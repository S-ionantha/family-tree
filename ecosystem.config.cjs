module.exports = {
  apps: [{
    name: 'family-tree',
    interpreter: 'node',
    script: 'node_modules/tsx/dist/cli.mjs',
    args: 'server/index.ts',
    instances: 1,
    exec_mode: 'fork',
    autorestart: true,
    watch: false,
    max_memory_restart: '300M',
    env: {
      NODE_ENV: 'production',
      PORT: 3001
    }
  }]
};