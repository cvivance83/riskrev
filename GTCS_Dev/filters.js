// Filters module for GTCs app
import { updateDisplay } from './ui.js';
import { detectIncoterms, extractIncotermText } from './utils.js';

export let selectedCategories = new Set();
export let selectedClauseTypes = new Set();
export let selectedSeveritySeller = new Set();
export let selectedSeverityBuyer = new Set();
export let filterBackToBack = false;
export let lastSeverityChanged = null;

export function initFilters(data) {
  // (Refactored from script.js:325-546)
  // Setup GTC, Incoterm, Clause Type, Category filters and event listeners
  // Use updateDisplay from ui.js for rendering
  // ...
}

export function matchIncoterm(incotermField, selectedValues) {
  if (!selectedValues.length) return true;
  if (Array.isArray(incotermField)) {
    const upperArray = incotermField.map(i => i.toUpperCase().trim());
    return selectedValues.some(val => upperArray.includes(val));
  }
  if (typeof incotermField === "string") {
    const upperString = incotermField.toUpperCase();
    return selectedValues.some(val => upperString.includes(val));
  }
  return false;
}

export function matchIncotermInContent(dataRow, selectedIncotermValues) {
  if (!selectedIncotermValues.length) return true;
  const contentToCheck = [
    dataRow["Content of the clause"] || "",
    dataRow["Abbreviated Amendment"] || "",
    dataRow["Risk Description"] || ""
  ].join(" ");
  const detectedIncoterms = detectIncoterms(contentToCheck);
  if (detectedIncoterms.length === 0) {
    return true;
  }
  return selectedIncotermValues.some(selected => detectedIncoterms.includes(selected.toUpperCase()));
}

export function filterTextByIncoterms(text, selectedIncoterms) {
  if (!text || !selectedIncoterms.length) return text;
  const detectedIncoterms = detectIncoterms(text);
  if (detectedIncoterms.length === 0) return text;
  let filteredText = text;
  detectedIncoterms.forEach(incoterm => {
    const incotermText = extractIncotermText(text, incoterm);
    if (!selectedIncoterms.includes(incoterm.toUpperCase())) {
      const removePattern = new RegExp(`\\b${incoterm}(?:\/[A-Z]+)*\\s*[\\(\\)]?\\s*:[^\\n]*(?:\\n(?!\\b(?:CIF|CFR|DAP|FOB))[^\\n]*)*`, 'gi');
      filteredText = filteredText.replace(removePattern, '').trim();
    }
  });
  return filteredText.replace(/\n\s*\n/g, '\n').trim();
}
// ...export other filter helpers as needed