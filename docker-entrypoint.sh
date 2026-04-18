#!/bin/bash
set -e

# Render provides PORT as an env variable — Apache must listen on it
APP_PORT=${PORT:-80}

echo "==> Configuring Apache to listen on port $APP_PORT ..."
sed -i "s/Listen 80/Listen ${APP_PORT}/" /etc/apache2/ports.conf
sed -i "s/*:80/*:${APP_PORT}/" /etc/apache2/sites-available/000-default.conf

echo "==> Creating .env file from environment variables ..."
cat > /var/www/html/.env << EOF
APP_NAME="${APP_NAME:-ElitePlatform}"
APP_ENV=${APP_ENV:-production}
APP_KEY=${APP_KEY}
APP_DEBUG=${APP_DEBUG:-false}
APP_URL=${APP_URL:-http://localhost}
FRONTEND_URL=${FRONTEND_URL:-http://localhost:3000}

LOG_CHANNEL=stack
LOG_LEVEL=error

DB_CONNECTION=${DB_CONNECTION:-mysql}
DB_HOST=${DB_HOST}
DB_PORT=${DB_PORT:-3306}
DB_DATABASE=${DB_DATABASE}
DB_USERNAME=${DB_USERNAME}
DB_PASSWORD=${DB_PASSWORD}

SESSION_DRIVER=${SESSION_DRIVER:-cookie}
SESSION_LIFETIME=120
SESSION_PATH=/
SESSION_DOMAIN=null

SANCTUM_STATEFUL_DOMAINS=${SANCTUM_STATEFUL_DOMAINS}

CACHE_STORE=${CACHE_STORE:-file}
QUEUE_CONNECTION=${QUEUE_CONNECTION:-sync}
FILESYSTEM_DISK=local

CLOUDINARY_URL=${CLOUDINARY_URL}

MAIL_MAILER=${MAIL_MAILER:-smtp}
MAIL_HOST=${MAIL_HOST:-smtp.gmail.com}
MAIL_PORT=${MAIL_PORT:-587}
MAIL_USERNAME=${MAIL_USERNAME}
MAIL_PASSWORD=${MAIL_PASSWORD}
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=${MAIL_FROM_ADDRESS:-${MAIL_USERNAME}}
MAIL_FROM_NAME="${MAIL_FROM_NAME:-ElitePlatform}"

PYTHON_API_URL=${PYTHON_API_URL}
EOF

echo "==> Running database migrations ..."
php artisan migrate --force

echo "==> Caching Laravel config/routes ..."
php artisan config:cache
php artisan route:cache
php artisan view:cache

echo "==> Setting storage permissions ..."
chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache
chmod -R 775 /var/www/html/storage /var/www/html/bootstrap/cache

echo "==> Starting Apache on port $APP_PORT ..."
exec apache2-foreground
