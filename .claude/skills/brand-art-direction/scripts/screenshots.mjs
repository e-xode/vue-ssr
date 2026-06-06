import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';

const ROUTES = {
  index: '',
  contact: '/contact',
  signin: '/signin',
  signup: '/signup',
};

const VIEWPORTS = {
  mobile: { width: 390, height: 844 },
  tablet: { width: 834, height: 1112 },
  desktop: { width: 1440, height: 900 },
};

const DEFAULT_ROUTES = ['index', 'contact'];

function parseArgs(argv) {
  const args = {
    routes: DEFAULT_ROUTES,
    viewports: ['desktop', 'mobile'],
    locale: 'en',
    base: 'http://localhost:3002',
    out: 'dist/screenshots',
    hover: null,
    focus: null,
    reducedMotion: false,
  };
  for (let i = 2; i < argv.length; i++) {
    const [key, valueInline] = argv[i].split('=');
    const value = valueInline !== undefined ? valueInline : argv[i + 1];
    const next = () => {
      if (valueInline === undefined) i++;
    };
    switch (key) {
      case '--routes':
        args.routes = value.split(',').map((s) => s.trim());
        next();
        break;
      case '--viewports':
        args.viewports = value.split(',').map((s) => s.trim());
        next();
        break;
      case '--locale':
        args.locale = value;
        next();
        break;
      case '--base':
        args.base = value.replace(/\/$/, '');
        next();
        break;
      case '--port':
        args.base = `http://localhost:${value}`;
        next();
        break;
      case '--out':
        args.out = value;
        next();
        break;
      case '--hover':
        args.hover = value;
        next();
        break;
      case '--focus':
        args.focus = value;
        next();
        break;
      case '--reduced-motion':
        args.reducedMotion = true;
        break;
      default:
        break;
    }
  }
  return args;
}

async function probe(base, locale) {
  try {
    const res = await fetch(`${base}/${locale}`, { redirect: 'manual' });
    return res.status > 0;
  } catch {
    return false;
  }
}

async function captureElement(page, selector, action, file) {
  const locator = page.locator(selector).first();
  if ((await locator.count()) === 0) {
    console.warn(`  skip ${action}: selector not found "${selector}"`);
    return null;
  }
  await locator.scrollIntoViewIfNeeded();
  if (action === 'hover') await locator.hover();
  if (action === 'focus') await locator.focus();
  await page.waitForTimeout(450);
  const box = await locator.boundingBox();
  if (!box) return null;
  const margin = 48;
  await page.screenshot({
    path: file,
    clip: {
      x: Math.max(0, box.x - margin),
      y: Math.max(0, box.y - margin),
      width: box.width + margin * 2,
      height: box.height + margin * 2,
    },
  });
  return file;
}

async function main() {
  const args = parseArgs(process.argv);
  const outDir = resolve(process.cwd(), args.out);
  await mkdir(outDir, { recursive: true });

  const up = await probe(args.base, args.locale);
  if (!up) {
    console.error(
      `No app responding at ${args.base}/${args.locale}.\n` +
        `Start one first (reuse a running "npm run dev", or "docker compose up"), then re-run.`
    );
    process.exit(1);
  }

  const browser = await chromium.launch({
    headless: true,
    args: ['--disable-dev-shm-usage', '--no-sandbox', '--disable-gpu'],
  });

  const jobs = [];
  for (const viewport of args.viewports) {
    const size = VIEWPORTS[viewport];
    if (!size) {
      console.warn(`Unknown viewport "${viewport}", skipping`);
      continue;
    }
    jobs.push({ viewport, size });
  }

  const captureJob = async ({ viewport, size }) => {
    const produced = [];
    const context = await browser.newContext({
      viewport: size,
      deviceScaleFactor: 1,
      reducedMotion: args.reducedMotion ? 'reduce' : 'no-preference',
    });
    const page = await context.newPage();
    try {
      for (const route of args.routes) {
        const path = ROUTES[route];
        if (path === undefined) {
          console.warn(`Unknown route "${route}", skipping`);
          continue;
        }
        const url = `${args.base}/${args.locale}${path}`;
        await page.goto(url, { waitUntil: 'load', timeout: 30000 });
        await page.evaluate(() => document.fonts && document.fonts.ready);
        await page.waitForTimeout(args.reducedMotion ? 200 : 900);

        const suffix = args.reducedMotion ? `${viewport}-rmotion` : viewport;
        const full = resolve(outDir, `${route}-${suffix}.png`);
        await page.screenshot({ path: full, fullPage: true });
        produced.push(full);

        if (args.hover) {
          const f = resolve(outDir, `${route}-hover-${viewport}.png`);
          const r = await captureElement(page, args.hover, 'hover', f);
          if (r) produced.push(r);
        }
        if (args.focus) {
          const f = resolve(outDir, `${route}-focus-${viewport}.png`);
          const r = await captureElement(page, args.focus, 'focus', f);
          if (r) produced.push(r);
        }
      }
    } finally {
      await context.close();
    }
    return produced;
  };

  const written = [];
  const concurrency = Math.min(Math.max(jobs.length, 1), 3);
  let cursor = 0;
  const runners = Array.from({ length: concurrency }, async () => {
    while (cursor < jobs.length) {
      const produced = await captureJob(jobs[cursor++]);
      written.push(...produced);
    }
  });
  try {
    await Promise.all(runners);
  } finally {
    await browser.close();
  }

  console.log(`\nWrote ${written.length} screenshot(s):`);
  for (const f of written) console.log(f);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
