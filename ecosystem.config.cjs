module.exports = {
  apps: [
    {
      name: 'bidsconnect-front',
      cwd: '.',
      script: './node_modules/.bin/vite',
      args: 'preview --host --port 4173',
      env: {
        NODE_ENV: 'production',
      },
      watch: false,
      autorestart: true,
      max_restarts: 10,
      restart_delay: 3000,
      error_file: './logs/bidsconnect-front-error.log',
      out_file: './logs/bidsconnect-front-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    },
  ],
}
