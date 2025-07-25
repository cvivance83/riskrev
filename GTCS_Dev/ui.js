// UI rendering and DOM manipulation for GTCs app
import { selectedCategories, selectedClauseTypes, selectedSeveritySeller, selectedSeverityBuyer, filterBackToBack, matchIncoterm, matchIncotermInContent } from './filters.js';
import { sortBySeverity, getSeverityDisplayLabel, getSeverityColor } from './sorting.js';
import { filterTextByIncoterms, cleanAmendmentText, detectIncoterms, isEmptyValue } from './utils.js';

export function setupUI() {
  // Theme switcher
  const body = document.body;
  const toggle = document.getElementById("themeSwitcher");
  const currentTheme = localStorage.getItem("theme");
  if (currentTheme === "dark") {
    body.classList.add("dark-mode");
  }
  toggle.addEventListener("click", () => {
    body.classList.toggle("dark-mode");
    const mode = body.classList.contains("dark-mode") ? "dark" : "light";
    localStorage.setItem("theme", mode);
  });
  // Add other UI setup logic as needed
}

export function renderRows() {
  const data = window.gtcData || [];
  // Example: Filter and render rows, applying filterTextByIncoterms to clause text
  // This is where you would use selected filters and helpers
}

export function renderAmendmentSummary() {
  const data = window.gtcData || [];
  // Example: Group amendments by department and render
  // ...
}