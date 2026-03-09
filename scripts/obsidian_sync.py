#!/usr/bin/env python3
"""Title: Obsidian Sync Script
Purpose: Bidirectional category-based sync for kitchen_obsidian/vault <-> kitchen_obsidian/local-zone.
Owner: You
Last updated: 2026-03-05
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
import zipfile
from dataclasses import dataclass
from datetime import UTC, datetime
from pathlib import Path
from typing import Any

MAP_COLUMNS = [
    "sync_id",
    "category",
    "vault_path",
    "local_path",
    "last_vault_updated",
    "last_local_updated",
    "last_sync_at",
    "last_sync_direction",
    "last_sync_hash",
    "status",
]


def now_iso() -> str:
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


def ensure_parent(path: Path) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)


def atomic_write_text(path: Path, content: str) -> None:
    ensure_parent(path)
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
        if value.lower() in {"true", "false"}:
            data[key] = value.lower() == "true"
        elif value.isdigit():
            data[key] = int(value)
        elif value.startswith("[") and value.endswith("]"):
            items = [v.strip().strip("'").strip('"') for v in value[1:-1].split(",") if v.strip()]
            data[key] = items
        else:
            data[key] = value
    return data


def sha256_text(text: str) -> str:
    return hashlib.sha256(text.encode("utf-8")).hexdigest()


def rel_posix(path: Path, root: Path) -> str:
    return path.relative_to(root).as_posix()


def slugify(text: str) -> str:
    out = []
    for ch in text.lower():
        if ch.isalnum():
            out.append(ch)
        elif ch in (" ", "_", "-"):
            out.append("-")
    slug = "".join(out)
    while "--" in slug:
        slug = slug.replace("--", "-")
    return slug.strip("-") or "untitled"


def infer_title(content: str, fallback: str) -> str:
    for line in content.splitlines():
        s = line.strip()
        if s.startswith("# "):
            return s[2:].strip()
    return fallback


def ensure_project_meta(md_content: str, fallback_title: str) -> str:
    # Keep existing project meta if already present.
    if "# Title:" in md_content or "**Purpose:**" in md_content:
        return md_content

    title = infer_title(md_content, fallback_title)
    header = (
        f"# Title: {title}\n"
        "**Purpose:** Импортированный материал для human-zone синхронизации Obsidian.\n"
        "**Owner:** You\n"
        f"**Last updated:** {datetime.now(UTC).date().isoformat()}\n\n"
    )

    # If frontmatter exists, place header after it.
    if md_content.startswith("---\n"):
        second = md_content.find("\n---\n", 4)
        if second != -1:
            fm = md_content[: second + 5]
            rest = md_content[second + 5 :]
            rest = rest.lstrip("\n")
            return f"{fm}\n{header}{rest}".rstrip() + "\n"

    return (header + md_content.lstrip("\n")).rstrip() + "\n"


def category_for_markdown(name: str) -> str:
    n = name.lower()
    if any(k in n for k in ("plan", "fakt", "rasshifrovka", "analitika")):
        return "summaries"
    if any(k in n for k in ("soglasovanie", "soveshchaniia", "crm")):
        return "decisions"
    if any(k in n for k in ("voprosy", "try-more", "untitled")):
        return "next-actions"
    return "inbox"


@dataclass
class SyncConfig:
    vault_root: str
    local_zone_root: str
    poll_interval_seconds: int
    tie_breaker: str
    archive_on_delete: bool
    excluded_paths: list[str]

    @classmethod
    def load(cls, path: Path) -> "SyncConfig":
        raw = parse_simple_yaml(path)
        return cls(
            vault_root=str(raw.get("vault_root", "kitchen_obsidian/vault")),
            local_zone_root=str(raw.get("local_zone_root", "kitchen_obsidian/local-zone")),
            poll_interval_seconds=int(raw.get("poll_interval_seconds", 900)),
            tie_breaker=str(raw.get("tie_breaker", "newer_timestamp")),
            archive_on_delete=bool(raw.get("archive_on_delete", True)),
            excluded_paths=list(raw.get("excluded_paths", [".obsidian/", "registry/"])),
        )


class FileLock:
    def __init__(self, path: Path) -> None:
        self.path = path
        self._fd: Any = None

    def __enter__(self) -> "FileLock":
        ensure_parent(self.path)
        self._fd = self.path.open("a+", encoding="utf-8")
        try:
            fcntl.flock(self._fd.fileno(), fcntl.LOCK_EX | fcntl.LOCK_NB)
        except BlockingIOError:
            raise RuntimeError(f"sync already running (lock busy): {self.path}")
        self._fd.seek(0)
        self._fd.truncate(0)
        self._fd.write(f"pid={os.getpid()} at {now_iso()}\n")
        self._fd.flush()
        return self

    def __exit__(self, exc_type: Any, exc: Any, tb: Any) -> None:
        if self._fd is not None:
            fcntl.flock(self._fd.fileno(), fcntl.LOCK_UN)
            self._fd.close()


class ObsidianSyncEngine:
    def __init__(self, root: Path, cfg_path: Path, mode: str, dry_run: bool, zip_path: str, limit: int) -> None:
        self.root = root
        self.mode = mode
        self.dry_run = dry_run
        self.zip_path = zip_path
        self.limit = limit
        self.cfg_path = cfg_path
        self.cfg = SyncConfig.load(cfg_path)

        self.vault_root = (root / self.cfg.vault_root).resolve()
        self.local_root = (root / self.cfg.local_zone_root).resolve()
        self.obsidian_root = root / "kitchen_obsidian"
        self.registry_dir = self.obsidian_root / "registry"

        self.map_path = self.registry_dir / "obsidian-object-map.csv"
        self.state_path = self.registry_dir / "sync-state.json"
        self.lock_path = self.registry_dir / "sync-lock"
        self.log_path = self.registry_dir / f"sync-log-{datetime.now(UTC).date().isoformat()}.jsonl"

        self.archive_deletions = root / "archive" / "obsidian-sync" / "deletions"
        self.archive_conflicts = root / "archive" / "obsidian-sync" / "conflicts"
        self.archive_import = root / "archive" / "obsidian-sync" / "import-snapshots"

        self.state = load_json(
            self.state_path,
            {
                "title": "Obsidian Sync State",
                "purpose": "State and checkpoints for obsidian sync.",
                "owner": "sync-script",
                "last_updated": now_iso(),
                "last_run_mode": "",
                "last_run_at": "",
                "last_run_result": "",
            },
        )
        self.rows = self._load_map()
        self.rows_by_rel: dict[str, dict[str, str]] = {}
        for row in self.rows:
            rel = self._rel_from_row(row)
            if rel:
                self.rows_by_rel[rel] = row

        self.actions: list[dict[str, Any]] = []

    def _load_map(self) -> list[dict[str, str]]:
        if not self.map_path.exists():
            return []
        rows: list[dict[str, str]] = []
        with self.map_path.open("r", encoding="utf-8", newline="") as f:
            reader = csv.DictReader(f)
            for r in reader:
                rows.append({k: (r.get(k) or "").strip() for k in MAP_COLUMNS})
        return rows

    def _save_map(self) -> None:
        ensure_parent(self.map_path)
        fd, tmp_name = tempfile.mkstemp(prefix="map-", suffix=".csv", dir=self.map_path.parent)
        os.close(fd)
        tmp = Path(tmp_name)
        try:
            with tmp.open("w", encoding="utf-8", newline="") as f:
                writer = csv.DictWriter(f, fieldnames=MAP_COLUMNS)
                writer.writeheader()
                for row in sorted(self.rows, key=lambda x: x.get("vault_path", "")):
                    writer.writerow({k: row.get(k, "") for k in MAP_COLUMNS})
            tmp.replace(self.map_path)
        finally:
            if tmp.exists():
                tmp.unlink(missing_ok=True)

    def _write_log(self) -> None:
        ensure_parent(self.log_path)
        with self.log_path.open("a", encoding="utf-8") as f:
            for item in self.actions:
                f.write(json.dumps(item, ensure_ascii=False) + "\n")

    def _log(self, event: str, **payload: Any) -> None:
        self.actions.append({"at": now_iso(), "event": event, **payload})

    def _rel_from_row(self, row: dict[str, str]) -> str:
        vp = row.get("vault_path", "")
        if not vp:
            return ""
        prefix = self.cfg.vault_root.rstrip("/") + "/"
        return vp[len(prefix) :] if vp.startswith(prefix) else ""

    def _ensure_row(self, rel: str) -> dict[str, str]:
        row = self.rows_by_rel.get(rel)
        if row is not None:
            return row
        category = rel.split("/", 1)[0] if "/" in rel else "inbox"
        row = {k: "" for k in MAP_COLUMNS}
        row["sync_id"] = str(uuid.uuid4())
        row["category"] = category
        row["vault_path"] = f"{self.cfg.vault_root.rstrip('/')}/{rel}"
        row["local_path"] = f"{self.cfg.local_zone_root.rstrip('/')}/{rel}"
        row["status"] = "active"
        self.rows.append(row)
        self.rows_by_rel[rel] = row
        return row

    def _iter_side(self, root_dir: Path) -> dict[str, Path]:
        found: dict[str, Path] = {}
        for p in sorted(root_dir.rglob("*")):
            if not p.is_file():
                continue
            rel = rel_posix(p, root_dir)
            if any(rel.startswith(prefix) for prefix in self.cfg.excluded_paths):
                continue
            if rel.endswith((".tmp", ".swp", ".lock")):
                continue
            found[rel] = p
        return found

    def _mtime_iso(self, path: Path) -> str:
        ts = datetime.fromtimestamp(path.stat().st_mtime, tz=UTC).replace(microsecond=0)
        return ts.isoformat()

    def _archive_copy(self, path: Path, namespace: str, reason: str) -> Path:
        stamp = datetime.now(UTC).strftime("%Y%m%dT%H%M%SZ")
        safe_name = path.name
        if namespace == "deletions":
            target = self.archive_deletions / f"{stamp}-{safe_name}"
        else:
            target = self.archive_conflicts / f"{stamp}-{safe_name}"
        if self.dry_run:
            self._log("dry_archive_copy", source=str(path), target=str(target.relative_to(self.root)), reason=reason)
            return target
        ensure_parent(target)
        shutil.copy2(path, target)
        self._log("archive_copy", source=str(path), target=str(target.relative_to(self.root)), reason=reason)
        return target

    def _copy_file(self, src: Path, dst: Path, reason: str) -> None:
        if self.dry_run:
            self._log("dry_copy", source=str(src), target=str(dst), reason=reason)
            return
        ensure_parent(dst)
        shutil.copy2(src, dst)
        self._log("copy", source=str(src), target=str(dst), reason=reason)

    def _changed_since_sync(self, mtime: str, row: dict[str, str]) -> bool:
        last = parse_ts(row.get("last_sync_at"))
        mt = parse_ts(mtime)
        if mt is None or last is None:
            return True
        return mt > last

    def _sync_one(self, rel: str, row: dict[str, str], vault_file: Path | None, local_file: Path | None) -> None:
        # Deletion semantics for previously tracked files.
        tracked_before = bool(row.get("last_sync_at"))
        status = row.get("status", "active")

        if status == "active" and tracked_before and vault_file is None and local_file is not None:
            self._archive_copy(local_file, "deletions", reason="deleted in vault")
            row["status"] = "archived"
            row["last_sync_direction"] = "pull"
            row["last_sync_at"] = now_iso()
            return

        if status == "active" and tracked_before and local_file is None and vault_file is not None:
            self._archive_copy(vault_file, "deletions", reason="deleted in local-zone")
            row["status"] = "archived"
            row["last_sync_direction"] = "push"
            row["last_sync_at"] = now_iso()
            return

        # New creation on one side.
        if vault_file is not None and local_file is None:
            target = self.local_root / rel
            self._copy_file(vault_file, target, reason="pull create")
            if not self.dry_run:
                local_file = target
            row["status"] = "active"
            row["last_sync_direction"] = "pull"
            row["last_sync_at"] = now_iso()

        if local_file is not None and vault_file is None:
            target = self.vault_root / rel
            self._copy_file(local_file, target, reason="push create")
            if not self.dry_run:
                vault_file = target
            row["status"] = "active"
            row["last_sync_direction"] = "push"
            row["last_sync_at"] = now_iso()

        if vault_file is None or local_file is None:
            return

        vault_bytes = vault_file.read_bytes()
        local_bytes = local_file.read_bytes()
        hv = hashlib.sha256(vault_bytes).hexdigest()
        hl = hashlib.sha256(local_bytes).hexdigest()

        vault_mtime = self._mtime_iso(vault_file)
        local_mtime = self._mtime_iso(local_file)

        if hv == hl:
            row["status"] = "active"
            row["last_sync_hash"] = hv
            row["last_vault_updated"] = vault_mtime
            row["last_local_updated"] = local_mtime
            if not row.get("last_sync_at"):
                row["last_sync_at"] = now_iso()
                row["last_sync_direction"] = "bidirectional"
            return

        vault_changed = self._changed_since_sync(vault_mtime, row)
        local_changed = self._changed_since_sync(local_mtime, row)

        winner = "vault"
        if vault_changed and local_changed:
            vt = parse_ts(vault_mtime)
            lt = parse_ts(local_mtime)
            if vt and lt:
                if lt > vt:
                    winner = "local"
                elif vt == lt:
                    winner = "vault"
            elif self.cfg.tie_breaker == "local":
                winner = "local"
        elif local_changed and not vault_changed:
            winner = "local"
        elif vault_changed and not local_changed:
            winner = "vault"
        else:
            vt = parse_ts(vault_mtime)
            lt = parse_ts(local_mtime)
            if vt and lt and lt > vt:
                winner = "local"
            elif self.cfg.tie_breaker == "local":
                winner = "local"

        if winner == "vault":
            self._archive_copy(local_file, "conflicts", reason="vault won conflict")
            self._copy_file(vault_file, local_file, reason="pull update")
            row["last_sync_direction"] = "pull"
            row["last_sync_hash"] = hv
            row["last_vault_updated"] = vault_mtime
            row["last_local_updated"] = self._mtime_iso(local_file) if not self.dry_run else local_mtime
        else:
            self._archive_copy(vault_file, "conflicts", reason="local-zone won conflict")
            self._copy_file(local_file, vault_file, reason="push update")
            row["last_sync_direction"] = "push"
            row["last_sync_hash"] = hl
            row["last_local_updated"] = local_mtime
            row["last_vault_updated"] = self._mtime_iso(vault_file) if not self.dry_run else vault_mtime

        row["status"] = "active"
        row["last_sync_at"] = now_iso()

    def _run_sync(self, direction: str) -> None:
        vault_files = self._iter_side(self.vault_root)
        local_files = self._iter_side(self.local_root)

        rel_set = set(vault_files) | set(local_files) | set(self.rows_by_rel)
        rel_list = sorted(rel_set)
        if self.limit > 0:
            rel_list = rel_list[: self.limit]

        for rel in rel_list:
            row = self._ensure_row(rel)
            v = vault_files.get(rel)
            l = local_files.get(rel)
            if direction == "pull" and l is not None and v is None and row.get("last_sync_at"):
                self._sync_one(rel, row, None, l)
                continue
            if direction == "push" and v is not None and l is None and row.get("last_sync_at"):
                self._sync_one(rel, row, v, None)
                continue
            self._sync_one(rel, row, v, l)

    def _import_from_zip(self, zip_path: Path) -> None:
        if not zip_path.exists():
            raise RuntimeError(f"zip not found: {zip_path}")

        stamp = datetime.now(UTC).strftime("%Y%m%dT%H%M%SZ")
        snapshot_dir = self.archive_import / f"{zip_path.stem}-{stamp}"
        if self.dry_run:
            self._log("dry_import_snapshot", source=str(zip_path), target=str(snapshot_dir.relative_to(self.root)))
            return

        snapshot_dir.mkdir(parents=True, exist_ok=True)
        with zipfile.ZipFile(zip_path, "r") as zf:
            zf.extractall(snapshot_dir)

        files = [p for p in snapshot_dir.rglob("*") if p.is_file()]
        for f in sorted(files):
            rel = rel_posix(f, snapshot_dir)
            lower = rel.lower()
            if lower.startswith("files/"):
                target_rel = rel
            elif lower.startswith("schemas/"):
                target_rel = rel
            elif f.suffix.lower() == ".md":
                category = category_for_markdown(f.name)
                target_rel = f"{category}/{f.name}"
            else:
                target_rel = f"files/{f.name}"

            vault_target = self.vault_root / target_rel
            local_target = self.local_root / target_rel

            content_bytes = f.read_bytes()
            if f.suffix.lower() == ".md":
                text = content_bytes.decode("utf-8", errors="replace")
                fallback = f.stem.replace("-", " ").strip().title()
                text = ensure_project_meta(text, fallback)
                atomic_write_text(vault_target, text)
                atomic_write_text(local_target, text)
                checksum = sha256_text(text)
            else:
                ensure_parent(vault_target)
                ensure_parent(local_target)
                shutil.copy2(f, vault_target)
                shutil.copy2(f, local_target)
                checksum = hashlib.sha256(content_bytes).hexdigest()

            row = self._ensure_row(target_rel)
            row["category"] = target_rel.split("/", 1)[0]
            row["status"] = "active"
            row["last_vault_updated"] = self._mtime_iso(vault_target)
            row["last_local_updated"] = self._mtime_iso(local_target)
            row["last_sync_at"] = now_iso()
            row["last_sync_direction"] = "import"
            row["last_sync_hash"] = checksum
            self._log("import_file", source=rel, target=target_rel)

    def run(self) -> int:
        allowed = {"import", "pull", "push", "bidirectional"}
        if self.mode not in allowed:
            raise RuntimeError(f"unsupported mode: {self.mode}")

        with FileLock(self.lock_path):
            if self.mode == "import":
                zip_file = Path(self.zip_path).expanduser().resolve()
                self._import_from_zip(zip_file)
            elif self.mode == "pull":
                self._run_sync("pull")
            elif self.mode == "push":
                self._run_sync("push")
            else:
                self._run_sync("bidirectional")

            if self.dry_run:
                print("[DRY-RUN] No state files changed.")
                for action in self.actions:
                    print(json.dumps(action, ensure_ascii=False))
                return 0

            self.state["last_run_mode"] = self.mode
            self.state["last_run_at"] = now_iso()
            self.state["last_run_result"] = "ok"
            self.state["last_updated"] = now_iso()
            atomic_write_json(self.state_path, self.state)
            self._save_map()
            self._write_log()
            print(f"Obsidian sync completed: mode={self.mode}, actions={len(self.actions)}")
            return 0


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Obsidian bidirectional sync tool")
    parser.add_argument("--mode", required=True, choices=["import", "pull", "push", "bidirectional"])
    parser.add_argument("--dry-run", action="store_true")
    parser.add_argument("--zip", default="", help="Path to zip export for import mode")
    parser.add_argument("--limit", type=int, default=0, help="Optional file limit per sync run (0 = no limit)")
    parser.add_argument("--config", default="kitchen_obsidian/registry/sync-config.yaml")
    parser.add_argument("--root", default="", help="Project root override")
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    base = Path(__file__).resolve().parents[1]
    root = Path(args.root).resolve() if args.root else base
    engine = ObsidianSyncEngine(
        root=root,
        cfg_path=(root / args.config).resolve(),
        mode=args.mode,
        dry_run=args.dry_run,
        zip_path=args.zip,
        limit=args.limit,
    )
    return engine.run()


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except Exception as exc:  # noqa: BLE001
        print(f"ERROR: {exc}", file=sys.stderr)
        raise SystemExit(1)
