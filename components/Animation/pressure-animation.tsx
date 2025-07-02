"use client"

import { useEffect, useRef } from "react"
import * as THREE from "three"
import type L from "leaflet"

interface PressureAnimationProps {
  pressure: number
  visible: boolean
  position: L.LatLngExpression
  width?: number
  height?: number
  map: L.Map
}

const PressureAnimation = ({ pressure, visible, position, width = 300, height = 300, map }: PressureAnimationProps) => {
  const mountRef = useRef<HTMLDivElement>(null)
  const animationRef = useRef<number>(0)
  const sceneRef = useRef<THREE.Scene | null>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const pressureRingsRef = useRef<THREE.Group | null>(null)

  const updatePosition = () => {
    if (!mountRef.current || !map || !position) return
    const point = map.latLngToContainerPoint(position)
    mountRef.current.style.left = `${point.x - width / 2}px`
    mountRef.current.style.top = `${point.y - height / 2 - 300}px`
  }

  useEffect(() => {
    if (!mountRef.current || !visible || !position) return

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000)
    camera.position.set(0, 8, 0)
    camera.lookAt(0, 0, 0)

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(width, height)
    renderer.setClearColor(0x000000, 0)
    mountRef.current.appendChild(renderer.domElement)

    const pressureRings = new THREE.Group()
    scene.add(pressureRings)

    sceneRef.current = scene
    rendererRef.current = renderer
    pressureRingsRef.current = pressureRings

    updatePosition()

    const animate = () => {
      if (!visible) return
      animationRef.current = requestAnimationFrame(animate)

      if (pressureRingsRef.current) {
        pressureRingsRef.current.children.forEach((ring, index) => {
          // Pulsing effect based on pressure
          const scale = 1 + Math.sin(Date.now() * 0.003 + index * 0.5) * 0.1
          ring.scale.setScalar(scale)

          // Gentle rotation
          ring.rotation.z += 0.005
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
    if (!pressureRingsRef.current || !visible) return

    pressureRingsRef.current.clear()

    // Convert pressure (assuming it's in tenths of hPa)
    const pressureHPa = pressure / 10
    const normalPressure = 1013.25
    const pressureDiff = pressureHPa - normalPressure

    // Determine if high or low pressure
    const isHighPressure = pressureDiff > 0
    const intensity = Math.abs(pressureDiff) / 50 // Normalize

    // Create pressure rings
    const ringCount = 3 + Math.floor(intensity * 3)

    for (let i = 0; i < ringCount; i++) {
      const radius = 1 + i * 0.8
      const geometry = new THREE.RingGeometry(radius, radius + 0.2, 32)

      // Color based on pressure type
      const color = isHighPressure
        ? new THREE.Color().setHSL(0.0, 0.6, 0.5) // Red for high pressure
        : new THREE.Color().setHSL(0.6, 0.6, 0.5) // Blue for low pressure

      const material = new THREE.MeshBasicMaterial({
        color: color,
        transparent: true,
        opacity: 0.3 - i * 0.05,
        side: THREE.DoubleSide,
      })

      const ring = new THREE.Mesh(geometry, material)
      ring.rotation.x = -Math.PI / 2

      pressureRingsRef.current.add(ring)
    }

    // Add center indicator
    const centerGeometry = new THREE.CircleGeometry(0.5, 16)
    const centerMaterial = new THREE.MeshBasicMaterial({
      color: isHighPressure ? 0xff4444 : 0x4444ff,
      transparent: true,
      opacity: 0.6,
    })

    const center = new THREE.Mesh(centerGeometry, centerMaterial)
    center.rotation.x = -Math.PI / 2
    pressureRingsRef.current.add(center)

    // Add pressure text (simplified as a small indicator)
    const textGeometry = new THREE.SphereGeometry(0.1, 8, 6)
    const textMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffff,
    })
    const textIndicator = new THREE.Mesh(textGeometry, textMaterial)
    textIndicator.position.y = 0.1
    pressureRingsRef.current.add(textIndicator)
  }, [pressure, visible])

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

export default PressureAnimation
