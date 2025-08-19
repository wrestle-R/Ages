import React, { useEffect, useRef, useState, useMemo } from "react"

export default function VaporizeAnimationText({ texts = ["Loading..."], triggerBurst = false, onComplete = () => {} }) {
  const containerRef = useRef(null)
  const canvasRef = useRef(null)
  const particlesRef = useRef([])
  const animationFrameRef = useRef(null)
  const [currentTextIndex] = useState(0)
  const [animationState, setAnimationState] = useState("static")
  const [burstStarted, setBurstStarted] = useState(false)

  const vaporizeProgressRef = useRef(0)
  const completedRef = useRef(false) // ensure onComplete runs once

  const config = useMemo(
    () => ({
      color: "rgb(255, 255, 255)",
      font: {
        fontFamily: "Inter, sans-serif",
        fontSize: "70px",
        fontWeight: 600,
      },
      animation: {
        vaporizeDuration: 2000,
        fadeInDuration: 1000,
        waitDuration: 500,
      },
      direction: "left-to-right",
      spread: 8,
      density: 5,
      effects: {
        turbulence: 0.4,
        colorShift: true,
        rotation: true,
        scale: true,
        glow: true,
        trail: true,
        gravity: 0.15,
        bounce: 0.8,
      },
    }),
    [],
  )

  useEffect(() => {
    if (triggerBurst && !burstStarted) {
      setBurstStarted(true)
      setAnimationState("vaporizing")
      vaporizeProgressRef.current = 0
    }
  }, [triggerBurst, burstStarted])

  useEffect(() => {
    if (!containerRef.current || !canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const updateCanvasSize = () => {
      const { width, height } = containerRef.current.getBoundingClientRect()
      canvas.width = Math.max(1, Math.floor(width))
      canvas.height = Math.max(1, Math.floor(height))
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
    }
    updateCanvasSize()

    const createParticles = (text) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      ctx.fillStyle = config.color
      ctx.font = `${config.font.fontWeight} ${config.font.fontSize} ${config.font.fontFamily}`
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"

      const x = canvas.width / 2
      const y = canvas.height / 2
      ctx.fillText(text, x, y)

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      const data = imageData.data
      const particles = []

      const sampleRate = 4
      for (let py = 0; py < canvas.height; py += sampleRate) {
        for (let px = 0; px < canvas.width; px += sampleRate) {
          const index = (py * canvas.width + px) * 4
          const alpha = data[index + 3]

          if (alpha > 0) {
            const particle = {
              x: px,
              y: py,
              originalX: px,
              originalY: py,
              previousX: px,
              previousY: py,
              color: `rgba(${data[index]}, ${data[index + 1]}, ${data[index + 2]}, ${alpha / 255})`,
              opacity: alpha / 255,
              originalAlpha: alpha / 255,
              velocityX: 0,
              velocityY: 0,
              angle: Math.random() * Math.PI * 2,
              speed: 0,
              scale: 1,
              rotation: Math.random() * Math.PI * 2,
              rotationSpeed: (Math.random() - 0.5) * 0.2,
              turbulence: Math.random() * config.effects.turbulence,
            }
            particles.push(particle)
          }
        }
      }

      particlesRef.current = particles
      ctx.clearRect(0, 0, canvas.width, canvas.height)
    }

    const drawGlow = (x, y, radius, color) => {
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius)
      gradient.addColorStop(0, color)
      gradient.addColorStop(1, "rgba(255, 255, 255, 0)")
      ctx.fillStyle = gradient
      ctx.beginPath()
      ctx.arc(x, y, radius, 0, Math.PI * 2)
      ctx.fill()
    }

    const drawTrail = (particle) => {
      ctx.beginPath()
      ctx.moveTo(particle.previousX, particle.previousY)
      ctx.lineTo(particle.x, particle.y)
      try {
        ctx.strokeStyle = particle.color.replace(/[\d.]+\)$/, `${particle.opacity * 0.3})`)
      } catch {
        ctx.strokeStyle = `rgba(255,255,255,${particle.opacity * 0.3})`
      }
      ctx.lineWidth = 1
      ctx.stroke()
    }

    let lastTime = performance.now()
    const animate = (currentTime) => {
      const deltaTime = (currentTime - lastTime) / 1000
      lastTime = currentTime

      ctx.clearRect(0, 0, canvas.width, canvas.height)

      switch (animationState) {
        case "vaporizing": {
          vaporizeProgressRef.current += deltaTime * 50
          const progress = Math.min(100, vaporizeProgressRef.current)

          let allVaporized = true
          particlesRef.current.forEach((particle) => {
            const shouldVaporize =
              config.direction === "left-to-right"
                ? particle.originalX <= (canvas.width * progress) / 100
                : particle.originalX >= canvas.width * (1 - progress / 100)

            if (shouldVaporize) {
              if (particle.speed === 0) {
                particle.speed = Math.random() * config.spread + 3
                particle.angle = Math.random() * Math.PI * 2
                particle.velocityX = Math.cos(particle.angle) * particle.speed
                particle.velocityY = Math.sin(particle.angle) * particle.speed
                particle.shouldFadeQuickly = Math.random() > config.density / 10
              }

              particle.velocityY += config.effects.gravity
              particle.velocityX *= 0.98
              particle.velocityY *= 0.98

              particle.velocityX += (Math.random() - 0.5) * particle.turbulence
              particle.velocityY += (Math.random() - 0.5) * particle.turbulence

              particle.previousX = particle.x
              particle.previousY = particle.y
              particle.x += particle.velocityX
              particle.y += particle.velocityY

              if (
                particle.x < -50 ||
                particle.x > canvas.width + 50 ||
                particle.y < -50 ||
                particle.y > canvas.height + 50
              ) {
                particle.opacity = 0
              }

              particle.opacity *= particle.shouldFadeQuickly ? 0.92 : 0.96

              if (particle.opacity > 0.01) allVaporized = false

              if (particle.opacity > 0.01) {
                if (config.effects.trail) {
                  drawTrail(particle)
                }

                ctx.save()
                ctx.translate(particle.x, particle.y)
                ctx.rotate(particle.rotation)
                ctx.scale(particle.scale, particle.scale)

                const particleColor = particle.color.replace(/[\d.]+\)$/, `${particle.opacity})`)
                ctx.fillStyle = particleColor
                ctx.fillRect(-1, -1, 2, 2)

                if (config.effects.glow) {
                  drawGlow(0, 0, 4, particleColor)
                }

                ctx.restore()
              }
            } else {
              allVaporized = false
              ctx.fillStyle = particle.color
              ctx.fillRect(particle.x, particle.y, 2, 2)
            }
          })

          if (progress >= 100 && allVaporized) {
            // Stop animation loop and report completion once
            if (animationFrameRef.current) {
              cancelAnimationFrame(animationFrameRef.current)
              animationFrameRef.current = null
            }
            if (!completedRef.current) {
              completedRef.current = true
              setAnimationState("done")
              try {
                onComplete()
              } catch (err) {
                // swallow callback errors
              }
            }
            return
          }
          break
        }

        default: {
          // static / done
          particlesRef.current.forEach((particle) => {
            ctx.fillStyle = particle.color
            ctx.fillRect(particle.x, particle.y, 2, 2)
          })
        }
      }

      animationFrameRef.current = requestAnimationFrame(animate)
    }

    createParticles(texts[currentTextIndex])
    // If we're already in 'vaporizing' state we start the loop; otherwise show static text
    if (animationState === "vaporizing") {
      if (!animationFrameRef.current) animationFrameRef.current = requestAnimationFrame(animate)
    } else {
      // draw static text once
      if (!particlesRef.current.length) createParticles(texts[currentTextIndex])
      particlesRef.current.forEach((p) => {
        ctx.fillStyle = p.color
        ctx.fillRect(p.x, p.y, 2, 2)
      })
    }

    const handleResize = () => updateCanvasSize()
    window.addEventListener("resize", handleResize)

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
        animationFrameRef.current = null
      }
      window.removeEventListener("resize", handleResize)
    }
  }, [config, texts, currentTextIndex, animationState, onComplete])

  return (
    <div className="relative w-full h-screen bg-black">
      <div ref={containerRef} className="absolute inset-0 flex items-center justify-center">
        <canvas ref={canvasRef} className="w-full h-full" />
      </div>
    </div>
  )
}
