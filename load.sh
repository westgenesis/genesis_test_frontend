#!/bin/bash
set -e

TAR_FILE="genesis_test_frontend.tar"
CONTAINER_NAME="genesis_test_frontend"
PORT="5001:80"   # 根据你的应用端口自行修改

echo "=== Step 1: 检查镜像文件是否存在 ==="

if [ ! -f "$TAR_FILE" ]; then
  echo "❌ 错误：找不到镜像文件 $TAR_FILE"
  exit 1
fi

echo ">>> 找到镜像文件：$TAR_FILE"

echo "=== Step 2: 载入镜像 ==="

LOAD_OUTPUT=$(docker load -i "$TAR_FILE")
echo "$LOAD_OUTPUT"

# 从 docker load 输出中提取镜像名
IMAGE_FULL_NAME=$(echo "$LOAD_OUTPUT" | grep -oP '(?<=Loaded image: ).*')

if [ -z "$IMAGE_FULL_NAME" ]; then
  echo "❌ 错误：无法解析镜像名称"
  exit 1
fi

echo ">>> 已成功加载镜像：$IMAGE_FULL_NAME"

echo "=== Step 3: 若容器存在先停止并删除 ==="
if docker ps -a --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
  echo ">>> 停止旧容器..."
  docker stop $CONTAINER_NAME || true
  docker rm $CONTAINER_NAME || true
fi

echo "=== Step 4: 启动容器 ==="

docker run -d \
  --name "$CONTAINER_NAME" \
  -p $PORT \
  "$IMAGE_FULL_NAME"

echo "=== 完成！容器已启动 ==="
docker ps | grep "$CONTAINER_NAME"