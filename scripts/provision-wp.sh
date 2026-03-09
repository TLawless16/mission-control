#!/usr/bin/env bash

# Mission Control WordPress Auto-Provisioner
# Requirements: wp-cli, running MySQL/MariaDB server, PHP
# Usage: ./provision-wp.sh <site_url> <db_name> <db_user> <db_pass> <admin_user> <admin_pass> <admin_email>

if [ "$#" -ne 7 ]; then
    echo "Usage: $0 <site_url> <db_name> <db_user> <db_pass> <admin_user> <admin_pass> <admin_email>"
    exit 1
fi

SITE_URL=$1
DB_NAME=$2
DB_USER=$3
DB_PASS=$4
ADMIN_USER=$5
ADMIN_PASS=$6
ADMIN_EMAIL=$7

echo "🚀 Starting WordPress Provisioning for $SITE_URL..."

# 1. Download WordPress
echo "📥 Downloading WordPress core..."
wp core download --allow-root

# 2. Create wp-config.php
echo "⚙️  Generating wp-config.php..."
wp config create \
    --dbname="$DB_NAME" \
    --dbuser="$DB_USER" \
    --dbpass="$DB_PASS" \
    --allow-root

# 3. Create the Database (if it doesn't exist)
echo "🗄️  Creating Database..."
wp db create --allow-root

# 4. Install WordPress
echo "🛠️  Installing WordPress..."
wp core install \
    --url="$SITE_URL" \
    --title="Mission Control Client Site" \
    --admin_user="$ADMIN_USER" \
    --admin_password="$ADMIN_PASS" \
    --admin_email="$ADMIN_EMAIL" \
    --allow-root

# 5. Configure Permalinks for API compatibility
echo "🔗 Configuring Permalinks for REST API..."
wp rewrite structure '/%postname%/' --allow-root
wp rewrite flush --allow-root

# 6. Generate Application Password for Make.com / Jarvis
# Note: wp-cli application-password package needs to be installed, or handled via WP 5.6+ core
echo "🔑 Generating Application Password for Mission Control Bot..."
APP_PASSWORD=$(wp user application-password create "$ADMIN_USER" "MissionControlBot" --porcelain --allow-root)

echo ""
echo "🟩 ======================================="
echo "✅ Provisioning Complete for $SITE_URL!"
echo "======================================="
echo "Admin URL: $SITE_URL/wp-admin"
echo "Admin User: $ADMIN_USER"
echo ""
echo "🚨 CRITICAL: Save this Application Password for Make.com!"
echo "Make.com Password: $APP_PASSWORD"
echo "======================================="
echo ""
