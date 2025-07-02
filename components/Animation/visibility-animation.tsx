"use client"

import { useEffect, useRef } from "react"
import * as THREE from "three"
import type L from "leaflet"

interface VisibilityAnimationProps {
  visibility: number
  visible: boolean
  position: L.LatLngExpression
  width?: number
  height?: number
  map: L.Map
}

const VisibilityAnimation = ({
  visibility,
  visible,
  position,
  width = 300,
  height = 300,
  map,
}: VisibilityAnimationProps) => {
  const mountRef = useRef<HTMLDivElement>(null)
  const animationRef = useRef<number>(0)
  const sceneRef = useRef<THREE.Scene | null>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const fogRef = useRef<THREE.Group | null>(null)

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
    camera.position.set(0, 2, 8)

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(width, height)
    renderer.setClearColor(0x000000, 0)
    mountRef.current.appendChild(renderer.domElement)

    const fog = new THREE.Group()
    scene.add(fog)

    sceneRef.current = scene
    rendererRef.current = renderer
    fogRef.current = fog

    updatePosition()

    const animate = () => {
      if (!visible) return
      animationRef.current = requestAnimationFrame(animate)

      if (fogRef.current) {
        fogRef.current.children.forEach((particle, index) => {
          // Slow drifting motion
          particle.position.x += Math.sin(Date.now() * 0.0005 + index) * 0.01
          particle.position.z += Math.cos(Date.now() * 0.0005 + index) * 0.01

          // Gentle vertical movement
          particle.position.y += Math.sin(Date.now() * 0.001 + index) * 0.005

          // Slow rotation
          particle.rotation.y += 0.002
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
    if (!fogRef.current || !visible) return

    fogRef.current.clear()

    // Lower visibility = more fog
    const fogIntensity = Math.max(0, (50 - visibility) / 50)
    const particleCount = Math.floor(fogIntensity * 20)

    if (fogIntensity > 0.1) {
      // Create fog layers
      for (let layer = 0; layer < 3; layer++) {
        const fogGeometry = new THREE.PlaneGeometry(15, 15)
        const fogMaterial = new THREE.MeshBasicMaterial({
          color: new THREE.Color().setHSL(0, 0, 0.8 - layer * 0.1),
          transparent: true,
          opacity: fogIntensity * (0.3 - layer * 0.05),
          side: THREE.DoubleSide,
        })

        const fogPlane = new THREE.Mesh(fogGeometry, fogMaterial)
        fogPlane.rotation.x = -Math.PI / 2 + (Math.random() - 0.5) * 0.2
        fogPlane.position.y = layer * 0.5
        fogPlane.position.x = (Math.random() - 0.5) * 2
        fogPlane.position.z = (Math.random() - 0.5) * 2

        fogRef.current.add(fogPlane)
      }

      // Add fog particles
      for (let i = 0; i < particleCount; i++) {
        const geometry = new THREE.SphereGeometry(0.3 + Math.random() * 0.5, 8, 6)
        const material = new THREE.MeshBasicMaterial({
          color: new THREE.Color().setHSL(0, 0, 0.9),
          transparent: true,
          opacity: fogIntensity * 0.2,
        })

        const particle = new THREE.Mesh(geometry, material)
        particle.position.set((Math.random() - 0.5) * 12, Math.random() * 3, (Math.random() - 0.5) * 12)

        fogRef.current.add(particle)
      }
    }
  }, [visibility, visible])

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

export default VisibilityAnimation
