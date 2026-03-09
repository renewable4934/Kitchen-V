# Title: Setup Anytype Sync
**Purpose:** Пошаговая настройка двусторонней синхронизации `kitchen_anytype` ↔ Anytype.  
**Owner:** Вы.  
**Last updated:** 2026-03-05

## 1) Подготовить токен Anytype API
1. Получите API token в Anytype.
2. В терминале выставьте переменную окружения:
```bash
export ANYTYPE_API_KEY="put-your-token-here"
```

## 2) Заполнить ID рабочего пространства
1. Откройте `kitchen_anytype/registry/sync-config.yaml`.
2. Укажите `anytype_api_base` и endpoint-пути из вашей версии Anytype API.
3. Укажите `workspace_or_space_id`.

## 3) Проверить dry-run
```bash
python3 scripts/anytype_sync.py --mode bidirectional --dry-run
```

## 4) Запустить реальную синхронизацию вручную
```bash
python3 scripts/anytype_sync.py --mode bidirectional
```

## 5) Включить автозапуск каждые 15 минут (macOS launchd)
```bash
export ANYTYPE_API_KEY="put-your-token-here"
bash scripts/install_anytype_sync_launchd.sh
```

## 6) Проверить статус launchd
```bash
launchctl list | rg com.kitchen_v.anytype_sync
tail -n 50 kitchen_anytype/registry/launchd-stdout.log
tail -n 50 kitchen_anytype/registry/launchd-stderr.log
```

## 7) Остановить синхронизацию
```bash
bash scripts/uninstall_anytype_sync_launchd.sh
```
