import { useEffect, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { RoundedBox } from '@react-three/drei'
import { MathUtils } from 'three'

const shell = { color: '#a8bbc9', metalness: 0.62, roughness: 0.3 }
const dark = { color: '#142735', metalness: 0.65, roughness: 0.34 }
const light = { color: '#64f7ff', emissive: '#13cfe3', emissiveIntensity: 2.5, toneMapped: false }
function Panel({ size, position, material = shell, radius = 0.12, ...props }) {
  return <RoundedBox args={size} position={position} radius={radius} smoothness={4} {...props}><meshStandardMaterial {...material} /></RoundedBox>
}
/** Local geometry: no GLB, remote textures, HDRI, or network dependency. */
export default function TrackingRobot({ reducedMotion = false, wave = 0, thinking = false, speaking = false }) {
  const body = useRef(), head = useRef(), eyes = useRef(), arm = useRef(), core = useRef()
  const pointer = useRef({ x: 0, y: 0 })
  const elapsed = useRef(0), waveStart = useRef(0)
  useEffect(() => { waveStart.current = elapsed.current }, [wave])
  useEffect(() => {
    if (reducedMotion || !matchMedia('(pointer: fine)').matches) return
    const move = (e) => { pointer.current = { x: e.clientX / innerWidth * 2 - 1, y: e.clientY / innerHeight * 2 - 1 } }
    const reset = () => { pointer.current = { x: 0, y: 0 } }
    window.addEventListener('pointermove', move, { passive: true })
    window.addEventListener('blur', reset)
    return () => { window.removeEventListener('pointermove', move); window.removeEventListener('blur', reset) }
  }, [reducedMotion])
  useFrame((_, delta) => {
    if (reducedMotion) return
    const dt = Math.min(delta, 0.05)
    elapsed.current += Math.min(delta, 1)
    const t = elapsed.current
    body.current.position.y = Math.sin(t * 1.35) * 0.09
    body.current.rotation.z = Math.sin(t * 0.7) * 0.035
    head.current.rotation.y = MathUtils.damp(head.current.rotation.y, pointer.current.x * 0.38, 5, dt)
    head.current.rotation.x = MathUtils.damp(head.current.rotation.x, pointer.current.y * 0.16 + (thinking ? Math.sin(t * 3) * .1 : 0), 5, dt)
    const blink = t % 4.7
    eyes.current.scale.y = blink > 4.45 ? Math.max(0.08, Math.abs(blink - 4.575) / 0.125) : 1
    const w = t - waveStart.current
    const greeting = w < 2.8 ? Math.sin(Math.min(w / 0.5, 1) * Math.PI / 2) * Math.min(1, (2.8 - w) / 0.5) : 0
    arm.current.rotation.z = 0.16 + greeting * (1.8 + Math.sin(w * 9) * 0.24)
    core.current.rotation.z = -t * (thinking ? 2 : 0.65)
    core.current.scale.setScalar(speaking ? 1 + Math.sin(t * 12) * .1 : 1)
  })
  return <group ref={body} rotation={[0.02, -0.16, 0]}>
    <group ref={head} position={[0, 1.04, 0]}>
      <Panel size={[1.65, 1.05, 0.98]} position={[0, 0, 0]} radius={0.24} />
      <Panel size={[1.38, 0.69, 0.15]} position={[0, -0.025, 0.5]} material={dark} radius={0.2} />
      <group ref={eyes} position={[0, 0.035, 0.6]}>
        {[-0.34, 0.34].map(x => <Panel key={x} size={[0.27, 0.17, 0.035]} position={[x, 0, 0]} material={light} radius={0.06} />)}
      </group>
      <mesh position={[0, -0.2, 0.595]}><boxGeometry args={[0.28, 0.025, 0.018]} /><meshBasicMaterial color="#42b5c9" /></mesh>
      {[-1, 1].map(side => <group key={side} position={[side * 0.87, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <mesh><cylinderGeometry args={[0.26, 0.26, 0.18, 32]} /><meshStandardMaterial {...dark} /></mesh>
        <mesh position={[0, side * -0.105, 0]}><cylinderGeometry args={[0.19, 0.19, 0.035, 32]} /><meshStandardMaterial {...light} /></mesh>
      </group>)}
      <mesh position={[0, 0.66, 0]}><cylinderGeometry args={[0.035, 0.055, 0.32, 16]} /><meshStandardMaterial {...dark} /></mesh>
      <mesh position={[0, 0.84, 0]}><sphereGeometry args={[0.095, 20, 20]} /><meshStandardMaterial {...light} /></mesh>
    </group>
    <mesh position={[0, 0.41, 0]}><cylinderGeometry args={[0.24, 0.24, 0.25, 24]} /><meshStandardMaterial {...dark} /></mesh>
    <Panel size={[1.26, 1.05, 0.76]} position={[0, -0.19, 0]} radius={0.22} />
    <Panel size={[0.92, 0.7, 0.08]} position={[0, -0.16, 0.4]} material={dark} radius={0.15} />
    <group ref={core} position={[0, -0.12, 0.46]}>
      <mesh><torusGeometry args={[0.21, 0.026, 12, 48, Math.PI * 1.65]} /><meshStandardMaterial {...light} /></mesh>
      <mesh><octahedronGeometry args={[0.115]} /><meshStandardMaterial {...light} /></mesh>
    </group>
    <mesh position={[0, -0.42, 0.46]}><boxGeometry args={[0.3, 0.022, 0.015]} /><meshBasicMaterial color="#75d6e4" /></mesh>
    {[-1, 1].map(side => <group key={side} ref={side === 1 ? arm : undefined} position={[side * 0.83, 0.17, 0]} rotation={[0, 0, side * 0.16]}>
      <mesh><sphereGeometry args={[0.22, 24, 24]} /><meshStandardMaterial {...dark} /></mesh>
      <Panel size={[0.34, 0.65, 0.38]} position={[0, -0.37, 0]} radius={0.13} />
      <mesh position={[0, -0.75, 0]}><sphereGeometry args={[0.2, 24, 24]} /><meshStandardMaterial {...dark} /></mesh>
      <Panel size={[0.32, 0.15, 0.1]} position={[0, -0.73, 0.16]} material={light} radius={0.04} />
    </group>)}
    {[-0.35, 0.35].map(x => <group key={x} position={[x, -0.84, 0]}>
      <mesh><cylinderGeometry args={[0.14, 0.14, 0.3, 20]} /><meshStandardMaterial {...dark} /></mesh>
      <Panel size={[0.42, 0.45, 0.52]} position={[0, -0.27, 0.06]} radius={0.14} />
      <mesh position={[0, -0.51, 0.06]}><cylinderGeometry args={[0.12, 0.17, 0.05, 24]} /><meshStandardMaterial {...light} /></mesh>
    </group>)}
  </group>
}
