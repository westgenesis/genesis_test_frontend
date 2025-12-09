#!/bin/bash
set -e

echo "🔄 从 ${REMOTE} 拉取最新代码..."
git pull

echo "⬇️ 拉取最新镜像..."
docker-compose pull

echo "🐳 构建并启动容器..."
docker-compose up -d --build

echo "✅ 部署完成。"