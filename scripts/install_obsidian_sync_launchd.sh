#!/usr/bin/env bash
# Title: Install Obsidian Sync Launchd
# Purpose: Install and start macOS launchd job for 15-minute Obsidian sync.
# Owner: You
# Last updated: 2026-03-05

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PLIST_TEMPLATE="$REPO_ROOT/scripts/launchd/com.kitchen_v.obsidian_sync.plist.template"
TARGET_DIR="$HOME/Library/LaunchAgents"
TARGET_PLIST="$TARGET_DIR/com.kitchen_v.obsidian_sync.plist"
PYTHON_BIN="${PYTHON_BIN:-$(command -v python3)}"

if [[ -z "$PYTHON_BIN" ]]; then
  echo "python3 not found" >&2
  exit 1
fi

mkdir -p "$TARGET_DIR"
mkdir -p "$REPO_ROOT/kitchen_obsidian/registry"

escaped_repo_root="$(printf '%s' "$REPO_ROOT" | sed 's/[\/&]/\\&/g')"
escaped_python_bin="$(printf '%s' "$PYTHON_BIN" | sed 's/[\/&]/\\&/g')"

sed -e "s/__REPO_ROOT__/$escaped_repo_root/g" \
    -e "s/__PYTHON_BIN__/$escaped_python_bin/g" \
    "$PLIST_TEMPLATE" > "$TARGET_PLIST"

launchctl unload "$TARGET_PLIST" >/dev/null 2>&1 || true
launchctl load "$TARGET_PLIST"
launchctl kickstart -k gui/"$(id -u)"/com.kitchen_v.obsidian_sync

echo "Installed and started: $TARGET_PLIST"
echo "Interval: every 900 seconds (15 minutes)"
