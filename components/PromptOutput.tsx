"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";

interface PromptOutputProps {
  prompt: string;
  isActive: boolean;
}

function highlightPrompt(raw: string): React.ReactNode[] {
  const lines = raw.split("\n");
  return lines.map((line, i) => {
    let className = "";

    if (line.startsWith("[STYLE]:")) className = "line-style";
    else if (line.startsWith("[SUBJECT_DESCRIPTION]:")) className = "line-subject";
    else if (/^\d+\.\s/.test(line)) className = "line-section";
    else if (line.startsWith("Title:") || line.startsWith("Include:") || line.startsWith("Use this layout:"))
      className = "line-header";

    return (
      <span key={i} className={className}>
        {line}
        {"\n"}
      </span>
    );
  });
}

export default function PromptOutput({ prompt, isActive }: PromptOutputProps) {
  const [showToast, setShowToast] = useState(false);
  const toastTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const preRef = useRef<HTMLPreElement>(null);

  const charCount = prompt.length;
  const wordCount = prompt.split(/\s+/).filter(Boolean).length;
  const lineCount = prompt.split("\n").length;

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(prompt);
      setShowToast(true);
      if (toastTimeout.current) clearTimeout(toastTimeout.current);
      toastTimeout.current = setTimeout(() => setShowToast(false), 2200);
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement("textarea");
      textarea.value = prompt;
      textarea.style.position = "fixed";
      textarea.style.left = "-9999px";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setShowToast(true);
      if (toastTimeout.current) clearTimeout(toastTimeout.current);
      toastTimeout.current = setTimeout(() => setShowToast(false), 2200);
    }
  }, [prompt]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (toastTimeout.current) clearTimeout(toastTimeout.current);
    };
  }, []);

  if (!prompt) return null;

  return (
    <div className={`glass-card animate-in animate-in-delay-3${isActive ? " active" : ""}`}>
      <div className="section-label">
        <span className="icon">📋</span>
        <span>Stage 3 — Compiled Prompt</span>
      </div>

      <div className="prompt-output-wrapper">
        <div className="prompt-toolbar">
          <div className="prompt-stats">
            <span>
              <strong style={{ color: "var(--text-secondary)" }}>{charCount.toLocaleString()}</strong> chars
            </span>
            <span>
              <strong style={{ color: "var(--text-secondary)" }}>{wordCount.toLocaleString()}</strong> words
            </span>
            <span>
              <strong style={{ color: "var(--text-secondary)" }}>{lineCount}</strong> lines
            </span>
          </div>

          <button
            id="copy-prompt-btn"
            className="btn btn-primary"
            onClick={handleCopy}
            type="button"
          >
            <span className="icon-left">📋</span>
            Copy to Clipboard
          </button>
        </div>

        <div className="prompt-block">
          <pre ref={preRef}>{highlightPrompt(prompt)}</pre>
        </div>
      </div>

      <div className={`copy-toast${showToast ? " visible" : ""}`}>
        ✓ Prompt copied to clipboard
      </div>
    </div>
  );
}
