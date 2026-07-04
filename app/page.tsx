"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import type { TokenValues } from "@/components/TokenEditor";
import assetLibrary from "@/data/assets-library.json";
import { PRODUCTION_STYLES } from "@/lib/style-presets";
import ImageSlider from "@/components/ImageSlider";

interface Character {
  mal_id: number;
  name: string;
  name_kanji: string | null;
  nicknames: string[];
  favorites: number;
  about: string | null;
  images: {
    jpg: { image_url: string; small_image_url: string };
  };
}

// Map the state keys to the JSON library category keys
const LIBRARY_KEYS: Record<string, string> = {
  alias: "aliases",
  role: "roles",
  personality: "personalities",
  coreTheme: "themes",
  accent: "accents",
  wardrobeDetails: "wardrobes",
  keyProp: "props",
  hairstyle: "hairstyles",
};

export default function HomePage() {
  // Mode selection: Single or Gene Splicing (Combine)
  const [splicingMode, setSplicingMode] = useState(false);
  const [productionMode, setProductionMode] = useState(false);

  // Autocomplete / Search states
  const [searchQueryA, setSearchQueryA] = useState("");
  const [searchResultsA, setSearchResultsA] = useState<Character[]>([]);
  const [selectedCharacterA, setSelectedCharacterA] = useState<Character | null>(null);
  const [loadingA, setLoadingA] = useState(false);

  const [searchQueryB, setSearchQueryB] = useState("");
  const [searchResultsB, setSearchResultsB] = useState<Character[]>([]);
  const [selectedCharacterB, setSelectedCharacterB] = useState<Character | null>(null);
  const [loadingB, setLoadingB] = useState(false);
  
  // Style settings
  const [styleOverride, setStyleOverride] = useState(PRODUCTION_STYLES[0].name);
  const [customStyle, setCustomStyle] = useState("");
  const [showCustomStyle, setShowCustomStyle] = useState(false);
  const [aspectRatio, setAspectRatio] = useState("4:3");

  // DNA tokens
  const [fields, setFields] = useState<TokenValues>({
    name: "",
    alias: "",
    role: "",
    age: "",
    gender: "",
    hairstyle: "",
    personality: "",
    coreTheme: "",
    accent: "",
    wardrobeDetails: "",
    keyProp: "",
  });

  const [parsing, setParsing] = useState(false);
  const [shuffling, setShuffling] = useState(false);
  const [tokenSource, setTokenSource] = useState<"local" | "manual">("local");
  
  // Preset selector states
  const [activePresetDropdown, setActivePresetDropdown] = useState<string | null>(null);
  const [presetSearch, setPresetSearch] = useState("");

  // Anime Dataset Toggle states
  const [animeDatasetEnabled, setAnimeDatasetEnabled] = useState(false);
  const [syncStatus, setSyncStatus] = useState<"Enabled" | "Fetching" | "Synced" | "Error" | "Disabled">("Disabled");

  // Tab view & output states
  const [activeTab, setActiveTab] = useState<"prompt" | "json" | "bio">("prompt");
  const [compiledPrompt, setCompiledPrompt] = useState("");
  const [compiling, setCompiling] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const debounceA = useRef<ReturnType<typeof setTimeout> | null>(null);
  const debounceB = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Trigger Toast Alert
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 2500);
  };

  const [topCharacters, setTopCharacters] = useState<Character[]>([]);
  const [loadingTop, setLoadingTop] = useState(false);

  const fetchTopCharacters = async (overrideDataset?: boolean) => {
    const isDatasetEnabled = overrideDataset !== undefined ? overrideDataset : animeDatasetEnabled;
    setLoadingTop(true);
    try {
      const res = await fetch(`/api/search?q=&limit=40&animeDataset=${isDatasetEnabled}`);
      const data = await res.json();
      if (res.ok) {
        setTopCharacters(data.results || []);
      }
    } catch (err) {
      console.error("Failed to fetch top characters:", err);
    } finally {
      setLoadingTop(false);
    }
  };

  const handleToggleAnimeDataset = (checked: boolean) => {
    setAnimeDatasetEnabled(checked);
    localStorage.setItem("animeDatasetEnabled", String(checked));
    setSyncStatus(checked ? "Enabled" : "Disabled");
    setTopCharacters([]); // Reset the cache
    // If a character dropdown is currently open, fetch immediately with new setting
    if (activePresetDropdown === "charA" || activePresetDropdown === "charB") {
      fetchTopCharacters(checked);
    }
    triggerToast(checked ? "🔌 Anime datasets enabled (Jikan + Kaggle)" : "🔌 Anime datasets disabled");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Synced":   return "var(--status-ok)";
      case "Fetching": return "var(--status-warn)";
      case "Error":    return "var(--status-error)";
      case "Enabled":  return "var(--accent)";
      default:         return "var(--t-dim)";
    }
  };

  // ─── Search API Calls ─────────────────────────────────────────
  const searchSubject = async (q: string, target: "A" | "B") => {
    if (q.trim().length < 3) {
      if (target === "A") setSearchResultsA([]);
      else setSearchResultsB([]);
      return;
    }

    if (target === "A") setLoadingA(true);
    else setLoadingB(true);

    if (animeDatasetEnabled) {
      setSyncStatus("Fetching");
    }

    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}&limit=6&animeDataset=${animeDatasetEnabled}`);
      const data = await res.json();
      if (res.ok) {
        if (target === "A") setSearchResultsA(data.results || []);
        else setSearchResultsB(data.results || []);
        
        if (animeDatasetEnabled) {
          setSyncStatus("Synced");
        }
      } else {
        if (animeDatasetEnabled) {
          setSyncStatus("Error");
        }
      }
    } catch (err) {
      console.error(`Search ${target} failed:`, err);
      if (animeDatasetEnabled) {
        setSyncStatus("Error");
      }
    } finally {
      if (target === "A") setLoadingA(false);
      else setLoadingB(false);
    }
  };

  const handleSearchChangeA = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchQueryA(val);
    if (debounceA.current) clearTimeout(debounceA.current);
    debounceA.current = setTimeout(() => searchSubject(val, "A"), 400);
  };

  const handleSearchChangeB = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchQueryB(val);
    if (debounceB.current) clearTimeout(debounceB.current);
    debounceB.current = setTimeout(() => searchSubject(val, "B"), 400);
  };

  // ─── Gene Splicing / Parse Trigger ─────────────────────────────
  const triggerBioParsing = useCallback(async (charA: Character, charB: Character | null) => {
    setParsing(true);
    setCompiledPrompt("");

    let canonicalName = charA.name;
    let bioPayload = charA.about || "";

    if (splicingMode && charB) {
      canonicalName = `Fusion of ${charA.name} and ${charB.name}`;
      bioPayload = `SUBJECT ALPHA (CHARACTER A):
Name: ${charA.name}
Biography: ${charA.about || "None"}

SUBJECT BETA (CHARACTER B):
Name: ${charB.name}
Biography: ${charB.about || "None"}`;
    }

    try {
      const res = await fetch("/api/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          canonical_name: canonicalName,
          raw_biography: bioPayload,
          use_anilist: animeDatasetEnabled,
        }),
      });

      const data = await res.json();
      if (data.parsed) {
        setFields(data.parsed);
        setTokenSource("local");
        triggerToast("🧬 Local database traits extracted");
      } else {
        // Fallback Client-side combine (Demo Mode)
        setTokenSource("manual");
        if (splicingMode && charB) {
          setFields({
            name: `${charA.name} × ${charB.name}`,
            alias: `Spliced Gene ${charA.name.split(" ")[0]} / ${charB.name.split(" ")[0]}`,
            role: "Hybrid Archetype",
            age: "Merged Essence",
            gender: "Merged Presentation",
            hairstyle: "Merged Styling",
            personality: "Combined Dual Traits",
            coreTheme: "Merged Thematic World",
            accent: "Spliced Dialect",
            wardrobeDetails: `Hybrid apparel of ${charA.name} and ${charB.name}`,
            keyProp: "Fused Signature Weapon",
          });
          triggerToast("⚠️ Demo Mode: Spliced combination draft created");
        } else {
          setFields({
            name: charA.name,
            alias: charA.nicknames[0] || "",
            role: "",
            age: "",
            gender: "Unknown",
            hairstyle: "Unknown",
            personality: "",
            coreTheme: "",
            accent: "",
            wardrobeDetails: "",
            keyProp: "",
          });
          triggerToast("⚠️ Demo Mode: Manual profile draft created");
        }
      }
    } catch {
      setTokenSource("manual");
    } finally {
      setParsing(false);
    }
  }, [splicingMode]);

  // Handle Character Selection
  const handleSelectA = (char: Character) => {
    setSelectedCharacterA(char);
    setSearchQueryA(char.name);
    setSearchResultsA([]);
    if (!splicingMode) {
      triggerBioParsing(char, null);
    } else if (selectedCharacterB) {
      triggerBioParsing(char, selectedCharacterB);
    }
  };

  const handleSelectB = (char: Character) => {
    setSelectedCharacterB(char);
    setSearchQueryB(char.name);
    setSearchResultsB([]);
    if (selectedCharacterA) {
      triggerBioParsing(selectedCharacterA, char);
    }
  };

  // Toggle Splicing Mode
  const handleToggleSplicing = () => {
    const nextMode = !splicingMode;
    setSplicingMode(nextMode);
    
    // Clear inputs and output on switch to avoid visual pollution
    setSelectedCharacterA(null);
    setSelectedCharacterB(null);
    setSearchQueryA("");
    setSearchQueryB("");
    setFields({
      name: "",
      alias: "",
      role: "",
      age: "",
      gender: "",
      hairstyle: "",
      personality: "",
      coreTheme: "",
      accent: "",
      wardrobeDetails: "",
      keyProp: "",
    });
    setCompiledPrompt("");
    triggerToast(nextMode ? "🧬 DNA Splicing Mode active" : "👤 Single Subject Mode active");
  };

  // ─── Shuffle Subjects (Alpha & Beta) ───────────────────────────
  const handleShuffleSubjects = async () => {
    if (shuffling || parsing) return;
    setShuffling(true);
    try {
      const count = splicingMode ? 2 : 1;
      const res = await fetch(`/api/random?count=${count}&animeDataset=${animeDatasetEnabled}`);
      const data = await res.json();
      
      if (!res.ok || !data.results || data.results.length === 0) {
        triggerToast("❌ No characters in database — check your data folder");
        return;
      }

      const charA = data.results[0];
      setSelectedCharacterA(charA);
      setSearchQueryA(charA.name);
      setSearchResultsA([]);

      if (splicingMode && data.results.length > 1) {
        const charB = data.results[1];
        setSelectedCharacterB(charB);
        setSearchQueryB(charB.name);
        setSearchResultsB([]);
        // await so the parse toast fires after the shuffle is done
        await triggerBioParsing(charA, charB);
      } else {
        setSelectedCharacterB(null);
        setSearchQueryB("");
        await triggerBioParsing(charA, null);
      }
    } catch (err) {
      console.error(err);
      triggerToast("❌ Failed to shuffle subjects");
    } finally {
      setShuffling(false);
    }
  };

  // ─── Preset Filtering Logic ────────────────────────────────────
  const [visibleCount, setVisibleCount] = useState(50);

  const toggleDropdown = (fieldKey: string) => {
    if (activePresetDropdown === fieldKey) {
      setActivePresetDropdown(null);
    } else {
      setActivePresetDropdown(fieldKey);
      setPresetSearch("");
      setVisibleCount(50);
      if (fieldKey === "charA" || fieldKey === "charB") {
        fetchTopCharacters();
      }
    }
  };

  const handleDropdownScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    if (target.scrollHeight - target.scrollTop <= target.clientHeight + 40) {
      setVisibleCount((prev) => prev + 50);
    }
  };

  const getFilteredPresets = (fieldKey: string): string[] => {
    const categoryKey = LIBRARY_KEYS[fieldKey];
    if (!categoryKey) return [];
    
    const list = (assetLibrary as any)[categoryKey] || [];
    
    if (!presetSearch.trim()) {
      return list.slice(0, visibleCount);
    }
    
    return list
      .filter((item: string) =>
        item.toLowerCase().includes(presetSearch.toLowerCase())
      )
      .slice(0, visibleCount);
  };

  const selectPresetValue = (key: keyof TokenValues, val: string) => {
    setFields((prev) => ({ ...prev, [key]: val }));
    setActivePresetDropdown(null);
    setPresetSearch("");
  };

  // Shuffle / Randomize all fields (Procedural Asset Library mix & match)
  const handleShuffle = () => {
    const randomChoice = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
    
    let combinedName = "Generic Character";
    if (splicingMode && selectedCharacterA && selectedCharacterB) {
      combinedName = `${selectedCharacterA.name} × ${selectedCharacterB.name}`;
    } else if (selectedCharacterA) {
      combinedName = selectedCharacterA.name;
    }

    setFields({
      name: combinedName,
      alias: randomChoice(assetLibrary.aliases),
      role: randomChoice(assetLibrary.roles),
      // Age isn't a modular asset class, we keep a random choice or generate dynamically
      age: randomChoice(["Child (8 - 12)", "Teenager (14 - 17)", "Young Adult (18 - 25)", "Prime Adult (26 - 35)", "Veteran (40 - 55)", "Ancient Immortal (100+)"]),
      gender: randomChoice(["Male", "Female", "Non-binary / Androgynous", "Genderfluid / Shifting"]),
      hairstyle: randomChoice(assetLibrary.hairstyles),
      personality: randomChoice(assetLibrary.personalities),
      coreTheme: randomChoice(assetLibrary.themes),
      accent: randomChoice(assetLibrary.accents),
      wardrobeDetails: randomChoice(assetLibrary.wardrobes),
      keyProp: randomChoice(assetLibrary.props),
    });
    triggerToast("🎲 DNA parameters randomized from Asset Library");
  };

  // ─── Compile ──────────────────────────────────────────────────
  const handleCompile = async () => {
    const finalStyle = showCustomStyle ? customStyle : styleOverride;
    if (!fields.name.trim() || !finalStyle.trim()) {
      triggerToast("❌ Name and Style are required");
      return;
    }
    setCompiling(true);
    try {
      const res = await fetch("/api/compile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          style: finalStyle,
          parsedTokens: fields,
          productionMode: productionMode,
          aspectRatio: aspectRatio,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setCompiledPrompt(data.prompt);
        setActiveTab("prompt");
        triggerToast(productionMode ? "⚡ AAA Cinematic Prompt generated" : "⚡ Reference sheet compiled");
      }
    } catch {
      triggerToast("❌ Failed to compile prompt");
    } finally {
      setCompiling(false);
    }
  };

  // Copy Clipboard
  const handleCopy = () => {
    let content = "";
    if (activeTab === "prompt") content = compiledPrompt;
    else if (activeTab === "json") content = JSON.stringify(fields, null, 2);
    else if (activeTab === "bio") {
      if (splicingMode) {
        content = `SUBJECT ALPHA:\n${selectedCharacterA?.about || "None"}\n\nSUBJECT BETA:\n${selectedCharacterB?.about || "None"}`;
      } else {
        content = selectedCharacterA?.about || "";
      }
    }

    if (!content) return;
    navigator.clipboard.writeText(content);
    triggerToast("📋 Copied to clipboard");
  };

  // Close preset dropdown on outer click
  useEffect(() => {
    const handleOuterClick = () => {
      setActivePresetDropdown(null);
      setPresetSearch("");
    };
    window.addEventListener("click", handleOuterClick);

    // Load local storage preference
    const stored = localStorage.getItem("animeDatasetEnabled");
    if (stored !== null) {
      const isEnabled = stored === "true";
      setAnimeDatasetEnabled(isEnabled);
      setSyncStatus(isEnabled ? "Enabled" : "Disabled");
    }

    return () => window.removeEventListener("click", handleOuterClick);
  }, []);

  const hasSubjectSelected = splicingMode 
    ? (selectedCharacterA !== null && selectedCharacterB !== null)
    : (selectedCharacterA !== null);

  return (
    <div className="app-container">
      {/* Header */}
      <header className="header-bar">
        <h1 className="header-title">
          🧬 SCHEET˚ <span className="orange">// V1.0 BY ZHONKVISION</span>
        </h1>
        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
          <div className="header-meta">
            SYSTEM: <strong>ONLINE</strong> &nbsp;·&nbsp; ENGINE: SQLITE / OFFLINE
          </div>
          <span style={{ color: "var(--b-dim)", fontSize: "0.58rem" }}>·</span>
          <a
            href="https://github.com/zhonkvision/scheet"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontFamily: "var(--font-tech)",
              fontSize: "0.58rem",
              color: "var(--accent)",
              textDecoration: "none",
              letterSpacing: "0.07em",
              textTransform: "uppercase",
              border: "1px solid var(--accent-dim)",
              padding: "0.15rem 0.4rem",
              borderRadius: "2px",
              display: "inline-flex",
              alignItems: "center",
              transition: "all 0.2s ease",
              background: "var(--accent-muted)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "var(--accent)";
              e.currentTarget.style.color = "var(--t-white)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "var(--accent-dim)";
              e.currentTarget.style.color = "var(--accent)";
            }}
          >
            🐈 GITHUB
          </a>
        </div>
      </header>

      {/* Main split-screen grid layout */}
      <main className="main-grid">
        {/* Left column: Input Parameters */}
        <section className="tech-panel">
          <div className="panel-header">
            <span>Input Parameters</span>
            <div style={{ display: "flex", gap: "0.35rem", alignItems: "center" }}>
              <button
                className={`toggle-pill btn-production${productionMode ? " active" : ""}`}
                onClick={() => setProductionMode(!productionMode)}
                type="button"
              >
                <span className="toggle-dot" />
                {productionMode ? "PRODUCTION ON" : "PRODUCTION"}
              </button>
              <button
                className={`toggle-pill btn-shuffle${shuffling || parsing ? " loading" : ""}`}
                onClick={handleShuffleSubjects}
                disabled={shuffling || parsing}
                type="button"
                style={{ opacity: shuffling || parsing ? 0.6 : 1, cursor: shuffling || parsing ? "wait" : "pointer" }}
              >
                {shuffling ? "⟳ LOADING..." : "SHUFFLE"}
              </button>
              <button
                className={`toggle-pill btn-splicer${splicingMode ? " active" : ""}`}
                onClick={handleToggleSplicing}
                type="button"
              >
                <span className="toggle-dot" />
                {splicingMode ? "SPLICER ON" : "SINGLE"}
              </button>
            </div>
          </div>

          <div className="tech-panel-scroll">
            {/* Splicing Mode Toggle Indicator */}
          {splicingMode && (
            <div className="demo-banner" style={{ background: "var(--accent-muted)", borderColor: "var(--accent-dim)", color: "var(--accent)" }}>
              🧬 <strong>SPLICER ENGAGED</strong> — Load Subject Alpha and Subject Beta to merge their DNA.
            </div>
          )}

          <div className={splicingMode ? "search-toggle-grid splicer-layout" : "search-toggle-grid single-layout"}>
            {/* Anime Character Dataset Toggle */}
            <div className={`api-toggle-box${animeDatasetEnabled ? " enabled" : ""}`}>
              <div className="api-toggle-label">
                <span className="api-toggle-label-main">🔌 SCHEETLINK!˚</span>
                <span className="api-toggle-label-status">
                  STATUS: <strong style={{ color: getStatusColor(syncStatus) }}>{syncStatus}</strong>
                </span>
              </div>
              <button
                className={`onoff-btn${animeDatasetEnabled ? " on" : ""}`}
                onClick={() => handleToggleAnimeDataset(!animeDatasetEnabled)}
                type="button"
              >
                <span className="onoff-dot" />
                {animeDatasetEnabled ? "ON" : "OFF"}
              </button>
            </div>

            {/* Stage 1: Character Search A */}
            <div className="search-box-container" style={{ marginBottom: 0, position: "relative" }}>
              <div className="label-container">
                <span className="input-label">
                  {splicingMode ? "01. Search Subject Alpha (A)" : "01. Search Character (Database)"}
                </span>
                <span
                  className="preset-trigger"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleDropdown("charA");
                  }}
                >
                  <span className="dot" /> Preset
                </span>
                {loadingA && <span className="micro-spinner" />}
              </div>
              <input
                type="text"
                className="tech-input"
                placeholder={splicingMode ? "Search Subject Alpha..." : "Search Character (e.g. Goku, Naruto, Joltwing)..."}
                value={searchQueryA}
                onChange={handleSearchChangeA}
              />

              {activePresetDropdown === "charA" && (
                <div className="preset-dropdown" style={{ maxHeight: "250px", overflowY: "auto" }} onClick={(e) => e.stopPropagation()}>
                  {loadingTop ? (
                    <div className="preset-item clean">Loading characters...</div>
                  ) : topCharacters.length === 0 ? (
                    <div className="preset-item clean">No popular characters found</div>
                  ) : (
                    topCharacters.map((char) => (
                      <div
                        key={char.mal_id}
                        className="preset-item"
                        onClick={() => {
                          handleSelectA(char);
                          setActivePresetDropdown(null);
                        }}
                      >
                        {char.name} <span style={{ opacity: 0.5, fontSize: "0.72rem", marginLeft: "4px" }}>★ {char.favorites.toLocaleString()}</span>
                      </div>
                    ))
                  )}
                </div>
              )}

              {searchResultsA.length > 0 && (
                <div className="search-results-flat">
                  {searchResultsA.map((char) => (
                    <div
                      key={char.mal_id}
                      className={`search-item-flat${
                        selectedCharacterA?.mal_id === char.mal_id ? " selected" : ""
                      }`}
                      onClick={() => handleSelectA(char)}
                    >
                      <span className="search-item-name">{char.name}</span>
                      <span className="search-item-meta">
                        ★ {char.favorites.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Stage 1: Character Search B (Only visible in Splicing Mode) */}
            {splicingMode && (
              <div className="search-box-container" style={{ marginBottom: 0, position: "relative" }}>
                <div className="label-container">
                  <span className="input-label">02. Search Subject Beta (B)</span>
                  <span
                    className="preset-trigger"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleDropdown("charB");
                    }}
                  >
                    <span className="dot" /> Preset
                  </span>
                  {loadingB && <span className="micro-spinner" />}
                </div>
                <input
                  type="text"
                  className="tech-input"
                  placeholder="Search Subject Beta..."
                  value={searchQueryB}
                  onChange={handleSearchChangeB}
                />

                {activePresetDropdown === "charB" && (
                  <div className="preset-dropdown" style={{ maxHeight: "250px", overflowY: "auto" }} onClick={(e) => e.stopPropagation()}>
                    {loadingTop ? (
                      <div className="preset-item clean">Loading characters...</div>
                    ) : topCharacters.length === 0 ? (
                      <div className="preset-item clean">No popular characters found</div>
                    ) : (
                      topCharacters.map((char) => (
                        <div
                          key={char.mal_id}
                          className="preset-item"
                          onClick={() => {
                            handleSelectB(char);
                            setActivePresetDropdown(null);
                          }}
                        >
                          {char.name} <span style={{ opacity: 0.5, fontSize: "0.72rem", marginLeft: "4px" }}>★ {char.favorites.toLocaleString()}</span>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {searchResultsB.length > 0 && (
                  <div className="search-results-flat">
                    {searchResultsB.map((char) => (
                      <div
                        key={char.mal_id}
                        className={`search-item-flat${
                          selectedCharacterB?.mal_id === char.mal_id ? " selected" : ""
                        }`}
                        onClick={() => handleSelectB(char)}
                      >
                        <span className="search-item-name">{char.name}</span>
                        <span className="search-item-meta">
                          ★ {char.favorites.toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Style dropdown selection */}
          <div className="form-group" style={{ marginTop: "0.4rem" }}>
            <div className="label-container">
              <span className="input-label">
                {splicingMode ? "03. Production Mode (Style)" : "02. Production Mode (Style)"}
              </span>
              <span
                className="preset-trigger"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowCustomStyle((prev) => !prev);
                }}
              >
                <span className="dot" /> {showCustomStyle ? "Presets" : "Custom style"}
              </span>
            </div>

            {showCustomStyle ? (
              <input
                type="text"
                className="tech-input"
                placeholder="Type visual style (e.g. Steampunk, 3D Render)..."
                value={customStyle}
                onChange={(e) => setCustomStyle(e.target.value)}
              />
            ) : (
              <select
                className="tech-select"
                value={styleOverride}
                onChange={(e) => setStyleOverride(e.target.value)}
              >
                {PRODUCTION_STYLES.map((st) => (
                  <option key={st.name} value={st.name}>
                    {st.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Grid of parameters matching the DNA matrix */}
          <div className="fields-grid" style={{ marginTop: "0.3rem" }}>
            {/* Name */}
                    {/* Alias */}
            <div className="form-group">
              <div className="label-container">
                <span className="input-label">Alias</span>
                <span
                  className="preset-trigger"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleDropdown("alias");
                  }}
                >
                  <span className="dot" /> Preset
                </span>
              </div>
              <input
                type="text"
                className="tech-input"
                value={fields.alias}
                onChange={(e) => setFields({ ...fields, alias: e.target.value })}
                placeholder="Alias descriptor"
              />
              {activePresetDropdown === "alias" && (
                <div className="preset-dropdown" onScroll={handleDropdownScroll} onClick={(e) => e.stopPropagation()}>
                  <input
                    type="text"
                    className="tech-input"
                    style={{ borderBottom: "1px solid var(--accent)", fontSize: "0.68rem" }}
                    placeholder="Search 1,000 aliases..."
                    value={presetSearch}
                    onChange={(e) => setPresetSearch(e.target.value)}
                  />
                  <div className="preset-item clean" onClick={() => selectPresetValue("alias", "")}>
                    None (Clean)
                  </div>
                  {getFilteredPresets("alias").map((p) => (
                    <div key={p} className="preset-item" onClick={() => selectPresetValue("alias", p)}>
                      {p}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Role */}
            <div className="form-group">
              <div className="label-container">
                <span className="input-label">Role</span>
                <span
                  className="preset-trigger"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleDropdown("role");
                  }}
                >
                  <span className="dot" /> Preset
                </span>
              </div>
              <input
                type="text"
                className="tech-input"
                value={fields.role}
                onChange={(e) => setFields({ ...fields, role: e.target.value })}
                placeholder="Class or occupation"
              />
              {activePresetDropdown === "role" && (
                <div className="preset-dropdown" onScroll={handleDropdownScroll} onClick={(e) => e.stopPropagation()}>
                  <input
                    type="text"
                    className="tech-input"
                    style={{ borderBottom: "1px solid var(--accent)", fontSize: "0.68rem" }}
                    placeholder="Search 1,000 roles..."
                    value={presetSearch}
                    onChange={(e) => setPresetSearch(e.target.value)}
                  />
                  <div className="preset-item clean" onClick={() => selectPresetValue("role", "")}>
                    None (Clean)
                  </div>
                  {getFilteredPresets("role").map((p) => (
                    <div key={p} className="preset-item" onClick={() => selectPresetValue("role", p)}>
                      {p}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Age */}
            <div className="form-group">
              <div className="label-container">
                <span className="input-label">Age Range</span>
                <span
                  className="preset-trigger"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleDropdown("age");
                  }}
                >
                  <span className="dot" /> Preset
                </span>
              </div>
              <input
                type="text"
                className="tech-input"
                value={fields.age}
                onChange={(e) => setFields({ ...fields, age: e.target.value })}
                placeholder="Approximate age"
              />
              {activePresetDropdown === "age" && (
                <div className="preset-dropdown" onScroll={handleDropdownScroll} onClick={(e) => e.stopPropagation()}>
                  <div className="preset-item clean" onClick={() => selectPresetValue("age", "")}>
                    None (Clean)
                  </div>
                  {["Child (8 - 12)", "Teenager (14 - 17)", "Young Adult (18 - 25)", "Prime Adult (26 - 35)", "Veteran (40 - 55)", "Ancient Immortal (100+)", "Unknown / Ageless"].map((p) => (
                    <div key={p} className="preset-item" onClick={() => selectPresetValue("age", p)}>
                      {p}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Gender */}
            <div className="form-group">
              <div className="label-container">
                <span className="input-label">Gender / Presentation</span>
                <span
                  className="preset-trigger"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleDropdown("gender");
                  }}
                >
                  <span className="dot" /> Preset
                </span>
              </div>
              <input
                type="text"
                className="tech-input"
                value={fields.gender}
                onChange={(e) => setFields({ ...fields, gender: e.target.value })}
                placeholder="Male, Female, Non-binary, etc."
              />
              {activePresetDropdown === "gender" && (
                <div className="preset-dropdown" onScroll={handleDropdownScroll} onClick={(e) => e.stopPropagation()}>
                  <div className="preset-item clean" onClick={() => selectPresetValue("gender", "")}>
                    None (Clean)
                  </div>
                  {["Male", "Female", "Non-binary / Androgynous", "Genderfluid / Shifting", "Unknown / Ageless"].map((p) => (
                    <div key={p} className="preset-item" onClick={() => selectPresetValue("gender", p)}>
                      {p}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Hairstyle */}
            <div className="form-group">
              <div className="label-container">
                <span className="input-label">Hairstyle</span>
                <span
                  className="preset-trigger"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleDropdown("hairstyle");
                  }}
                >
                  <span className="dot" /> Preset
                </span>
              </div>
              <input
                type="text"
                className="tech-input"
                value={fields.hairstyle}
                onChange={(e) => setFields({ ...fields, hairstyle: e.target.value })}
                placeholder="Style, color, and accents"
              />
              {activePresetDropdown === "hairstyle" && (
                <div className="preset-dropdown" onScroll={handleDropdownScroll} onClick={(e) => e.stopPropagation()}>
                  <input
                    type="text"
                    className="tech-input"
                    style={{ borderBottom: "1px solid var(--accent)", fontSize: "0.68rem" }}
                    placeholder="Search 1,000 hairstyles..."
                    value={presetSearch}
                    onChange={(e) => setPresetSearch(e.target.value)}
                  />
                  <div className="preset-item clean" onClick={() => selectPresetValue("hairstyle", "")}>
                    None (Clean)
                  </div>
                  {getFilteredPresets("hairstyle").map((p) => (
                    <div key={p} className="preset-item" onClick={() => selectPresetValue("hairstyle", p)}>
                      {p}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Personality */}
            <div className="form-group">
              <div className="label-container">
                <span className="input-label">Personality Traits</span>
                <span
                  className="preset-trigger"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleDropdown("personality");
                  }}
                >
                  <span className="dot" /> Preset
                </span>
              </div>
              <input
                type="text"
                className="tech-input"
                value={fields.personality}
                onChange={(e) => setFields({ ...fields, personality: e.target.value })}
                placeholder="Three traits (e.g. Brave, Calm, Loyal)"
              />
              {activePresetDropdown === "personality" && (
                <div className="preset-dropdown" onScroll={handleDropdownScroll} onClick={(e) => e.stopPropagation()}>
                  <input
                    type="text"
                    className="tech-input"
                    style={{ borderBottom: "1px solid var(--accent)", fontSize: "0.68rem" }}
                    placeholder="Search 1,000 personality types..."
                    value={presetSearch}
                    onChange={(e) => setPresetSearch(e.target.value)}
                  />
                  <div className="preset-item clean" onClick={() => selectPresetValue("personality", "")}>
                    None (Clean)
                  </div>
                  {getFilteredPresets("personality").map((p) => (
                    <div key={p} className="preset-item" onClick={() => selectPresetValue("personality", p)}>
                      {p}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Core Theme */}
            <div className="form-group">
              <div className="label-container">
                <span className="input-label">Core Theme</span>
                <span
                  className="preset-trigger"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleDropdown("coreTheme");
                  }}
                >
                  <span className="dot" /> Preset
                </span>
              </div>
              <input
                type="text"
                className="tech-input"
                value={fields.coreTheme}
                onChange={(e) => setFields({ ...fields, coreTheme: e.target.value })}
                placeholder="Visual genre theme"
              />
              {activePresetDropdown === "coreTheme" && (
                <div className="preset-dropdown" onScroll={handleDropdownScroll} onClick={(e) => e.stopPropagation()}>
                  <input
                    type="text"
                    className="tech-input"
                    style={{ borderBottom: "1px solid var(--accent)", fontSize: "0.68rem" }}
                    placeholder="Search 1,000 themes..."
                    value={presetSearch}
                    onChange={(e) => setPresetSearch(e.target.value)}
                  />
                  <div className="preset-item clean" onClick={() => selectPresetValue("coreTheme", "")}>
                    None (Clean)
                  </div>
                  {getFilteredPresets("coreTheme").map((p) => (
                    <div key={p} className="preset-item" onClick={() => selectPresetValue("coreTheme", p)}>
                      {p}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Accent */}
            <div className="form-group">
              <div className="label-container">
                <span className="input-label">Speech Accent</span>
                <span
                  className="preset-trigger"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleDropdown("accent");
                  }}
                >
                  <span className="dot" /> Preset
                </span>
              </div>
              <input
                type="text"
                className="tech-input"
                value={fields.accent}
                onChange={(e) => setFields({ ...fields, accent: e.target.value })}
                placeholder="Speech tone/accent"
              />
              {activePresetDropdown === "accent" && (
                <div className="preset-dropdown" onScroll={handleDropdownScroll} onClick={(e) => e.stopPropagation()}>
                  <input
                    type="text"
                    className="tech-input"
                    style={{ borderBottom: "1px solid var(--accent)", fontSize: "0.68rem" }}
                    placeholder="Search 1,000 speech patterns..."
                    value={presetSearch}
                    onChange={(e) => setPresetSearch(e.target.value)}
                  />
                  <div className="preset-item clean" onClick={() => selectPresetValue("accent", "")}>
                    None (Clean)
                  </div>
                  {getFilteredPresets("accent").map((p) => (
                    <div key={p} className="preset-item" onClick={() => selectPresetValue("accent", p)}>
                      {p}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Aspect Ratio Selection */}
            <div className="form-group">
              <div className="label-container">
                <span className="input-label">Aspect Ratio</span>
              </div>
              <select
                className="tech-select"
                value={aspectRatio}
                onChange={(e) => setAspectRatio(e.target.value)}
              >
                <option value="4:3">4:3 (Default Horizontal)</option>
                <option value="16:9">16:9 (Widescreen Horizontal)</option>
                <option value="1:1">1:1 (Square Layout)</option>
                <option value="3:2">3:2 (Standard Horizontal)</option>
                <option value="2:3">2:3 (Portrait Poster Layout)</option>
              </select>
            </div>

            <div className="fields-grid-split">
              {/* Wardrobe Details */}
              <div className="form-group">
              <div className="label-container">
                <span className="input-label">Wardrobe details</span>
                <span
                  className="preset-trigger"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleDropdown("wardrobeDetails");
                  }}
                >
                  <span className="dot" /> Preset
                </span>
              </div>
              <input
                type="text"
                className="tech-input"
                value={fields.wardrobeDetails}
                onChange={(e) => setFields({ ...fields, wardrobeDetails: e.target.value })}
                placeholder="Wardrobe and apparel details"
              />
              {activePresetDropdown === "wardrobeDetails" && (
                <div className="preset-dropdown" onScroll={handleDropdownScroll} onClick={(e) => e.stopPropagation()}>
                  <input
                    type="text"
                    className="tech-input"
                    style={{ borderBottom: "1px solid var(--accent)", fontSize: "0.68rem" }}
                    placeholder="Search 1,000 wardrobes..."
                    value={presetSearch}
                    onChange={(e) => setPresetSearch(e.target.value)}
                  />
                  <div className="preset-item clean" onClick={() => selectPresetValue("wardrobeDetails", "")}>
                    None (Clean)
                  </div>
                  {getFilteredPresets("wardrobeDetails").map((p) => (
                    <div key={p} className="preset-item" onClick={() => selectPresetValue("wardrobeDetails", p)}>
                      {p}
                    </div>
                  ))}
                </div>
              )}
            </div>

              {/* Key Prop */}
              <div className="form-group">
              <div className="label-container">
                <span className="input-label">Key Signature Prop</span>
                <span
                  className="preset-trigger"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleDropdown("keyProp");
                  }}
                >
                  <span className="dot" /> Preset
                </span>
              </div>
              <input
                type="text"
                className="tech-input"
                value={fields.keyProp}
                onChange={(e) => setFields({ ...fields, keyProp: e.target.value })}
                placeholder="Prop - attribute1, attribute2"
              />
              {activePresetDropdown === "keyProp" && (
                <div className="preset-dropdown" onScroll={handleDropdownScroll} onClick={(e) => e.stopPropagation()}>
                  <input
                    type="text"
                    className="tech-input"
                    style={{ borderBottom: "1px solid var(--accent)", fontSize: "0.68rem" }}
                    placeholder="Search 1,000 props..."
                    value={presetSearch}
                    onChange={(e) => setPresetSearch(e.target.value)}
                  />
                  <div className="preset-item clean" onClick={() => selectPresetValue("keyProp", "")}>
                    None (Clean)
                  </div>
                  {getFilteredPresets("keyProp").map((p) => (
                    <div key={p} className="preset-item" onClick={() => selectPresetValue("keyProp", p)}>
                      {p}
                    </div>
                  ))}
                </div>
              )}
            </div>
            </div>
          </div>

          {/* Sample Output Image Slider */}
          <ImageSlider />
          </div>

        </section>

        {/* Right column: Tabs & Output */}
        <section className="tech-panel">
          {/* Action Row */}
          <div className="btn-row" style={{ marginTop: 0, marginBottom: "1rem" }}>
            <button className="btn-tech-outline" onClick={handleShuffle} type="button">
              SHUFFLE DNA
            </button>
            <button
              className="btn-tech-solid"
              onClick={handleCompile}
              disabled={compiling || parsing || !hasSubjectSelected}
              type="button"
            >
              {compiling ? "COMPILING..." : "GENERATE PROMPT"}
            </button>
          </div>

          {/* Tabs Navigation */}
          <nav className="tech-tabs">
            <button
              className={`tech-tab${activeTab === "prompt" ? " active" : ""}`}
              onClick={() => setActiveTab("prompt")}
              type="button"
            >
              MASTER PROMPT
            </button>
            <button
              className={`tech-tab${activeTab === "json" ? " active" : ""}`}
              onClick={() => setActiveTab("json")}
              type="button"
            >
              JSON DATA
            </button>
            <button
              className={`tech-tab${activeTab === "bio" ? " active" : ""}`}
              onClick={() => setActiveTab("bio")}
              type="button"
            >
              {splicingMode ? "SPLICED BIOS" : "CHARACTER BIO"}
            </button>
          </nav>

          {/* Code Container */}
          <div className="code-container">


            {activeTab === "prompt" && (
              <pre>{compiledPrompt || "// Compiled character reference prompt will appear here."}</pre>
            )}

            {activeTab === "json" && (
              <pre>{JSON.stringify(fields, null, 2)}</pre>
            )}

            {activeTab === "bio" && (
              <pre style={{ color: "var(--text-light)" }}>
                {splicingMode ? (
                  <>
                    {selectedCharacterA ? (
                      <>
                        <strong>【 SUBJECT ALPHA — {selectedCharacterA.name} 】</strong>
                        {"\n"}
                        {selectedCharacterA.about || "No biography details available."}
                        {"\n\n"}
                      </>
                    ) : (
                      "// Subject Alpha not selected.\n"
                    )}
                    {selectedCharacterB ? (
                      <>
                        <strong>【 SUBJECT BETA — {selectedCharacterB.name} 】</strong>
                        {"\n"}
                        {selectedCharacterB.about || "No biography details available."}
                      </>
                    ) : (
                      "// Subject Beta not selected."
                    )}
                  </>
                ) : (
                  selectedCharacterA?.about || "// No character biography loaded."
                )}
              </pre>
            )}
          </div>

          <button
            className="btn-tech-outline"
            style={{ marginTop: "0.6rem", width: "100%", padding: "0.6rem", textAlign: "center" }}
            onClick={handleCopy}
            type="button"
          >
            📋 COPY {activeTab.toUpperCase()}
          </button>
        </section>
      </main>

      {/* Zhonk Vision Footer Credit */}
      <footer className="zhonk-credit">
        Designed by <span>Zhonk Vision</span> &nbsp;·&nbsp; SCHEET˚ V3.0
      </footer>

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="toast-alert">
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
