"use client";

import { useEffect, useRef, useState, useCallback } from "react";

interface ImageViewerProps {
  images: { src: string; alt: string }[];
  initialIndex: number;
  onClose: () => void;
}

export default function ImageViewer({ images, initialIndex, onClose }: ImageViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isTransitioning, setIsTransitioning] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const touchRef = useRef({
    startX: 0,
    startY: 0,
    startDist: 0,
    isPinching: false,
    startScale: 1,
    startPos: { x: 0, y: 0 },
  });

  const resetZoom = useCallback(() => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  }, []);

  const goToPrev = useCallback(() => {
    if (currentIndex > 0) {
      resetZoom();
      setCurrentIndex((i) => i - 1);
    }
  }, [currentIndex, resetZoom]);

  const goToNext = useCallback(() => {
    if (currentIndex < images.length - 1) {
      resetZoom();
      setCurrentIndex((i) => i + 1);
    }
  }, [currentIndex, images.length, resetZoom]);

  // Keyboard events
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case "Escape":
          onClose();
          break;
        case "ArrowLeft":
          goToPrev();
          break;
        case "ArrowRight":
          goToNext();
          break;
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose, goToPrev, goToNext]);

  // Prevent body scroll
  useEffect(() => {
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, []);

  // Touch handlers
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touches = e.touches;
    touchRef.current.startX = touches[0].clientX;
    touchRef.current.startY = touches[0].clientY;
    touchRef.current.startScale = scale;
    touchRef.current.startPos = { ...position };
    touchRef.current.isPinching = false;
    setIsTransitioning(false);

    if (touches.length === 2) {
      touchRef.current.isPinching = true;
      const dx = touches[0].clientX - touches[1].clientX;
      const dy = touches[0].clientY - touches[1].clientY;
      touchRef.current.startDist = Math.sqrt(dx * dx + dy * dy);
    }
  }, [scale, position]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    const touches = e.touches;

    if (touches.length === 2 && touchRef.current.isPinching) {
      e.preventDefault();
      const dx = touches[0].clientX - touches[1].clientX;
      const dy = touches[0].clientY - touches[1].clientY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const newScale = Math.max(1, Math.min(5, touchRef.current.startScale * (dist / touchRef.current.startDist)));
      setScale(newScale);
    } else if (touches.length === 1 && scale === 1 && !touchRef.current.isPinching) {
      const deltaX = touches[0].clientX - touchRef.current.startX;
      if (Math.abs(deltaX) > 10) {
        setIsTransitioning(true);
      }
    } else if (touches.length === 1 && scale > 1) {
      e.preventDefault();
      const dx = touches[0].clientX - touchRef.current.startX;
      const dy = touches[0].clientY - touchRef.current.startY;
      setPosition({
        x: touchRef.current.startPos.x + dx,
        y: touchRef.current.startPos.y + dy,
      });
    }
  }, [scale]);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (touchRef.current.isPinching) {
      touchRef.current.isPinching = false;
      return;
    }

    if (scale === 1 && isTransitioning) {
      const deltaX = e.changedTouches[0].clientX - touchRef.current.startX;
      if (deltaX < -50) {
        goToNext();
      } else if (deltaX > 50) {
        goToPrev();
      }
    }
    setIsTransitioning(false);
  }, [scale, isTransitioning, goToNext, goToPrev]);

  // Double-click to toggle zoom
  const handleDoubleClick = useCallback(() => {
    if (scale > 1) {
      resetZoom();
    } else {
      setScale(2);
    }
  }, [scale, resetZoom]);

  if (images.length === 0) return null;

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 bg-black touch-none select-none"
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

      {/* Image */}
      <div className="flex items-center justify-center w-full h-full">
        <img
          src={images[currentIndex].src}
          alt={images[currentIndex].alt}
          onDoubleClick={handleDoubleClick}
          style={{
            transform: `scale(${scale}) translate(${position.x / scale}px, ${position.y / scale}px)`,
            transition: isTransitioning ? "none" : "transform 0.2s ease-out",
          }}
          className="max-w-full max-h-full object-contain"
          draggable={false}
        />
      </div>

      {/* Navigation arrows */}
      {currentIndex > 0 && (
        <button
          onClick={goToPrev}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white/20 backdrop-blur rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      )}
      {currentIndex < images.length - 1 && (
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
