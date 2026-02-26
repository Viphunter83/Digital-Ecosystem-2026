# Maintenance & Safety Guide

Инструкции по безопасному обслуживанию системы в режиме Production.

## 1. Безопасность (Danger Zone)
Все опасные скрипты перемещены в директорию `infra/danger_zone/`. 
- **`nuclear_reset.exp`**: Полная очистка сетей и пересборка стека. Использовать только в крайнем случае.
- **`hard_reset.exp`**: Жесткий перезапуск всех контейнеров.

**Правило**: Никогда не запускайте скрипты из этой папки без предварительного бэкапа базы данных.

## 2. Мониторинг и логи
Для проверки работоспособности используйте следующие команды через SSH:

### Проверка статуса контейнеров:
```bash
docker ps
```

### Просмотр логов бэкенда:
```bash
docker logs --tail 100 russtanko-russtankoprod-colyja-backend-1
```

### Проверка API каталога:
```bash
curl -I http://localhost:8000/catalog/search
```

## 3. Решение частых проблем
### Пропал каталог на сайте
1. Проверьте статус контейнера `backend`. Если он в состоянии `Restarting`, проверьте логи.
2. Убедитесь, что база данных `db` запущена и доступна.
3. Проверьте правильность `DATABASE_URL` в настройках Dokploy.

### Ошибки Git Pull на сервере
Если Dokploy не может обновить код, зайдите на сервер и выполните:
```bash
cd /etc/dokploy/compose/russtanko-russtankoprod-colyja/code
git status
# Если есть "грязные" файлы, сбросьте их:
## 4. Почта и Доставляемость (Mail & DNS)
Для работы почтовых уведомлений и синхронизации с AmoCRM критически важны настройки в панели RU-CENTER:

### Проверка DNS:
- **MX**: `10 mx1.beget.com`, `20 mx2.beget.com`
- **SPF**: `v=spf1 redirect=beget.com`
- **DKIM**: TXT-запись `beget._domainkey` (ключ Beget)
- **DMARC**: TXT-запись `_dmarc` со значением `v=DMARC1; p=none;`

### Обслуживание ящика:
- Основной ящик: `zakaz@tdrusstankosbyt.ru`
- Если письма попадают в спам на стороне получателя, проверьте статус DKIM через `dig txt beget._domainkey.tdrusstankosbyt.ru`.
