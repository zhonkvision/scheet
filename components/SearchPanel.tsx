"use client";

import React, { useState, useCallback, useRef } from "react";

interface Character {
  mal_id: number;
  name: string;
  name_kanji: string | null;
  nicknames: string[];
  favorites: number;
  about: string | null;
  images: {
    jpg: { image_url: string; small_image_url: string };
    webp: { image_url: string; small_image_url: string };
  };
}

interface SearchPanelProps {
  onSelect: (character: Character) => void;
  isActive: boolean;
}

export default function SearchPanel({ onSelect, isActive }: SearchPanelProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Character[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const doSearch = useCallback(async (q: string) => {
    if (q.length < 3) {
      setResults([]);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}&limit=8`);
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Search failed");
        setResults([]);
      } else {
        setResults(data.results || []);
        if (data.results?.length === 0) {
          setError("No characters found. Try a different name.");
        }
      }
    } catch {
      setError("Network error. Please try again.");
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    setSelectedId(null);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => doSearch(val), 400);
  };

  const handleSelect = (char: Character) => {
    setSelectedId(char.mal_id);
    onSelect(char);
  };

  const truncateBio = (text: string | null, maxLen: number = 120) => {
    if (!text) return "No biography available";
    const cleaned = text.replace(/\\n/g, " ").replace(/\n/g, " ").trim();
    return cleaned.length > maxLen
      ? cleaned.slice(0, maxLen) + "…"
      : cleaned;
  };

  return (
    <div className={`glass-card animate-in${isActive ? " active" : ""}`}>
      <div className="section-label">
        <span className="icon">🔍</span>
        <span>Stage 1 — Character Search</span>
      </div>

      <input
        id="character-search-input"
        type="text"
        className="input-field large"
        placeholder="Search anime character by name…"
        value={query}
        onChange={handleInputChange}
        autoComplete="off"
        spellCheck={false}
      />

      {loading && (
        <div style={{ marginTop: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <span className="spinner" />
          <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
            Searching Jikan API…
          </span>
        </div>
      )}

      {error && !loading && (
        <div style={{ marginTop: "1rem", fontSize: "0.85rem", color: "var(--accent-amber)" }}>
          {error}
        </div>
      )}

      {results.length > 0 && !loading && (
        <div className="search-results">
          {results.map((char) => (
            <div
              key={char.mal_id}
              className={`search-result-item${
                selectedId === char.mal_id ? " selected" : ""
              }`}
              onClick={() => handleSelect(char)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") handleSelect(char);
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={char.images?.jpg?.small_image_url || char.images?.jpg?.image_url}
                alt={char.name}
                width={44}
                height={62}
                style={{
                  borderRadius: "6px",
                  objectFit: "cover",
                  flexShrink: 0,
                  background: "var(--bg-glass)",
                }}
              />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="result-name">{char.name}</div>
                <div className="result-bio">
                  {truncateBio(char.about)}
                </div>
                <div className="result-meta">
                  {char.name_kanji && (
                    <span style={{ opacity: 0.7 }}>{char.name_kanji}</span>
                  )}
                  {char.favorites > 0 && (
                    <span className="fav-badge">★ {char.favorites.toLocaleString()}</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {query.length > 0 && query.length < 3 && !loading && (
        <div style={{ marginTop: "0.75rem", fontSize: "0.8rem", color: "var(--text-muted)" }}>
          Type at least 3 characters to search…
        </div>
      )}
    </div>
  );
}
