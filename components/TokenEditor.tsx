"use client";

import React from "react";

export interface TokenValues {
  name: string;
  alias: string;
  role: string;
  age: string;
  gender: string;
  hairstyle: string;
  personality: string;
  coreTheme: string;
  accent: string;
  wardrobeDetails: string;
  keyProp: string;
}

interface TokenEditorProps {
  tokens: TokenValues;
  onChange: (tokens: TokenValues) => void;
  source: "gemini" | "manual";
  loading: boolean;
  isActive: boolean;
}

const TOKEN_FIELDS: {
  key: keyof TokenValues;
  label: string;
  tag: string;
  placeholder: string;
  fullWidth?: boolean;
}[] = [
  {
    key: "name",
    label: "Name",
    tag: "PARSED_NAME",
    placeholder: "Full character name",
  },
  {
    key: "alias",
    label: "Alias",
    tag: "PARSED_ALIAS",
    placeholder: "Short descriptor or title",
  },
  {
    key: "role",
    label: "Role",
    tag: "PARSED_ROLE",
    placeholder: "Class, occupation, or archetype",
  },
  {
    key: "age",
    label: "Age",
    tag: "PARSED_AGE",
    placeholder: "Approximate age range",
  },
  {
    key: "gender",
    label: "Gender / Presentation",
    tag: "PARSED_GENDER",
    placeholder: "Male, Female, Non-binary, Androgynous, etc.",
  },
  {
    key: "hairstyle",
    label: "Hairstyle",
    tag: "PARSED_HAIRSTYLE",
    placeholder: "Style, color, and accents (dreadlocks, braids, neon, etc.)",
  },
  {
    key: "personality",
    label: "Personality",
    tag: "PARSED_PERSONALITY",
    placeholder: "Three comma-separated traits",
    fullWidth: true,
  },
  {
    key: "coreTheme",
    label: "Core Theme",
    tag: "PARSED_CORE_THEME",
    placeholder: "Visual sub-genre aesthetic",
  },
  {
    key: "accent",
    label: "Speech Accent",
    tag: "PARSED_ACCENT",
    placeholder: "Inferred dialect or speech style",
  },
  {
    key: "wardrobeDetails",
    label: "Wardrobe",
    tag: "PARSED_WARDROBE_DETAILS",
    placeholder: "Condensed apparel listing",
    fullWidth: true,
  },
  {
    key: "keyProp",
    label: "Key Prop",
    tag: "PARSED_KEY_PROP",
    placeholder: "Primary signature item — attribute1, attribute2",
    fullWidth: true,
  },
];

export default function TokenEditor({
  tokens,
  onChange,
  source,
  loading,
  isActive,
}: TokenEditorProps) {
  const filledCount = Object.values(tokens).filter((v) => v.trim().length > 0).length;
  const totalCount = Object.keys(tokens).length;

  const handleChange = (key: keyof TokenValues, value: string) => {
    onChange({ ...tokens, [key]: value });
  };

  return (
    <div className={`glass-card animate-in animate-in-delay-1${isActive ? " active" : ""}`}>
      <div className="section-label">
        <span className="icon">🤖</span>
        <span>Stage 2 — Token Parser</span>
      </div>

      {source === "manual" && (
        <div className="demo-banner">
          <span className="demo-icon">⚡</span>
          <span>
            <strong>Demo Mode</strong> — No Gemini API key detected. Fill in the
            token fields manually, or add <code>GEMINI_API_KEY</code> to{" "}
            <code>.env.local</code> for auto-parsing.
          </span>
        </div>
      )}

      {loading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="loading-shimmer"
              style={{ height: "42px", width: i % 2 === 0 ? "100%" : "60%" }}
            />
          ))}
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginTop: "0.25rem" }}>
            <span className="spinner" />
            <span style={{ fontSize: "0.82rem", color: "var(--text-secondary)" }}>
              Parsing bio with Gemini 2.5 Flash…
            </span>
          </div>
        </div>
      ) : (
        <>
          <div className="token-grid">
            {TOKEN_FIELDS.map((field) => (
              <div
                key={field.key}
                className={`token-field${field.fullWidth ? " full-width" : ""}`}
              >
                <label className="token-label" htmlFor={`token-${field.key}`}>
                  {field.label}
                  <span className="tag">{field.tag}</span>
                </label>
                <input
                  id={`token-${field.key}`}
                  type="text"
                  className={`token-input${tokens[field.key].trim() ? " filled" : ""}`}
                  placeholder={field.placeholder}
                  value={tokens[field.key]}
                  onChange={(e) => handleChange(field.key, e.target.value)}
                />
              </div>
            ))}
          </div>

          <div className="token-status">
            <span>
              Tokens filled: <span className="count">{filledCount}/{totalCount}</span>
            </span>
            {source === "gemini" && (
              <span style={{ marginLeft: "auto", color: "var(--accent-emerald)", fontSize: "0.72rem" }}>
                ✓ Auto-parsed by Gemini
              </span>
            )}
          </div>
        </>
      )}
    </div>
  );
}
