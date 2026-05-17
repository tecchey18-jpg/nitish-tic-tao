import { spawn } from 'node:child_process';

const viteCommand =
  process.platform === 'win32'
    ? ['cmd.exe', ['/d', '/s', '/c', 'npm.cmd run dev:vite -- --host 0.0.0.0']]
    : ['npm', ['run', 'dev:vite', '--', '--host', '0.0.0.0']];
const children = [
  spawn(process.execPath, ['room-server.mjs'], { stdio: 'inherit' }),
  spawn(viteCommand[0], viteCommand[1], { stdio: 'inherit' })
];

const shutdown = (code = 0) => {
  for (const child of children) {
    if (!child.killed) child.kill();
  }
  process.exit(code);
};

for (const child of children) {
  child.on('exit', (code) => {
    if (code && code !== 0) shutdown(code);
  });
}

process.on('SIGINT', () => shutdown());
process.on('SIGTERM', () => shutdown());
