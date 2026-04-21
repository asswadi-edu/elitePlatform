#!/bin/bash
set -e

APP_PORT=${PORT:-80}

echo "==> [1/7] Configuring Apache on port $APP_PORT ..."
sed -i "s/Listen 80/Listen ${APP_PORT}/" /etc/apache2/ports.conf
sed -i "s/*:80/*:${APP_PORT}/" /etc/apache2/sites-available/000-default.conf

echo "==> [2/7] Creating .env file ..."
{
  echo "APP_NAME=\"${APP_NAME:-ElitePlatform}\""
  echo "APP_ENV=${APP_ENV:-production}"
  echo "APP_KEY=${APP_KEY}"
  echo "APP_DEBUG=${APP_DEBUG:-false}"
  echo "APP_URL=${APP_URL:-http://localhost}"
  echo "FRONTEND_URL=${FRONTEND_URL:-}"
  echo ""
  echo "LOG_CHANNEL=stderr"
  echo "LOG_LEVEL=error"
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

echo "==> [3/7] Running storage:link ..."
php artisan storage:link --force || echo "storage:link skipped"

echo "==> [4/7] Running database migrations ..."
php artisan migrate --force || echo "migrate FAILED - check DB connection"

echo "==> [5/7] Checking if database needs seeding ..."
USER_COUNT=$(php artisan tinker --execute="echo \App\Models\User::count();" 2>/dev/null | tail -1 | tr -d '[:space:]' || echo "0")
echo "Current user count: $USER_COUNT"

if [ "$USER_COUNT" = "0" ] || [ -z "$USER_COUNT" ]; then
  echo "==> Database is empty — running seeders ..."
  php artisan db:seed --force || echo "Seeding FAILED"
else
  echo "==> Database already has data — skipping seeders"
fi

echo "==> [6/7] Caching Laravel config/routes/views ..."
php artisan config:cache || echo "config:cache failed"
php artisan route:cache  || echo "route:cache failed"
php artisan view:cache   || echo "view:cache failed"

echo "==> [7/7] Starting Apache on port $APP_PORT ..."
chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache
chmod -R 775 /var/www/html/storage /var/www/html/bootstrap/cache
exec apache2-foreground
