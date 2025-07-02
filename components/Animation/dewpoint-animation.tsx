"use client"

import { useEffect, useRef } from "react"
import * as THREE from "three"
import type L from "leaflet"

interface DewpointAnimationProps {
  dewpoint: number
  visible: boolean
  position: L.LatLngExpression
  width?: number
  height?: number
  map: L.Map
}

const DewpointAnimation = ({ dewpoint, visible, position, width = 300, height = 300, map }: DewpointAnimationProps) => {
  const mountRef = useRef<HTMLDivElement>(null)
  const animationRef = useRef<number>(0)
  const sceneRef = useRef<THREE.Scene | null>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const condensationRef = useRef<THREE.Group | null>(null)

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
    camera.position.set(0, 3, 8)

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(width, height)
    renderer.setClearColor(0x000000, 0)
    mountRef.current.appendChild(renderer.domElement)

    const condensation = new THREE.Group()
    scene.add(condensation)

    sceneRef.current = scene
    rendererRef.current = renderer
    condensationRef.current = condensation

    updatePosition()

    const animate = () => {
      if (!visible) return
      animationRef.current = requestAnimationFrame(animate)

      if (condensationRef.current) {
        condensationRef.current.children.forEach((droplet, index) => {
          // Gentle falling motion
          droplet.position.y -= 0.02 + Math.random() * 0.01

          // Slight swaying
          droplet.position.x += Math.sin(Date.now() * 0.002 + index) * 0.005

          // Reset if fallen too far
          if (droplet.position.y < -3) {
            droplet.position.y = 3 + Math.random() * 2
            droplet.position.x = (Math.random() - 0.5) * 6
            droplet.position.z = (Math.random() - 0.5) * 6
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
    if (!condensationRef.current || !visible) return

    condensationRef.current.clear()

    // Convert dewpoint (assuming it's in tenths of degrees)
    const dewpointCelsius = dewpoint / 10

    // Higher dewpoint = more condensation
    const intensity = Math.max(0, (dewpointCelsius + 10) / 40) // Normalize -10°C to 30°C
    const dropletCount = Math.floor(intensity * 50)

    // Create water droplets
    for (let i = 0; i < dropletCount; i++) {
      const geometry = new THREE.SphereGeometry(0.05 + Math.random() * 0.1, 8, 6)
      const material = new THREE.MeshBasicMaterial({
        color: new THREE.Color().setHSL(0.55, 0.8, 0.7),
        transparent: true,
        opacity: 0.6 + Math.random() * 0.3,
      })

      const droplet = new THREE.Mesh(geometry, material)
      droplet.position.set((Math.random() - 0.5) * 6, 3 + Math.random() * 2, (Math.random() - 0.5) * 6)

      condensationRef.current.add(droplet)
    }

    // Add condensation surface for high dewpoint
    if (dewpointCelsius > 15) {
      const surfaceGeometry = new THREE.PlaneGeometry(8, 8)
      const surfaceMaterial = new THREE.MeshBasicMaterial({
        color: new THREE.Color().setHSL(0.55, 0.3, 0.8),
        transparent: true,
        opacity: ((dewpointCelsius - 15) / 15) * 0.2,
        side: THREE.DoubleSide,
      })

      const surface = new THREE.Mesh(surfaceGeometry, surfaceMaterial)
      surface.rotation.x = -Math.PI / 2
      surface.position.y = -0.5
      condensationRef.current.add(surface)
    }
  }, [dewpoint, visible])

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

export default DewpointAnimation
