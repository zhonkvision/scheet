"use client";

import React, { useState } from "react";

const STYLE_PRESETS = [
  {
    id: "ghibli",
    name: "Studio Ghibli Concept Art",
    gradient: "linear-gradient(135deg, #7ec8a0, #5ba3d9, #e8d5a3)",
  },
  {
    id: "shinkai",
    name: "Makoto Shinkai Cinematic",
    gradient: "linear-gradient(135deg, #1a3a5c, #e8a87c, #d4738a)",
  },
  {
    id: "cyberpunk",
    name: "Cyberpunk Noir",
    gradient: "linear-gradient(135deg, #0d0221, #e040fb, #00e5ff)",
  },
  {
    id: "manga-ink",
    name: "Dark Manga Ink Wash",
    gradient: "linear-gradient(135deg, #1a1a1a, #555555, #2a2a2a)",
  },
  {
    id: "watercolor",
    name: "Watercolor Illustration",
    gradient: "linear-gradient(135deg, #f5e6cc, #c4a882, #a8d8ea)",
  },
  {
    id: "disney-3d",
    name: "Disney / Pixar 3D",
    gradient: "linear-gradient(135deg, #3b82f6, #f59e0b, #ef4444)",
  },
  {
    id: "retro-90s",
    name: "Retro 90s Anime Cel",
    gradient: "linear-gradient(135deg, #ff6b6b, #ffd93d, #6bcb77)",
  },
  {
    id: "custom",
    name: "Custom Style…",
    gradient: "linear-gradient(135deg, var(--bg-glass), var(--border-subtle))",
  },
];

interface StyleSelectorProps {
  selectedStyle: string;
  onStyleChange: (style: string) => void;
  isActive: boolean;
}

export default function StyleSelector({
  selectedStyle,
  onStyleChange,
  isActive,
}: StyleSelectorProps) {
  const [customText, setCustomText] = useState("");

  const selectedPreset = STYLE_PRESETS.find(
    (p) => p.id !== "custom" && p.name === selectedStyle
  );
  const isCustom =
    !selectedPreset && selectedStyle.length > 0
      ? true
      : STYLE_PRESETS.find((p) => p.id === "custom")?.name === selectedStyle;

  const handlePresetClick = (preset: (typeof STYLE_PRESETS)[number]) => {
    if (preset.id === "custom") {
      onStyleChange(customText || "");
    } else {
      onStyleChange(preset.name);
    }
  };

  const handleCustomInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomText(e.target.value);
    onStyleChange(e.target.value);
  };

  const activeId =
    selectedPreset?.id ||
    (isCustom || (!selectedPreset && selectedStyle.length > 0) ? "custom" : "");

  return (
    <div className={`glass-card animate-in animate-in-delay-2${isActive ? " active" : ""}`}>
      <div className="section-label">
        <span className="icon">🎨</span>
        <span>Style Override</span>
      </div>

      <div className="style-grid">
        {STYLE_PRESETS.map((preset) => (
          <div
            key={preset.id}
            className={`style-option${activeId === preset.id ? " selected" : ""}`}
            onClick={() => handlePresetClick(preset)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") handlePresetClick(preset);
            }}
          >
            <div
              className="style-swatch"
              style={{ background: preset.gradient }}
            />
            <span className="style-name">{preset.name}</span>
          </div>
        ))}
      </div>

      {activeId === "custom" && (
        <div className="custom-style-input">
          <input
            id="custom-style-input"
            type="text"
            className="input-field"
            placeholder="Describe your visual style…"
            value={customText}
            onChange={handleCustomInput}
          />
        </div>
      )}
    </div>
  );
}
