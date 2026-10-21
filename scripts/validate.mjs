import { execFile, spawn } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, statSync, unlinkSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { promisify } from 'node:util';

const sentinelNamespace = 'vue-ssr-validate-state';

const serialStages = [{ name: 'lint', script: 'lint' }];
const parallelStages = [
  { name: 'format', script: 'format:check' },
  { name: 'build', script: 'build' },
  { name: 'test', script: 'test:run' },
];

const stagesByExtension = {
  '.vue': ['format', 'lint', 'build', 'test'],
  '.js': ['format', 'lint', 'build', 'test'],
  '.mjs': ['format', 'lint', 'build', 'test'],
  '.cjs': ['format', 'lint', 'build', 'test'],
  '.ts': ['format', 'lint', 'build', 'test'],
  '.scss': ['format', 'lint', 'build'],
  '.css': ['format', 'lint', 'build'],
  '.json': ['format', 'test'],
};

const selectStages = (extensions) =>
  new Set([...extensions].flatMap((extension) => stagesByExtension[extension] ?? []));

const execFileAsync = promisify(execFile);
const npmBin = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const bigBuffer = { maxBuffer: 1024 * 1024 * 256 };

const gitOutput = async (args, cwd) => {
  try {
    const { stdout } = await execFileAsync('git', args, { ...bigBuffer, cwd });
    return stdout;
  } catch (err) {
    throw new Error(`git ${args.join(' ')} failed: ${err.message}`, { cause: err });
  }
};

const gitLines = async (args, cwd) =>
  (await gitOutput(args, cwd))
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

const resolveRoot = async () =>
  (await gitOutput(['rev-parse', '--show-toplevel'], process.cwd())).trim();

const resolveGitDir = async (root) => (await gitOutput(['rev-parse', '--git-dir'], root)).trim();

const extensionOf = (file) => {
  const dot = file.lastIndexOf('.');
  return dot >= 0 ? file.slice(dot).toLowerCase() : '';
};

const dirtyFiles = async (root) => {
  const groups = await Promise.all([
    gitLines(['diff', '--name-only', 'HEAD'], root),
    gitLines(['diff', '--name-only', '--cached'], root),
    gitLines(['ls-files', '--others', '--exclude-standard'], root),
  ]);
  return [...new Set(groups.flat())];
};

const computeDigest = async (root) => {
  const parts = [
    await gitOutput(['status', '--porcelain=v2', '-uall', '--no-renames'], root),
    await gitOutput(['diff', 'HEAD'], root),
  ];
  const untracked = (await gitLines(['ls-files', '--others', '--exclude-standard'], root)).sort();
  for (const file of untracked) {
    try {
      const info = statSync(join(root, file));
      parts.push(`${Math.floor(info.mtimeMs)} ${info.size} ${file}`);
    } catch (err) {
      console.error(err);
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
    child.on('error', (err) => done({ name, script, code: 1, output: `${output}\n${err}` }));
    child.on('close', (code) => done({ name, script, code: code ?? 1, output }));
  });

const tail = (text, lines) => text.split('\n').slice(-lines).join('\n');

const reproduceCommand = (script) => `npm run ${script}`;

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
      if (result.script) console.log(`reproduce: ${reproduceCommand(result.script)}`);
    }
  }
};

const readSentinel = (sentinel) => {
  try {
    return JSON.parse(readFileSync(sentinel, 'utf8'));
  } catch (err) {
    if (err.code !== 'ENOENT') console.error(err);
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
  } catch (err) {
    console.error(err);
  }
};

const main = async () => {
  const root = await resolveRoot();
  const gitDir = await resolveGitDir(root);
  const stateDir = resolve(root, gitDir, sentinelNamespace);
  const sentinel = join(stateDir, 'state.json');

  const active = selectStages(new Set((await dirtyFiles(root)).map(extensionOf)));
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
