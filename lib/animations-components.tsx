'use client';

import { useEffect, useRef } from 'react';

// Export interfaces from animations.ts
export interface MatrixRainProps {
  width?: number;
  height?: number;
  fontSize?: number;
  density?: number;
  colors?: {
    primary: string;
    secondary: string;
    background: string;
  };
  speed?: number;
}

export interface NetworkNode {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
}

export interface NetworkParticlesProps {
  width?: number;
  height?: number;
  nodeCount?: number;
  connectionDistance?: number;
  nodeColor?: string;
  lineColor?: string;
  lineWidth?: number;
  speed?: number;
}

export interface RadarSweepProps {
  width?: number;
  height?: number;
  centerX?: number;
  centerY?: number;
  radius?: number;
  sweepColor?: string;
  gridColor?: string;
  sweepSpeed?: number;
}

export interface HexagonGridProps {
  width?: number;
  height?: number;
  hexSize?: number;
  strokeColor?: string;
  fillColor?: string;
  spacing?: number;
}

/**
 * Matrix Rain Canvas Component
 */
export function MatrixRainCanvas({
  width = typeof window !== 'undefined' ? window.innerWidth : 800,
  height = typeof window !== 'undefined' ? window.innerHeight : 600,
  fontSize = 14,
  density = 0.05,
  colors = {
    primary: '#00FF41',
    secondary: '#00C832',
    background: 'rgba(10, 10, 11, 0.8)',
  },
  speed = 50,
}: MatrixRainProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = width;
    canvas.height = height;

    const columns = Math.floor(width / fontSize);
    const drops: number[] = Array(columns).fill(1);

    function draw() {
      if (!ctx) return;
      ctx.fillStyle = colors.background;
      ctx.fillRect(0, 0, width, height);

      ctx.fillStyle = colors.primary;
      ctx.font = `${fontSize}px monospace`;

      for (let i = 0; i < drops.length; i++) {
        const text = String.fromCharCode(Math.random() * 128);
        const x = i * fontSize;
        const y = drops[i] * fontSize;

        if (Math.random() > density) {
          ctx.fillStyle = colors.primary;
          ctx.fillText(text, x, y);
        } else {
          ctx.fillStyle = colors.secondary;
          ctx.fillText(text, x, y);
        }

        if (y > height && Math.random() > 0.975) {
          drops[i] = 0;
        }

        drops[i]++;
      }
    }

    const interval = setInterval(draw, speed);
    draw();

    return () => {
      clearInterval(interval);
    };
  }, [width, height, fontSize, density, colors, speed]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none"
      style={{ opacity: 0.3 }}
    />
  );
}

/**
 * Network Particles Component
 */
export function NetworkParticles({
  width = typeof window !== 'undefined' ? window.innerWidth : 800,
  height = typeof window !== 'undefined' ? window.innerHeight : 600,
  nodeCount = 50,
  connectionDistance = 150,
  nodeColor = '#00FF41',
  lineColor = '#00FF41',
  lineWidth = 1,
  speed = 0.5,
}: NetworkParticlesProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const nodesRef = useRef<NetworkNode[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = width;
    canvas.height = height;

    const nodes: NetworkNode[] = Array.from({ length: nodeCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * speed,
      vy: (Math.random() - 0.5) * speed,
      radius: Math.random() * 2 + 1,
    }));

    nodesRef.current = nodes;

    function draw() {
      if (!ctx) return;
      ctx.clearRect(0, 0, width, height);

      nodes.forEach((node) => {
        node.x += node.vx;
        node.y += node.vy;

        if (node.x <= 0 || node.x >= width) node.vx *= -1;
        if (node.y <= 0 || node.y >= height) node.vy *= -1;

        node.x = Math.max(0, Math.min(width, node.x));
        node.y = Math.max(0, Math.min(height, node.y));

        nodes.forEach((otherNode) => {
          const dx = node.x - otherNode.x;
          const dy = node.y - otherNode.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < connectionDistance && ctx) {
            ctx.strokeStyle = lineColor;
            ctx.lineWidth = lineWidth * (1 - distance / connectionDistance);
            ctx.globalAlpha = 1 - distance / connectionDistance;
            ctx.beginPath();
            ctx.moveTo(node.x, node.y);
            ctx.lineTo(otherNode.x, otherNode.y);
            ctx.stroke();
            ctx.globalAlpha = 1;
          }
        });

        if (ctx) {
          ctx.fillStyle = nodeColor;
          ctx.beginPath();
          ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      requestAnimationFrame(draw);
    }

    const animationId = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [width, height, nodeCount, connectionDistance, nodeColor, lineColor, lineWidth, speed]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none"
      style={{ opacity: 0.4 }}
    />
  );
}

/**
 * Radar Sweep Component
 */
export function RadarSweep({
  width = 400,
  height = 400,
  centerX,
  centerY,
  radius = 150,
  sweepColor = '#00FF41',
  gridColor = '#00FF41',
  sweepSpeed = 2,
}: RadarSweepProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const angleRef = useRef(0);

  const cx = centerX ?? width / 2;
  const cy = centerY ?? height / 2;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = width;
    canvas.height = height;

    function draw() {
      if (!ctx) return;
      ctx.clearRect(0, 0, width, height);

      ctx.strokeStyle = gridColor;
      ctx.lineWidth = 1;
      ctx.globalAlpha = 0.3;

      for (let r = radius / 3; r <= radius; r += radius / 3) {
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.stroke();
      }

      for (let i = 0; i < 8; i++) {
        const angle = (Math.PI * 2 * i) / 8;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(
          cx + Math.cos(angle) * radius,
          cy + Math.sin(angle) * radius
        );
        ctx.stroke();
      }

      ctx.globalAlpha = 1;

      const currentAngle = (angleRef.current * Math.PI) / 180;
      const gradient = ctx.createLinearGradient(cx, cy, cx + Math.cos(currentAngle) * radius, cy + Math.sin(currentAngle) * radius);
      gradient.addColorStop(0, sweepColor + '80');
      gradient.addColorStop(1, sweepColor + '00');

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, radius, currentAngle - 0.3, currentAngle + 0.3);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = sweepColor;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(
        cx + Math.cos(currentAngle) * radius,
        cy + Math.sin(currentAngle) * radius
      );
      ctx.stroke();

      angleRef.current += sweepSpeed;
      if (angleRef.current >= 360) {
        angleRef.current = 0;
      }

      requestAnimationFrame(draw);
    }

    const animationId = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [width, height, cx, cy, radius, sweepColor, gridColor, sweepSpeed]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none"
      style={{ opacity: 0.6 }}
    />
  );
}

/**
 * Hexagon Grid Component
 */
export function HexagonGrid({
  width = typeof window !== 'undefined' ? window.innerWidth : 800,
  height = typeof window !== 'undefined' ? window.innerHeight : 600,
  hexSize = 30,
  strokeColor = '#00FF41',
  fillColor = 'transparent',
  spacing = 5,
}: HexagonGridProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;

    svg.setAttribute('width', width.toString());
    svg.setAttribute('height', height.toString());

    const hexWidth = hexSize * 2;
    const hexHeight = (hexSize * Math.sqrt(3)) / 2;
    const cols = Math.ceil(width / (hexWidth * 0.75)) + 1;
    const rows = Math.ceil(height / hexHeight) + 1;

    const drawHexagon = (x: number, y: number) => {
      const points: string[] = [];
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i;
        const px = x + hexSize * Math.cos(angle);
        const py = y + hexSize * Math.sin(angle);
        points.push(`${px},${py}`);
      }
      return points.join(' ');
    };

    svg.innerHTML = '';

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const x = col * hexWidth * 0.75 + (row % 2 === 0 ? 0 : hexWidth * 0.375);
        const y = row * hexHeight;

        const hex = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
        hex.setAttribute('points', drawHexagon(x, y));
        hex.setAttribute('fill', fillColor);
        hex.setAttribute('stroke', strokeColor);
        hex.setAttribute('stroke-width', '1');
        hex.setAttribute('opacity', '0.2');
        svg.appendChild(hex);
      }
    }
  }, [width, height, hexSize, strokeColor, fillColor, spacing]);

  return (
    <svg
      ref={svgRef}
      className="absolute inset-0 pointer-events-none"
      style={{ opacity: 0.3 }}
    />
  );
}

/**
 * Scan Line Overlay Component
 */
export function ScanLineOverlay({
  speed = 3,
  color = '#00FF41',
  thickness = 2,
}: {
  speed?: number;
  color?: string;
  thickness?: number;
}) {
  return (
    <div
      className="absolute inset-0 pointer-events-none overflow-hidden"
      style={{ zIndex: 1000 }}
    >
      <div
        className="absolute w-full"
        style={{
          height: `${thickness}px`,
          background: `linear-gradient(to bottom, transparent, ${color}, transparent)`,
          boxShadow: `0 0 ${thickness * 5}px ${color}`,
          animation: `scan-line ${speed}s linear infinite`,
        }}
      />
    </div>
  );
}

