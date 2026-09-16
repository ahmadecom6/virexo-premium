import { useEffect } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import TrackingRobot from './TrackingRobot'

function ContextLifecycle({ onFailure }) {
  const gl = useThree(state => state.gl)
  useEffect(() => {
    const lost = (event) => { event.preventDefault(); onFailure() }
    gl.domElement.addEventListener('webglcontextlost', lost)
    return () => gl.domElement.removeEventListener('webglcontextlost', lost)
  }, [gl, onFailure])
  return null
}

export default function Scene({ reducedMotion, active, wave, thinking, speaking, onReady, onFailure }) {
  return <Canvas
    camera={{ position: [0, 0.4, 6.9], fov: 39 }}
    dpr={[1, 1.5]}
    frameloop={active && !reducedMotion ? 'always' : 'demand'}
    gl={{ alpha: true, antialias: true, powerPreference: 'low-power' }}
    onCreated={({ gl }) => { gl.setClearAlpha(0); onReady() }}
    style={{ position: 'absolute', inset: 0, zIndex: 2 }}
  >
    <ContextLifecycle onFailure={onFailure} />
    <ambientLight intensity={1.3} />
    <hemisphereLight args={['#b7efff', '#142638', 2]} />
    <directionalLight position={[3, 5, 5]} intensity={4} color="#e8f7ff" />
    <directionalLight position={[-4, 2, 1]} intensity={3} color="#24daf3" />
    <directionalLight position={[2, -1, -3]} intensity={5} color="#7363ff" />
    <TrackingRobot reducedMotion={reducedMotion} wave={wave} thinking={thinking} speaking={speaking} />
  </Canvas>
}
