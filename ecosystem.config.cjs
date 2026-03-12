module.exports = {
  apps: [{
    name: 'family-tree',
    script: 'node_modules/.bin/tsx',
    args: 'server/index.ts',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '300M',
    env: {
      NODE_ENV: 'production',
      PORT: 3001
    }
  }]
};