#!/usr/bin/env bash
# Title: Aeza bootstrap script
# Purpose: prepares an Aeza Ubuntu server for one site instance with Caddy, fail2ban, systemd, Node.js and a deploy user.
# Owner: Project team
# Last updated: 2026-03-11

set -Eeuo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
APP_NAME="${APP_NAME:?Set APP_NAME, for example kitchen-v-prod}"
APP_DOMAIN="${APP_DOMAIN:?Set APP_DOMAIN, for example zakazpegas.ru}"
APP_PORT="${APP_PORT:?Set APP_PORT, for example 3000}"
DEPLOY_USER="${DEPLOY_USER:-deploy}"
RUN_USER="${RUN_USER:-$DEPLOY_USER}"
APP_ROOT="${APP_ROOT:-/opt/${APP_NAME}}"
SERVICE_NAME="${SERVICE_NAME:-$APP_NAME}"
CADDY_ADMIN_EMAIL="${CADDY_ADMIN_EMAIL:-admin@${APP_DOMAIN%%,*}}"
SYSTEMCTL_PATH="$(command -v systemctl)"
SUDOERS_FILE="/etc/sudoers.d/${DEPLOY_USER}-${SERVICE_NAME}"

require_root() {
  if [ "$(id -u)" -ne 0 ]; then
    echo "Run this script as root." >&2
    exit 1
  fi
}

install_node() {
  local current_major
  current_major="$(node -v 2>/dev/null | sed 's/^v//' | cut -d. -f1 || true)"
  if [ -n "$current_major" ] && [ "$current_major" -ge 20 ]; then
    return
  fi

  curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
  apt-get install -y nodejs
}

render_template() {
  local source_file="$1"
  local target_file="$2"
  sed \
    -e "s|__APP_DOMAIN__|${APP_DOMAIN}|g" \
    -e "s|__APP_PORT__|${APP_PORT}|g" \
    -e "s|__APP_DIR__|${APP_ROOT}|g" \
    -e "s|__SERVICE_NAME__|${SERVICE_NAME}|g" \
    -e "s|__RUN_USER__|${RUN_USER}|g" \
    "$source_file" > "$target_file"
}

require_root

apt-get update
apt-get install -y ca-certificates curl gnupg rsync caddy fail2ban ufw unattended-upgrades
install_node

if ! id -u "$DEPLOY_USER" >/dev/null 2>&1; then
  useradd --create-home --shell /bin/bash "$DEPLOY_USER"
fi

mkdir -p "${APP_ROOT}/releases" "${APP_ROOT}/shared"
chown -R "${DEPLOY_USER}:${DEPLOY_USER}" "$APP_ROOT"

mkdir -p /etc/fail2ban/jail.d /etc/ssh/sshd_config.d /etc/caddy/sites-enabled /var/log/caddy

cat > /etc/fail2ban/jail.d/sshd.local <<EOF
[sshd]
enabled = true
port = ssh
backend = systemd
maxretry = 5
findtime = 10m
bantime = 1h
EOF

cat > /etc/ssh/sshd_config.d/99-hardening.conf <<EOF
MaxAuthTries 3
LoginGraceTime 30
PermitEmptyPasswords no
X11Forwarding no
ClientAliveInterval 300
ClientAliveCountMax 2
EOF

ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable

render_template "${SCRIPT_DIR}/systemd-site.service.template" "/etc/systemd/system/${SERVICE_NAME}.service"
render_template "${SCRIPT_DIR}/nginx-site.conf.template" "/etc/caddy/sites-enabled/${SERVICE_NAME}.caddy"

cat > /etc/caddy/Caddyfile <<EOF
{
    email ${CADDY_ADMIN_EMAIL}
}

import /etc/caddy/sites-enabled/*.caddy
EOF

cat > "$SUDOERS_FILE" <<EOF
${DEPLOY_USER} ALL=NOPASSWD:${SYSTEMCTL_PATH} restart ${SERVICE_NAME},${SYSTEMCTL_PATH} status ${SERVICE_NAME}
EOF
chmod 440 "$SUDOERS_FILE"

systemctl daemon-reload
systemctl enable "${SERVICE_NAME}"
systemctl enable --now fail2ban
systemctl enable --now caddy
caddy validate --config /etc/caddy/Caddyfile
systemctl restart ssh
systemctl restart fail2ban
systemctl restart caddy

echo "Server bootstrap is ready."
echo "App root: ${APP_ROOT}"
echo "Service: ${SERVICE_NAME}"
echo "Deploy user: ${DEPLOY_USER}"
