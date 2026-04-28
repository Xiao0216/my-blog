"use client"

import { useLoader } from "@react-three/fiber"
import { BackSide, TextureLoader } from "three"

export function MinimalStarfieldBackdrop() {
  const starfieldMap = useLoader(TextureLoader, "/planets/threex/galaxy_starfield.png")

  return (
    <mesh position={[0, 0, -420]}>
      <sphereGeometry args={[900, 48, 32]} />
      <meshBasicMaterial map={starfieldMap} opacity={0.34} side={BackSide} transparent />
    </mesh>
  )
}
