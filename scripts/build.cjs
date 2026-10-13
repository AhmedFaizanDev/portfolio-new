const { spawnSync } = require('node:child_process');
const path = require('node:path');

const nextBin = path.join(__dirname, '..', 'node_modules', 'next', 'dist', 'bin', 'next');
const result = spawnSync(
  process.execPath,
  ['--max-old-space-size=4096', nextBin, 'build', '--webpack'],
  {
    stdio: 'inherit',
    env: process.env,
  }
);

if (result.error) {
  console.error(result.error);
  process.exit(1);
}

process.exit(result.status ?? 1);
