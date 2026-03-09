# Title: Setup Obsidian Sync
**Purpose:** Пошаговая настройка двусторонней синхронизации категорий между Obsidian Vault и локальной зоной проекта.  
**Owner:** You  
**Last updated:** 2026-03-05

## 1) Проверка установки Obsidian
```bash
brew install --cask obsidian
```

## 2) Импорт архива Anytype в Obsidian-контур
```bash
python3 scripts/obsidian_sync.py --mode import --zip /Users/maximisaev/Downloads/Anytype.20260305.210043.07.zip
```

## 3) Проверка dry-run
```bash
python3 scripts/obsidian_sync.py --mode pull --dry-run
python3 scripts/obsidian_sync.py --mode push --dry-run
```

## 4) Ручной запуск двустороннего синка
```bash
python3 scripts/obsidian_sync.py --mode bidirectional
```

## 5) Установка автосинхронизации (каждые 15 минут)
```bash
bash scripts/install_obsidian_sync_launchd.sh
```

## 6) Проверка launchd
```bash
launchctl list | rg com.kitchen_v.obsidian_sync
tail -n 50 kitchen_obsidian/registry/launchd-stdout.log
tail -n 50 kitchen_obsidian/registry/launchd-stderr.log
```

## 7) Отключение автосинхронизации
```bash
bash scripts/uninstall_obsidian_sync_launchd.sh
```
