#!/usr/bin/env bash
# Title: Uninstall Anytype Sync Launchd
# Purpose: Stop and remove launchd job for kitchen_anytype sync.
# Owner: You
# Last updated: 2026-03-05

set -euo pipefail

TARGET_PLIST="$HOME/Library/LaunchAgents/com.kitchen_v.anytype_sync.plist"

if [[ -f "$TARGET_PLIST" ]]; then
  launchctl unload "$TARGET_PLIST" >/dev/null 2>&1 || true
  rm -f "$TARGET_PLIST"
  echo "Uninstalled: $TARGET_PLIST"
else
  echo "Not installed: $TARGET_PLIST"
fi
