// Main entry point for GTCs app
import { initFilters } from './filters.js';
import { sortBySeverity, getSeverityDisplayLabel, getSeverityColor, getRiskRecommendation } from './sorting.js';
import { renderRows, renderAmendmentSummary, setupUI } from './ui.js';
import { setupClipboard } from './clipboard.js';
import * as utils from './utils.js';

export function initApp() {
  setupUI();
  setupClipboard();
  // Fetch data and initialize filters, then render
  fetch('http://portal.dts.corp.local/dpts/contracts/_layouts/15/download.aspx?UniqueId=%7Bb82c6aba%2Dafcc%2D4832%2Dbf94%2D14fc3a832140%7D&Source=http%3A%2F%2Fportal%2Edts%2Ecorp%2Elocal%2Fdpts%2Fcontracts%2FSiteAssets%2FForms%2FAllItems%2Easpx%3FRootFolder%3D%252Fdpts%252Fcontracts%252FSiteAssets%252FGTCS%255FDev%26FolderCTID%3D0x012000D5D1FADBC8861742BDC627451942500C%26View%3D%257B954C25BC%252D2637%252D4D50%252DA01D%252D338BA474858F%257D')
    .then(response => response.json())
    .then(json => {
      window.gtcData = json;
      initFilters(json);
      renderRows();
      renderAmendmentSummary();
    })
    .catch(err => console.error('Erreur de chargement du JSON :', err));
}

document.addEventListener('DOMContentLoaded', initApp);