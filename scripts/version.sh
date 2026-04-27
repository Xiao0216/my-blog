#!/usr/bin/env bash
set -euo pipefail

CONTAINER="${1:-ai-blog}"

echo "Git:"
printf '  branch: %s\n' "$(git branch --show-current 2>/dev/null || echo unknown)"
printf '  head:   %s\n' "$(git rev-parse --short HEAD 2>/dev/null || echo unknown)"
if [[ -n "$(git status --porcelain 2>/dev/null || true)" ]]; then
  echo "  dirty:  yes"
else
  echo "  dirty:  no"
fi

if ! docker inspect "$CONTAINER" >/dev/null 2>&1; then
  echo "容器不存在: $CONTAINER"
  exit 0
fi

image_id="$(docker inspect --format='{{.Image}}' "$CONTAINER")"
image_ref="$(docker inspect --format='{{.Config.Image}}' "$CONTAINER")"
created="$(docker inspect --format='{{.Created}}' "$CONTAINER")"
status="$(docker inspect --format='{{.State.Status}}' "$CONTAINER")"
health="$(docker inspect --format='{{if .State.Health}}{{.State.Health.Status}}{{else}}none{{end}}' "$CONTAINER")"

version="$(docker inspect --format='{{index .Config.Labels "org.opencontainers.image.version"}}' "$image_id" 2>/dev/null || true)"
revision="$(docker inspect --format='{{index .Config.Labels "org.opencontainers.image.revision"}}' "$image_id" 2>/dev/null || true)"
branch="$(docker inspect --format='{{index .Config.Labels "org.opencontainers.image.ref.name"}}' "$image_id" 2>/dev/null || true)"
build_date="$(docker inspect --format='{{index .Config.Labels "org.opencontainers.image.created"}}' "$image_id" 2>/dev/null || true)"

echo "Docker:"
printf '  container:  %s\n' "$CONTAINER"
printf '  image ref:  %s\n' "$image_ref"
printf '  image id:   %s\n' "$image_id"
printf '  status:     %s\n' "$status"
printf '  health:     %s\n' "$health"
printf '  created:    %s\n' "$created"
printf '  version:    %s\n' "${version:-unknown}"
printf '  revision:   %s\n' "${revision:-unknown}"
printf '  branch:     %s\n' "${branch:-unknown}"
printf '  build date: %s\n' "${build_date:-unknown}"
