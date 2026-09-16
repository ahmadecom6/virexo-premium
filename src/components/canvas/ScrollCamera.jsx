import { useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { easing } from 'maath'

export default function ScrollCamera() {
  const { camera } = useThree()

  useFrame((state, delta) => {
    // Calculate normalized scroll progress (0 to 1)
    const maxScroll = document.body.scrollHeight - window.innerHeight
    const scrollY = window.scrollY || 0
    const progress = Math.max(0, Math.min(1, scrollY / maxScroll))

    // Determine target position based on progress
    // At top (0), camera is at [0, 0, 5]
    // At bottom (1), camera flies closer and moves down, e.g., [0, -3, 2]
    const targetZ = 5 - (progress * 3)
    const targetY = -(progress * 4)
    
    // Slight rotation to look up as we go down
    const targetRotX = progress * 0.2

    easing.damp3(camera.position, [0, targetY, targetZ], 0.3, delta)
    easing.dampE(camera.rotation, [targetRotX, 0, 0], 0.3, delta)
  })

  return null
}
