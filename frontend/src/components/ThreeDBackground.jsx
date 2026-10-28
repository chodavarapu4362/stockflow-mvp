import React, { useEffect, useRef } from 'react';

/**
 * High-performance, interactive 3D Ambient Canvas Background
 * Features:
 * - 3D Perspective Ground Grid with undulating wave motion
 * - Multiple rotating 3D isometric floating wireframe cubes
 * - Ambient floating neon particles & glow nodes
 * - Interactive mouse parallax depth tracking
 */
export default function ThreeDBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Mouse coordinates for 3D parallax
    let mouse = { x: width / 2, y: height / 2, targetX: width / 2, targetY: height / 2 };

    const handleMouseMove = (e) => {
      mouse.targetX = e.clientX;
      mouse.targetY = e.clientY;
    };

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('resize', handleResize);

    // 3D Wireframe Cube Class
    class Cube3D {
      constructor(x, y, z, size, color, rotSpeed) {
        this.baseX = x;
        this.baseY = y;
        this.baseZ = z;
        this.size = size;
        this.color = color;
        this.rotSpeed = rotSpeed;
        this.angleX = Math.random() * Math.PI * 2;
        this.angleY = Math.random() * Math.PI * 2;
        this.angleZ = Math.random() * Math.PI * 2;
        this.floatOffset = Math.random() * 100;
      }

      update(time, parallaxX, parallaxY) {
        this.angleX += this.rotSpeed.x;
        this.angleY += this.rotSpeed.y;
        this.angleZ += this.rotSpeed.z;

        const floatY = Math.sin(time * 0.0015 + this.floatOffset) * 25;
        this.x = this.baseX + parallaxX * 30;
        this.y = this.baseY + floatY + parallaxY * 20;
        this.z = this.baseZ;
      }

      draw(ctx, fov, cx, cy) {
        const s = this.size / 2;
        // 8 vertices in 3D local coordinates
        let vertices = [
          [-s, -s, -s],
          [s, -s, -s],
          [s, s, -s],
          [-s, s, -s],
          [-s, -s, s],
          [s, -s, s],
          [s, s, s],
          [-s, s, s],
        ];

        // Rotation transforms
        const cosX = Math.cos(this.angleX), sinX = Math.sin(this.angleX);
        const cosY = Math.cos(this.angleY), sinY = Math.sin(this.angleY);
        const cosZ = Math.cos(this.angleZ), sinZ = Math.sin(this.angleZ);

        const projected = vertices.map(([vx, vy, vz]) => {
          // Rotate Y
          let x1 = vx * cosY + vz * sinY;
          let y1 = vy;
          let z1 = -vx * sinY + vz * cosY;

          // Rotate X
          let x2 = x1;
          let y2 = y1 * cosX - z1 * sinX;
          let z2 = y1 * sinX + z1 * cosX;

          // Rotate Z
          let x3 = x2 * cosZ - y2 * sinZ;
          let y3 = x2 * sinZ + y2 * cosZ;
          let z3 = z2;

          // Translate to world position
          let wx = x3 + this.x;
          let wy = y3 + this.y;
          let wz = z3 + this.z;

          // Perspective projection
          const scale = fov / (fov + wz);
          return [cx + wx * scale, cy + wy * scale, wz];
        });

        // 12 edges of a cube
        const edges = [
          [0, 1], [1, 2], [2, 3], [3, 0], // front
          [4, 5], [5, 6], [6, 7], [7, 4], // back
          [0, 4], [1, 5], [2, 6], [3, 7], // connectors
        ];

        ctx.strokeStyle = this.color;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        for (const [i, j] of edges) {
          ctx.moveTo(projected[i][0], projected[i][1]);
          ctx.lineTo(projected[j][0], projected[j][1]);
        }
        ctx.stroke();

        // Draw small vertices glow
        ctx.fillStyle = this.color;
        for (const [px, py] of projected) {
          ctx.beginPath();
          ctx.arc(px, py, 2, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    // Glowing Particle Class
    class Particle3D {
      constructor() {
        this.reset();
      }

      reset() {
        this.x = (Math.random() - 0.5) * width * 1.5;
        this.y = (Math.random() - 0.5) * height * 1.5;
        this.z = Math.random() * 800 + 100;
        this.vx = (Math.random() - 0.5) * 0.4;
        this.vy = (Math.random() - 0.5) * 0.4;
        this.vz = -(Math.random() * 0.8 + 0.2);
        this.size = Math.random() * 2 + 1;
        this.alpha = Math.random() * 0.6 + 0.2;
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;
        this.z += this.vz;
        if (this.z < 10) this.reset();
      }

      draw(ctx, fov, cx, cy) {
        const scale = fov / (fov + this.z);
        const px = cx + this.x * scale;
        const py = cy + this.y * scale;

        if (px < 0 || px > width || py < 0 || py > height) return;

        ctx.fillStyle = `rgba(56, 189, 248, ${this.alpha * scale})`;
        ctx.beginPath();
        ctx.arc(px, py, this.size * scale, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Initialize 3D objects
    const cubes = [
      new Cube3D(-width * 0.35, -height * 0.2, 200, 110, 'rgba(56, 189, 248, 0.45)', { x: 0.005, y: 0.008, z: 0.003 }),
      new Cube3D(width * 0.38, -height * 0.15, 250, 130, 'rgba(99, 102, 241, 0.45)', { x: 0.004, y: -0.006, z: 0.005 }),
      new Cube3D(-width * 0.28, height * 0.28, 180, 85, 'rgba(168, 85, 247, 0.4)', { x: -0.007, y: 0.005, z: 0.002 }),
      new Cube3D(width * 0.32, height * 0.25, 220, 95, 'rgba(14, 165, 233, 0.35)', { x: 0.006, y: 0.007, z: -0.004 }),
      new Cube3D(0, -height * 0.35, 300, 75, 'rgba(59, 130, 246, 0.3)', { x: 0.003, y: 0.004, z: 0.008 }),
    ];

    const particles = Array.from({ length: 60 }, () => new Particle3D());

    let time = 0;

    const render = () => {
      time++;
      // Smooth mouse easing
      mouse.x += (mouse.targetX - mouse.x) * 0.05;
      mouse.y += (mouse.targetY - mouse.y) * 0.05;

      const parallaxX = (mouse.x - width / 2) / (width / 2);
      const parallaxY = (mouse.y - height / 2) / (height / 2);

      // Deep, futuristic 3D background gradient
      const bgGrad = ctx.createLinearGradient(0, 0, width, height);
      bgGrad.addColorStop(0, '#090d16');
      bgGrad.addColorStop(0.5, '#0b1329');
      bgGrad.addColorStop(1, '#070a12');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2;
      const fov = 600;

      // Draw 3D Radial Glow Orbs
      const glowGrad1 = ctx.createRadialGradient(
        cx + parallaxX * 80 - 200,
        cy + parallaxY * 50 - 150,
        10,
        cx + parallaxX * 80 - 200,
        cy + parallaxY * 50 - 150,
        450
      );
      glowGrad1.addColorStop(0, 'rgba(14, 165, 233, 0.15)');
      glowGrad1.addColorStop(1, 'transparent');
      ctx.fillStyle = glowGrad1;
      ctx.fillRect(0, 0, width, height);

      const glowGrad2 = ctx.createRadialGradient(
        cx - parallaxX * 80 + 250,
        cy - parallaxY * 50 + 100,
        10,
        cx - parallaxX * 80 + 250,
        cy - parallaxY * 50 + 100,
        500
      );
      glowGrad2.addColorStop(0, 'rgba(99, 102, 241, 0.12)');
      glowGrad2.addColorStop(1, 'transparent');
      ctx.fillStyle = glowGrad2;
      ctx.fillRect(0, 0, width, height);

      // Draw 3D Perspective Ground Grid
      const horizonY = height * 0.62 + parallaxY * 30;
      const gridCols = 22;
      const gridRows = 16;
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.08)';
      ctx.lineWidth = 1;

      // Perspective grid vanishing lines
      for (let i = -gridCols / 2; i <= gridCols / 2; i++) {
        const bottomX = cx + i * (width / (gridCols * 0.75)) + parallaxX * 50;
        ctx.beginPath();
        ctx.moveTo(cx + parallaxX * 25, horizonY);
        ctx.lineTo(bottomX, height + 50);
        ctx.stroke();
      }

      // Horizontal lines with exponential distance compression
      for (let j = 1; j <= gridRows; j++) {
        const p = Math.pow(j / gridRows, 2.2);
        const y = horizonY + (height - horizonY + 50) * p;
        const wave = Math.sin(time * 0.02 + j * 0.5) * 3;
        ctx.strokeStyle = `rgba(56, 189, 248, ${0.03 + p * 0.12})`;
        ctx.beginPath();
        ctx.moveTo(0, y + wave);
        ctx.lineTo(width, y + wave);
        ctx.stroke();
      }

      // Update and draw floating 3D Particles
      for (const p of particles) {
        p.update();
        p.draw(ctx, fov, cx, cy);
      }

      // Update and draw 3D Wireframe Cubes
      for (const cube of cubes) {
        cube.update(time, parallaxX, parallaxY);
        cube.draw(ctx, fov, cx, cy);
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ display: 'block' }}
    />
  );
}
