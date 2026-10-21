"use client";

import React, { useState, useEffect, useTransition } from "react";
import {
  Search,
  Calendar,
  Filter,
  ChevronDown,
  X,
  RotateCcw,
  Users,
  Shield,
  Layers,
  Sparkles,
} from "lucide-react";
import { questions } from "@/content/questionnaire";
import { missions } from "@/content/missions";
import type { Filters, Question, Session } from "@/lib/types";

interface GlobalResearchFiltersProps {
  filters: Filters;
  onChange: (next: Filters) => void;
  filteredCount: number;
  totalCount: number;
  activeSection?: string;
}

// Helper to get formatted date string in Asia/Colombo (UTC+5:30)
function getColomboDateString(daysAgo = 0): string {
  const now = new Date();
  if (daysAgo > 0) {
    now.setDate(now.getDate() - daysAgo);
  }
  // Format YYYY-MM-DD
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function GlobalResearchFilters({
  filters,
  onChange,
  filteredCount,
  totalCount,
  activeSection = "",
}: GlobalResearchFiltersProps) {
  const [isPending, startTransition] = useTransition();
  const [isAdvancedOpen, setIsAdvancedOpen] = useState<boolean>(false);
  const [localSearch, setLocalSearch] = useState<string>(filters.code ?? "");

  // Determine active date range preset
  const datePreset = (() => {
    if (!filters.from && !filters.to) return "all";
    const today = getColomboDateString(0);
    const d7 = getColomboDateString(7);
    const d30 = getColomboDateString(30);

    if (filters.from === d7 && (!filters.to || filters.to === today)) return "7d";
    if (filters.from === d30 && (!filters.to || filters.to === today)) return "30d";
    return "custom";
  })();

  // Keep local search in sync with incoming filter updates
  useEffect(() => {
    setLocalSearch(filters.code ?? "");
  }, [filters.code]);

  // Debounced search updates
  useEffect(() => {
    const timer = setTimeout(() => {
      if ((filters.code ?? "") !== localSearch) {
        startTransition(() => {
          const next = { ...filters };
          if (localSearch.trim()) {
            next.code = localSearch.trim();
          } else {
            delete next.code;
          }
          onChange(next);
        });
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [localSearch, filters, onChange]);

  // Handle Date Range preset change
  const handleDatePresetChange = (preset: string) => {
    const next = { ...filters };
    const today = getColomboDateString(0);

    if (preset === "all") {
      delete next.from;
      delete next.to;
    } else if (preset === "7d") {
      next.from = getColomboDateString(7);
      next.to = today;
    } else if (preset === "30d") {
      next.from = getColomboDateString(30);
      next.to = today;
    } else if (preset === "custom") {
      if (!next.from) next.from = getColomboDateString(7);
      if (!next.to) next.to = today;
    }
    onChange(next);
  };

  // Handle Participation Status change
  const handleStatusChange = (status: string) => {
    const next = { ...filters };
    if (!status || status === "all") {
      delete next.status;
    } else {
      next.status = status;
    }
    onChange(next);
  };

  // Update specific single filter key
  const handleFilterChange = (key: keyof Filters | string, value: string) => {
    const next = { ...filters };
    if (!value || value === "all") {
      delete next[key as keyof Filters];
    } else {
      (next as Record<string, string>)[key] = value;
    }
    onChange(next);
  };

  // Clear a single filter chip
  const removeFilter = (key: keyof Filters | string) => {
    const next = { ...filters };
    if (key === "date") {
      delete next.from;
      delete next.to;
    } else {
      delete next[key as keyof Filters];
    }
    onChange(next);
  };

  // Reset ALL filters
  const resetAllFilters = () => {
    setLocalSearch("");
    onChange({});
  };

  // Demographic questions Q1..Q5
  const demoQuestions = questions.slice(0, 5);

  // Active filter chips list
  const activeChips: Array<{ key: string; label: string }> = [];

  if (filters.code) {
    activeChips.push({
      key: "code",
      label: `Search: "${filters.code}"`,
    });
  }

  if (datePreset === "7d") {
    activeChips.push({ key: "date", label: "Date: Last 7 Days" });
  } else if (datePreset === "30d") {
    activeChips.push({ key: "date", label: "Date: Last 30 Days" });
  } else if (datePreset === "custom" && (filters.from || filters.to)) {
    activeChips.push({
      key: "date",
      label: `Date: ${filters.from || "Start"} to ${filters.to || "Now"}`,
    });
  }

  if (filters.status) {
    const statusLabels: Record<string, string> = {
      completed: "Completed Participants",
      in_progress: "In Progress (Drafts)",
      draft: "In Progress (Drafts)",
      submitted_complete: "Submitted Complete",
      submitted_with_missing: "Submitted With Missing",
    };
    activeChips.push({
      key: "status",
      label: statusLabels[filters.status] || `Status: ${filters.status}`,
    });
  }

  // Demographic chips
  demoQuestions.forEach((q) => {
    const val = filters[q.id as keyof Filters];
    if (val) {
      const opt = q.options.find((o) => String(o.code) === String(val));
      activeChips.push({
        key: q.id,
        label: `${q.variable}: ${opt?.label ?? val}`,
      });
    }
  });

  // Mission filter chip
  if (filters.mission) {
    const m = missions.find(
      (m) => m.id === filters.mission || m.iv === filters.mission,
    );
    activeChips.push({
      key: "mission",
      label: m ? `${m.name} (${m.iv})` : `Mission: ${filters.mission}`,
    });
  }

  // Known Exposure chip
  if (filters.exposure) {
    activeChips.push({
      key: "exposure",
      label:
        filters.exposure === "true"
          ? "Known Prior Exposure"
          : "No Prior Exposure",
    });
  }

  const hasActiveFilters = activeChips.length > 0;

  return (
    <div
      className="global-research-filters-panel"
      role="region"
      aria-label="Research Data Filters"
    >
      {/* Panel Header */}
      <div className="filter-panel-header">
        <div className="filter-panel-title-block">
          <div className="filter-title-row">
            <Filter size={17} className="text-primary" aria-hidden="true" />
            <h2 className="filter-panel-heading">Research Data Filters</h2>
          </div>
          <p className="filter-panel-sub">Search and explore participant research data.</p>
        </div>

        {/* Result Counter & Reset Button */}
        <div className="filter-summary-actions">
          <div className="filter-result-counter font-mono">
            <span>Showing</span>
            <strong className="text-primary font-bold">{filteredCount}</strong>
            <span>of</span>
            <strong>{totalCount}</strong>
            <span>participants</span>
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              className="button ghost small reset-filters-btn"
              onClick={resetAllFilters}
              aria-label="Reset all active filters"
            >
              <RotateCcw size={13} aria-hidden="true" />
              <span>Reset Filters</span>
            </button>
          )}
        </div>
      </div>

      {/* THREE ESSENTIAL CONTROLS (DEFAULT VISIBLE) */}
      <div className="filter-essential-controls-grid">
        {/* 1. Search Participant */}
        <div className="filter-control-item search-control">
          <label htmlFor="filter-search-input" className="filter-control-label">
            Search Participant
          </label>
          <div className="filter-input-wrap">
            <Search size={15} className="input-icon text-muted" aria-hidden="true" />
            <input
              id="filter-search-input"
              type="text"
              className="filter-text-input"
              placeholder="Participant code or submission ID…"
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
            />
            {localSearch && (
              <button
                type="button"
                className="clear-search-btn"
                onClick={() => setLocalSearch("")}
                aria-label="Clear participant search"
              >
                <X size={14} aria-hidden="true" />
              </button>
            )}
          </div>
        </div>

        {/* 2. Date Range */}
        <div className="filter-control-item date-control">
          <label htmlFor="filter-date-preset-select" className="filter-control-label">
            Date Range (Asia/Colombo)
          </label>
          <div className="filter-input-wrap">
            <Calendar size={15} className="input-icon text-muted" aria-hidden="true" />
            <select
              id="filter-date-preset-select"
              className="filter-select-input"
              value={datePreset}
              onChange={(e) => handleDatePresetChange(e.target.value)}
            >
              <option value="all">All Time</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="custom">Custom Range…</option>
            </select>
          </div>
        </div>

        {/* 3. Participation Status */}
        <div className="filter-control-item status-control">
          <label htmlFor="filter-status-select" className="filter-control-label">
            Participation Status
          </label>
          <div className="filter-input-wrap">
            <select
              id="filter-status-select"
              className="filter-select-input"
              value={filters.status ?? "all"}
              onChange={(e) => handleStatusChange(e.target.value)}
            >
              <option value="all">All Responses</option>
              <option value="completed">Completed</option>
              <option value="in_progress">In Progress (Draft)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Custom Date Pickers (Shown ONLY when Custom Range is selected) */}
      {datePreset === "custom" && (
        <div className="custom-date-inputs-row">
          <div className="date-sub-input">
            <label htmlFor="custom-from-date" className="sub-label">
              From Date:
            </label>
            <input
              id="custom-from-date"
              type="date"
              className="filter-date-field"
              value={filters.from ?? ""}
              onChange={(e) => handleFilterChange("from", e.target.value)}
            />
          </div>
          <div className="date-sub-input">
            <label htmlFor="custom-to-date" className="sub-label">
              Through Date:
            </label>
            <input
              id="custom-to-date"
              type="date"
              className="filter-date-field"
              value={filters.to ?? ""}
              onChange={(e) => handleFilterChange("to", e.target.value)}
            />
          </div>
        </div>
      )}

      {/* COLLAPSIBLE ADVANCED FILTERS TOGGLE */}
      <div className="filter-advanced-toggle-bar">
        <button
          type="button"
          className="advanced-filter-toggle-btn"
          onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
          aria-expanded={isAdvancedOpen}
        >
          <span>{isAdvancedOpen ? "Less Filters" : "More Filters"}</span>
          <ChevronDown
            size={14}
            className={`transition-transform duration-200 ${
              isAdvancedOpen ? "rotate-180" : ""
            }`}
            aria-hidden="true"
          />
        </button>
      </div>

      {/* ADVANCED FILTER GROUPS (COLLAPSIBLE) */}
      {isAdvancedOpen && (
        <div className="advanced-filters-container">
          {/* GROUP A — Demographic Filters */}
          <div className="advanced-group-card">
            <div className="advanced-group-title">
              <Users size={14} className="text-primary" aria-hidden="true" />
              <span>GROUP A — Demographic Filters</span>
            </div>
            <div className="advanced-group-grid">
              {demoQuestions.map((q) => (
                <div key={q.id} className="advanced-select-wrap">
                  <label htmlFor={`filter-${q.id}`} className="advanced-label">
                    {q.variable}
                  </label>
                  <select
                    id={`filter-${q.id}`}
                    className="filter-select-input"
                    value={filters[q.id as keyof Filters] ?? "all"}
                    onChange={(e) => handleFilterChange(q.id, e.target.value)}
                  >
                    <option value="all">All {q.variable} Categories</option>
                    {q.options.map((o) => (
                      <option key={o.code} value={o.code}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </div>

          {/* GROUP B — Cyber Mission Filters */}
          <div className="advanced-group-card">
            <div className="advanced-group-title">
              <Shield size={14} className="text-primary" aria-hidden="true" />
              <span>GROUP B — Cyber Mission &amp; Practice Filters</span>
            </div>
            <div className="advanced-group-grid">
              {/* Mission Selector */}
              <div className="advanced-select-wrap">
                <label htmlFor="filter-mission-select" className="advanced-label">
                  Cyber Mission
                </label>
                <select
                  id="filter-mission-select"
                  className="filter-select-input"
                  value={filters.mission ?? "all"}
                  onChange={(e) => handleFilterChange("mission", e.target.value)}
                >
                  <option value="all">All Cyber Missions (IV1–IV4)</option>
                  {missions
                    .filter((m) => !m.proposed)
                    .map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name} ({m.iv})
                      </option>
                    ))}
                </select>
              </div>

              {/* Known Prior Exposure */}
              <div className="advanced-select-wrap">
                <label htmlFor="filter-exposure-select" className="advanced-label">
                  Known Prior Practice
                </label>
                <select
                  id="filter-exposure-select"
                  className="filter-select-input"
                  value={filters.exposure ?? "all"}
                  onChange={(e) => handleFilterChange("exposure", e.target.value)}
                >
                  <option value="all">All Exposure Statuses</option>
                  <option value="true">Known Prior Exposure</option>
                  <option value="false">No Known Prior Exposure</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ACTIVE FILTER CHIPS */}
      {hasActiveFilters && (
        <div className="active-filter-chips-row" role="region" aria-label="Active Filters">
          <span className="chips-label text-xs text-muted font-semibold">Active Filters:</span>
          <div className="chips-flex-wrap">
            {activeChips.map((chip) => (
              <span key={chip.key} className="active-filter-chip">
                <span>{chip.label}</span>
                <button
                  type="button"
                  onClick={() => removeFilter(chip.key)}
                  aria-label={`Remove filter ${chip.label}`}
                  className="chip-remove-btn"
                >
                  <X size={12} aria-hidden="true" />
                </button>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
