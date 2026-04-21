#!/bin/bash
set -e

APP_PORT=${PORT:-80}

echo "==> [1/6] Configuring Apache on port $APP_PORT ..."
sed -i "s/Listen 80/Listen ${APP_PORT}/" /etc/apache2/ports.conf
sed -i "s/*:80/*:${APP_PORT}/" /etc/apache2/sites-available/000-default.conf

echo "==> [2/6] Creating .env file ..."
{
  echo "APP_NAME=\"${APP_NAME:-ElitePlatform}\""
  echo "APP_ENV=${APP_ENV:-production}"
  echo "APP_KEY=${APP_KEY}"
  echo "APP_DEBUG=${APP_DEBUG:-false}"
  echo "APP_URL=${APP_URL:-http://localhost}"
  echo "FRONTEND_URL=${FRONTEND_URL:-}"
  echo ""
  echo "LOG_CHANNEL=stderr"
  echo "LOG_LEVEL=debug"
  echo ""
  echo "DB_CONNECTION=${DB_CONNECTION:-mysql}"
  echo "DB_HOST=${DB_HOST}"
  echo "DB_PORT=${DB_PORT:-3306}"
  echo "DB_DATABASE=${DB_DATABASE}"
  echo "DB_USERNAME=${DB_USERNAME}"
  printf 'DB_PASSWORD=%s\n' "${DB_PASSWORD}"
  echo ""
  echo "SESSION_DRIVER=${SESSION_DRIVER:-cookie}"
  echo "SESSION_LIFETIME=120"
  echo "SESSION_PATH=/"
  echo "SESSION_DOMAIN=null"
  echo ""
  echo "SANCTUM_STATEFUL_DOMAINS=${SANCTUM_STATEFUL_DOMAINS}"
  echo ""
  echo "CACHE_STORE=array"
  echo "QUEUE_CONNECTION=sync"
  echo "FILESYSTEM_DISK=local"
  echo ""
  printf 'CLOUDINARY_URL=%s\n' "${CLOUDINARY_URL}"
  echo ""
  echo "MAIL_MAILER=${MAIL_MAILER:-smtp}"
  echo "MAIL_HOST=${MAIL_HOST:-smtp.gmail.com}"
  echo "MAIL_PORT=${MAIL_PORT:-587}"
  echo "MAIL_USERNAME=${MAIL_USERNAME}"
  printf 'MAIL_PASSWORD=%s\n' "${MAIL_PASSWORD}"
  echo "MAIL_ENCRYPTION=tls"
  echo "MAIL_FROM_ADDRESS=${MAIL_FROM_ADDRESS:-${MAIL_USERNAME}}"
  echo "MAIL_FROM_NAME=\"${MAIL_FROM_NAME:-ElitePlatform}\""
  echo ""
  echo "PYTHON_API_URL=${PYTHON_API_URL:-}"
} > /var/www/html/.env

echo "==> .env written. Contents (masked):"
grep -v "PASSWORD\|KEY\|SECRET\|URL" /var/www/html/.env || true

echo "==> [3/6] Testing DB connection ..."
php -r "
  try {
    \$pdo = new PDO(
      'mysql:host=${DB_HOST};port=${DB_PORT:-3306};dbname=${DB_DATABASE}',
      '${DB_USERNAME}',
      getenv('DB_PASSWORD')
    );
    echo 'DB connection OK' . PHP_EOL;
  } catch (Exception \$e) {
    echo 'DB connection FAILED: ' . \$e->getMessage() . PHP_EOL;
  }
" || true

echo "==> [4/6] Running artisan commands ..."
php artisan storage:link --force || echo "storage:link failed (non-fatal)"
php artisan migrate --force || echo "migrate FAILED — check DB connection above"
php artisan config:cache || echo "config:cache failed"
php artisan route:cache  || echo "route:cache failed"
php artisan view:cache   || echo "view:cache failed"

echo "==> [5/6] Setting permissions ..."
chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache
chmod -R 775 /var/www/html/storage /var/www/html/bootstrap/cache

echo "==> [6/6] Starting Apache on port $APP_PORT ..."
exec apache2-foreground
