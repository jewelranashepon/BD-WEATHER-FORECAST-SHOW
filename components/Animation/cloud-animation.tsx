"use client"

import { useEffect, useRef } from "react"
import * as THREE from "three"
import type L from "leaflet"

interface CloudAnimationProps {
  cloudData: {
    totalCloudAmount: number
    lowCloudAmount: number
    mediumCloudAmount: number
    highCloudAmount: number
  }
  visible: boolean
  position: L.LatLngExpression
  width?: number
  height?: number
  map: L.Map
}

const CloudAnimation = ({ cloudData, visible, position, width = 300, height = 300, map }: CloudAnimationProps) => {
  const mountRef = useRef<HTMLDivElement>(null)
  const animationRef = useRef<number>(0)
  const sceneRef = useRef<THREE.Scene | null>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const cloudsRef = useRef<THREE.Group | null>(null)

  const updatePosition = () => {
    if (!mountRef.current || !map || !position) return
    const point = map.latLngToContainerPoint(position)
    mountRef.current.style.left = `${point.x - width / 2}px`
    mountRef.current.style.top = `${point.y - height / 2 - 250}px`
  }

  useEffect(() => {
    if (!mountRef.current || !visible || !position) return

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000)
    camera.position.set(0, 0, 12)

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(width, height)
    renderer.setClearColor(0x000000, 0)
    mountRef.current.appendChild(renderer.domElement)

    const clouds = new THREE.Group()
    scene.add(clouds)
    cloudsRef.current = clouds  // Assign the group to the ref

    // Add lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6)
    scene.add(ambientLight)
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
    directionalLight.position.set(5, 5, 5)
    scene.add(directionalLight)

    sceneRef.current = scene
    rendererRef.current = renderer
    cloudsRef.current = clouds

    updatePosition()

    const animate = () => {
      if (!visible) return
      animationRef.current = requestAnimationFrame(animate)

      if (cloudsRef.current) {
        cloudsRef.current.children.forEach((cloud, index) => {
          cloud.position.x += Math.sin(Date.now() * 0.0005 + index) * 0.01
          cloud.rotation.y += 0.002

          // Gentle floating motion
          cloud.position.y += Math.sin(Date.now() * 0.001 + index) * 0.005
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
    if (!cloudsRef.current || !visible) return

    cloudsRef.current.clear()

    const { totalCloudAmount, lowCloudAmount, mediumCloudAmount, highCloudAmount } = cloudData

    // Create cloud layers
    const createCloudLayer = (amount: number, height: number, size: number, opacity: number) => {
      const cloudCount = Math.floor((amount / 8) * 6) // Convert oktas to cloud count

      for (let i = 0; i < cloudCount; i++) {
        const cloudGroup = new THREE.Group()

        // Create multiple spheres for each cloud
        const sphereCount = 3 + Math.random() * 4
        for (let j = 0; j < sphereCount; j++) {
          const geometry = new THREE.SphereGeometry(size * (0.8 + Math.random() * 0.4), 12, 8)
          const material = new THREE.MeshLambertMaterial({
            color: new THREE.Color().setHSL(0, 0, 0.9 - height * 0.1),
            transparent: true,
            opacity: opacity * (0.7 + Math.random() * 0.3),
          })

          const sphere = new THREE.Mesh(geometry, material)
          sphere.position.set(
            (Math.random() - 0.5) * size * 2,
            (Math.random() - 0.5) * size * 0.5,
            (Math.random() - 0.5) * size * 2,
          )
          sphere.scale.y = 0.6 + Math.random() * 0.3

          cloudGroup.add(sphere)
        }

        cloudGroup.position.set((Math.random() - 0.5) * 15, height, (Math.random() - 0.5) * 15)

        cloudsRef.current?.add(cloudGroup)
      }
    }

    // High clouds
    if (highCloudAmount > 0) {
      createCloudLayer(highCloudAmount, 6, 1.5, 0.4)
    }

    // Medium clouds
    if (mediumCloudAmount > 0) {
      createCloudLayer(mediumCloudAmount, 3, 1.2, 0.6)
    }

    // Low clouds
    if (lowCloudAmount > 0) {
      createCloudLayer(lowCloudAmount, 1, 1.0, 0.8)
    }
  }, [cloudData, visible])

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

export default CloudAnimation
