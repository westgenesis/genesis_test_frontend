#!/bin/bash
set -e

echo "🔄 拉取最新代码..."
git pull

echo "🐳 构建并启动容器..."
docker-compose up -d --build

echo "✅ 部署完成。"