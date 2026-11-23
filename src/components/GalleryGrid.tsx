import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useCallback, useEffect, useRef, useState } from 'react';
import { gallery } from '../data/gallery';
import { asset } from '../lib/asset';
import { Close } from './Icons';
import { Reveal } from './Reveal';
import { RollingNumber } from './RollingNumber';

const ease = [0.22, 1, 0.36, 1] as const;

const slide = {
  enter: (direction: number) => ({ opacity: 0, x: direction * 110 }),
  center: { opacity: 1, x: 0 },
  exit: (direction: number) => ({ opacity: 0, x: direction * -110 }),
} as const;

export function GalleryGrid() {
  const [active, setActive] = useState<number | null>(null);
  const [direction, setDirection] = useState(1);
  const reduce = useReducedMotion();
  const closeRef = useRef<HTMLButtonElement>(null);
  const opener = useRef<HTMLButtonElement | null>(null);
  const isOpen = active !== null;

  const close = useCallback(() => setActive(null), []);
  const step = useCallback((dir: number) => {
    setDirection(dir);
    setActive((current) =>
      current === null ? current : (current + dir + gallery.length) % gallery.length,
    );
  }, []);

  useEffect(() => {
    if (active === null) return;
    for (const offset of [1, -1]) {
      const photo = gallery[(active + offset + gallery.length) % gallery.length];
      const preloader = new Image();
      preloader.decoding = 'async';
      preloader.src = asset(photo.src);
    }
  }, [active]);

  useEffect(() => {
    if (!isOpen) return;
    const trigger = opener.current;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        close();
        return;
      }
      if (event.key === 'ArrowRight') step(1);
      if (event.key === 'ArrowLeft') step(-1);
      if (event.key !== 'Tab') return;
      const panel = document.querySelector('.lightbox');
      if (!panel) return;
      const focusable = panel.querySelectorAll<HTMLElement>('button:not([disabled])');
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = previous;
      trigger?.focus();
    };
  }, [isOpen, close, step]);

  return (
    <>
      <div className="gallery-grid">
        {gallery.map((photo, index) => (
          <Reveal key={photo.id} className="gallery-item" delay={0.02 * (index % 8)}>
            <button
              className="gallery-open"
              type="button"
              aria-label={`Открыть снимок ${index + 1}`}
              onClick={(event) => {
                opener.current = event.currentTarget;
                setActive(index);
              }}
            >
              <img
                src={asset(photo.src)}
                srcSet={`${asset(photo.src.replace('gallery/', 'gallery/sm/'))} ${Math.round(
                  Math.min(1, 720 / Math.max(photo.width, photo.height)) * photo.width,
                )}w, ${asset(photo.src)} ${photo.width}w`}
                sizes="(max-width: 720px) 92vw, (max-width: 1024px) 47vw, 31vw"
                alt={photo.alt}
                width={photo.width}
                height={photo.height}
                loading={index < 4 ? 'eager' : 'lazy'}
                decoding="async"
              />
              <span className="gallery-hint mono" aria-hidden="true">
                Открыть
              </span>
            </button>
          </Reveal>
        ))}
      </div>

      <AnimatePresence>
        {active !== null && (
          <motion.div
            className="lightbox"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            onClick={close}
          >
            <button
              ref={closeRef}
              className="lightbox-close"
              type="button"
              onClick={close}
              aria-label="Закрыть"
            >
              <Close />
            </button>

            <motion.div
              className="lightbox-stage"
              role="dialog"
              aria-modal="true"
              aria-label={`Снимок ${active + 1} из ${gallery.length}`}
              initial={reduce ? false : { opacity: 0, scale: 0.985 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.99 }}
              transition={{ duration: 0.45, ease }}
              onClick={(event) => event.stopPropagation()}
            >
              <button
                className="lightbox-nav is-prev"
                type="button"
                onClick={() => step(-1)}
                aria-label="Предыдущий снимок"
              >
                <span aria-hidden="true">←</span>
              </button>

              <AnimatePresence mode="popLayout" custom={direction}>
                <motion.figure
                  key={gallery[active].id}
                  className="lightbox-figure"
                  custom={direction}
                  variants={slide}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: reduce ? 0 : 0.34, ease }}
                >
                  <img
                    src={asset(gallery[active].src)}
                    alt={gallery[active].alt}
                    width={gallery[active].width}
                    height={gallery[active].height}
                    decoding="async"
                    draggable={false}
                  />
                </motion.figure>
              </AnimatePresence>

              <button
                className="lightbox-nav is-next"
                type="button"
                onClick={() => step(1)}
                aria-label="Следующий снимок"
              >
                <span aria-hidden="true">→</span>
              </button>
            </motion.div>

            <div className="lightbox-bar mono" onClick={(event) => event.stopPropagation()}>
              <span className="lightbox-counter">
                <RollingNumber
                  value={String(active + 1).padStart(2, '0')}
                  suffix={` / ${String(gallery.length).padStart(2, '0')}`}
                />
              </span>
              <span className="lightbox-alt">← → листать · Esc закрыть</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
