// Utility/helper functions for GTCs app

export function normalizeSeverityNum(input) {
  if (!input) return "";
  const val = input.toString().toLowerCase().trim();
  if (["3", "3.0", "high", "élevé"].includes(val)) return "1";
  if (["2", "2.0", "moderate", "modéré"].includes(val)) return "2";
  if (["1", "1.0", "low", "faible"].includes(val)) return "3";
  if (["0", "0.0", "informative", "info", "informative only"].includes(val)) return "4";
  return "";
}

export function severityValue(input) {
  const normalized = normalizeSeverityNum(input);
  return normalized ? parseInt(normalized) : 99;
}

export function getSeverityLabel(input) {
  if (!input) return "";
  const val = input.toString().toLowerCase().trim();
  if (["1", "1.0", "high", "élevé"].includes(val)) return "high";
  if (["2", "2.0", "moderate", "modéré"].includes(val)) return "moderate";
  if (["3", "3.0", "low", "faible"].includes(val)) return "low";
  if (["4", "4.0", "informative", "info", "informative only"].includes(val)) return "informative";
  return "";
}

export function isEmptyValue(value) {
  if (!value) return true;
  const cleanValue = value.toString().toLowerCase().trim();
  const emptyValues = ['nan', 'n/a', 'na', '-', '/', '', 'null', 'undefined', 'none'];
  return emptyValues.includes(cleanValue);
}

export function detectIncoterms(text) {
  if (!text || isEmptyValue(text)) return [];
  const incoterms = ['CIF', 'CFR', 'DAP', 'FOB'];
  const detectedIncoterms = [];
  const pattern = /\b(CIF|CFR|DAP|FOB)(?:\/([CIF|CFR|DAP|FOB]+))*\s*[\(\)]?\s*:/gi;
  let match;
  while ((match = pattern.exec(text)) !== null) {
    const mainTerm = match[1].toUpperCase();
    if (incoterms.includes(mainTerm) && !detectedIncoterms.includes(mainTerm)) {
      detectedIncoterms.push(mainTerm);
    }
    if (match[2]) {
      const additionalTerms = match[2].split('/');
      additionalTerms.forEach(term => {
        const cleanTerm = term.trim().toUpperCase();
        if (incoterms.includes(cleanTerm) && !detectedIncoterms.includes(cleanTerm)) {
          detectedIncoterms.push(cleanTerm);
        }
      });
    }
  }
  return detectedIncoterms;
}

export function extractIncotermText(text, incoterm) {
  if (!text || isEmptyValue(text)) return '';
  const pattern = new RegExp(`\\b${incoterm}(?:\/[A-Z]+)*\\s*[\\(\\)]?\\s*:([^\\n]*(?:\\n(?!\\b(?:CIF|CFR|DAP|FOB))[^\\n]*)*)`);
  const match = text.match(pattern);
  return match ? match[1].trim() : '';
}

export function cleanAmendmentText(text) {
  if (isEmptyValue(text)) return "";
  return text
    .replace(/^[-–—]?\s*/i, '')
    .replace(/\bwhen\s+(we|i)\s+(buy|sell)\b[:,]?\s*/gi, '')
    .trim();
}