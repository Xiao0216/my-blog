"use client"

import { Canvas } from "@react-three/fiber"

import type { MinimalThreeScene } from "@/components/site/life-universe/minimal-three-scene-model"
import { MinimalConnections } from "@/components/site/life-universe/minimal-connections"
import { MinimalOrbitPaths } from "@/components/site/life-universe/minimal-orbit-paths"
import { MinimalPlanetMesh } from "@/components/site/life-universe/minimal-planet-mesh"
import { MinimalStarField } from "@/components/site/life-universe/minimal-star-field"

export function PlanetUniverseScene({
  scene,
  focusedPlanetId,
  hoveredPlanetId,
  isMotionPaused,
  isReducedMotion,
  onEnterPlanet,
  onHoverPlanet,
  onLeavePlanet,
}: {
  readonly scene: MinimalThreeScene
  readonly focusedPlanetId?: string
  readonly hoveredPlanetId?: string
  readonly isMotionPaused: boolean
  readonly isReducedMotion: boolean
  readonly onEnterPlanet: (planetId: string) => void
  readonly onHoverPlanet: (planetId: string, point: { x: number; y: number }) => void
  readonly onLeavePlanet: (planetId: string) => void
}) {
  const activePlanetId = hoveredPlanetId ?? focusedPlanetId

  return (
    <div
      className="minimal-three-scene"
      data-reduced-motion={isReducedMotion ? "true" : "false"}
      data-testid="minimal-three-scene"
    >
      <Canvas
        camera={{ fov: 42, position: [0, 0, 760] }}
        dpr={[1, 1.5]}
        gl={{ alpha: true, antialias: true, preserveDrawingBuffer: true }}
      >
        <ambientLight intensity={0.38} />
        <directionalLight color="#fff3df" intensity={1.65} position={[260, 220, 360]} />
        <pointLight color="#8c949f" intensity={0.26} position={[-260, -200, 180]} />
        <hemisphereLight args={["#c8d6ff", "#17110d", 0.34]} />
        <group>
          <MinimalStarField stars={scene.stars} />
          <MinimalOrbitPaths bodies={scene.bodies} />
          <MinimalConnections
            activePlanetId={activePlanetId}
            bodies={scene.bodies}
            isMotionPaused={isMotionPaused || isReducedMotion}
          />
          {scene.bodies.map((body) => (
            <group key={body.id}>
              <MinimalPlanetMesh
                body={body}
                isDimmed={Boolean(activePlanetId) && activePlanetId !== body.id}
                isFocused={focusedPlanetId === body.id}
                isHovered={hoveredPlanetId === body.id}
                isMotionPaused={isMotionPaused || isReducedMotion}
                isReducedMotion={isReducedMotion}
                onEnterPlanet={onEnterPlanet}
                onHoverPlanet={onHoverPlanet}
                onLeavePlanet={onLeavePlanet}
              />
            </group>
          ))}
        </group>
      </Canvas>
    </div>
  )
}
