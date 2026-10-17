"use client";

import React, { useState, useEffect, useRef } from "react";
import { Moon, Sun, CircuitBoard, Check, ChevronDown } from "lucide-react";
import { useTheme, Theme, THEMES } from "./theme-provider";

export function ThemeToggle({
  variant = "pill",
  className = "",
}: {
  variant?: "pill" | "dropdown" | "compact";
  className?: string;
}) {
  const { theme, setTheme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonsRef = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close dropdown on outside click or escape
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const getIcon = (id: Theme, size = 16) => {
    switch (id) {
      case "dark":
        return <Moon size={size} strokeWidth={1.9} aria-hidden="true" />;
      case "light":
        return <Sun size={size} strokeWidth={1.9} aria-hidden="true" />;
      case "cyber":
        return <CircuitBoard size={size} strokeWidth={1.9} aria-hidden="true" />;
      default:
        return <Moon size={size} strokeWidth={1.9} aria-hidden="true" />;
    }
  };

  const getThemeName = (id: Theme) => {
    switch (id) {
      case "dark":
        return "Dark";
      case "light":
        return "Light";
      case "cyber":
        return "Cyber";
      default:
        return "Dark";
    }
  };

  const currentTheme = mounted ? theme : "dark";

  // Arrow key navigation for radio group
  const handleKeyDown = (e: React.KeyboardEvent, currentIndex: number) => {
    let nextIndex = -1;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      e.preventDefault();
      nextIndex = (currentIndex + 1) % THEMES.length;
    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      e.preventDefault();
      nextIndex = (currentIndex - 1 + THEMES.length) % THEMES.length;
    }

    if (nextIndex >= 0) {
      const nextTheme = THEMES[nextIndex].id;
      setTheme(nextTheme);
      buttonsRef.current[nextIndex]?.focus();
    }
  };

  if (variant === "compact") {
    return (
      <button
        type="button"
        className={`theme-toggle-compact ${className}`}
        onClick={toggleTheme}
        aria-label={`Current theme: ${getThemeName(currentTheme)}. Click to switch theme.`}
        title={`Theme: ${getThemeName(currentTheme)} (click to switch)`}
      >
        <span className="theme-toggle-icon">{getIcon(currentTheme, 18)}</span>
        <span className="sr-only">Toggle theme</span>
      </button>
    );
  }

  if (variant === "dropdown") {
    return (
      <div
        className={`theme-dropdown-container ${className}`}
        ref={dropdownRef}
      >
        <button
          type="button"
          className="theme-dropdown-trigger"
          onClick={() => setIsOpen(!isOpen)}
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          aria-label={`Theme selector: ${getThemeName(currentTheme)}`}
        >
          <span className="theme-toggle-icon">{getIcon(currentTheme, 16)}</span>
          <span className="theme-current-label">{getThemeName(currentTheme)}</span>
          <ChevronDown
            size={14}
            className={`theme-arrow ${isOpen ? "open" : ""}`}
            aria-hidden="true"
          />
        </button>

        {isOpen && (
          <div
            className="theme-dropdown-menu"
            role="listbox"
            aria-label="Select color theme"
          >
            {THEMES.map((t) => (
              <button
                key={t.id}
                type="button"
                role="option"
                aria-selected={currentTheme === t.id}
                className={`theme-dropdown-item ${currentTheme === t.id ? "active" : ""}`}
                onClick={() => {
                  setTheme(t.id);
                  setIsOpen(false);
                }}
              >
                <span className="theme-item-icon">{getIcon(t.id, 15)}</span>
                <span className="theme-item-label">{getThemeName(t.id)}</span>
                {currentTheme === t.id && (
                  <Check size={14} className="theme-item-check" aria-hidden="true" />
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Segmented Capsule Appearance Switcher (Dark | Light | Cyber)
  return (
    <div
      className={`appearance-switcher theme-segmented-pill ${className}`}
      role="radiogroup"
      aria-label="Appearance"
    >
      {THEMES.map((t, idx) => {
        const isSelected = currentTheme === t.id;
        return (
          <button
            key={t.id}
            ref={(el) => {
              buttonsRef.current[idx] = el;
            }}
            type="button"
            role="radio"
            aria-checked={isSelected}
            tabIndex={isSelected ? 0 : -1}
            className={`appearance-segment-btn theme-segment-button ${isSelected ? "selected" : ""}`}
            onClick={() => setTheme(t.id)}
            onKeyDown={(e) => handleKeyDown(e, idx)}
            aria-label={`${getThemeName(t.id)} mode`}
            title={`Switch to ${getThemeName(t.id)} mode`}
          >
            <span className="appearance-segment-icon">{getIcon(t.id, 16)}</span>
            <span className="appearance-segment-label theme-segment-text">{getThemeName(t.id)}</span>
          </button>
        );
      })}
    </div>
  );
}
