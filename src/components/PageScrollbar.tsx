import { useEffect, useRef, useState } from 'react';
import type { PointerEvent as ReactPointerEvent } from 'react';

type Thumb = { top: number; height: number; visible: boolean };

export function PageScrollbar() {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const drag = useRef<{ startY: number; startScroll: number } | null>(null);
  const [thumb, setThumb] = useState<Thumb>({ top: 0, height: 0, visible: false });

  useEffect(() => {
    const doc = document.documentElement;
    let frame = 0;

    const metrics = {
      viewport: 0,
      full: 0,
      height: 0,
      maxTop: 1,
      maxScroll: 1,
      visible: false,
    };

    const paint = () => {
      frame = 0;
      if (!metrics.visible) {
        setThumb((prev) => (prev.visible ? { top: 0, height: 0, visible: false } : prev));
        return;
      }
      const progress = doc.scrollTop / metrics.maxScroll;
      setThumb({ top: metrics.maxTop * progress, height: metrics.height, visible: true });
    };

    const measure = () => {
      metrics.viewport = window.innerHeight;
      metrics.full = doc.scrollHeight;
      const trackH = trackRef.current?.clientHeight ?? metrics.viewport - 20;
      metrics.visible = metrics.full > metrics.viewport + 1;
      metrics.height = Math.max(
        36,
        (metrics.viewport / Math.max(1, metrics.full)) * trackH,
      );
      metrics.maxTop = Math.max(0, trackH - metrics.height);
      metrics.maxScroll = Math.max(1, metrics.full - metrics.viewport);
      paint();
    };

    const scheduleMeasure = () => {
      if (!frame) frame = window.requestAnimationFrame(measure);
    };

    const schedulePaint = () => {
      if (!frame) frame = window.requestAnimationFrame(paint);
    };

    measure();
    window.addEventListener('scroll', schedulePaint, { passive: true });
    window.addEventListener('resize', scheduleMeasure);

    const observer = new ResizeObserver(scheduleMeasure);
    observer.observe(document.body);

    return () => {
      window.removeEventListener('scroll', schedulePaint);
      window.removeEventListener('resize', scheduleMeasure);
      observer.disconnect();
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!thumb.visible) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    drag.current = {
      startY: event.clientY,
      startScroll: document.documentElement.scrollTop,
    };
  };

  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!drag.current) return;
    const doc = document.documentElement;
    const viewport = window.innerHeight;
    const trackH = trackRef.current?.clientHeight ?? viewport - 20;
    const maxTop = Math.max(1, trackH - thumb.height);
    const delta =
      ((event.clientY - drag.current.startY) / maxTop) * (doc.scrollHeight - viewport);
    doc.scrollTop = drag.current.startScroll + delta;
  };

  const onPointerUp = () => {
    drag.current = null;
  };

  return (
    <div className="page-scrollbar" aria-hidden="true">
      <div className="page-scrollbar-track" ref={trackRef}>
        <div
          className="page-scrollbar-thumb"
          style={{
            height: `${thumb.height}px`,
            transform: `translateY(${thumb.top}px)`,
            opacity: thumb.visible ? 1 : 0,
          }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        />
      </div>
    </div>
  );
}
