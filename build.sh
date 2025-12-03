#!/bin/bash
set -e

IMAGE_NAME="genesis_test_frontend"
IMAGE_TAG="latest"
PLATFORM="linux/amd64"
OUTPUT_FILE="genesis_test_frontend.tar"

echo "=== Step 1: 使用 buildx 构建指定架构镜像（platform=$PLATFORM） ==="

# --load 会把构建好的镜像加载到当前 docker 镜像仓库
docker buildx build \
  --platform $PLATFORM \
  -t ${IMAGE_NAME}:${IMAGE_TAG} \
  --load \
  .

echo "=== Step 2: 导出镜像为 tar 文件 ==="

docker save -o ${OUTPUT_FILE} ${IMAGE_NAME}:${IMAGE_TAG}

echo "=== 完成！镜像已导出到 ${OUTPUT_FILE} ==="