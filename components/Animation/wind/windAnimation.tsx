"use client"

import { useEffect, useRef } from "react"
import * as THREE from "three"
import type L from "leaflet"

interface WindFlowTrailProps {
  windSpeed: number // in knots or km/h
  windDirection: number // in degrees
  visible: boolean
  position: L.LatLngExpression
  map: L.Map
  width?: number
  height?: number
  color?: string
}

const WindFlowTrailAnimation = ({
  windSpeed,
  windDirection,
  visible,
  position,
  map,
  width = 300,
  height = 300,
  color = "#19ec86",
}: WindFlowTrailProps) => {
  const mountRef = useRef<HTMLDivElement>(null)
  const animationRef = useRef<number | null>(null)
  const sceneRef = useRef<THREE.Scene | null>(null)
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const particlesRef = useRef<THREE.Points | null>(null)

  const particleCount = Math.min(100 + windSpeed * 2, 500)
  const particlesData = useRef<{
    positions: Float32Array
    velocities: Float32Array
    ages: Float32Array
    maxAge: Float32Array
  } | null>(null)

  const updatePosition = () => {
    if (!mountRef.current || !map || !position) return
    const point = map.latLngToContainerPoint(position)
    mountRef.current.style.left = `${point.x - width / 2}px`
    mountRef.current.style.top = `${point.y - height / 2 - 300}px`
  }

  useEffect(() => {
    if (!mountRef.current || !visible || !position) return

    // Setup Three.js scene
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000)
    camera.position.z = 20

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
    })
    renderer.setSize(width, height)
    renderer.setClearColor(0x000000, 0)
    mountRef.current.appendChild(renderer.domElement)

    sceneRef.current = scene
    cameraRef.current = camera
    rendererRef.current = renderer

    // Calculate wind direction vector (meteorological convention: direction wind comes FROM)
    const angleRad = ((windDirection + 180) * Math.PI) / 180 // Add 180 to get direction wind goes TO
    const windVectorX = Math.sin(angleRad)
    const windVectorY = Math.cos(angleRad)

    // Speed factor based on wind speed
    const speedFactor = Math.max(0.02, Math.min(0.15, windSpeed / 50))

    // Initialize particle data
    const positions = new Float32Array(particleCount * 3)
    const velocities = new Float32Array(particleCount * 3)
    const ages = new Float32Array(particleCount)
    const maxAge = new Float32Array(particleCount)
    const colors = new Float32Array(particleCount * 3)
    const sizes = new Float32Array(particleCount)

    const windColor = new THREE.Color(color)

    for (let i = 0; i < particleCount; i++) {
      // Random starting positions
      positions[i * 3] = (Math.random() - 0.5) * 15
      positions[i * 3 + 1] = (Math.random() - 0.5) * 15
      positions[i * 3 + 2] = (Math.random() - 0.5) * 2

      // Wind velocity with some randomness
      velocities[i * 3] = windVectorX * speedFactor + (Math.random() - 0.5) * 0.02
      velocities[i * 3 + 1] = windVectorY * speedFactor + (Math.random() - 0.5) * 0.02
      velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.01

      // Particle lifecycle
      ages[i] = Math.random() * 100
      maxAge[i] = 50 + Math.random() * 100

      // Colors
      colors[i * 3] = windColor.r
      colors[i * 3 + 1] = windColor.g
      colors[i * 3 + 2] = windColor.b

      // Sizes
      sizes[i] = 1 + Math.random() * 2
    }

    particlesData.current = { positions, velocities, ages, maxAge }

    // Create particle geometry
    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3))
    geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3))
    geometry.setAttribute("size", new THREE.BufferAttribute(sizes, 1))

    // Create particle material
    const material = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
      },
      vertexShader: `
        attribute float size;
        attribute vec3 color;
        varying vec3 vColor;
        varying float vAlpha;
        uniform float time;
        
        void main() {
          vColor = color;
          
          // Calculate alpha based on position and time
          float distanceFromCenter = length(position.xy) / 10.0;
          vAlpha = 1.0 - distanceFromCenter;
          vAlpha = clamp(vAlpha, 0.1, 0.8);
          
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = size * (300.0 / -mvPosition.z);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        varying vec3 vColor;
        varying float vAlpha;
        
        void main() {
          float distanceToCenter = distance(gl_PointCoord, vec2(0.5));
          if (distanceToCenter > 0.5) discard;
          
          float alpha = (1.0 - distanceToCenter * 2.0) * vAlpha;
          gl_FragColor = vec4(vColor, alpha);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })

    const particles = new THREE.Points(geometry, material)
    scene.add(particles)
    particlesRef.current = particles

    // Animation loop
    let startTime = Date.now()
    const animate = () => {
      if (!visible || !particlesData.current) return

      animationRef.current = requestAnimationFrame(animate)

      const currentTime = Date.now()
      const deltaTime = (currentTime - startTime) / 1000
      startTime = currentTime

      const { positions, velocities, ages, maxAge } = particlesData.current

      // Update particles
      for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3

        // Update age
        ages[i] += deltaTime * 30

        // Reset particle if too old or out of bounds
        if (ages[i] > maxAge[i] || Math.abs(positions[i3]) > 12 || Math.abs(positions[i3 + 1]) > 12) {
          // Reset position
          positions[i3] = (Math.random() - 0.5) * 15
          positions[i3 + 1] = (Math.random() - 0.5) * 15
          positions[i3 + 2] = (Math.random() - 0.5) * 2

          // Reset age
          ages[i] = 0
          maxAge[i] = 50 + Math.random() * 100

          // Update velocity with current wind
          velocities[i3] = windVectorX * speedFactor + (Math.random() - 0.5) * 0.02
          velocities[i3 + 1] = windVectorY * speedFactor + (Math.random() - 0.5) * 0.02
          velocities[i3 + 2] = (Math.random() - 0.5) * 0.01
        } else {
          // Update position based on velocity
          positions[i3] += velocities[i3]
          positions[i3 + 1] += velocities[i3 + 1]
          positions[i3 + 2] += velocities[i3 + 2]

          // Add some turbulence
          positions[i3] += Math.sin(currentTime * 0.001 + i) * 0.005
          positions[i3 + 1] += Math.cos(currentTime * 0.001 + i) * 0.005
        }
      }

      // Update geometry
      particles.geometry.attributes.position.needsUpdate = true

      // Update shader uniform
      if (material.uniforms) {
        material.uniforms.time.value = currentTime * 0.001
      }

      renderer.render(scene, camera)
    }

    animate()

    // Handle map movement
    const handleMapMove = () => updatePosition()
    map.on("move", handleMapMove)
    map.on("zoom", handleMapMove)

    updatePosition()

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
      map.off("move", handleMapMove)

      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement)
      }

      // Clean up Three.js resources
      geometry.dispose()
      material.dispose()
      renderer.dispose()
      scene.clear()
    }
  }, [visible, windSpeed, windDirection, position, map, width, height, color])

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

export default WindFlowTrailAnimation
