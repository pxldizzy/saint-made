#!/bin/sh
# Neon на free-тарифе засыпает при простое, и первая попытка миграции может
# упасть по таймауту advisory-блокировки (P1002). Пробуем несколько раз.
i=1
while [ $i -le 4 ]; do
  if npx prisma migrate deploy; then
    exit 0
  fi
  echo "migrate deploy: попытка $i не удалась, ждём и повторяем…"
  i=$((i + 1))
  sleep 8
done
echo "migrate deploy: не удалось за 4 попытки"
exit 1
