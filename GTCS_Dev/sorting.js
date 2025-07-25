// Sorting logic for GTCs app
import { severityValue } from './utils.js';

export function sortBySeverity(a, b) {
  const severityA = severityValue(a["Severity Seller"] || a["Severity Buyer"]);
  const severityB = severityValue(b["Severity Seller"] || b["Severity Buyer"]);
  return severityA - severityB;
}

export function getSeverityDisplayLabel(severity) {
  const labels = {
    1: "🔴 High",
    2: "🟡 Moderate",
    3: "🟢 Low",
    4: "🔵 Informative"
  };
  return labels[severity] || "⚪ Unknown";
}

export function getSeverityColor(severity) {
  const colors = {
    1: "#e74c3c",
    2: "#e6c222",
    3: "#16f10f",
    4: "#3498db"
  };
  return colors[severity] || "#95a5a6";
}

export function getRiskRecommendation(riskLevel) {
  const recommendations = {
    "1": "⚠️ Attention immédiate requise. Consultez l'équipe juridique avant signature.",
    "2": "📋 Révision recommandée. Vérifiez les implications opérationnelles.",
    "3": "✅ Risque acceptable. Procédures standard suffisantes.",
    "4": "ℹ️ Information uniquement. Aucune action particulière requise."
  };
  return recommendations[riskLevel] || "Évaluation manuelle recommandée.";
}