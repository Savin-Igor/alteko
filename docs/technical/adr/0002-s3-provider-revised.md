# ADR 0002 — MinIO на Hetzner Volume как production S3 backend

| | |
|---|---|
| Дата | 2026-05-11 |
| Статус | **Принято** (supersedes ADR-0001) |
| Автор | ALTEKO team |
| Связанные | #152 (issue), ADR-0001 (superseded), `docs/DEPLOY.md` |

---

## Контекст

ADR-0001 выбрал Hetzner Object Storage, аргументируя надёжностью хранения. Этот аргумент оказался ошибочным: **Hetzner Volume — сетевое блочное хранилище на Ceph-кластере** с встроенной репликацией, а не один физический диск.

Дополнительно: статус Hetzner Object Storage API в регионах Falkenstein/Helsinki не был подтверждён на момент принятия ADR-0001.

---

## Решение

Использовать **MinIO single-node** на существующем Hetzner Volume (`/mnt/data/alteko/minio`).

### Архитектура

```
Hetzner VPS (89.167.4.195)
/mnt/data/alteko/minio/  ← данные на Hetzner Volume (Ceph)

docker-compose.yml:
  app         → http://minio:9000 (внутренняя docker-сеть)
  db          (postgres)
  minio       → /mnt/data/alteko/minio, port 127.0.0.1:3021:9000
  minio-init  (one-shot: создаёт buckets при первом старте)
```

### Buckets

| Bucket | Содержимое | Срок хранения |
|--------|-----------|---------------|
| `alteko-documents` | Документы дома (энергосертификат, протоколы) | бессрочно |
| `alteko-uploads` | PDF-счета пользователей | 90 дней после анализа |
| `alteko-reports` | Readiness Report PDF | 365 дней |
| `alteko-media` | Payload CMS media | бессрочно |

---

## Tradeoffs

| Критерий | MinIO на Volume | Hetzner Object Storage |
|---|---|---|
| Стоимость/мес | €0 (Volume оплачен) | ~€0.60 @ 100 GB |
| Durability | Ceph (~6×9) | 11×9 |
| RAM | +256 MB из 4 GB | 0 |
| Latency | <1 ms (docker-сеть) | ~2-5 ms |
| DR | detach/reattach Volume | managed |
| Vendor lock-in | нет (S3 API) | нет (S3 API) |

---

## DR-стратегия

Hetzner Volume защищает от disk failure (Ceph). Для off-site backup: cron rclone sync → Backblaze B2 (~€0.50/мес при 100 GB). Это отдельный follow-up issue (#154 item 3).

---

## Ограничения

- MinIO консоль недоступна публично — только через SSH-tunnel на порт 3021
- При падении VPS файлы недоступны до восстановления контейнера (данные сохраняются на Volume)
- Single-node MinIO без HA — acceptable для данного объёма и стадии

---

## Acceptance criteria

- [x] ADR-0001 помечен как Superseded
- [x] `minio` и `minio-init` сервисы добавлены в `docker-compose.yml`
- [x] `deploy.yml` создаёт `/mnt/data/alteko/minio` при деплое
- [x] `.env.example` документирует MinIO credentials
- [ ] Smoke test: загрузить файл, прочитать обратно (пост-деплой, после установки реальных credentials)
