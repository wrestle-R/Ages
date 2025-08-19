import React, { useEffect, useRef, useState, useMemo } from "react";

/**
 * props:
 * - texts: array of strings to show
 * - triggerBurst: boolean, when true the current text will vaporize/burst
 * - onComplete: callback when burst + transition finished
 */
export default function VaporizeAnimationText({ texts = ["Cool"], triggerBurst = false, onComplete = () => {} }) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const particlesRef = useRef([]);
  const animRef = useRef(null);
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const animationStateRef = useRef("static"); // static | vaporizing | fadingIn | waiting

  const vaporizeProgressRef = useRef(0);
  const fadeOpacityRef = useRef(0);

  const config = useMemo(() => ({
    color: "rgb(255, 255, 255)",
    font: { fontFamily: "Inter, sans-serif", fontSize: "70px", fontWeight: 600 },
    animation: { vaporizeDuration: 2000, fadeInDuration: 1000, waitDuration: 500 },
    direction: "left-to-right",
    spread: 5,
    density: 5,
    effects: { turbulence: 0.3, colorShift: true, rotation: true, scale: true, glow: true, trail: true, gravity: 0.1, bounce: 0.8 }
  }), []);

  // build particle list based on text
  useEffect(() => {
    if (!containerRef.current || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const updateCanvasSize = () => {
      const { width, height } = containerRef.current.getBoundingClientRect();
      canvas.width = width;
      canvas.height = height;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
    };
    updateCanvasSize();

    const createParticles = (text) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = config.color;
      ctx.font = `${config.font.fontWeight} ${config.font.fontSize} ${config.font.fontFamily}`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      const x = canvas.width / 2;
      const y = canvas.height / 2;
      ctx.fillText(text, x, y);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      const particles = [];
      const sampleRate = 4;
      for (let py = 0; py < canvas.height; py += sampleRate) {
        for (let px = 0; px < canvas.width; px += sampleRate) {
          const index = (py * canvas.width + px) * 4;
          const alpha = data[index + 3];
          if (alpha > 0) {
            particles.push({
              x: px, y: py, originalX: px, originalY: py, previousX: px, previousY: py,
              color: `rgba(${data[index]}, ${data[index + 1]}, ${data[index + 2]}, ${alpha / 255})`,
              opacity: alpha / 255, originalAlpha: alpha / 255,
              velocityX: 0, velocityY: 0, angle: Math.random() * Math.PI * 2, speed: 0,
              scale: 1, rotation: Math.random() * Math.PI * 2, rotationSpeed: (Math.random() - 0.5) * 0.2,
              turbulence: Math.random() * config.effects.turbulence, shouldFadeQuickly: false
            });
          }
        }
      }
      particlesRef.current = particles;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    };

    const drawGlow = (x, y, radius, color) => {
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
      gradient.addColorStop(0, color);
      gradient.addColorStop(1, "rgba(255, 255, 255, 0)");
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
    };

    const drawTrail = (p) => {
      ctx.beginPath();
      ctx.moveTo(p.previousX, p.previousY);
      ctx.lineTo(p.x, p.y);
      try {
        ctx.strokeStyle = p.color.replace(/[\d.]+\)$/, `${p.opacity * 0.3})`);
      } catch {
        ctx.strokeStyle = p.color;
      }
      ctx.lineWidth = 1;
      ctx.stroke();
    };

    let lastTime = performance.now();
    const animate = (time) => {
      const deltaTime = (time - lastTime) / 1000;
      lastTime = time;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const state = animationStateRef.current;
      if (state === "vaporizing") {
        vaporizeProgressRef.current += deltaTime * 100;
        const progress = Math.min(100, vaporizeProgressRef.current);
        let allVaporized = true;
        particlesRef.current.forEach(p => {
          const shouldVaporize = config.direction === "left-to-right"
            ? p.originalX <= canvas.width * progress / 100
            : p.originalX >= canvas.width * (1 - progress / 100);
          if (shouldVaporize) {
            if (p.speed === 0) {
              p.speed = Math.random() * config.spread + 2;
              p.angle = Math.random() * Math.PI * 2;
              p.velocityX = Math.cos(p.angle) * p.speed;
              p.velocityY = Math.sin(p.angle) * p.speed;
              p.shouldFadeQuickly = Math.random() > config.density / 10;
            }
            p.velocityY += config.effects.gravity;
            p.velocityX *= 0.98;
            p.velocityY *= 0.98;
            p.velocityX += (Math.random() - 0.5) * p.turbulence * 0.5;
            p.velocityY += (Math.random() - 0.5) * p.turbulence * 0.5;
            p.previousX = p.x; p.previousY = p.y;
            p.x += p.velocityX; p.y += p.velocityY;
            if (p.x < -50 || p.x > canvas.width + 50 || p.y < -50 || p.y > canvas.height + 50) {
              p.opacity = 0;
            }
            p.opacity = p.shouldFadeQuickly ? p.opacity * 0.95 : p.opacity * 0.98;
            if (p.opacity > 0.01) allVaporized = false;
            if (p.opacity > 0.01) {
              if (config.effects.trail) drawTrail(p);
              ctx.save();
              ctx.translate(p.x, p.y);
              ctx.rotate(p.rotation);
              ctx.scale(p.scale, p.scale);
              const particleColor = p.color.replace(/[\d.]+\)$/, `${p.opacity})`);
              ctx.fillStyle = particleColor;
              ctx.fillRect(-1, -1, 2, 2);
              if (config.effects.glow) drawGlow(0, 0, 4, particleColor);
              ctx.restore();
            }
          } else {
            allVaporized = false;
            ctx.fillStyle = p.color;
            ctx.fillRect(p.x, p.y, 2, 2);
          }
        });

        if (progress >= 100 && allVaporized) {
          particlesRef.current = [];
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          const nextIndex = (currentTextIndex + 1) % texts.length;
          setCurrentTextIndex(nextIndex);
          createParticles(texts[nextIndex]);
          animationStateRef.current = "fadingIn";
          fadeOpacityRef.current = 0;
        }
      } else if (state === "fadingIn") {
        fadeOpacityRef.current += deltaTime * 2;
        const opacity = Math.min(1, fadeOpacityRef.current);
        particlesRef.current.forEach(p => {
          p.x = p.originalX; p.y = p.originalY;
          p.opacity = opacity * p.originalAlpha;
          ctx.fillStyle = p.color.replace(/[\d.]+\)$/, `${p.opacity})`);
          ctx.fillRect(p.x, p.y, 2, 2);
          if (config.effects.glow) drawGlow(p.x, p.y, 2, p.color.replace(/[\d.]+\)$/, `${p.opacity * 0.5})`));
        });
        if (opacity >= 1) {
          animationStateRef.current = "waiting";
          setTimeout(() => {
            animationStateRef.current = "vaporizing";
            vaporizeProgressRef.current = 0;
          }, config.animation.waitDuration);
        }
      } else if (state === "waiting") {
        particlesRef.current.forEach(p => {
          ctx.fillStyle = p.color;
          ctx.fillRect(p.x, p.y, 2, 2);
          if (config.effects.glow) drawGlow(p.x, p.y, 2, p.color);
        });
      } else {
        particlesRef.current.forEach(p => {
          ctx.fillStyle = p.color;
          ctx.fillRect(p.x, p.y, 2, 2);
        });
      }

      animRef.current = requestAnimationFrame(animate);
    };

    // init
    createParticles(texts[currentTextIndex]);
    animationStateRef.current = "waiting";
    animRef.current = requestAnimationFrame(animate);
    window.addEventListener("resize", updateCanvasSize);

    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
      window.removeEventListener("resize", updateCanvasSize);
    };
  }, [config, texts, currentTextIndex]);

  // When triggerBurst becomes true we'll switch to vaporizing state and when done call onComplete
  useEffect(() => {
    if (!triggerBurst) return;
    // start vaporizing; when the cycle completes we detect empty particles and consider burst finished
    animationStateRef.current = "vaporizing";
    // Poll to detect completion: we consider it complete when particles array is empty (after animation code clears it)
    let check = null;
    check = setInterval(() => {
      if (!particlesRef.current || particlesRef.current.length === 0) {
        // small grace time to allow canvas clear
        clearInterval(check);
        // brief delay for a nicer reveal transition
        setTimeout(() => {
          try { onComplete(); } catch {}
        }, 250);
      }
    }, 150);

    return () => clearInterval(check);
  }, [triggerBurst, onComplete]);

  return (
    <div ref={containerRef} className="relative w-full h-screen bg-black flex items-center justify-center">
      <canvas ref={canvasRef} className="w-full h-full" />
      {/* center hint text while waiting to burst */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div style={{ fontFamily: "Inter, sans-serif", fontWeight: 600, fontSize: 20, color: "rgba(255,255,255,0.25)" }}>
          {triggerBurst ? "" : "battiling renders cold starts now"}
        </div>
      </div>
    </div>
  );
}
