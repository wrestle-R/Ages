"use client"

import { memo, useEffect, useRef } from "react"
import * as THREE from "three"

function BirthdayCake({ extinguished }: { extinguished: boolean }) {
  const host = useRef<HTMLDivElement>(null)
  const lightsOut = useRef(extinguished)
  const redraw = useRef<(() => void) | null>(null)

  useEffect(() => {
    lightsOut.current = extinguished
    redraw.current?.()
  }, [extinguished])

  useEffect(() => {
    const container = host.current
    if (!container) return

    let renderer: THREE.WebGLRenderer
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    } catch {
      container.dataset.unavailable = "true"
      return
    }

    delete container.dataset.unavailable
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75))
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFShadowMap
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.35
    container.appendChild(renderer.domElement)

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 30)
    camera.position.set(1.8, 3.1, 6.1)
    camera.lookAt(0, 0.95, 0)
    const cake = new THREE.Group()
    cake.rotation.y = -0.25
    scene.add(cake)

    const cream = new THREE.MeshStandardMaterial({
      color: "#fff1d4",
      roughness: 0.52,
    })
    const icing = new THREE.MeshStandardMaterial({
      color: "#dce6ff",
      roughness: 0.34,
    })
    const blue = new THREE.MeshStandardMaterial({
      color: "#6084de",
      roughness: 0.45,
    })
    const gold = new THREE.MeshStandardMaterial({
      color: "#e6bb72",
      metalness: 0.65,
      roughness: 0.27,
    })
    const candleMaterial = new THREE.MeshStandardMaterial({
      color: "#f3d8a0",
      roughness: 0.4,
    })
    const wickMaterial = new THREE.MeshStandardMaterial({ color: "#493824" })
    const flameMaterial = new THREE.MeshBasicMaterial({ color: "#ffbd54" })
    const flameCore = new THREE.MeshBasicMaterial({ color: "#fff5cf" })
    const geometries: THREE.BufferGeometry[] = []
    const materials = [
      cream,
      icing,
      blue,
      gold,
      candleMaterial,
      wickMaterial,
      flameMaterial,
      flameCore,
    ]

    function mesh(
      geometry: THREE.BufferGeometry,
      material: THREE.Material,
      x: number,
      y: number,
      z: number,
      parent = cake
    ) {
      geometries.push(geometry)
      const object = new THREE.Mesh(geometry, material)
      object.position.set(x, y, z)
      object.castShadow = true
      object.receiveShadow = true
      parent.add(object)
      return object
    }
    function cylinder(
      radius: number,
      height: number,
      y: number,
      material: THREE.Material
    ) {
      return mesh(
        new THREE.CylinderGeometry(radius, radius, height, 64),
        material,
        0,
        y,
        0
      )
    }
    function ring(
      radius: number,
      tube: number,
      y: number,
      material: THREE.Material
    ) {
      const object = mesh(
        new THREE.TorusGeometry(radius, tube, 10, 64),
        material,
        0,
        y,
        0
      )
      object.rotation.x = Math.PI / 2
    }

    cylinder(1.35, 0.07, 0.07, cream)
    ring(1.32, 0.028, 0.105, gold)
    cylinder(1.08, 0.72, 0.48, blue)
    cylinder(1.09, 0.08, 0.37, cream)
    cylinder(1.09, 0.08, 0.57, cream)
    cylinder(1.095, 0.13, 0.86, icing)
    ring(1.065, 0.055, 0.89, icing)
    cylinder(0.78, 0.5, 1.14, cream)
    cylinder(0.79, 0.11, 1.41, icing)
    ring(0.77, 0.055, 1.44, icing)

    // Rounded piping and varying icing drips give the tiers real volume.
    for (let i = 0; i < 36; i++) {
      const angle = (i / 36) * Math.PI * 2
      const bead = mesh(
        new THREE.SphereGeometry(0.055, 10, 8),
        cream,
        Math.cos(angle) * 1.05,
        0.15,
        Math.sin(angle) * 1.05
      )
      bead.scale.y = 0.8
    }
    for (let i = 0; i < 18; i++) {
      const angle = (i / 18) * Math.PI * 2
      const drip = mesh(
        new THREE.SphereGeometry(0.078, 12, 12),
        icing,
        Math.cos(angle) * 0.765,
        1.345,
        Math.sin(angle) * 0.765
      )
      drip.scale.set(0.85, 1.2 + (i % 3) * 0.6, 0.85)
    }
    for (let i = 0; i < 23; i++) {
      const angle = i * 2.39996
      const radius = 0.24 + (i % 5) * 0.092
      const sprinkle = mesh(
        new THREE.CapsuleGeometry(0.014, 0.062, 3, 5),
        i % 2 ? gold : blue,
        Math.cos(angle) * radius,
        1.485,
        Math.sin(angle) * radius
      )
      sprinkle.rotation.set(Math.PI / 2, 0, angle)
    }

    const flames = new THREE.Group()
    cake.add(flames)
    const candlePositions = [
      [-0.38, 0.2],
      [-0.12, -0.3],
      [0.39, 0.2],
    ]
    candlePositions.forEach(([x, z], index) => {
      const height = index === 1 ? 0.59 : 0.45
      mesh(
        new THREE.CylinderGeometry(0.04, 0.04, height, 16),
        candleMaterial,
        x,
        1.49 + height / 2,
        z
      )
      for (let j = 0; j < 5; j++) {
        const band = mesh(
          new THREE.TorusGeometry(0.041, 0.009, 5, 16),
          blue,
          x,
          1.53 + j * 0.075,
          z
        )
        band.rotation.x = Math.PI / 2
      }
      mesh(
        new THREE.CylinderGeometry(0.006, 0.006, 0.055, 8),
        wickMaterial,
        x,
        1.515 + height,
        z
      )
      const flame = mesh(
        new THREE.SphereGeometry(0.065, 16, 16),
        flameMaterial,
        x,
        1.61 + height,
        z,
        flames
      )
      flame.scale.set(0.72, 1.8, 0.72)
      const core = mesh(
        new THREE.SphereGeometry(0.032, 12, 12),
        flameCore,
        x,
        1.575 + height,
        z + 0.02,
        flames
      )
      core.scale.y = 1.6
      const light = new THREE.PointLight("#ffb965", 0.6, 2.8)
      light.position.set(x, 1.64 + height, z)
      flames.add(light)
    })

    scene.add(new THREE.HemisphereLight("#eaf0ff", "#344366", 2.5))
    const key = new THREE.DirectionalLight("#fff0d4", 4.5)
    key.position.set(-3, 5, 4)
    key.castShadow = true
    key.shadow.mapSize.set(1024, 1024)
    key.shadow.normalBias = 0.025
    key.shadow.radius = 3
    scene.add(key)
    const rim = new THREE.DirectionalLight("#80acff", 3)
    rim.position.set(3, 2, -3)
    scene.add(rim)
    const shadowMaterial = new THREE.ShadowMaterial({ opacity: 0.14 })
    const floor = mesh(
      new THREE.PlaneGeometry(12, 12),
      shadowMaterial,
      0,
      0.025,
      0
    )
    floor.rotation.x = -Math.PI / 2
    floor.castShadow = false

    const motion = window.matchMedia("(prefers-reduced-motion: reduce)")
    let visible = true
    let contextAvailable = true
    let frame = 0
    let target = -0.25
    const render = () => {
      if (!contextAvailable) return
      flames.visible = !lightsOut.current
      renderer.render(scene, camera)
    }
    redraw.current = render
    const animate = (time: number) => {
      frame = 0
      if (!contextAvailable || !visible || document.hidden) return
      cake.rotation.y += (target - cake.rotation.y) * 0.045
      if (!motion.matches) {
        flames.scale.y = 1 + Math.sin(time * 0.005) * 0.014
        cake.position.y = Math.sin(time * 0.0007) * 0.018
      }
      render()
      if (!motion.matches) frame = requestAnimationFrame(animate)
    }
    const restart = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(animate)
    }
    const resize = new ResizeObserver(() => {
      const { width, height } = container.getBoundingClientRect()
      if (!width || !height) return
      renderer.setSize(width, height)
      camera.aspect = width / height
      camera.updateProjectionMatrix()
      render()
    })
    resize.observe(container)
    const intersection = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
      restart()
    })
    intersection.observe(container)
    const pointerMove = (event: PointerEvent) => {
      if (motion.matches || event.pointerType === "touch") return
      const box = container.getBoundingClientRect()
      target = -0.25 + ((event.clientX - box.left) / box.width - 0.5) * 0.9
    }
    const pointerLeave = () => {
      target = -0.25
    }
    const contextLost = (event: Event) => {
      event.preventDefault()
      contextAvailable = false
      cancelAnimationFrame(frame)
      container.dataset.unavailable = "true"
    }
    const contextRestored = () => {
      contextAvailable = true
      delete container.dataset.unavailable
      restart()
    }
    container.addEventListener("pointermove", pointerMove)
    container.addEventListener("pointerleave", pointerLeave)
    renderer.domElement.addEventListener("webglcontextlost", contextLost)
    renderer.domElement.addEventListener(
      "webglcontextrestored",
      contextRestored
    )
    document.addEventListener("visibilitychange", restart)
    motion.addEventListener("change", restart)
    restart()

    return () => {
      redraw.current = null
      cancelAnimationFrame(frame)
      resize.disconnect()
      intersection.disconnect()
      container.removeEventListener("pointermove", pointerMove)
      container.removeEventListener("pointerleave", pointerLeave)
      document.removeEventListener("visibilitychange", restart)
      motion.removeEventListener("change", restart)
      renderer.domElement.removeEventListener("webglcontextlost", contextLost)
      renderer.domElement.removeEventListener(
        "webglcontextrestored",
        contextRestored
      )
      geometries.forEach((geometry) => geometry.dispose())
      materials.forEach((material) => material.dispose())
      shadowMaterial.dispose()
      key.shadow.dispose()
      renderer.dispose()
      renderer.domElement.remove()
    }
  }, [])

  return (
    <div className="cake-scene" ref={host} aria-hidden="true">
      <div className={`cake-fallback ${extinguished ? "is-extinguished" : ""}`}>
        <span className="fallback-candle" />
        <span className="fallback-tier top" />
        <span className="fallback-tier bottom" />
        <span className="fallback-plate" />
      </div>
    </div>
  )
}

export default memo(BirthdayCake)
