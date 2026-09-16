import React, { useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { Sphere, MeshDistortMaterial } from '@react-three/drei'

export default function TechGlobe(props) {
  const globeRef = useRef()
  const scrollRef = useRef(0)

  useEffect(() => {
    const onScroll = () => {
      scrollRef.current = window.scrollY
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useFrame((state) => {
    if (globeRef.current) {
      globeRef.current.rotation.y = state.clock.elapsedTime * 0.1 + scrollRef.current * 0.005
      globeRef.current.rotation.x = state.clock.elapsedTime * 0.05 + scrollRef.current * 0.002
    }
  })

  return (
    <group {...props}>
      <Sphere ref={globeRef} args={[1.5, 64, 64]}>
        <MeshDistortMaterial
          color="#1e293b"
          roughness={0.2}
          metalness={0.8}
          distort={0.2}
          speed={2}
          wireframe={true}
          emissive="#00f2fe"
          emissiveIntensity={0.5}
        />
      </Sphere>
    </group>
  )
}
