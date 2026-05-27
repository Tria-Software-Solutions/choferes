import { useState, useEffect, useRef, memo } from 'react';

const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

interface ShuffleProps {
  text: string;
  stagger?: number;
  className?: string;
}

const Shuffle = memo(({ text, stagger = 0.06, className = '' }: ShuffleProps) => {
  const [displayChars, setDisplayChars] = useState(() =>
    text.split('').map(() => CHARS[Math.floor(Math.random() * CHARS.length)])
  );
  const indexRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  const lastRef = useRef(0);

  useEffect(() => {
    const chars = text.split('');
    setDisplayChars(chars.map(() => CHARS[Math.floor(Math.random() * CHARS.length)]));
    indexRef.current = 0;
    lastRef.current = performance.now();

    function tick(now: number) {
      if (indexRef.current >= chars.length) {
        rafRef.current = null;
        return;
      }

      const elapsed = now - lastRef.current;
      if (elapsed >= stagger * 1000) {
        setDisplayChars(prev => {
          const next = prev.map((c, i) => {
            if (i < indexRef.current) return chars[i];
            if (i === indexRef.current) return chars[i];
            return CHARS[Math.floor(Math.random() * CHARS.length)];
          });
          return next;
        });
        indexRef.current++;
        lastRef.current = now;
      } else {
        setDisplayChars(prev =>
          prev.map((c, i) => {
            if (i < indexRef.current) return chars[i];
            return CHARS[Math.floor(Math.random() * CHARS.length)];
          })
        );
      }

      rafRef.current = requestAnimationFrame(tick);
    }

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [text, stagger]);

  return (
    <span className={`shuffle-text ${className}`} aria-label={text}>
      {displayChars.map((char, i) => (
        <span key={i} className="shuffle-char">
          {char === ' ' ? '\u00A0' : char}
        </span>
      ))}
    </span>
  );
});

Shuffle.displayName = 'Shuffle';

export default Shuffle;
