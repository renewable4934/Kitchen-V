#!/usr/bin/env bash
# Title: Release deploy script
# Purpose: unpacks a prepared release, links the shared env file, builds the app and restarts the site service with rollback on failed healthcheck.
# Owner: Project team
# Last updated: 2026-03-11

set -Eeuo pipefail

APP_DIR="${APP_DIR:?Set APP_DIR}"
SERVICE_NAME="${SERVICE_NAME:?Set SERVICE_NAME}"
APP_PORT="${APP_PORT:?Set APP_PORT}"
RELEASE_ARCHIVE="${RELEASE_ARCHIVE:?Set RELEASE_ARCHIVE}"
ENV_FILE="${ENV_FILE:-}"
RELEASE_ID="${RELEASE_ID:-$(date -u +%Y%m%d%H%M%S)}"
RELEASES_DIR="${APP_DIR}/releases"
SHARED_DIR="${APP_DIR}/shared"
CURRENT_LINK="${APP_DIR}/current"
RELEASE_DIR="${RELEASES_DIR}/${RELEASE_ID}"
SYSTEMCTL_BIN="systemctl"

if command -v sudo >/dev/null 2>&1; then
  SYSTEMCTL_BIN="sudo systemctl"
fi

cleanup() {
  rm -f "$RELEASE_ARCHIVE"
  if [ -n "$ENV_FILE" ]; then
    rm -f "$ENV_FILE"
  fi
}

trap cleanup EXIT

mkdir -p "$RELEASES_DIR" "$SHARED_DIR"
rm -rf "$RELEASE_DIR"
mkdir -p "$RELEASE_DIR"

previous_release=""
if [ -L "$CURRENT_LINK" ]; then
  previous_release="$(readlink -f "$CURRENT_LINK" || true)"
fi

tar -xzf "$RELEASE_ARCHIVE" -C "$RELEASE_DIR"

if [ -n "$ENV_FILE" ] && [ -f "$ENV_FILE" ]; then
  install -m 600 "$ENV_FILE" "${SHARED_DIR}/.env"
fi

if [ -f "${SHARED_DIR}/.env" ]; then
  ln -sfn "${SHARED_DIR}/.env" "${RELEASE_DIR}/.env"
fi

cd "$RELEASE_DIR"
npm ci
npm run build
ln -sfn "$RELEASE_DIR" "$CURRENT_LINK"
$SYSTEMCTL_BIN restart "$SERVICE_NAME"

healthy=0
for attempt in 1 2 3 4 5 6 7 8 9 10; do
  if curl --fail --show-error --silent "http://127.0.0.1:${APP_PORT}/api/health" >/dev/null; then
    healthy=1
    break
  fi
  sleep 3
done

if [ "$healthy" -ne 1 ]; then
  echo "Healthcheck failed for release ${RELEASE_ID}. Rolling back." >&2
  if [ -n "$previous_release" ] && [ -d "$previous_release" ]; then
    ln -sfn "$previous_release" "$CURRENT_LINK"
    $SYSTEMCTL_BIN restart "$SERVICE_NAME"
  fi
  exit 1
fi

find "$RELEASES_DIR" -mindepth 1 -maxdepth 1 -type d | sort | head -n -5 | xargs -r rm -rf
echo "Release ${RELEASE_ID} is active."
