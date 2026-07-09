"use client";

import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { getViewerImageUrl } from "@/lib/images";

interface ImageViewerProps {
  images: { src: string; alt: string; thumbnail?: string }[];
  initialIndex: number;
  onClose: () => void;
}

function vpCenter() {
  return { vx: window.innerWidth / 2, vy: window.innerHeight / 2 };
}

export default function ImageViewer({ images, initialIndex, onClose }: ImageViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [zoomState, setZoomState] = useState({ scale: 1, x: 0, y: 0 });
  const [isAnimating, setIsAnimating] = useState(false);
  // Track which full-res images have finished loading
  const [loadedSet, setLoadedSet] = useState<Set<number>>(new Set());
  const preloadedRef = useRef<Set<number>>(new Set());

  const touch = useRef({
    // pinch
    isPinching: false,
    startDist: 0,
    startScale: 1, startX: 0, startY: 0,
    // gesture midpoint in screen coords
    gx: 0, gy: 0,
    // swipe
    swipeX: 0, swipeY: 0,
    isSwiping: false,
  });

  const currentImage = images[currentIndex];

  // Use original resolution with WebP conversion (no resize, no quality loss)
  const viewerSrc = useMemo(() => {
    return getViewerImageUrl(currentImage.src, 95);
  }, [currentImage.src]);

  const markLoaded = useCallback((idx: number) => {
    setLoadedSet(prev => {
      if (prev.has(idx)) return prev;
      const next = new Set(prev);
      next.add(idx);
      return next;
    });
  }, []);

  const resetZoom = useCallback(() => {
    setIsAnimating(true);
    setZoomState({ scale: 1, x: 0, y: 0 });
    setTimeout(() => setIsAnimating(false), 300);
  }, []);

  const goToPrev = useCallback(() => {
    if (currentIndex > 0) { resetZoom(); setCurrentIndex(currentIndex - 1); }
  }, [currentIndex, resetZoom]);

  const goToNext = useCallback(() => {
    if (currentIndex < images.length - 1) { resetZoom(); setCurrentIndex(currentIndex + 1); }
  }, [currentIndex, images.length, resetZoom]);

  // Preload adjacent full-res images in the background
  useEffect(() => {
    const neighbors = [currentIndex - 1, currentIndex + 1].filter(
      i => i >= 0 && i < images.length && !preloadedRef.current.has(i)
    );
    neighbors.forEach(i => {
      preloadedRef.current.add(i);
      const img = new window.Image();
      img.onload = () => markLoaded(i);
      // Use fetchpriority="low" to avoid stealing bandwidth from the current image
      img.fetchPriority = "low";
      img.src = images[i].src;
    });
  }, [currentIndex, images, markLoaded]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowLeft") goToPrev();
      else if (e.key === "ArrowRight") goToNext();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, goToPrev, goToNext]);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, []);

  // ── Touch ──
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const t = touch.current;
    const touches = e.touches;
    setIsAnimating(false);

    if (touches.length >= 2) {
      t.isPinching = true;
      t.isSwiping = false;
      t.startScale = zoomState.scale;
      t.startX = zoomState.x;
      t.startY = zoomState.y;
      const dx = touches[0].clientX - touches[1].clientX;
      const dy = touches[0].clientY - touches[1].clientY;
      t.startDist = Math.sqrt(dx * dx + dy * dy);
      t.gx = (touches[0].clientX + touches[1].clientX) / 2;
      t.gy = (touches[0].clientY + touches[1].clientY) / 2;
      return;
    }

    if (zoomState.scale <= 1 && touches.length === 1) {
      t.isSwiping = true;
      t.isPinching = false;
      t.swipeX = touches[0].clientX;
      t.swipeY = touches[0].clientY;
      return;
    }

    if (zoomState.scale > 1 && touches.length === 1) {
      t.isPinching = false;
      t.swipeX = touches[0].clientX;
      t.swipeY = touches[0].clientY;
    }
  }, [zoomState.scale, zoomState.x, zoomState.y]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    const t = touch.current;
    const touches = e.touches;

    if (touches.length >= 2 && t.isPinching) {
      e.preventDefault();
      const dx = touches[0].clientX - touches[1].clientX;
      const dy = touches[0].clientY - touches[1].clientY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const s = Math.max(1, Math.min(6, t.startScale * (dist / t.startDist)));

      const { vx, vy } = vpCenter();
      const ratio = s / t.startScale;
      const newX = (t.gx - vx) * (1 - ratio) + t.startX * ratio;
      const newY = (t.gy - vy) * (1 - ratio) + t.startY * ratio;

      setZoomState({ scale: s, x: newX, y: newY });
      return;
    }

    if (touches.length === 1 && zoomState.scale > 1 && !t.isPinching) {
      e.preventDefault();
      const deltaX = touches[0].clientX - t.swipeX;
      const deltaY = touches[0].clientY - t.swipeY;
      t.swipeX = touches[0].clientX;
      t.swipeY = touches[0].clientY;
      setZoomState(prev => ({ ...prev, x: prev.x + deltaX, y: prev.y + deltaY }));
    }
  }, [zoomState.scale]);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    const t = touch.current;
    if (t.isPinching) {
      t.isPinching = false;
      return;
    }
    if (t.isSwiping) {
      t.isSwiping = false;
      const dx = e.changedTouches[0].clientX - t.swipeX;
      if (Math.abs(dx) > 60) {
        setIsAnimating(true);
        setTimeout(() => setIsAnimating(false), 300);
        if (dx < 0) goToNext();
        else goToPrev();
      }
    }
  }, [goToNext, goToPrev]);

  const handleDoubleClick = useCallback(() => {
    if (zoomState.scale > 1) resetZoom();
    else {
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 300);
      setZoomState({ scale: 2.5, x: 0, y: 0 });
    }
  }, [zoomState.scale, resetZoom]);

  if (images.length === 0) return null;

  const { scale, x, y } = zoomState;
  const isZoomed = scale > 1;
  const thumbUrl = currentImage.thumbnail;
  const isLoaded = loadedSet.has(currentIndex);

  return (
    <div
      className="fixed inset-0 z-50 bg-black select-none"
      style={{ touchAction: "none" }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-10 w-10 h-10 bg-white/20 backdrop-blur rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 text-white/80 text-sm bg-black/30 backdrop-blur px-3 py-1 rounded-full">
        {currentIndex + 1} / {images.length}
      </div>

      <div
        className="absolute inset-0 flex items-center justify-center overflow-hidden"
        onClick={!isZoomed ? onClose : undefined}
      >
        {/* Blurred thumbnail placeholder — already cached from the grid view */}
        {thumbUrl && !isLoaded && (
          <img
            referrerPolicy="origin"
            src={thumbUrl}
            alt=""
            className="absolute max-w-full max-h-full object-contain"
            style={{ filter: "blur(20px) brightness(0.6)", transform: "scale(1.15)" }}
            draggable={false}
          />
        )}

        {/* Main full-res image with fade-in */}
        <img
          referrerPolicy="origin"
          src={viewerSrc}
          fetchPriority="high"
          alt={currentImage.alt}
          onLoad={() => markLoaded(currentIndex)}
          onDoubleClick={handleDoubleClick}
          style={{
            transform: `translate3d(${x}px, ${y}px, 0) scale3d(${scale}, ${scale}, 1)`,
            transition: isAnimating
              ? "transform 0.3s cubic-bezier(0.25, 0.1, 0.25, 1)"
              : isLoaded
                ? "opacity 0.4s ease"
                : "none",
            opacity: isLoaded ? 1 : 0,
            willChange: isZoomed ? "transform" : "auto",
          }}
          className="max-w-full max-h-full object-contain"
          draggable={false}
        />
      </div>

      {!isZoomed && currentIndex > 0 && (
        <button onClick={(e) => { e.stopPropagation(); goToPrev(); }}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white/20 backdrop-blur rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      )}
      {!isZoomed && currentIndex < images.length - 1 && (
        <button onClick={(e) => { e.stopPropagation(); goToNext(); }}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white/20 backdrop-blur rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      )}
    </div>
  );
}
