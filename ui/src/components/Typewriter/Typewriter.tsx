import { useEffect } from 'react';
import { stagger, useAnimate, useInView } from 'motion/react';

interface Word {
  text: string;
  className?: string;
}

interface TypewriterProps {
  words: Word[];
  className?: string;
  cursorClassName?: string;
}

const TypewriterEffect = ({ words }: TypewriterProps) => {
  const wordsArray = words.map((word) => ({
    ...word,
    text: word.text.split(''),
  }));

  const [scope, animate] = useAnimate();
  const isInView = useInView(scope);

  useEffect(() => {
    if (isInView) {
      animate(
        'span',
        {
          display: 'inline-block',
          opacity: 1,
          width: 'fit-content',
        },
        {
          duration: 0.3,
          delay: stagger(0.08),
          ease: 'easeInOut',
        }
      );
    }
  }, [isInView, animate]);

  return (
    <div style={{ display: 'inline' }}>
      <div ref={scope} style={{ display: 'inline' }}>
        {wordsArray.map((word, idx) => (
          <span key={`word-${idx}`} style={{ display: 'inline-block' }}>
            {word.text.map((char, index) => (
              <span
                key={`char-${index}`}
                style={{ display: 'none', opacity: 0 }}
              >
                {char === ' ' ? '\u00A0' : char}
              </span>
            ))}
            &nbsp;
          </span>
        ))}
      </div>
      <span
        style={{
          display: 'inline-block',
          width: 3,
          height: '1em',
          marginLeft: 4,
          borderRadius: 2,
          opacity: 1,
          animation: 'tw-blink 0.8s step-end infinite',
        }}
      >
        &nbsp;
      </span>
      <style>{`@keyframes tw-blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }`}</style>
    </div>
  );
};

export default TypewriterEffect;
