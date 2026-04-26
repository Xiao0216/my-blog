"use client"

import { useEffect, useMemo, useRef } from "react"

import { useFrame } from "@react-three/fiber"

import type { MinimalThreeBody } from "@/components/site/life-universe/minimal-three-scene-model"
import {
  getMinimalOrbitAngularSpeed,
  getMinimalOrbitPosition,
  getMinimalOrbitSeed,
} from "@/components/site/life-universe/minimal-three-orbit"

type MinimalConnection = {
  readonly fromBody: MinimalThreeBody
  readonly id: string
  readonly positions: Float32Array
  readonly toBody: MinimalThreeBody
}

type MutableBufferAttribute = {
  needsUpdate?: boolean
}

function writePoint(
  target: Float32Array,
  offset: number,
  point: readonly [number, number, number]
) {
  target[offset] = point[0]
  target[offset + 1] = point[1]
  target[offset + 2] = point[2]
}

function writeConnectionPositions(
  connection: MinimalConnection,
  fromAngle: number,
  toAngle: number
) {
  writePoint(
    connection.positions,
    0,
    getMinimalOrbitPosition(connection.fromBody, fromAngle)
  )
  writePoint(
    connection.positions,
    3,
    getMinimalOrbitPosition(connection.toBody, toAngle)
  )
}

function formatConnection(positions?: Float32Array) {
  if (!positions) {
    return ""
  }

  return Array.from(positions)
    .map((value) => String(Math.round(value * 10000000) / 10000000))
    .join(",")
}

export function MinimalConnections({
  activePlanetId,
  bodies,
  isMotionPaused,
}: {
  readonly activePlanetId?: string
  readonly bodies: ReadonlyArray<MinimalThreeBody>
  readonly isMotionPaused: boolean
}) {
  const anglesRef = useRef(new Map<string, number>())
  const attributeRefs = useRef(new Map<string, MutableBufferAttribute | null>())

  function readAngle(body: MinimalThreeBody) {
    return anglesRef.current.get(body.id) ?? getMinimalOrbitSeed(body)
  }

  const connections = useMemo(() => {
    if (!activePlanetId) {
      return []
    }

    const activeBody = bodies.find((body) => body.id === activePlanetId)

    if (!activeBody) {
      return []
    }

    return bodies
      .filter((body) => body.id !== activePlanetId)
      .slice(0, 3)
      .map((body) => {
        const connection: MinimalConnection = {
          fromBody: activeBody,
          id: `${activePlanetId}-${body.id}`,
          positions: new Float32Array(6),
          toBody: body,
        }

        writeConnectionPositions(connection, readAngle(activeBody), readAngle(body))

        return connection
      })
  }, [activePlanetId, bodies])

  useEffect(() => {
    const bodyIds = new Set(bodies.map((body) => body.id))

    for (const bodyId of anglesRef.current.keys()) {
      if (!bodyIds.has(bodyId)) {
        anglesRef.current.delete(bodyId)
      }
    }

    for (const body of bodies) {
      if (!anglesRef.current.has(body.id)) {
        anglesRef.current.set(body.id, getMinimalOrbitSeed(body))
      }
    }
  }, [bodies])

  useFrame((_, delta = 0) => {
    const safeDelta = Math.max(0, delta)

    if (!isMotionPaused) {
      for (const body of bodies) {
        anglesRef.current.set(
          body.id,
          readAngle(body) + safeDelta * getMinimalOrbitAngularSpeed(body)
        )
      }
    }

    for (const connection of connections) {
      writeConnectionPositions(
        connection,
        readAngle(connection.fromBody),
        readAngle(connection.toBody)
      )

      const attribute = attributeRefs.current.get(connection.id)

      if (attribute) {
        attribute.needsUpdate = true
      }
    }
  })

  return (
    <group
      data-first-connection={formatConnection(connections[0]?.positions)}
      data-testid="minimal-connections"
    >
      {connections.map((connection) => (
        <line key={connection.id}>
          <bufferGeometry>
            <bufferAttribute
              ref={(attribute: MutableBufferAttribute | null) => {
                attributeRefs.current.set(connection.id, attribute)
              }}
              args={[connection.positions, 3]}
              attach="attributes-position"
              count={connection.positions.length / 3}
            />
          </bufferGeometry>
          <lineBasicMaterial color="#9f8f76" opacity={0.12} transparent />
        </line>
      ))}
    </group>
  )
}
