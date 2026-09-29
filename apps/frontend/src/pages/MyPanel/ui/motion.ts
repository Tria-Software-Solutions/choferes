import { useEffect, useRef, useState } from "react";
import { useMediaQuery } from "@mui/material";
import { keyframes } from "@mui/material/styles";
import type { SxProps, Theme } from "@mui/material/styles";

// Movimiento de "Mi Panel": entrada escalonada de las secciones, medidores que
// se llenan y cifras que suben hasta su valor. Todo se apaga con
// `prefers-reduced-motion`.

export const usePrefersReducedMotion = (): boolean =>
  useMediaQuery("(prefers-reduced-motion: reduce)", { noSsr: true });

const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

/** Entrada suave (fade + subida) con retardo según la posición de la sección. */
export const revealSx = (index = 0): SxProps<Theme> => ({
  animation: `${fadeUp} 460ms cubic-bezier(0.22, 0.8, 0.24, 1) backwards`,
  animationDelay: `${Math.min(index, 8) * 60}ms`,
  "@media (prefers-reduced-motion: reduce)": { animation: "none" },
});

/** false en el primer pintado y true justo después: dispara las transiciones CSS de entrada. */
export const useMountedFlag = (): boolean => {
  const reduced = usePrefersReducedMotion();
  const [mounted, setMounted] = useState(reduced);
  useEffect(() => {
    if (reduced) {
      setMounted(true);
      return undefined;
    }
    const frame = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(frame);
  }, [reduced]);
  return mounted;
};

/** Anima un número desde su valor anterior hasta `target` (ease-out cúbico). */
export const useCountUp = (target: number, duration = 900): number => {
  const reduced = usePrefersReducedMotion();
  const [value, setValue] = useState(reduced ? target : 0);
  const fromRef = useRef(reduced ? target : 0);

  useEffect(() => {
    if (reduced) {
      fromRef.current = target;
      setValue(target);
      return undefined;
    }
    const from = fromRef.current;
    const start = performance.now();
    let frame = 0;
    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      const next = progress === 1 ? target : from + (target - from) * eased;
      fromRef.current = next;
      setValue(next);
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, duration, reduced]);

  return value;
};
