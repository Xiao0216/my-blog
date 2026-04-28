import type { MinimalThreeBody } from "@/components/site/life-universe/minimal-three-scene-model"

export function getMinimalOrbitSeed(body: MinimalThreeBody) {
  return degreesToRadians(body.orbit.startAngle) + body.orbit.delaySeconds * 0.15
}

export function getMinimalOrbitAngularSpeed(body: MinimalThreeBody) {
  if (body.orbit.radius <= 0) {
    return 0
  }

  return (Math.PI * 2) / Math.max(body.orbit.durationSeconds, 0.001)
}

export function getMinimalRotationAngularSpeed(body: MinimalThreeBody) {
  if (body.rotation.durationSeconds <= 0) {
    return 0
  }

  return (Math.PI * 2) / body.rotation.durationSeconds
}

export function getMinimalOrbitPosition(
  body: MinimalThreeBody,
  angle: number
): [number, number, number] {
  if (body.orbit.radius <= 0) {
    return [0, 0, body.position[2]]
  }

  return [
    Math.cos(angle) * body.orbit.radius,
    Math.sin(angle) * body.orbit.radius * 0.72,
    body.position[2],
  ]
}

function degreesToRadians(value: number) {
  return (value * Math.PI) / 180
}
