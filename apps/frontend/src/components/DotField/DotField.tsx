import React, { memo, useRef, useEffect } from 'react';

interface DotFieldProps {
  dotRadius?: number;
  dotSpacing?: number;
  cursorRadius?: number;
  cursorForce?: number;
  bulgeOnly?: boolean;
  bulgeStrength?: number;
  glowRadius?: number;
  glowColor?: string;
  sparkle?: boolean;
  waveAmplitude?: number;
  gradientFrom?: string;
  gradientTo?: string;
  style?: React.CSSProperties;
  className?: string;
}

interface Dot {
  ax: number;
  ay: number;
  sx: number;
  sy: number;
  vx: number;
  vy: number;
  x: number;
  y: number;
}

const g1 = Math.PI * 2;

const DotField: React.FC<DotFieldProps> = memo(({
  dotRadius = 1.5,
  dotSpacing = 14,
  cursorRadius = 500,
  cursorForce = 0.1,
  bulgeOnly = true,
  bulgeStrength = 67,
  glowRadius = 80,
  glowColor = 'rgba(100, 116, 139, 0.08)',
  sparkle = false,
  waveAmplitude = 0,
  gradientFrom = 'rgba(168, 85, 247, 0.35)',
  gradientTo = 'rgba(180, 151, 207, 0.25)',
  style,
  className,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const glowCircleRef = useRef<SVGCircleElement | null>(null);
  const dotsRef = useRef<Dot[]>([]);
  
  const mouseRef = useRef({
    x: -9999,
    y: -9999,
    prevX: -9999,
    prevY: -9999,
    speed: 0,
  });
  
  const rafRef = useRef<number | null>(null);
  const boundsRef = useRef({ w: 0, h: 0, offsetX: 0, offsetY: 0 });
  const glowOpacityRef = useRef(0);
  const targetOpacityRef = useRef(0);
  
  const propsRef = useRef({
    dotRadius,
    dotSpacing,
    cursorRadius,
    cursorForce,
    bulgeOnly,
    bulgeStrength,
    sparkle,
    waveAmplitude,
    gradientFrom,
    gradientTo,
  });
  
  propsRef.current = {
    dotRadius,
    dotSpacing,
    cursorRadius,
    cursorForce,
    bulgeOnly,
    bulgeStrength,
    sparkle,
    waveAmplitude,
    gradientFrom,
    gradientTo,
  };
  
  const rebuildRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const glowCircle = glowCircleRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d', { alpha: true })!;
    
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let resizeTimeout: NodeJS.Timeout;

    function handleResize() {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(setupCanvas, 100);
    }

    function setupCanvas() {
      if (!canvas || !ctx) return;
      const parent = canvas.parentElement;
      if (!parent) return;
      
      const bounds = parent.getBoundingClientRect();
      const w = bounds.width;
      const h = bounds.height;
      
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      
      boundsRef.current = {
        w,
        h,
        offsetX: bounds.left + window.scrollX,
        offsetY: bounds.top + window.scrollY,
      };
      
      generateDots(w, h);
    }

    function generateDots(w: number, h: number) {
      const p = propsRef.current;
      const spacing = p.dotRadius + p.dotSpacing;
      const cols = Math.floor(w / spacing);
      const rows = Math.floor(h / spacing);
      const startX = (w % spacing) / 2;
      const startY = (h % spacing) / 2;
      
      const dots: Dot[] = new Array(rows * cols);
      let index = 0;
      
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const x = startX + c * spacing + spacing / 2;
          const y = startY + r * spacing + spacing / 2;
          dots[index++] = {
            ax: x,
            ay: y,
            sx: x,
            sy: y,
            vx: 0,
            vy: 0,
            x,
            y,
          };
        }
      }
      dotsRef.current = dots;
    }

    function handleMouseMove(e: MouseEvent) {
      if ((e.target as HTMLElement).closest('.ln-navbar')) return;
      const bounds = boundsRef.current;
      mouseRef.current.x = e.pageX - bounds.offsetX;
      mouseRef.current.y = e.pageY - bounds.offsetY;
    }

    function updateMouseSpeed() {
      const m = mouseRef.current;
      const dx = m.prevX - m.x;
      const dy = m.prevY - m.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      m.speed += (dist - m.speed) * 0.5;
      if (m.speed < 0.001) m.speed = 0;
      
      m.prevX = m.x;
      m.prevY = m.y;
    }

    const mouseInterval = setInterval(updateMouseSpeed, 20);
    let frameCount = 0;

    function render() {
      frameCount++;
      const dots = dotsRef.current;
      const mouse = mouseRef.current;
      const { w, h } = boundsRef.current;
      const p = propsRef.current;
      const numDots = dots.length;
      const time = frameCount * 0.02;
      const speedNormalized = Math.min(mouse.speed / 5, 1);
      
      targetOpacityRef.current += (speedNormalized - targetOpacityRef.current) * 0.06;
      if (targetOpacityRef.current < 0.001) targetOpacityRef.current = 0;
      
      const targetOpacity = targetOpacityRef.current;
      glowOpacityRef.current += (targetOpacity - glowOpacityRef.current) * 0.08;
      
      if (glowCircle) {
        glowCircle.setAttribute('cx', mouse.x.toString());
        glowCircle.setAttribute('cy', mouse.y.toString());
        glowCircle.style.opacity = glowOpacityRef.current.toString();
      }
      
      ctx.clearRect(0, 0, w, h);
      
      const gradient = ctx.createLinearGradient(0, 0, w, h);
      gradient.addColorStop(0, p.gradientFrom);
      gradient.addColorStop(1, p.gradientTo);
      ctx.fillStyle = gradient;
      
      const radiusSq = p.cursorRadius * p.cursorRadius;
      const halfRadius = p.dotRadius / 2;
      const isBulge = p.bulgeOnly;
      
      ctx.beginPath();
      
      for (let idx = 0; idx < numDots; idx++) {
        const dot = dots[idx];
        const dx = mouse.x - dot.ax;
        const dy = mouse.y - dot.ay;
        const distSq = dx * dx + dy * dy;
        
        if (distSq < radiusSq && targetOpacity > 0.01) {
          const dist = Math.sqrt(distSq);
          if (isBulge) {
            const force = 1 - dist / p.cursorRadius;
            const strength = force * force * p.bulgeStrength * targetOpacity;
            const angle = Math.atan2(dy, dx);
            
            dot.sx += (dot.ax - Math.cos(angle) * strength - dot.sx) * 0.15;
            dot.sy += (dot.ay - Math.sin(angle) * strength - dot.sy) * 0.15;
          } else {
            const angle = Math.atan2(dy, dx);
            const force = (500 / dist) * (mouse.speed * p.cursorForce);
            
            dot.vx += Math.cos(angle) * -force;
            dot.vy += Math.sin(angle) * -force;
          }
        } else if (isBulge) {
          dot.sx += (dot.ax - dot.sx) * 0.1;
          dot.sy += (dot.ay - dot.sy) * 0.1;
        }
        
        if (!isBulge) {
          dot.vx *= 0.9;
          dot.vy *= 0.9;
          dot.x = dot.ax + dot.vx;
          dot.y = dot.ay + dot.vy;
          dot.sx += (dot.x - dot.sx) * 0.1;
          dot.sy += (dot.y - dot.sy) * 0.1;
        }
        
        let drawX = dot.sx;
        let drawY = dot.sy;
        
        if (p.waveAmplitude > 0) {
          drawY += Math.sin(dot.ax * 0.03 + time) * p.waveAmplitude;
          drawX += Math.cos(dot.ay * 0.03 + time * 0.7) * p.waveAmplitude * 0.5;
        }
        
        const isSparkle = p.sparkle && (((idx * 2654435761) ^ (frameCount >> 3)) >>> 0) % 100 < 3;
        const currentRadius = isSparkle ? halfRadius * 1.8 : halfRadius;
        
        ctx.moveTo(drawX + currentRadius, drawY);
        ctx.arc(drawX, drawY, currentRadius, 0, g1);
      }
      
      ctx.fill();
      rafRef.current = requestAnimationFrame(render);
    }

    setupCanvas();
    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    rafRef.current = requestAnimationFrame(render);
    
    rebuildRef.current = () => {
      const { w, h } = boundsRef.current;
      if (w > 0 && h > 0) generateDots(w, h);
    };

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      clearInterval(mouseInterval);
      clearTimeout(resizeTimeout);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  useEffect(() => {
    if (rebuildRef.current) {
      rebuildRef.current();
    }
  }, [dotRadius, dotSpacing]);

  const stopColorSolid = glowColor;
  const stopColorTransparent = glowColor.startsWith('#')
    ? glowColor.length === 7 
      ? glowColor + '00' 
      : glowColor + '0'
    : glowColor.replace(/[^,]+(?=\s*\))/g, '0');

  return (
    <div
      className={className}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        ...style,
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
        }}
      />
      <svg
        ref={svgRef}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
        }}
      >
        <defs>
          <radialGradient id="dot-field-glow">
            <stop offset="0%" stopColor={stopColorSolid} />
            <stop offset="100%" stopColor={stopColorTransparent} />
          </radialGradient>
        </defs>
        <circle
          ref={glowCircleRef}
          cx="-9999"
          cy="-9999"
          r={glowRadius}
          fill="url(#dot-field-glow)"
          style={{ opacity: 0, willChange: 'opacity' }}
        />
      </svg>
    </div>
  );
});

export default DotField;
