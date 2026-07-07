"use client";

import { useEffect, useRef, useState, useCallback, useMemo } from "react";

interface ImageViewerProps {
  images: { src: string; alt: string }[];
  initialIndex: number;
  onClose: () => void;
}

export default function ImageViewer({ images, initialIndex, onClose }: ImageViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [zoomState, setZoomState] = useState({ scale: 1, x: 0, y: 0 });
  const [isAnimating, setIsAnimating] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  // Use refs for touch tracking to avoid re-renders during pinch
  const touch = useRef({
    startX: 0,
    startY: 0,
    startDist: 0,
    isPinching: false,
    isSwiping: false,
    startScale: 1,
    startPosX: 0,
    startPosY: 0,
    lastPinchScale: 1,
  });
  const rafId = useRef(0);
  const currentImage = useMemo(() => images[currentIndex], [images, currentIndex]);

  const resetZoom = useCallback(() => {
    setIsAnimating(true);
    setZoomState({ scale: 1, x: 0, y: 0 });
    setTimeout(() => setIsAnimating(false), 250);
  }, []);

  const goToPrev = useCallback(() => {
    if (currentIndex > 0) {
      resetZoom();
      setCurrentIndex(currentIndex - 1);
    }
  }, [currentIndex, resetZoom]);

  const goToNext = useCallback(() => {
    if (currentIndex < images.length - 1) {
      resetZoom();
      setCurrentIndex(currentIndex + 1);
    }
  }, [currentIndex, images.length, resetZoom]);

  // Keyboard navigation
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      switch (e.key) {
        case "Escape": onClose(); break;
        case "ArrowLeft": goToPrev(); break;
        case "ArrowRight": goToNext(); break;
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, goToPrev, goToNext]);

  // Prevent body scroll
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, []);

  // Throttle state updates via requestAnimationFrame
  const applyZoom = useCallback((s: number, px: number, py: number) => {
    if (rafId.current) return;
    rafId.current = requestAnimationFrame(() => {
      setZoomState({ scale: s, x: px, y: py });
      rafId.current = 0;
    });
  }, []);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touches = e.touches;
    const t = touch.current;
    t.startX = touches[0].clientX;
    t.startY = touches[0].clientY;
    t.startScale = zoomState.scale;
    t.startPosX = zoomState.x;
    t.startPosY = zoomState.y;
    t.isPinching = false;
    t.isSwiping = false;
    setIsAnimating(false);

    if (touches.length === 2) {
      t.isPinching = true;
      const dx = touches[0].clientX - touches[1].clientX;
      const dy = touches[0].clientY - touches[1].clientY;
      t.startDist = Math.sqrt(dx * dx + dy * dy);
      t.lastPinchScale = zoomState.scale;
    } else if (touches.length === 1 && zoomState.scale === 1) {
      t.isSwiping = true;
    }
  }, [zoomState.scale, zoomState.x, zoomState.y]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    const touches = e.touches;
    const t = touch.current;

    if (touches.length === 2 && t.isPinching) {
      e.preventDefault();
      const dx = touches[0].clientX - touches[1].clientX;
      const dy = touches[0].clientY - touches[1].clientY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const raw = t.startScale * (dist / t.startDist);
      const s = Math.max(1, Math.min(5, raw));
      t.lastPinchScale = s;
      applyZoom(s, t.startPosX, t.startPosY);
      return;
    }

    if (touches.length === 1 && t.isPinching) return;

    if (touches.length === 1 && zoomState.scale > 1) {
      e.preventDefault();
      applyZoom(
        zoomState.scale,
        t.startPosX + (touches[0].clientX - t.startX),
        t.startPosY + (touches[0].clientY - t.startY)
      );
    }
  }, [zoomState.scale, applyZoom]);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    const t = touch.current;
    if (t.isPinching) {
      t.isPinching = false;
      return;
    }
    if (t.isSwiping && zoomState.scale === 1) {
      const dx = e.changedTouches[0].clientX - t.startX;
      if (Math.abs(dx) > 50) {
        setIsAnimating(true);
        setTimeout(() => setIsAnimating(false), 300);
      }
      if (dx < -50) goToNext();
      else if (dx > 50) goToPrev();
    }
    t.isSwiping = false;
  }, [zoomState.scale, goToNext, goToPrev]);

  // Double-tap zoom toggle
  const handleDoubleClick = useCallback(() => {
    if (zoomState.scale > 1) resetZoom();
    else setZoomState({ scale: 2.5, x: 0, y: 0 });
  }, [zoomState.scale, resetZoom]);

  if (images.length === 0) return null;

  const { scale, x, y } = zoomState;
  const isZoomed = scale > 1;

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 bg-black select-none"
      style={{ touchAction: "none" }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-10 w-10 h-10 bg-white/20 backdrop-blur rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* Counter */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 text-white/80 text-sm bg-black/30 backdrop-blur px-3 py-1 rounded-full">
        {currentIndex + 1} / {images.length}
      </div>

      {/* Image container */}
      <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
        <img
          ref={imageRef}
          referrerPolicy="origin"
          src={currentImage.src}
          alt={currentImage.alt}
          onDoubleClick={handleDoubleClick}
          style={{
            transform: `translate3d(${x}px, ${y}px, 0) scale3d(${scale}, ${scale}, 1)`,
            transition: isAnimating ? "transform 0.25s cubic-bezier(0.2, 0, 0.2, 1)" : "none",
            willChange: isZoomed ? "transform" : "auto",
            backfaceVisibility: "hidden",
          }}
          className="max-w-full max-h-full object-contain pointer-events-none"
          draggable={false}
        />
      </div>

      {/* Navigation arrows - hidden when zoomed */}
      {!isZoomed && currentIndex > 0 && (
        <button
          onClick={goToPrev}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white/20 backdrop-blur rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      )}
      {!isZoomed && currentIndex < images.length - 1 && (
        <button
          onClick={goToNext}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white/20 backdrop-blur rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      )}
    </div>
  );
}
