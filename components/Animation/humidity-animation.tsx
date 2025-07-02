"use client"

import { useEffect, useRef } from "react"
import * as THREE from "three"
import type L from "leaflet"

interface HumidityAnimationProps {
  humidity: number
  visible: boolean
  position: L.LatLngExpression
  width?: number
  height?: number
  map: L.Map
}

const HumidityAnimation = ({ humidity, visible, position, width = 300, height = 300, map }: HumidityAnimationProps) => {
  const mountRef = useRef<HTMLDivElement>(null)
  const animationRef = useRef<number>(0)
  const sceneRef = useRef<THREE.Scene | null>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const vaporRef = useRef<THREE.Group | null>(null)

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
    camera.position.set(0, 3, 10)

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(width, height)
    renderer.setClearColor(0x000000, 0)
    mountRef.current.appendChild(renderer.domElement)

    const vapor = new THREE.Group()
    scene.add(vapor)

    sceneRef.current = scene
    rendererRef.current = renderer
    vaporRef.current = vapor

    updatePosition()

    const animate = () => {
      if (!visible) return
      animationRef.current = requestAnimationFrame(animate)

      if (vaporRef.current) {
        vaporRef.current.children.forEach((particle, index) => {
          // Gentle upward movement
          particle.position.y += 0.02 + Math.sin(Date.now() * 0.002 + index) * 0.01

          // Slight horizontal drift
          particle.position.x += Math.sin(Date.now() * 0.001 + index) * 0.005
          particle.position.z += Math.cos(Date.now() * 0.001 + index) * 0.005

          // Gentle rotation
          particle.rotation.y += 0.005

          // Scale pulsing
          const scale = 1 + Math.sin(Date.now() * 0.003 + index) * 0.2
          particle.scale.setScalar(scale)

          // Reset if too high
          if (particle.position.y > 8) {
            particle.position.y = -1
            particle.position.x = (Math.random() - 0.5) * 8
            particle.position.z = (Math.random() - 0.5) * 8
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
    if (!vaporRef.current || !visible) return

    vaporRef.current.clear()

    const intensity = humidity / 100
    const particleCount = Math.floor(10 + intensity * 30)

    for (let i = 0; i < particleCount; i++) {
      const geometry = new THREE.SphereGeometry(0.1 + Math.random() * 0.2, 8, 6)
      const material = new THREE.MeshBasicMaterial({
        color: new THREE.Color().setHSL(0.55, 0.3, 0.8),
        transparent: true,
        opacity: 0.1 + intensity * 0.3,
      })

      const particle = new THREE.Mesh(geometry, material)
      particle.position.set((Math.random() - 0.5) * 8, Math.random() * 2 - 1, (Math.random() - 0.5) * 8)

      vaporRef.current.add(particle)
    }

    // Add mist effect for high humidity
    if (humidity > 70) {
      const mistGeometry = new THREE.PlaneGeometry(12, 12)
      const mistMaterial = new THREE.MeshBasicMaterial({
        color: new THREE.Color().setHSL(0.55, 0.2, 0.9),
        transparent: true,
        opacity: ((humidity - 70) / 30) * 0.2,
        side: THREE.DoubleSide,
      })

      const mist = new THREE.Mesh(mistGeometry, mistMaterial)
      mist.rotation.x = -Math.PI / 2
      mist.position.y = 0.5
      vaporRef.current.add(mist)
    }
  }, [humidity, visible])

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

export default HumidityAnimation
