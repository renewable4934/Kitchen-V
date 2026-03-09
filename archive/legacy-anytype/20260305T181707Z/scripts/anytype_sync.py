#!/usr/bin/env python3
"""Title: Anytype Sync Script
Purpose: Bidirectional sync for kitchen_anytype <-> Anytype API with no-delete safety.
Owner: You
Last updated: 2026-03-05

This script syncs only `kitchen_anytype/` <-> Anytype API.
It never deletes data; it archives instead.
"""

from __future__ import annotations

import argparse
import csv
import fcntl
import hashlib
import json
import os
import shutil
import sys
import tempfile
import uuid
from dataclasses import dataclass
from datetime import UTC, datetime
from pathlib import Path
from typing import Any
from urllib import error, parse, request


REQUIRED_MAP_COLUMNS = [
    "local_path",
    "anytype_object_id",
    "remote_updated_at",
    "local_updated_at",
    "last_sync_at",
    "last_sync_direction",
    "last_sync_hash",
    "status",
    "kitchen_sync_id",
]

IGNORED_PUSH_PREFIXES = ("kitchen_anytype/registry/",)
IGNORED_PUSH_SUFFIXES = (".tmp", ".swp", ".lock")


def now_utc_iso() -> str:
    return datetime.now(UTC).replace(microsecond=0).isoformat()


def parse_ts(value: str | None) -> datetime | None:
    if not value:
        return None
    text = value.strip()
    if text.endswith("Z"):
        text = text[:-1] + "+00:00"
    try:
        dt = datetime.fromisoformat(text)
    except ValueError:
        return None
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=UTC)
    return dt.astimezone(UTC)


def ensure_parents(path: Path) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)


def atomic_write_text(path: Path, content: str) -> None:
    ensure_parents(path)
    with tempfile.NamedTemporaryFile("w", encoding="utf-8", dir=path.parent, delete=False) as tmp:
        tmp.write(content)
        tmp_path = Path(tmp.name)
    tmp_path.replace(path)


def atomic_write_json(path: Path, payload: dict[str, Any]) -> None:
    atomic_write_text(path, json.dumps(payload, ensure_ascii=False, indent=2) + "\n")


def load_json(path: Path, default: dict[str, Any]) -> dict[str, Any]:
    if not path.exists():
        return default
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except json.JSONDecodeError:
        return default


def sha256_text(text: str) -> str:
    return hashlib.sha256(text.encode("utf-8")).hexdigest()


def rel_posix(path: Path, root: Path) -> str:
    return path.relative_to(root).as_posix()


def slugify(text: str) -> str:
    allowed = []
    for ch in text.lower():
        if ch.isalnum():
            allowed.append(ch)
        elif ch in (" ", "-", "_"):
            allowed.append("-")
    slug = "".join(allowed)
    while "--" in slug:
        slug = slug.replace("--", "-")
    return slug.strip("-") or "untitled"


def parse_simple_yaml(path: Path) -> dict[str, Any]:
    data: dict[str, Any] = {}
    if not path.exists():
        return data
    for raw in path.read_text(encoding="utf-8").splitlines():
        line = raw.strip()
        if not line or line.startswith("#") or ":" not in line:
            continue
        key, value = line.split(":", 1)
        key = key.strip()
        value = value.strip()
        if value.startswith(("'", '"')) and value.endswith(("'", '"')) and len(value) >= 2:
            value = value[1:-1]
        if value.lower() in ("true", "false"):
            data[key] = value.lower() == "true"
        elif value.isdigit():
            data[key] = int(value)
        elif value.startswith("[") and value.endswith("]"):
            items = [v.strip().strip("'").strip('"') for v in value[1:-1].split(",") if v.strip()]
            data[key] = items
        else:
            data[key] = value
    return data


@dataclass
class SyncConfig:
    anytype_api_base: str
    anytype_api_key_env: str
    workspace_or_space_id: str
    poll_interval_minutes: int
    archive_on_remote_delete: bool
    tie_breaker: str
    changes_endpoint: str
    objects_endpoint: str
    archive_endpoint_template: str
    request_timeout_seconds: int
    default_owner: str

    @classmethod
    def load(cls, path: Path) -> "SyncConfig":
        raw = parse_simple_yaml(path)
        return cls(
            anytype_api_base=str(raw.get("anytype_api_base", "")).rstrip("/"),
            anytype_api_key_env=str(raw.get("anytype_api_key_env", "ANYTYPE_API_KEY")),
            workspace_or_space_id=str(raw.get("workspace_or_space_id", "")),
            poll_interval_minutes=int(raw.get("poll_interval_minutes", 15)),
            archive_on_remote_delete=bool(raw.get("archive_on_remote_delete", True)),
            tie_breaker=str(raw.get("tie_breaker", "remote")),
            changes_endpoint=str(raw.get("changes_endpoint", "/v1/objects/changes")),
            objects_endpoint=str(raw.get("objects_endpoint", "/v1/objects")),
            archive_endpoint_template=str(raw.get("archive_endpoint_template", "/v1/objects/{object_id}/archive")),
            request_timeout_seconds=int(raw.get("request_timeout_seconds", 30)),
            default_owner=str(raw.get("default_owner", "project-team")),
        )


class FileLock:
    def __init__(self, path: Path) -> None:
        self.path = path
        self._fd: Any = None

    def __enter__(self) -> "FileLock":
        ensure_parents(self.path)
        self._fd = self.path.open("a+", encoding="utf-8")
        try:
            fcntl.flock(self._fd.fileno(), fcntl.LOCK_EX | fcntl.LOCK_NB)
        except BlockingIOError:
            raise RuntimeError(f"sync already running (lock busy): {self.path}")
        self._fd.seek(0)
        self._fd.truncate(0)
        self._fd.write(f"pid={os.getpid()} at {now_utc_iso()}\n")
        self._fd.flush()
        return self

    def __exit__(self, exc_type: Any, exc: Any, tb: Any) -> None:
        if self._fd is not None:
            fcntl.flock(self._fd.fileno(), fcntl.LOCK_UN)
            self._fd.close()


class AnytypeClient:
    def __init__(self, cfg: SyncConfig) -> None:
        self.cfg = cfg
        self.base = cfg.anytype_api_base
        token = os.getenv(cfg.anytype_api_key_env, "").strip()
        if not self.base:
            raise RuntimeError("anytype_api_base is empty in sync-config.yaml")
        if not token:
            raise RuntimeError(f"missing API token in env var: {cfg.anytype_api_key_env}")
        self._headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json",
            "Accept": "application/json",
        }

    def _request_json(self, method: str, endpoint: str, query: dict[str, Any] | None = None, body: dict[str, Any] | None = None) -> dict[str, Any]:
        url = self.base + endpoint
        if query:
            clean = {k: v for k, v in query.items() if v is not None and v != ""}
            if clean:
                url = f"{url}?{parse.urlencode(clean)}"
        payload = None
        if body is not None:
            payload = json.dumps(body).encode("utf-8")
        req = request.Request(url=url, data=payload, headers=self._headers, method=method)
        try:
            with request.urlopen(req, timeout=self.cfg.request_timeout_seconds) as resp:
                raw = resp.read().decode("utf-8")
                if not raw:
                    return {}
                try:
                    return json.loads(raw)
                except json.JSONDecodeError as exc:
                    preview = raw[:240].replace("\n", " ")
                    raise RuntimeError(f"Anytype API returned non-JSON response: {preview}") from exc
        except error.HTTPError as exc:
            detail = exc.read().decode("utf-8", errors="replace")
            raise RuntimeError(f"Anytype API HTTP {exc.code} {exc.reason}: {detail}") from exc
        except error.URLError as exc:
            raise RuntimeError(f"Anytype API network error: {exc.reason}") from exc

    def list_changes(self, cursor: str | None, limit: int) -> tuple[list[dict[str, Any]], str | None]:
        data = self._request_json(
            "GET",
            self.cfg.changes_endpoint,
            query={"cursor": cursor, "limit": limit, "space_id": self.cfg.workspace_or_space_id},
        )
        items = data.get("items") or data.get("objects") or []
        next_cursor = data.get("next_cursor") or data.get("cursor")
        return list(items), next_cursor

    def get_object(self, object_id: str) -> dict[str, Any]:
        return self._request_json("GET", f"{self.cfg.objects_endpoint}/{parse.quote(object_id)}")

    def create_object(self, payload: dict[str, Any]) -> dict[str, Any]:
        return self._request_json("POST", self.cfg.objects_endpoint, body=payload)

    def update_object(self, object_id: str, payload: dict[str, Any]) -> dict[str, Any]:
        return self._request_json("PATCH", f"{self.cfg.objects_endpoint}/{parse.quote(object_id)}", body=payload)

    def archive_object(self, object_id: str, reason: str) -> dict[str, Any]:
        endpoint = self.cfg.archive_endpoint_template.replace("{object_id}", parse.quote(object_id))
        return self._request_json("POST", endpoint, body={"reason": reason, "status": "Archived"})


class SyncEngine:
    def __init__(self, root: Path, cfg_path: Path, mode: str, dry_run: bool, limit: int) -> None:
        self.root = root
        self.mode = mode
        self.dry_run = dry_run
        self.limit = limit
        self.cfg_path = cfg_path
        self.cfg = SyncConfig.load(cfg_path)

        self.kitchen_dir = root / "kitchen_anytype"
        self.registry_dir = self.kitchen_dir / "registry"
        self.map_path = self.registry_dir / "anytype-object-map.csv"
        self.state_path = self.registry_dir / "sync-state.json"
        self.lock_path = self.registry_dir / "sync-lock"
        self.log_path = self.registry_dir / f"sync-log-{datetime.now(UTC).date().isoformat()}.jsonl"

        self.archive_root = root / "archive" / "kitchen-anytype"
        self.conflict_root = root / "archive" / "conflicts"

        self.state = load_json(
            self.state_path,
            {"title": "sync-state", "purpose": "state of anytype sync", "owner": "sync-script", "last_updated": now_utc_iso(), "last_cursor": None},
        )
        self.rows = self._load_map()
        self.rows_by_path = {row["local_path"]: row for row in self.rows}
        self.rows_by_object = {row["anytype_object_id"]: row for row in self.rows if row.get("anytype_object_id")}
        self.actions: list[dict[str, Any]] = []

    def _load_map(self) -> list[dict[str, str]]:
        if not self.map_path.exists():
            return []
        rows: list[dict[str, str]] = []
        with self.map_path.open("r", encoding="utf-8", newline="") as f:
            reader = csv.DictReader(f)
            for r in reader:
                row = {k: (r.get(k) or "").strip() for k in REQUIRED_MAP_COLUMNS}
                rows.append(row)
        return rows

    def _save_map(self) -> None:
        ensure_parents(self.map_path)
        tmp_fd, tmp_name = tempfile.mkstemp(prefix="map-", suffix=".csv", dir=self.map_path.parent)
        os.close(tmp_fd)
        tmp_path = Path(tmp_name)
        try:
            with tmp_path.open("w", encoding="utf-8", newline="") as f:
                writer = csv.DictWriter(f, fieldnames=REQUIRED_MAP_COLUMNS)
                writer.writeheader()
                for row in sorted(self.rows, key=lambda it: it["local_path"]):
                    writer.writerow({k: row.get(k, "") for k in REQUIRED_MAP_COLUMNS})
            tmp_path.replace(self.map_path)
        finally:
            if tmp_path.exists():
                tmp_path.unlink(missing_ok=True)

    def _log_action(self, event: str, **payload: Any) -> None:
        entry = {"at": now_utc_iso(), "event": event, **payload}
        self.actions.append(entry)

    def _write_log(self) -> None:
        ensure_parents(self.log_path)
        with self.log_path.open("a", encoding="utf-8") as f:
            for item in self.actions:
                f.write(json.dumps(item, ensure_ascii=False) + "\n")

    def _ensure_row(self, local_rel: str) -> dict[str, str]:
        row = self.rows_by_path.get(local_rel)
        if row is not None:
            return row
        row = {k: "" for k in REQUIRED_MAP_COLUMNS}
        row["local_path"] = local_rel
        row["status"] = "active"
        row["kitchen_sync_id"] = str(uuid.uuid4())
        self.rows.append(row)
        self.rows_by_path[local_rel] = row
        return row

    def _read_local(self, rel_path: str) -> str:
        return (self.root / rel_path).read_text(encoding="utf-8")

    def _write_local(self, rel_path: str, content: str) -> None:
        target = self.root / rel_path
        if self.dry_run:
            self._log_action("dry_write_local", path=rel_path, bytes=len(content.encode("utf-8")))
            return
        atomic_write_text(target, content)

    def _extract_title(self, rel_path: str, content: str) -> str:
        for line in content.splitlines():
            if line.startswith("# "):
                return line[2:].strip()
        return Path(rel_path).stem.replace("-", " ").strip().title()

    def _format_human_markdown(self, title: str, body: str) -> str:
        lines = body.splitlines()
        if lines and lines[0].startswith("# "):
            return body if body.endswith("\n") else body + "\n"
        header = [
            f"# Title: {title}",
            "**Purpose:** Синхронизированный материал из Anytype для человеческой зоны.",
            f"**Owner:** {self.cfg.default_owner}",
            f"**Last updated:** {datetime.now(UTC).date().isoformat()}",
            "",
        ]
        return "\n".join(header) + body + ("\n" if not body.endswith("\n") else "")

    def _local_mtime(self, rel_path: str) -> str:
        p = self.root / rel_path
        if not p.exists():
            return ""
        ts = datetime.fromtimestamp(p.stat().st_mtime, tz=UTC).replace(microsecond=0)
        return ts.isoformat()

    def _is_local_changed_since_sync(self, row: dict[str, str]) -> bool:
        if not row.get("last_sync_at"):
            return True
        local_dt = parse_ts(row.get("local_updated_at")) or parse_ts(self._local_mtime(row["local_path"]))
        sync_dt = parse_ts(row.get("last_sync_at"))
        if not local_dt or not sync_dt:
            return True
        return local_dt > sync_dt

    def _is_remote_changed_since_sync(self, row: dict[str, str]) -> bool:
        if not row.get("last_sync_at"):
            return True
        remote_dt = parse_ts(row.get("remote_updated_at"))
        sync_dt = parse_ts(row.get("last_sync_at"))
        if not remote_dt or not sync_dt:
            return True
        return remote_dt > sync_dt

    def _archive_local_file(self, rel_path: str, reason: str, namespace: str, move: bool = False) -> str:
        src = self.root / rel_path
        if not src.exists():
            return rel_path
        stamp = datetime.now(UTC).strftime("%Y%m%dT%H%M%SZ")
        dst_rel = f"archive/{namespace}/{stamp}-{Path(rel_path).name}"
        dst = self.root / dst_rel
        if self.dry_run:
            self._log_action("dry_archive_local", source=rel_path, target=dst_rel, reason=reason)
            return dst_rel
        ensure_parents(dst)
        if move:
            shutil.move(str(src), str(dst))
        else:
            shutil.copy2(src, dst)
        self._log_action("archive_local", source=rel_path, target=dst_rel, reason=reason, move=move)
        return dst_rel

    def _choose_local_path_for_remote(self, item: dict[str, Any], row: dict[str, str] | None) -> str:
        # Respect previously tracked path when possible.
        if row and row.get("local_path"):
            return row["local_path"]

        service_path = str(item.get("kitchen_local_path") or "").strip()
        if service_path.startswith("kitchen_anytype/") and not service_path.startswith("kitchen_anytype/registry/"):
            return service_path

        bucket = "inbox"
        item_type = str(item.get("type") or "").lower()
        tags = [str(t).lower() for t in (item.get("tags") or [])]
        if "decision" in item_type or "decision" in tags:
            bucket = "decisions"
        elif "summary" in item_type or "report" in tags:
            bucket = "summaries"
        elif "glossary" in item_type or "term" in tags:
            bucket = "glossary"
        elif "task" in item_type or "action" in tags:
            bucket = "next-actions"

        title = str(item.get("title") or "untitled")
        slug = slugify(title)
        return f"kitchen_anytype/{bucket}/{slug}.md"

    def _extract_remote_identity(self, resp: dict[str, Any], fallback_id: str = "") -> tuple[str, str]:
        object_id = str(resp.get("id") or (resp.get("object") or {}).get("id") or fallback_id)
        updated = str(
            resp.get("updated_at")
            or (resp.get("object") or {}).get("updated_at")
            or now_utc_iso()
        )
        return object_id, updated

    def _build_payload(self, rel_path: str, content: str, row: dict[str, str]) -> dict[str, Any]:
        title = self._extract_title(rel_path, content)
        checksum = sha256_text(content)
        return {
            "space_id": self.cfg.workspace_or_space_id,
            "title": title,
            "content": content,
            "status": "Active",
            "kitchen_sync_id": row["kitchen_sync_id"],
            "kitchen_local_path": rel_path,
            "kitchen_last_sync_hash": checksum,
            "kitchen_last_sync_at": now_utc_iso(),
        }

    def _iter_local_files(self) -> list[str]:
        files: list[str] = []
        for p in sorted(self.kitchen_dir.rglob("*")):
            if not p.is_file():
                continue
            rel = rel_posix(p, self.root)
            if rel.startswith(IGNORED_PUSH_PREFIXES):
                continue
            if rel.endswith(IGNORED_PUSH_SUFFIXES):
                continue
            files.append(rel)
        return files

    def _sync_pull(self, client: AnytypeClient) -> None:
        cursor = self.state.get("last_cursor")
        items, next_cursor = client.list_changes(cursor=cursor, limit=self.limit)
        self._log_action("pull_fetched", count=len(items), cursor=cursor, next_cursor=next_cursor)

        for item in items:
            object_id = str(item.get("id") or "").strip()
            if not object_id:
                continue
            remote_updated_at = str(item.get("updated_at") or now_utc_iso())
            row = self.rows_by_object.get(object_id)

            if bool(item.get("deleted", False)):
                if row and row.get("local_path"):
                    archived_rel = self._archive_local_file(
                        row["local_path"],
                        reason="remote deleted",
                        namespace="kitchen-anytype",
                        move=True,
                    )
                    row["local_path"] = archived_rel
                    row["status"] = "archived"
                    row["last_sync_direction"] = "pull"
                    row["last_sync_at"] = now_utc_iso()
                    row["remote_updated_at"] = remote_updated_at
                continue

            rel_path = self._choose_local_path_for_remote(item, row)
            row = row or self._ensure_row(rel_path)
            row["anytype_object_id"] = object_id
            self.rows_by_object[object_id] = row
            if row["local_path"] != rel_path:
                old_path = row["local_path"]
                row["local_path"] = rel_path
                self.rows_by_path[rel_path] = row
                if old_path and old_path in self.rows_by_path:
                    del self.rows_by_path[old_path]

            remote_body = str(item.get("content") or "")
            remote_title = str(item.get("title") or Path(rel_path).stem)
            rendered = self._format_human_markdown(remote_title, remote_body)
            remote_hash = sha256_text(rendered)

            current_file = self.root / rel_path
            local_exists = current_file.exists()
            local_content = current_file.read_text(encoding="utf-8") if local_exists else ""
            local_hash = sha256_text(local_content) if local_exists else ""
            local_mtime = self._local_mtime(rel_path)

            if local_exists and local_hash != remote_hash and self._is_local_changed_since_sync(row) and self._is_remote_changed_since_sync(row):
                local_dt = parse_ts(local_mtime)
                remote_dt = parse_ts(remote_updated_at)
                winner_remote = True
                if local_dt and remote_dt:
                    winner_remote = remote_dt >= local_dt
                elif self.cfg.tie_breaker == "local":
                    winner_remote = False
                if winner_remote:
                    self._archive_local_file(rel_path, reason="conflict local snapshot", namespace="conflicts")
                    self._write_local(rel_path, rendered)
                    self._log_action("pull_conflict_remote_won", path=rel_path, object_id=object_id)
                else:
                    conflict_rel = f"archive/conflicts/{datetime.now(UTC).strftime('%Y%m%dT%H%M%SZ')}-{Path(rel_path).stem}-remote.md"
                    if self.dry_run:
                        self._log_action("dry_write_remote_snapshot", path=conflict_rel, object_id=object_id)
                    else:
                        atomic_write_text(self.root / conflict_rel, rendered)
                    self._log_action("pull_conflict_local_won", path=rel_path, object_id=object_id)
                    continue
            elif local_hash != remote_hash:
                self._write_local(rel_path, rendered)
                self._log_action("pull_write", path=rel_path, object_id=object_id)

            row["remote_updated_at"] = remote_updated_at
            row["local_updated_at"] = self._local_mtime(rel_path) if not self.dry_run else local_mtime
            row["last_sync_at"] = now_utc_iso()
            row["last_sync_direction"] = "pull"
            row["last_sync_hash"] = remote_hash
            row["status"] = "active"

        self.state["last_cursor"] = next_cursor

    def _sync_push(self, client: AnytypeClient | None) -> None:
        now_iso = now_utc_iso()
        current_files = set(self._iter_local_files())

        # Detect local removals for previously tracked active files.
        for row in self.rows:
            if row.get("status") != "active":
                continue
            rel = row.get("local_path", "")
            if not rel or rel.startswith("archive/"):
                continue
            if rel in current_files:
                continue
            object_id = row.get("anytype_object_id")
            if object_id:
                if self.dry_run:
                    self._log_action("dry_archive_remote", object_id=object_id, reason="local removed or moved")
                else:
                    if client is None:
                        raise RuntimeError("client is required for non-dry-run push")
                    client.archive_object(object_id, reason="local removed or moved")
                    self._log_action("push_archive_remote", object_id=object_id)
            row["status"] = "archived"
            row["last_sync_at"] = now_iso
            row["last_sync_direction"] = "push"

        # Push current files.
        for rel in sorted(current_files):
            full = self.root / rel
            content = full.read_text(encoding="utf-8")
            checksum = sha256_text(content)
            row = self._ensure_row(rel)
            object_id = row.get("anytype_object_id", "")

            if row.get("status") == "archived":
                row["status"] = "active"

            # Best effort conflict check.
            if object_id and row.get("remote_updated_at") and row.get("last_sync_at"):
                remote_dt = parse_ts(row["remote_updated_at"])
                local_dt = parse_ts(self._local_mtime(rel))
                sync_dt = parse_ts(row["last_sync_at"])
                if remote_dt and local_dt and sync_dt and remote_dt > sync_dt and local_dt > sync_dt:
                    if remote_dt > local_dt:
                        self._archive_local_file(rel, reason="push conflict local snapshot", namespace="conflicts")
                        self._log_action("push_conflict_remote_won", path=rel, object_id=object_id)
                        continue

            payload = self._build_payload(rel, content, row)
            if self.dry_run:
                action = "dry_push_update" if object_id else "dry_push_create"
                self._log_action(action, path=rel, object_id=object_id)
                continue

            if client is None:
                raise RuntimeError("client is required for non-dry-run push")
            if object_id:
                response = client.update_object(object_id, payload)
                self._log_action("push_update", path=rel, object_id=object_id)
            else:
                response = client.create_object(payload)
                self._log_action("push_create", path=rel)

            new_id, new_remote_updated = self._extract_remote_identity(response, fallback_id=object_id)
            row["anytype_object_id"] = new_id
            row["remote_updated_at"] = new_remote_updated
            row["local_updated_at"] = self._local_mtime(rel)
            row["last_sync_at"] = now_utc_iso()
            row["last_sync_direction"] = "push"
            row["last_sync_hash"] = checksum
            row["status"] = "active"
            self.rows_by_object[new_id] = row

    def run(self) -> int:
        if self.mode not in {"pull", "push", "bidirectional"}:
            raise RuntimeError(f"unsupported mode: {self.mode}")

        with FileLock(self.lock_path):
            client: AnytypeClient | None = None
            if self.mode in {"pull", "bidirectional"}:
                client = AnytypeClient(self.cfg)
            elif not self.dry_run:
                client = AnytypeClient(self.cfg)

            if self.mode in {"pull", "bidirectional"}:
                if client is None:
                    raise RuntimeError("client is required for pull")
                self._sync_pull(client)
            if self.mode in {"push", "bidirectional"}:
                self._sync_push(client)

            if self.dry_run:
                print("[DRY-RUN] No state files changed.")
                for action in self.actions:
                    print(json.dumps(action, ensure_ascii=False))
                return 0

            self.state["last_run_at"] = now_utc_iso()
            self.state["last_run_mode"] = self.mode
            self.state["last_run_result"] = "ok"
            self.state["last_updated"] = now_utc_iso()

            self._save_map()
            atomic_write_json(self.state_path, self.state)
            self._write_log()
            print(f"Sync completed: mode={self.mode}, actions={len(self.actions)}")
            return 0


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Bidirectional kitchen_anytype sync with Anytype API.")
    parser.add_argument("--mode", required=True, choices=["pull", "push", "bidirectional"])
    parser.add_argument("--dry-run", action="store_true", help="Plan only, no local/remote mutations.")
    parser.add_argument("--limit", type=int, default=200, help="Max remote changes fetched per pull cycle.")
    parser.add_argument(
        "--config",
        default="kitchen_anytype/registry/sync-config.yaml",
        help="Path to sync config yaml (simple key:value parser).",
    )
    parser.add_argument(
        "--root",
        default="",
        help="Project root path. Default: parent folder of scripts/anytype_sync.py.",
    )
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    script_root = Path(__file__).resolve().parents[1]
    root = Path(args.root).resolve() if args.root else script_root
    cfg_path = (root / args.config).resolve()
    engine = SyncEngine(root=root, cfg_path=cfg_path, mode=args.mode, dry_run=args.dry_run, limit=args.limit)
    return engine.run()


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except Exception as exc:  # noqa: BLE001 - CLI wrapper
        print(f"ERROR: {exc}", file=sys.stderr)
        raise SystemExit(1)
