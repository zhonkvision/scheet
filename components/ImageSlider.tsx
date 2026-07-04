"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";

interface Slide {
  src: string;
  label: string;
  character: string;
}

const SLIDES: Slide[] = [
  { src: "/samples/sample-1.jpg", label: "CHARACTER REFERENCE SCHEET˚", character: "Solwielder — Galactic Acolyte" },
  { src: "/samples/sample-2.jpg", label: "CHARACTER REFERENCE SCHEET˚", character: "Solwielder — Galactic Acolyte v2" },
  { src: "/samples/sample-3.jpg", label: "CHARACTER REFERENCE SCHEET˚", character: "Rook — Vanguard Warrior" },
  { src: "/samples/sample-4.jpg", label: "CHARACTER REFERENCE SCHEET˚", character: "Nikocaller Dexshield — Vapor Enchanter" },
  { src: "/samples/sample-5.jpg", label: "CHARACTER REFERENCE SCHEET˚", character: "Rick — Bio-Engineered Cleric" },
  { src: "/samples/sample-6.jpg", label: "CHARACTER REFERENCE SCHEET˚", character: "Elara Vance — Vanguard Warrior" },
  { src: "/samples/sample-7.jpg", label: "CHARACTER REFERENCE SCHEET˚", character: "Lunabinder — Vapor Lancer" },
  { src: "/samples/sample-8.jpg", label: "CHARACTER REFERENCE SCHEET˚", character: "Vegeta — Vortex Stalker" },
  { src: "/samples/sample-9.jpg", label: "CHARACTER REFERENCE SCHEET˚", character: "Vectogaze × Sorawatcher — Ether Nomad" },
  { src: "/samples/sample-10.jpg", label: "CHARACTER REFERENCE SCHEET˚", character: "Omegasailor — Gothic Vanguard" },
  { src: "/samples/sample-11.jpg", label: "CHARACTER REFERENCE SCHEET˚", character: "Vaelhunter — Zenith Shaman" },
  { src: "/samples/sample-12.jpg", label: "CHARACTER REFERENCE SCHEET˚", character: "Omegasailor v2 — Gothic Vanguard" },
];

export default function ImageSlider() {
  const [current, setCurrent] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [dragStartX, setDragStartX] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);

  const [visibleItems, setVisibleItems] = useState(3);
  const [showLightbox, setShowLightbox] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 480) {
        setVisibleItems(1);
      } else if (window.innerWidth <= 768) {
        setVisibleItems(2);
      } else {
        setVisibleItems(3);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const maxIndex = Math.max(0, SLIDES.length - visibleItems);

  const goTo = useCallback(
    (index: number) => {
      if (isAnimating) return;
      setIsAnimating(true);
      let target = index;
      if (target >= SLIDES.length) target = 0;
      if (target < 0) target = SLIDES.length - 1;
      setCurrent(target);
      setTimeout(() => setIsAnimating(false), 360);
    },
    [isAnimating]
  );

  const prev = () => goTo(current - 1);
  const next = () => goTo(current + 1);

  // Keyboard navigation
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (showLightbox) {
        if (e.key === "Escape") setShowLightbox(false);
        if (e.key === "ArrowLeft") prev();
        if (e.key === "ArrowRight") next();
      } else {
        if (e.key === "ArrowLeft") prev();
        if (e.key === "ArrowRight") next();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [current, showLightbox, prev, next]);

  // Touch / Mouse drag
  const handlePointerDown = (e: React.PointerEvent) => {
    if (showLightbox) return;
    setDragging(true);
    setDragStartX(e.clientX);
    setDragOffset(0);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragging || showLightbox) return;
    setDragOffset(e.clientX - dragStartX);
  };

  const handlePointerUp = () => {
    if (!dragging || showLightbox) return;
    setDragging(false);
    const threshold = 60;
    if (dragOffset < -threshold) next();
    else if (dragOffset > threshold) prev();
    setDragOffset(0);
  };

  return (
    <div className="slider-root" aria-label="Sample output gallery">
      {/* Header */}
      <div className="slider-header">
        <div className="slider-header-left">
          <span className="slider-label-tag">◈ SAMPLE OUTPUTS</span>
          <span className="slider-char-name">{SLIDES[current]?.character || ""}</span>
        </div>
        <div className="slider-nav-controls">
          <span className="slider-counter">
            {String(current + 1).padStart(2, "0")} / {String(SLIDES.length).padStart(2, "0")}
          </span>
          <button className="slider-arrow-btn" onClick={prev} aria-label="Previous">
            ‹
          </button>
          <button className="slider-arrow-btn" onClick={next} aria-label="Next">
            ›
          </button>
        </div>
      </div>

      {/* Track */}
      <div
        className="slider-track-wrapper"
        ref={trackRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        style={{ cursor: dragging ? "grabbing" : "pointer" }}
      >
        <div
          className="slider-track"
          style={{
            transform: `translateX(calc(${-Math.min(current, maxIndex) * (100 / visibleItems)}% + ${dragOffset}px))`,
            transition: dragging ? "none" : "transform 0.36s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
            gap: "0.4rem",
            padding: "0.2rem"
          }}
        >
          {SLIDES.map((slide, i) => {
            const isSlideVisible = i >= current && i < current + visibleItems;
            return (
              <div
                key={i}
                className={`slider-slide${i === current ? " active" : ""}`}
                style={{ 
                  flex: `0 0 calc(${100 / visibleItems}% - ${(0.4 * (visibleItems - 1)) / visibleItems}rem)`,
                  cursor: "pointer"
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  if (!dragging) {
                    setCurrent(i);
                    setShowLightbox(true);
                  }
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={slide.src}
                  alt={slide.character}
                  className="slider-img"
                  draggable={false}
                />
                <div className="slider-slide-overlay">
                  <span className="slider-slide-title" style={{ fontSize: "0.45rem" }}>{slide.character.split(" — ")[0]}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Dot indicators */}
      <div className="slider-dots" role="tablist">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            className={`slider-dot${i === current ? " active" : ""}`}
            onClick={() => goTo(i)}
            aria-label={`Slide ${i + 1}`}
            role="tab"
            aria-selected={i === current}
          />
        ))}
      </div>

      {/* Lightbox / Expanded View Modal */}
      {showLightbox && (
        <div className="lightbox-overlay" onClick={() => setShowLightbox(false)}>
          <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
            <div className="lightbox-header">
              <span className="lightbox-title">{SLIDES[current].label}</span>
              <span className="lightbox-meta">{SLIDES[current].character}</span>
              <button className="lightbox-close" onClick={() => setShowLightbox(false)} aria-label="Close Expanded View">
                ✕
              </button>
            </div>
            <div className="lightbox-body">
              <button className="lightbox-arrow prev" onClick={prev} aria-label="Previous Image">
                ‹
              </button>
              <div className="lightbox-image-wrapper">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={SLIDES[current].src}
                  alt={SLIDES[current].character}
                  className="lightbox-img"
                />
              </div>
              <button className="lightbox-arrow next" onClick={next} aria-label="Next Image">
                ›
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
