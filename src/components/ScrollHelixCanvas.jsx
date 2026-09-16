import { useEffect, useRef } from 'react'
import * as THREE from 'three'

export default function ScrollHelixCanvas() {
  const containerRef = useRef(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return undefined

    // Scene, Camera, Renderer
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000)
    camera.position.set(0, 0, 48)

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'high-performance' })
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 2)
    renderer.setPixelRatio(pixelRatio)
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.2
    container.appendChild(renderer.domElement)

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x0a1426, 2.5)
    scene.add(ambientLight)

    const mainLight = new THREE.DirectionalLight(0xffffff, 2.8)
    mainLight.position.set(20, 35, 30)
    scene.add(mainLight)

    const blueRimLight = new THREE.DirectionalLight(0x00f2fe, 3.2)
    blueRimLight.position.set(-25, -15, -20)
    scene.add(blueRimLight)

    const amberLight = new THREE.PointLight(0xf59e0b, 4, 40)
    amberLight.position.set(5, 0, 10)
    scene.add(amberLight)

    const cyanLight = new THREE.PointLight(0x00f2fe, 4, 40)
    cyanLight.position.set(-5, 8, 12)
    scene.add(cyanLight)

    // Materials
    const metalMaterial = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.32,
      metalness: 0.88,
    })

    const darkJointMaterial = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.25,
      metalness: 0.95,
    })

    const amberGlowMaterial = new THREE.MeshStandardMaterial({
      color: 0xfbbf24,
      emissive: 0xf59e0b,
      emissiveIntensity: 2.8,
      roughness: 0.2,
    })

    const cyanGlowMaterial = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x00f2fe,
      emissiveIntensity: 2.6,
      roughness: 0.2,
    })

    const purpleGlowMaterial = new THREE.MeshStandardMaterial({
      color: 0xc084fc,
      emissive: 0xa855f7,
      emissiveIntensity: 2.4,
      roughness: 0.2,
    })

    // Group for the entire DNA Helix structure
    const helixGroup = new THREE.Group()
    scene.add(helixGroup)

    const numRungs = 44
    const radius = 9
    const verticalSpan = 70
    const twist = 3.6 * Math.PI

    const strand1Points = []
    const strand2Points = []

    // Build rungs and node components
    for (let i = 0; i < numRungs; i++) {
      const t = i / (numRungs - 1)
      const angle = t * twist
      const y = (t - 0.5) * verticalSpan

      const x1 = Math.cos(angle) * radius
      const z1 = Math.sin(angle) * radius

      const x2 = Math.cos(angle + Math.PI) * radius
      const z2 = Math.sin(angle + Math.PI) * radius

      const p1 = new THREE.Vector3(x1, y, z1)
      const p2 = new THREE.Vector3(x2, y, z2)

      strand1Points.push(p1)
      strand2Points.push(p2)

      // Bridge Cylinder
      const distance = p1.distanceTo(p2)
      const rungGeom = new THREE.CylinderGeometry(0.35, 0.35, distance, 12)
      const rungMesh = new THREE.Mesh(rungGeom, metalMaterial)

      const midPoint = new THREE.Vector3().addVectors(p1, p2).multiplyScalar(0.5)
      rungMesh.position.copy(midPoint)

      const dir = new THREE.Vector3().subVectors(p2, p1).normalize()
      const orientation = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir)
      rungMesh.setRotationFromQuaternion(orientation)
      helixGroup.add(rungMesh)

      // Illuminated Center Node & Rings on every 2nd rung
      if (i % 2 === 0) {
        const glowChoice = i % 6 === 0 ? purpleGlowMaterial : i % 4 === 0 ? cyanGlowMaterial : amberGlowMaterial
        const nodeOuterGeom = new THREE.CylinderGeometry(0.7, 0.7, 1.4, 16)
        const nodeOuter = new THREE.Mesh(nodeOuterGeom, darkJointMaterial)
        nodeOuter.position.copy(midPoint)
        nodeOuter.setRotationFromQuaternion(orientation)
        helixGroup.add(nodeOuter)

        const ringGeom = new THREE.TorusGeometry(0.76, 0.16, 12, 24)
        const ringMesh = new THREE.Mesh(ringGeom, glowChoice)
        ringMesh.position.copy(midPoint)
        ringMesh.setRotationFromQuaternion(orientation)
        ringMesh.rotateX(Math.PI / 2)
        helixGroup.add(ringMesh)
      }

      // Strand Backbone Joints
      const jointGeom = new THREE.SphereGeometry(0.65, 12, 12)
      const joint1 = new THREE.Mesh(jointGeom, darkJointMaterial)
      joint1.position.copy(p1)
      helixGroup.add(joint1)

      const joint2 = new THREE.Mesh(jointGeom, darkJointMaterial)
      joint2.position.copy(p2)
      helixGroup.add(joint2)

      // Glowing collar on selected joints
      if (i % 3 === 0) {
        const collarGeom = new THREE.TorusGeometry(0.75, 0.12, 12, 24)
        const collar1 = new THREE.Mesh(collarGeom, amberGlowMaterial)
        collar1.position.copy(p1)
        helixGroup.add(collar1)

        const collar2 = new THREE.Mesh(collarGeom, cyanGlowMaterial)
        collar2.position.copy(p2)
        helixGroup.add(collar2)
      }
    }

    // Continuous Backbone Tubes
    const curve1 = new THREE.CatmullRomCurve3(strand1Points)
    const tubeGeom1 = new THREE.TubeGeometry(curve1, 140, 0.42, 12, false)
    const tube1 = new THREE.Mesh(tubeGeom1, metalMaterial)
    helixGroup.add(tube1)

    const curve2 = new THREE.CatmullRomCurve3(strand2Points)
    const tubeGeom2 = new THREE.TubeGeometry(curve2, 140, 0.42, 12, false)
    const tube2 = new THREE.Mesh(tubeGeom2, metalMaterial)
    helixGroup.add(tube2)

    // Initial positioning
    helixGroup.rotation.z = 0.28
    helixGroup.rotation.x = 0.2

    // Scroll & Mouse Tracking
    let targetScroll = 0
    let currentScroll = 0
    let mouseX = 0
    let mouseY = 0

    const onScroll = () => {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight
      targetScroll = scrollable > 0 ? window.scrollY / scrollable : 0
    }

    const onMouseMove = (event) => {
      mouseX = (event.clientX / window.innerWidth - 0.5) * 2
      mouseY = (event.clientY / window.innerHeight - 0.5) * 2
    }

    const onResize = () => {
      const width = window.innerWidth
      const height = window.innerHeight
      camera.aspect = width / height
      camera.updateProjectionMatrix()
      renderer.setSize(width, height)
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('mousemove', onMouseMove, { passive: true })
    window.addEventListener('resize', onResize)

    // Render loop with smooth interpolation (cinematic scroll effect)
    let frameId = 0
    let clock = new THREE.Clock()

    const animate = () => {
      frameId = requestAnimationFrame(animate)
      const elapsedTime = clock.getElapsedTime()

      // Smooth scroll lerp
      currentScroll += (targetScroll - currentScroll) * 0.065

      // Helix rotation: continuous idle spin + scroll progression
      helixGroup.rotation.y = elapsedTime * 0.18 + currentScroll * Math.PI * 3.2
      helixGroup.rotation.x = 0.2 + Math.sin(currentScroll * Math.PI) * 0.4 + mouseY * 0.08
      helixGroup.rotation.z = 0.28 + Math.cos(currentScroll * Math.PI * 1.5) * 0.25 + mouseX * 0.08

      // Cinematic Camera Keyframing based on scroll
      // Scroll 0.0 - 0.2 (Hero): Wide establishing view
      // Scroll 0.2 - 0.5 (Zoom In): Macro focus on glowing node cylinders
      // Scroll 0.5 - 0.8 (Stats): Pan to side with card highlights
      // Scroll 0.8 - 1.0 (Outro): Distant backdrop
      if (currentScroll < 0.35) {
        const p = currentScroll / 0.35
        camera.position.z = 48 - p * 24 // Zooms in from 48 to 24
        camera.position.y = -p * 6
        camera.position.x = mouseX * 2.5 + p * 8
      } else if (currentScroll < 0.7) {
        const p = (currentScroll - 0.35) / 0.35
        camera.position.z = 24 + p * 12 // Pulls back slightly to 36
        camera.position.y = -6 + p * 14
        camera.position.x = 8 - p * 16 + mouseX * 2.5
      } else {
        const p = (currentScroll - 0.7) / 0.3
        camera.position.z = 36 + p * 14 // Zooms out to 50
        camera.position.y = 8 - p * 12
        camera.position.x = -8 + p * 8 + mouseX * 2.5
      }

      camera.lookAt(0, 0, 0)

      renderer.render(scene, camera)
    }

    animate()

    return () => {
      cancelAnimationFrame(frameId)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('resize', onResize)
      renderer.dispose()
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement)
      }
    }
  }, [])

  return (
    <div
      ref={containerRef}
      className="scroll-helix-container"
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 0,
        overflow: 'hidden',
      }}
      aria-hidden="true"
    />
  )
}
