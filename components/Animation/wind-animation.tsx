import { useEffect, useRef } from "react"
import * as THREE from "three"
import type L from "leaflet"

interface WindAnimationProps {
  windSpeed: number
  windDirection: number
  visible: boolean
  position: L.LatLngExpression
  width?: number
  height?: number
  map: L.Map
}

const WindAnimation = ({
  windSpeed,
  windDirection,
  visible,
  position,
  width = 300,
  height = 300,
  map,
}: WindAnimationProps) => {
  const mountRef = useRef<HTMLDivElement>(null)
  const animationRef = useRef<number>(0)
  const sceneRef = useRef<THREE.Scene | null>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const windParticlesRef = useRef<THREE.Group | null>(null)

  const updatePosition = () => {
    if (!mountRef.current || !map || !position) return
    const point = map.latLngToContainerPoint(position)
    mountRef.current.style.left = `${point.x - width / 2 - 50}px`
    mountRef.current.style.top = `${point.y - height / 2 - 400}px`
  }

  useEffect(() => {
    if (!mountRef.current || !visible || !position) return

    const scene = new THREE.Scene()
    scene.background = null

    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000)
    camera.position.set(0, 5, 15)

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
    })
    renderer.setSize(width, height)
    renderer.setClearColor(0x000000, 0)
    mountRef.current.appendChild(renderer.domElement)

    const windParticles = new THREE.Group()
    scene.add(windParticles)

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8)
    scene.add(ambientLight)

    sceneRef.current = scene
    rendererRef.current = renderer
    windParticlesRef.current = windParticles

    updatePosition()

    const animate = () => {
      if (!visible) return
      animationRef.current = requestAnimationFrame(animate)

      // Animate wind particles
      if (windParticlesRef.current) {
        const directionRadians = (windDirection * Math.PI) / 180
        const speedFactor = windSpeed / 100

        windParticlesRef.current.children.forEach((particle) => {
          // Move particles in wind direction
          particle.position.x += Math.sin(directionRadians) * speedFactor * 0.2
          particle.position.z += Math.cos(directionRadians) * speedFactor * 0.2
          
          // Add some vertical movement
          particle.position.y += Math.sin(Date.now() * 0.01) * 0.02

          // Reset position if particle moves too far
          if (Math.abs(particle.position.x) > 15 || Math.abs(particle.position.z) > 15) {
            particle.position.x = (Math.random() - 0.5) * 10
            particle.position.z = (Math.random() - 0.5) * 10
            particle.position.y = (Math.random() - 0.5) * 8
          }
        })
      }

      renderer.render(scene, camera)
    }

    animate()

    const handleMapMove = () => updatePosition()
    map.on("move", handleMapMove)
    map.on("zoom", handleMapMove)

    return () => {
      cancelAnimationFrame(animationRef.current)
      map.off("move", handleMapMove)
      map.off("zoom", handleMapMove)
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement)
      }
      renderer.dispose()
      scene.clear()
    }
  }, [width, height, visible, position, map])

  useEffect(() => {
    if (!windParticlesRef.current || !visible || !position) return

    windParticlesRef.current.clear()

    const intensity = Math.min(windSpeed / 100, 1)
    const particleCount = Math.max(50, Math.min(200, windSpeed * 2))

    // Create wind streamlines
    for (let i = 0; i < 5; i++) {
      const points = []
      const directionRadians = (windDirection * Math.PI) / 180
      
      for (let j = 0; j < 20; j++) {
        const x = Math.sin(directionRadians) * j * 0.5 + (Math.random() - 0.5) * 2
        const y = (Math.random() - 0.5) * 4
        const z = Math.cos(directionRadians) * j * 0.5 + (Math.random() - 0.5) * 2
        points.push(new THREE.Vector3(x, y, z))
      }

      const curve = new THREE.CatmullRomCurve3(points)
      const geometry = new THREE.TubeGeometry(curve, 20, 0.05, 8, false)
      const material = new THREE.MeshBasicMaterial({
        color: 0x87ceeb,
        transparent: true,
        opacity: 0.4 + intensity * 0.3,
      })

      const streamline = new THREE.Mesh(geometry, material)
      windParticlesRef.current.add(streamline)
    }

    // Create wind direction arrow
    const arrowGeometry = new THREE.ConeGeometry(0.3, 2, 8)
    const arrowMaterial = new THREE.MeshBasicMaterial({
      color: 0x4169e1,
      transparent: true,
      opacity: 0.8,
    })
    const arrow = new THREE.Mesh(arrowGeometry, arrowMaterial)
    
    // Position and orient the arrow
    arrow.rotation.x = Math.PI / 2
    arrow.rotation.z = -windDirection * (Math.PI / 180)
    arrow.position.y = 2
    
    windParticlesRef.current.add(arrow)

    // Create floating particles
    const positions = new Float32Array(particleCount * 3)
    const velocities = new Float32Array(particleCount * 3)

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 10
      positions[i * 3 + 1] = (Math.random() - 0.5) * 8
      positions[i * 3 + 2] = (Math.random() - 0.5) * 10

      const directionRadians = (windDirection * Math.PI) / 180
      velocities[i * 3] = Math.sin(directionRadians) * intensity * 0.1
      velocities[i * 3 + 1] = (Math.random() - 0.5) * 0.02
      velocities[i * 3 + 2] = Math.cos(directionRadians) * intensity * 0.1
    }

    const particleGeometry = new THREE.BufferGeometry()
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))

    const particleMaterial = new THREE.PointsMaterial({
      color: 0x87ceeb,
      size: 0.05,
      transparent: true,
      opacity: 0.6,
    })

    const particles = new THREE.Points(particleGeometry, particleMaterial)
    windParticlesRef.current.add(particles)

  }, [windSpeed, windDirection, visible, position])

  useEffect(() => {
    updatePosition()
  }, [position, map])

  if (!visible || !position) return null

  return (
    <div
      ref={mountRef}
      style={{
        width,
        height,
        position: "absolute",
        pointerEvents: "none",
        zIndex: 1000,
      }}
    />
  )
}

export default WindAnimation