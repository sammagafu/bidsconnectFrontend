module.exports = {
  apps: [
    {
      name: 'bidsconnect-front',
      cwd: '.',
      script: './node_modules/.bin/vite',
      args: 'preview --host --port 5173',
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
    {
      name: "bidsconnect-back",
      cwd: "/var/www/bidsconnect",
      script: "bin/gunicorn",
      args: "bidsconnect.wsgi:application \
             --bind 127.0.0.1:8000 \
             --workers 3 \
             --timeout 120 \
             --max-requests 1000 \
             --max-requests-jitter 50",
      interpreter: "none",
      instances: 1,
      exec_mode: "fork",
      autorestart: true,
      watch: false,
      max_memory_restart: "1G",
      env: {
        DJANGO_SETTINGS_MODULE: "bidsconnect.settings",
        PYTHONUNBUFFERED: "1"
      }
    }
  ],
}
