import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useLayoutEffect, useRef, type ReactNode } from 'react';

const ease = [0.22, 1, 0.36, 1] as const;

export function RollingNumber({
  value,
  suffix,
  className,
}: {
  value: string | number;
  suffix?: ReactNode;
  className?: string;
}) {
  const reduce = useReducedMotion();
  const text = String(value);
  const trackRef = useRef<HTMLSpanElement>(null);
  const measureRef = useRef<HTMLSpanElement>(null);

  useLayoutEffect(() => {
    const track = trackRef.current;
    const measure = measureRef.current;
    if (!track || !measure) return;

    const apply = () => {
      const width = measure.getBoundingClientRect().width;
      if (width > 0) track.style.width = `${Math.ceil(width * 10) / 10}px`;
    };

    apply();

    const observer = new ResizeObserver(apply);
    observer.observe(measure);

    let alive = true;
    document.fonts?.ready.then(() => {
      if (alive) apply();
    });

    return () => {
      alive = false;
      observer.disconnect();
    };
  }, [text]);

  return (
    <span className={`rolling-number${className ? ` ${className}` : ''}`}>
      <span className="sr-only">{text}</span>
      <span
        ref={trackRef}
        className={`rolling-track${reduce ? ' is-static' : ''}`}
        aria-hidden="true"
      >
        <span ref={measureRef} className="rolling-measure">
          {text}
        </span>
        <AnimatePresence initial={false}>
          <motion.span
            className="rolling-face"
            key={text}
            initial={reduce ? { opacity: 0 } : { y: '0.6em', opacity: 0 }}
            animate={{ y: '0%', opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease }}
          >
            {text}
          </motion.span>
        </AnimatePresence>
      </span>
      {suffix != null && <span className="rolling-suffix">{suffix}</span>}
    </span>
  );
}
