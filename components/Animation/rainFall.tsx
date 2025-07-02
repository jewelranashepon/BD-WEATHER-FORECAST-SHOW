"use client"

import { useEffect, useRef } from "react"
import * as THREE from "three"
import type L from "leaflet"

interface RainFallAnimationProps {
  precipitation: number
  visible: boolean
  position: L.LatLngExpression
  width?: number
  height?: number
  color?: string
  map: L.Map
}

const RainFallAnimation = ({
  precipitation,
  visible,
  position,
  width = 300,
  height = 300,
  color = "#b0b0b0",
  map,
}: RainFallAnimationProps) => {
  const mountRef = useRef<HTMLDivElement>(null)
  const animationRef = useRef<number>(0)
  const sceneRef = useRef<THREE.Scene | null>(null)
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const rainRef = useRef<THREE.Group | null>(null)
  const cloudsRef = useRef<THREE.Group | null>(null)

  // Convert lat/lng to container pixel position
  const updatePosition = () => {
    if (!mountRef.current || !map || !position) return

    const point = map.latLngToContainerPoint(position)

    mountRef.current.style.left = `${point.x - width / 2}px`
    mountRef.current.style.top = `${point.y - height / 2 - 200}px`
  }

  useEffect(() => {
    if (!mountRef.current || !visible || !position) return

    // Initialize Three.js scene
    const scene = new THREE.Scene()
    scene.background = null 

    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000)
    camera.position.set(0, 5, 15)
    camera.lookAt(0, 0, 0)

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
    })
    renderer.setSize(width, height)
    renderer.setClearColor(0x000000, 0) 
    mountRef.current.appendChild(renderer.domElement)

    // Create rain group
    const rain = new THREE.Group()
    scene.add(rain)

    // Create clouds group
    const clouds = new THREE.Group()
    scene.add(clouds)

    // Add ambient light
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6)
    scene.add(ambientLight)

    // Add directional light
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
    directionalLight.position.set(10, 10, 5)
    scene.add(directionalLight)

    // Store references
    sceneRef.current = scene
    cameraRef.current = camera
    rendererRef.current = renderer
    rainRef.current = rain
    cloudsRef.current = clouds

    // Initial position update
    updatePosition()

    // Animation loop
    const animate = () => {
      if (!visible) return

      animationRef.current = requestAnimationFrame(animate)

      // Move rain drops downward
      if (rainRef.current) {
        rainRef.current.children.forEach((drop) => {
          drop.position.y -= 0.3 + Math.random() * 0.2
          // Reset position if drop falls below ground
          if (drop.position.y < -10) {
            drop.position.y = 10 + Math.random() * 5
            drop.position.x = (Math.random() - 0.5) * 15
            drop.position.z = (Math.random() - 0.5) * 15
          }
        })
      }

      // Animate clouds slightly
      if (cloudsRef.current) {
        cloudsRef.current.rotation.y += 0.001
        cloudsRef.current.children.forEach((cloud, index) => {
          cloud.position.x += Math.sin(Date.now() * 0.001 + index) * 0.01
        })
      }

      renderer.render(scene, camera)
    }

    animate()

    // Listen to map events to update position
    const handleMapMove = () => {
      updatePosition()
    }

    map.on("move", handleMapMove)
    map.on("zoom", handleMapMove)

    return () => {
      cancelAnimationFrame(animationRef.current)
      map.off("move", handleMapMove)
      map.off("zoom", handleMapMove)

      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement)
      }

      // Clean up Three.js resources
      renderer.dispose()
      scene.clear()
    }
  }, [width, height, visible, position, map])

  useEffect(() => {
    if (!rainRef.current || !cloudsRef.current || !visible || !position) return

    // Clear existing rain and clouds
    rainRef.current.clear()
    cloudsRef.current.clear()

    // Calculate rain intensity based on precipitation
    const rainCount = Math.min(30 + precipitation * 15, 300)
    const cloudCount = Math.min(3 + Math.floor(precipitation / 2), 8)

    // Parse color
    const rainColor = new THREE.Color(color)

    // Create rain drops
    for (let i = 0; i < rainCount; i++) {
      const rainGeometry = new THREE.BufferGeometry()
      const positions = new Float32Array(6)

      const x = (Math.random() - 0.5) * 15
      const y = 10 + Math.random() * 5
      const z = (Math.random() - 0.5) * 15

      positions[0] = x
      positions[1] = y
      positions[2] = z

      positions[3] = x + (Math.random() - 0.5) * 0.3
      positions[4] = y - 0.8 - Math.random() * 0.4
      positions[5] = z + (Math.random() - 0.5) * 0.3

      rainGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3))

      const rainMaterial = new THREE.LineBasicMaterial({
        color: rainColor,
        transparent: true,
        opacity: 0.6 + Math.random() * 0.3,
      })

      const rainDrop = new THREE.Line(rainGeometry, rainMaterial)
      rainRef.current.add(rainDrop)
    }

    // Create clouds
    for (let i = 0; i < cloudCount; i++) {
      const cloudGeometry = new THREE.SphereGeometry(0.8 + Math.random() * 1.2, 8, 6)
      const cloudMaterial = new THREE.MeshLambertMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.7 + Math.random() * 0.2,
      })
      const cloud = new THREE.Mesh(cloudGeometry, cloudMaterial)

      cloud.position.set((Math.random() - 0.5) * 12, 6 + Math.random() * 3, (Math.random() - 0.5) * 12)

      cloud.scale.y = 0.4 + Math.random() * 0.3
      cloud.scale.x = 1 + Math.random() * 0.5
      cloud.scale.z = 1 + Math.random() * 0.5

      cloudsRef.current.add(cloud)
    }
  }, [precipitation, visible, color, position])

  // Update position when map moves
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

export default RainFallAnimation