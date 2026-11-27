// Builds the web app in one Vite mode and syncs it into the native projects.
// Usage: node scripts/native-build.mjs <development|qa|production>
import { spawnSync } from 'node:child_process';

const modes = ['development', 'qa', 'production'];
const mode = process.argv[2];
if (!modes.includes(mode)) {
  console.error(`Usage: node scripts/native-build.mjs <${modes.join('|')}>`);
  process.exit(1);
}

function run(command, args) {
  const result = spawnSync(command, args, {
    stdio: 'inherit',
    shell: process.platform === 'win32',
  });
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

run('npx', ['tsc']);
run('npx', ['vite', 'build', '--mode', mode]);
run('npx', ['cap', 'sync']);
