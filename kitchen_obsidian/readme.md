# Title: Kitchen Obsidian Zone
**Purpose:** Human-zone проекта на базе Obsidian для решений, сводок, терминов и следующих шагов.  
**Owner:** You  
**Last updated:** 2026-03-05

## Структура
1. `vault/` — рабочий Obsidian Vault.
2. `local-zone/` — локальная сторона для двусторонней синхронизации.
3. `registry/` — служебный реестр sync (map/state/config/lock/log).

## Правила
1. Синк только внутри `kitchen_obsidian/*`.
2. Удаления запрещены: только архивирование в `archive/obsidian-sync/`.
3. При конфликте версий побеждает более новый timestamp (при равенстве — `vault`).
