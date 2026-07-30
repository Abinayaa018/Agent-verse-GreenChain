import React, { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  baseX: number;
  baseY: number;
  colorType: 'emerald' | 'cyan';
}

export const DigitalTwinBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -1000, y: -1000, targetX: -1000, targetY: -1000 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const particles: Particle[] = [];
    const particleCount = Math.min(45, Math.floor((width * height) / 35000));

    // Initialize particles
    for (let i = 0; i < particleCount; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      particles.push({
        x,
        y,
        baseX: x,
        baseY: y,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        radius: Math.random() * 2 + 1,
        colorType: Math.random() > 0.4 ? 'emerald' : 'cyan',
      });
    }

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.targetX = e.clientX;
      mouseRef.current.targetY = e.clientY;
    };

    const handleMouseLeave = () => {
      mouseRef.current.targetX = -1000;
      mouseRef.current.targetY = -1000;
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);

    // Animation Loop
    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Smooth mouse position interpolation for organic parallax
      const mouse = mouseRef.current;
      if (mouse.x === -1000) {
        mouse.x = mouse.targetX;
        mouse.y = mouse.targetY;
      } else {
        mouse.x += (mouse.targetX - mouse.x) * 0.08;
        mouse.y += (mouse.targetY - mouse.y) * 0.08;
      }

      // Update and draw particles
      particles.forEach((p) => {
        // Continuous organic floating movement
        p.baseX += p.vx;
        p.baseY += p.vy;

        // Wrap around boundaries
        if (p.baseX < 0) p.baseX = width;
        if (p.baseX > width) p.baseX = 0;
        if (p.baseY < 0) p.baseY = height;
        if (p.baseY > height) p.baseY = 0;

        // Mouse Parallax Offset
        let offsetX = 0;
        let offsetY = 0;
        if (mouse.x !== -1000) {
          const dx = mouse.x - p.baseX;
          const dy = mouse.y - p.baseY;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 400) {
            const force = (400 - dist) / 400;
            offsetX = -dx * force * 0.04 * p.radius;
            offsetY = -dy * force * 0.04 * p.radius;
          }
        }

        p.x = p.baseX + offsetX;
        p.y = p.baseY + offsetY;

        // Draw particle node
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.colorType === 'emerald' ? 'rgba(63, 230, 168, 0.14)' : 'rgba(48, 213, 255, 0.14)';
        ctx.fill();
      });

      // Draw connection lines
      ctx.lineWidth = 0.75;
      for (let i = 0; i < particles.length; i++) {
        const pi = particles[i];
        for (let j = i + 1; j < particles.length; j++) {
          const pj = particles[j];
          const dx = pi.x - pj.x;
          const dy = pi.y - pj.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 160) {
            const alpha = (1 - dist / 160) * 0.05;
            ctx.strokeStyle = pi.colorType === 'emerald'
              ? `rgba(63, 230, 168, ${alpha})`
              : `rgba(48, 213, 255, ${alpha})`;
            ctx.beginPath();
            ctx.moveTo(pi.x, pi.y);
            ctx.lineTo(pj.x, pj.y);
            ctx.stroke();
          }
        }

        // Draw lines connecting to mouse coordinates
        if (mouse.x !== -1000) {
          const dx = pi.x - mouse.x;
          const dy = pi.y - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 220) {
            const alpha = (1 - dist / 220) * 0.07;
            ctx.strokeStyle = pi.colorType === 'emerald'
              ? `rgba(63, 230, 168, ${alpha})`
              : `rgba(48, 213, 255, ${alpha})`;
            ctx.beginPath();
            ctx.moveTo(pi.x, pi.y);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.stroke();
          }
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    // Clean up
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-0 opacity-70"
      style={{ mixBlendMode: 'screen' }}
    />
  );
};
export default DigitalTwinBackground;
