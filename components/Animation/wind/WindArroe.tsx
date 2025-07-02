"use client"

import { useEffect, useRef } from "react"
import * as THREE from "three"
import type L from "leaflet"

interface WindArrowIndicatorProps {
  windSpeed: number // in km/h or knots
  windDirection: number // in degrees (meteorological convention)
  position: L.LatLngExpression
  map: L.Map
  visible?: boolean
  width?: number
  height?: number
}

const WindArrowIndicator = ({
  windSpeed,
  windDirection,
  position,
  map,
  visible = true,
  width = 100,
  height = 100,
}: WindArrowIndicatorProps) => {
  const mountRef = useRef<HTMLDivElement>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const sceneRef = useRef<THREE.Scene | null>(null)

  const updatePosition = () => {
    if (!mountRef.current || !map || !position) return
    const point = map.latLngToContainerPoint(position)
    mountRef.current.style.left = `${point.x - width / 2}px`
    mountRef.current.style.top = `${point.y - height / 2}px`
  }

  useEffect(() => {
    if (!mountRef.current || !visible || !position) return

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000)
    camera.position.z = 20

    const renderer = new THREE.WebGLRenderer({ alpha: true })
    renderer.setSize(width, height)
    renderer.setClearColor(0x000000, 0)
    mountRef.current.appendChild(renderer.domElement)

    // Wind direction (TO direction)
    const angleRad = ((windDirection + 180) * Math.PI) / 180
    const dir = new THREE.Vector3(Math.sin(angleRad), Math.cos(angleRad), 0).normalize()
    const origin = new THREE.Vector3(0, 0, 0)
    const length = Math.max(4, windSpeed / 2)

    const arrow = new THREE.ArrowHelper(dir, origin, length, 0x00ffff, 4, 2)
    scene.add(arrow)

    // Base stand
    const baseGeo = new THREE.CircleGeometry(2, 32)
    const baseMat = new THREE.MeshBasicMaterial({ color: 0x222222 })
    const base = new THREE.Mesh(baseGeo, baseMat)
    base.rotation.x = -Math.PI / 2
    scene.add(base)

    renderer.render(scene, camera)

    rendererRef.current = renderer
    sceneRef.current = scene

    const handleMapMove = () => updatePosition()
    map.on("move", handleMapMove)
    map.on("zoom", handleMapMove)
    updatePosition()

    return () => {
      map.off("move", handleMapMove)
      map.off("zoom", handleMapMove)
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement)
      }
      scene.clear()
      renderer.dispose()
    }
  }, [windSpeed, windDirection, position, visible, map, width, height])

  useEffect(() => {
    updatePosition()
  }, [position, map])

  if (!visible) return null

  return (
    <div
      ref={mountRef}
      style={{
        position: "absolute",
        width,
        height,
        zIndex: 999,
        pointerEvents: "none",
      }}
    >
      {/* Wind speed label */}
      <div
        style={{
          position: "absolute",
          top: "-20px",
          left: "50%",
          transform: "translateX(-50%)",
          background: "#222",
          color: "#ffed00",
          fontSize: "12px",
          padding: "2px 6px",
          borderRadius: "4px",
          whiteSpace: "nowrap",
        }}
      >
        {windSpeed} km/h
      </div>
    </div>
  )
}

export default WindArrowIndicator