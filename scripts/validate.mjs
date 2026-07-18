import { execFile, spawn } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, statSync, unlinkSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { promisify } from 'node:util';

const sentinelNamespace = 'vue-ssr-validate-state';

const serialStages = [{ name: 'lint', script: 'lint' }];
const parallelStages = [
  { name: 'format', script: 'format:check' },
  { name: 'build', script: 'build' },
  { name: 'test', script: 'test:run' },
];

const selectStages = (extensions) => {
  const has = (...candidates) => candidates.some((value) => extensions.has(value));
  if (has('.vue', '.js', '.mjs', '.cjs', '.ts'))
    return new Set(['format', 'lint', 'build', 'test']);
  if (has('.scss', '.css')) return new Set(['format', 'lint']);
  return new Set();
};

const execFileAsync = promisify(execFile);
const npmBin = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const bigBuffer = { maxBuffer: 1024 * 1024 * 256 };

const gitOutput = async (args) => {
  try {
    const { stdout } = await execFileAsync('git', args, bigBuffer);
    return stdout;
  } catch {
    return '';
  }
};

const gitLines = async (args) =>
  (await gitOutput(args))
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

const resolveRoot = async () =>
  (await gitOutput(['rev-parse', '--show-toplevel'])).trim() || process.cwd();

const resolveGitDir = async () => (await gitOutput(['rev-parse', '--git-dir'])).trim() || '.git';

const extensionOf = (file) => {
  const dot = file.lastIndexOf('.');
  return dot >= 0 ? file.slice(dot).toLowerCase() : '';
};

const dirtyFiles = async () => {
  const groups = await Promise.all([
    gitLines(['diff', '--name-only', 'HEAD']),
    gitLines(['diff', '--name-only', '--cached']),
    gitLines(['ls-files', '--others', '--exclude-standard']),
  ]);
  return [...new Set(groups.flat())];
};

const computeDigest = async (root) => {
  const parts = [
    await gitOutput(['status', '--porcelain=v2', '-uall', '--no-renames']),
    await gitOutput(['diff', 'HEAD']),
  ];
  const untracked = (await gitLines(['ls-files', '--others', '--exclude-standard'])).sort();
  for (const file of untracked) {
    try {
      const info = statSync(join(root, file));
      parts.push(`${Math.floor(info.mtimeMs)} ${info.size} ${file}`);
    } catch {
      parts.push(`missing ${file}`);
    }
  }
  return createHash('sha1').update(parts.join('\n')).digest('hex');
};

const runStage = ({ name, script }, root) =>
  new Promise((done) => {
    const child = spawn(npmBin, ['run', script], { cwd: root, env: process.env });
    let output = '';
    child.stdout.on('data', (chunk) => {
      output += chunk;
    });
    child.stderr.on('data', (chunk) => {
      output += chunk;
    });
    child.on('error', (err) => done({ name, code: 1, output: `${output}\n${err}` }));
    child.on('close', (code) => done({ name, code: code ?? 1, output }));
  });

const tail = (text, lines) => text.split('\n').slice(-lines).join('\n');

const printReport = (mode, order, results) => {
  console.log('## Validation (npm run validate)');
  console.log(`mode: ${mode}`);
  console.log(`stages: ${order.length ? order.join(', ') : 'none'}`);
  for (const result of results) {
    if (result.code === 0) {
      console.log(`- ${result.name}: PASS`);
    } else {
      console.log(`- ${result.name}: FAIL (exit ${result.code})`);
      console.log(tail(result.output, 40));
    }
  }
};

const readSentinel = (sentinel) => {
  try {
    return JSON.parse(readFileSync(sentinel, 'utf8'));
  } catch {
    return null;
  }
};

const writeSentinel = (sentinel, stateDir, payload) => {
  mkdirSync(stateDir, { recursive: true });
  writeFileSync(sentinel, JSON.stringify(payload));
};

const clearSentinel = (sentinel) => {
  try {
    if (existsSync(sentinel)) unlinkSync(sentinel);
  } catch {
    void 0;
  }
};

const main = async () => {
  const root = await resolveRoot();
  const gitDir = await resolveGitDir();
  const stateDir = join(root, gitDir, sentinelNamespace);
  const sentinel = join(stateDir, 'state.json');

  const active = selectStages(new Set((await dirtyFiles()).map(extensionOf)));
  const serial = serialStages.filter((stage) => active.has(stage.name));
  const parallel = parallelStages.filter((stage) => active.has(stage.name));
  const order = [...serial, ...parallel].map((stage) => stage.name);
  const digest = await computeDigest(root);

  const saved = readSentinel(sentinel);
  if (saved && saved.digest === digest) {
    printReport('cached (unchanged since last run)', saved.order || order, saved.results || []);
    process.exit(saved.failed ? 1 : 0);
  }

  if (order.length === 0) {
    printReport('skipped (no validatable files)', order, []);
    writeSentinel(sentinel, stateDir, { digest, order, results: [], failed: false });
    process.exit(0);
  }

  const results = [];
  for (const stage of serial) {
    const result = await runStage(stage, root);
    results.push(result);
    if (result.code !== 0) {
      printReport('full', order, results);
      clearSentinel(sentinel);
      process.exit(1);
    }
  }

  results.push(...(await Promise.all(parallel.map((stage) => runStage(stage, root)))));

  const failed = results.some((result) => result.code !== 0);
  printReport('full', order, results);

  const finalDigest = await computeDigest(root);
  writeSentinel(sentinel, stateDir, { digest: finalDigest, order, results, failed });

  process.exit(failed ? 1 : 0);
};

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
