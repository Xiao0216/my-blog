#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

ALLOW_DIRTY="${ALLOW_DIRTY:-0}"
RUN_TESTS="${RUN_TESTS:-0}"
SITE_URL="${NEXT_PUBLIC_SITE_URL:-https://blog.wenshuai.site}"
BRANCH="$(git branch --show-current 2>/dev/null || echo unknown)"
COMMIT="$(git rev-parse --short HEAD 2>/dev/null || echo unknown)"
FULL_COMMIT="$(git rev-parse HEAD 2>/dev/null || echo unknown)"
BUILD_DATE="$(date -u +%Y-%m-%dT%H:%M:%SZ)"

if [[ -n "$(git status --porcelain)" && "$ALLOW_DIRTY" != "1" ]]; then
  echo "工作区有未提交改动，停止部署。"
  echo "请先提交代码，或临时使用：ALLOW_DIRTY=1 scripts/deploy.sh"
  git status --short
  exit 1
fi

if [[ -n "$(git status --porcelain)" ]]; then
  VERSION="${COMMIT}-dirty-$(date -u +%Y%m%d%H%M%S)"
else
  VERSION="$COMMIT"
fi

export NEXT_PUBLIC_SITE_URL="$SITE_URL"
export APP_VERSION="$VERSION"
export GIT_COMMIT="$FULL_COMMIT"
export GIT_BRANCH="$BRANCH"
export BUILD_DATE="$BUILD_DATE"
export IMAGE_TAG="$VERSION"

echo "部署版本: $APP_VERSION"
echo "Git 分支: $GIT_BRANCH"
echo "Git 提交: $GIT_COMMIT"
echo "构建时间: $BUILD_DATE"
echo "站点地址: $NEXT_PUBLIC_SITE_URL"

echo "执行质量检查..."
npm run typecheck
npm run lint
if [[ "$RUN_TESTS" == "1" ]]; then
  npm test
fi

echo "构建并启动 Docker 服务..."
docker compose build \
  --build-arg NEXT_PUBLIC_SITE_URL="$NEXT_PUBLIC_SITE_URL" \
  --build-arg APP_VERSION="$APP_VERSION" \
  --build-arg GIT_COMMIT="$GIT_COMMIT" \
  --build-arg GIT_BRANCH="$GIT_BRANCH" \
  --build-arg BUILD_DATE="$BUILD_DATE" \
  web

docker tag "ai-blog:$IMAGE_TAG" ai-blog:latest
IMAGE_TAG="$IMAGE_TAG" docker compose up -d --no-build

echo "等待健康检查..."
for attempt in {1..30}; do
  status="$(docker inspect --format='{{if .State.Health}}{{.State.Health.Status}}{{else}}{{.State.Status}}{{end}}' ai-blog 2>/dev/null || echo missing)"
  if [[ "$status" == "healthy" ]]; then
    break
  fi
  if [[ "$attempt" == "30" ]]; then
    echo "容器未通过健康检查，当前状态: $status"
    docker compose ps
    docker logs --tail=80 ai-blog || true
    exit 1
  fi
  sleep 2
done

scripts/version.sh
