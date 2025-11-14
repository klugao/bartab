#!/bin/sh
set -e

# Substituir a porta padrão pela variável PORT do Cloud Run
if [ -n "$PORT" ]; then
    sed -i "s/listen 8080;/listen $PORT;/" /etc/nginx/conf.d/default.conf
fi

exec "$@"

