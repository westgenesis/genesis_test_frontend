#!/bin/bash
set -e

# 默认为 production
MODE=${1:-production}

echo "🔄 拉取最新代码..."
git pull

docker compose build --build-arg MODE=$MODE

echo "🐳 启动容器..."
docker compose up -d

echo "✅ 部署完成。当前 MODE=$MODE"