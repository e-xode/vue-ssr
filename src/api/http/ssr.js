import fs from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { parseThemeCookie, DEFAULT_THEME } from '#src/shared/theme.js';
import { DEFAULT_LOCALE } from '#src/shared/const.js';
import { fillTemplate, renderStateScript } from '#src/api/http/template.js';
import {
  SSR_ENTRY_SERVER_PATH,
  SSR_DEV_ENTRY_PATH,
  DEV_INDEX_HTML_PATH,
  PROD_INDEX_HTML_PATH,
} from '#src/api/http/constants.js';

export async function readProductionTemplate() {
  return fs.readFile(PROD_INDEX_HTML_PATH, 'utf-8');
}

export function createSsrRenderer({ isProduction, vite, templateHtml, base, db }) {
  let productionRender = null;

  async function loadProductionRender() {
    if (!productionRender) {
      const entryUrl = pathToFileURL(path.resolve(SSR_ENTRY_SERVER_PATH)).href;
      productionRender = (await import(entryUrl)).render;
    }
    return productionRender;
  }

  async function loadTemplateAndRender(url) {
    if (isProduction) {
      return { template: templateHtml, render: await loadProductionRender() };
    }
    const rawTemplate = await fs.readFile(DEV_INDEX_HTML_PATH, 'utf-8');
    const template = await vite.transformIndexHtml(url, rawTemplate);
    const { render } = await vite.ssrLoadModule(SSR_DEV_ENTRY_PATH);
    return { template, render };
  }

  async function handle(req, res) {
    try {
      const url = req.originalUrl.replace(base, '/');
      const { template, render } = await loadTemplateAndRender(url);
      const theme = parseThemeCookie(req.headers.cookie);
      const rendered = await render(url, db, theme);

      const html = fillTemplate(template, {
        lang: rendered.locale || DEFAULT_LOCALE,
        theme,
        head: rendered.head,
        state: renderStateScript(rendered.state),
        html: rendered.html,
      });

      res
        .status(rendered.statusCode || 200)
        .set({ 'Content-Type': 'text/html' })
        .send(html);
    } catch (err) {
      vite?.ssrFixStacktrace(err);
      console.error(err);
      res.status(500).set({ 'Content-Type': 'text/plain' }).end('Internal Server Error');
    }
  }

  async function warmUp() {
    if (!isProduction) return;
    try {
      const render = await loadProductionRender();
      await render(`/${DEFAULT_LOCALE}`, db, DEFAULT_THEME);
    } catch (err) {
      console.error(err);
    }
  }

  return { handle, warmUp };
}
