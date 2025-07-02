"use client"

import { useEffect, useRef } from "react"
import * as THREE from "three"
import type L from "leaflet"

interface TemperatureAnimationProps {
  temperature: number
  visible: boolean
  position: L.LatLngExpression
  width?: number
  height?: number
  map: L.Map
}

const TemperatureAnimation = ({
  temperature,
  visible,
  position,
  width = 300,
  height = 300,
  map,
}: TemperatureAnimationProps) => {
  const mountRef = useRef<HTMLDivElement>(null)
  const animationRef = useRef<number>(0)
  const sceneRef = useRef<THREE.Scene | null>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const heatWavesRef = useRef<THREE.Group | null>(null)

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
    camera.position.set(0, 5, 10)

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(width, height)
    renderer.setClearColor(0x000000, 0)
    mountRef.current.appendChild(renderer.domElement)

    const heatWaves = new THREE.Group()
    scene.add(heatWaves)

    sceneRef.current = scene
    rendererRef.current = renderer
    heatWavesRef.current = heatWaves

    updatePosition()

    const animate = () => {
      if (!visible) return
      animationRef.current = requestAnimationFrame(animate)

      if (heatWavesRef.current) {
        heatWavesRef.current.children.forEach((wave, index) => {
          wave.position.y += 0.05 + Math.sin(Date.now() * 0.003 + index) * 0.02
          wave.rotation.z += 0.01
          wave.scale.x = 1 + Math.sin(Date.now() * 0.002 + index) * 0.3
          wave.scale.z = 1 + Math.cos(Date.now() * 0.002 + index) * 0.3

          if (wave.position.y > 8) {
            wave.position.y = -2
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
    if (!heatWavesRef.current || !visible) return

    heatWavesRef.current.clear()

    // Convert temperature (assuming it's in tenths of degrees)
    const tempCelsius = temperature / 10
    const intensity = Math.max(0, Math.min(1, (tempCelsius + 10) / 50)) // Normalize -10°C to 40°C

    // Create heat wave effect
    const waveCount = Math.floor(5 + intensity * 15)

    for (let i = 0; i < waveCount; i++) {
      const geometry = new THREE.RingGeometry(0.5, 1.5 + Math.random(), 8, 1)

      // Color based on temperature
      let color: THREE.Color
      if (tempCelsius < 0) {
        color = new THREE.Color().setHSL(0.6, 0.8, 0.3 + intensity * 0.4) // Blue for cold
      } else if (tempCelsius < 20) {
        color = new THREE.Color().setHSL(0.3, 0.6, 0.4 + intensity * 0.3) // Green for mild
      } else if (tempCelsius < 30) {
        color = new THREE.Color().setHSL(0.1, 0.8, 0.5 + intensity * 0.3) // Yellow for warm
      } else {
        color = new THREE.Color().setHSL(0.0, 0.9, 0.4 + intensity * 0.4) // Red for hot
      }

      const material = new THREE.MeshBasicMaterial({
        color: color,
        transparent: true,
        opacity: 0.2 + intensity * 0.3,
        side: THREE.DoubleSide,
      })

      const wave = new THREE.Mesh(geometry, material)
      wave.position.set((Math.random() - 0.5) * 8, -2 + Math.random() * 10, (Math.random() - 0.5) * 8)
      wave.rotation.x = Math.PI / 2

      heatWavesRef.current.add(wave)
    }
  }, [temperature, visible])

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

export default TemperatureAnimation
