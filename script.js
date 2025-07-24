let selectedCategories = new Set();
let selectedClauseTypes = new Set();
let selectedSeveritySeller = new Set();
let selectedSeverityBuyer = new Set();
let filterBackToBack = false;
let data = [];
let lastSeverityChanged = null; // "Seller", "Buyer" ou null


const body = document.body;
const toggle = document.getElementById("themeSwitcher");

// Applique le thème sauvegardé

document.addEventListener("DOMContentLoaded", () => {
  const body = document.body;

  // 🤖 TEST RAPIDE DU CHATBOT
  setTimeout(() => {
    console.log('🧪 Test des éléments du chatbot après 2 secondes...');
    const fab = document.getElementById('chatbot-fab');
    const container = document.getElementById('chatbot-container');
    
    if (fab && container) {
      console.log('✅ Éléments trouvés, test de visibilité...');
      // Test simple de fonctionnement
      fab.onclick = function() {
        console.log('🔵 Test FAB click - Manual');
        container.classList.toggle('active');
        console.log('📱 Container classes:', container.classList.toString());
      };
    } else {
      console.error('❌ Éléments de test non trouvés:', { fab: !!fab, container: !!container });
    }
  }, 2000);

  // 🌙 Gestion du thème
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

  // 🎛️ Bouton toggle des filtres
  const toggleButton = document.getElementById("toggleFilters");
  const toggleArrow = document.getElementById("toggleArrow");
  const filterHeader = document.getElementById("filterHeader");

  let filtersVisible = true;

  toggleButton.addEventListener("click", () => {
    filtersVisible = !filtersVisible;
    filterHeader.classList.toggle("collapsed", !filtersVisible);
    toggleButton.classList.toggle("collapsed", !filtersVisible);
    toggleArrow.textContent = filtersVisible ? "↓" : "→";
  });

  fetch("http://portal.dts.corp.local/dpts/contracts/_layouts/15/download.aspx?UniqueId=%7Bb82c6aba%2Dafcc%2D4832%2Dbf94%2D14fc3a832140%7D&Source=http%3A%2F%2Fportal%2Edts%2Ecorp%2Elocal%2Fdpts%2Fcontracts%2FSiteAssets%2FForms%2FAllItems%2Easpx%3FRootFolder%3D%252Fdpts%252Fcontracts%252FSiteAssets%252FGTCS%255FDev%26FolderCTID%3D0x012000D5D1FADBC8861742BDC627451942500C%26View%3D%257B954C25BC%252D2637%252D4D50%252DA01D%252D338BA474858F%257D")
    .then(response => response.json())
    .then(json => {
      data = json;
      initFilters(data);
      updateDisplay();


      // ✅ Appelle Lucide une fois que le DOM a été mis à jour
      lucide.createIcons();
      
      // 🤖 CHATBOT INITIALIZATION - après que tout soit chargé
      initializeChatbot();
    })
    .catch(err => console.error("Erreur de chargement du JSON :", err));


  // ✅ Fonction toggle pour les filtres de gravité

const severityOrder = ["1", "2", "3", "4"]; // 4 = informative, ..., 1 = high

function getLabelFromSeverity(level) {
  const map = {
    "1": "high",
    "2": "moderate",
    "3": "low",
    "4": "informative"
  };
  return map[level];
}
function toggleSeverity(role, selectedLevel) {
  lastSeverityChanged = role; // ← On enregistre le dernier côté cliqué (Buyer ou Seller)

  const selectedSet = role === 'Seller' ? selectedSeveritySeller : selectedSeverityBuyer;

  const index = severityOrder.indexOf(selectedLevel);
  if (index === -1) return;

  const levelsToSelect = severityOrder.slice(0, index + 1);

  const allSelected = levelsToSelect.every(lvl => selectedSet.has(lvl));

  if (allSelected) {
    // Si tout était déjà sélectionné, on les retire
    levelsToSelect.forEach(lvl => selectedSet.delete(lvl));
  } else {
    // Sinon, on sélectionne tous ceux en-dessous et celui-ci
    levelsToSelect.forEach(lvl => selectedSet.add(lvl));
  }

  // Mise à jour visuelle
  severityOrder.forEach(lvl => {
    const btn = document.getElementById(`${getLabelFromSeverity(lvl)}${role}`);
    if (btn) {
      if (selectedSet.has(lvl)) {
        btn.classList.add("selected");
      } else {
        btn.classList.remove("selected");
      }
    }

    
  });

  updateDisplay();
}


function normalizeSeverityNum(input) {
  if (!input) return "";

  const val = input.toString().toLowerCase().trim();

  if (["3", "3.0", "high", "élevé"].includes(val)) return "1";      // High
  if (["2", "2.0", "moderate", "modéré"].includes(val)) return "2"; // Moderate
  if (["1", "1.0", "low", "faible"].includes(val)) return "3";      // Low
  if (["0", "0.0", "informative", "info", "informative only"].includes(val)) return "4"; // Informative

  return "";
}

function severityValue(input) {
  const normalized = normalizeSeverityNum(input);
  return normalized ? parseInt(normalized) : 99;
}

function getSeverityLabel(input) {
  if (!input) return "";

  const val = input.toString().toLowerCase().trim();

  if (["1", "1.0", "high", "élevé"].includes(val)) return "high";
  if (["2", "2.0", "moderate", "modéré"].includes(val)) return "moderate";
  if (["3", "3.0", "low", "faible"].includes(val)) return "low";
  if (["4", "4.0", "informative", "info", "informative only"].includes(val)) return "informative";

  return "";
}

  // --- Fonction réutilisable pour gérer les dropdowns ---
  function setupDropdownToggle(labelEl, dropdownEl) {
    let timeoutId;

    function openDropdown() {
      dropdownEl.classList.add("show");
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => dropdownEl.classList.remove("show"), 2000);
    }

    function closeDropdown() {
      dropdownEl.classList.remove("show");
    }

    labelEl.addEventListener("click", (e) => {
      e.stopPropagation();
      openDropdown();
    });

    dropdownEl.addEventListener("mouseenter", () => clearTimeout(timeoutId));
    dropdownEl.addEventListener("mouseleave", () => {
      timeoutId = setTimeout(closeDropdown, 2000);
    });
    // ✅ Ferme le menu si clic ailleurs sur la page
    document.addEventListener("click", (e) => {
      if (!dropdownEl.contains(e.target) && e.target !== labelEl) {
        closeDropdown();
      }
    });
  }

  
 function isNotBackToBack(d) {
  return (d["Back to back"] || "").toString().trim().toLowerCase() !== "yes";
  
}

console.log("⛔ Clauses filtrées car Back to Back = Yes :", data.filter(d => !isNotBackToBack(d)));


  function matchIncoterm(incotermField, selectedValues) {
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

  // 🚢 Vérifie si les Incoterms sélectionnés correspondent au contenu des clauses
  function matchIncotermInContent(dataRow, selectedIncotermValues) {
    if (!selectedIncotermValues.length) return true;
    
    // Chercher dans le contenu de la clause et l'amendement
    const contentToCheck = [
      dataRow["Content of the clause"] || "",
      dataRow["Abbreviated Amendment"] || "",
      dataRow["Risk Description"] || ""
    ].join(" ");
    
    const detectedIncoterms = detectIncoterms(contentToCheck);
    
    // Si aucun Incoterm détecté dans le contenu, utiliser le filtrage standard
    if (detectedIncoterms.length === 0) {
      return true; // Laisser passer, sera filtré par matchIncoterm
    }
    
    // ✨ NOUVELLE LOGIQUE : La clause doit contenir AU MOINS UN des Incoterms sélectionnés
    return selectedIncotermValues.some(selected => 
      detectedIncoterms.includes(selected.toUpperCase())
    );
  }

  // 📝 Filtre le texte pour ne garder que les parties liées aux Incoterms sélectionnés
  function filterTextByIncoterms(text, selectedIncoterms) {
    if (!text || !selectedIncoterms.length) return text;
    
    const detectedIncoterms = detectIncoterms(text);
    
    // Si aucun Incoterm détecté, retourner le texte original
    if (detectedIncoterms.length === 0) return text;
    
    let filteredText = text;
    
    // Pour chaque Incoterm détecté
    detectedIncoterms.forEach(incoterm => {
      const incotermText = extractIncotermText(text, incoterm);
      
      // Si cet Incoterm n'est pas sélectionné, supprimer sa partie
      if (!selectedIncoterms.includes(incoterm.toUpperCase())) {
        // Pattern pour supprimer la section entière de cet Incoterm
        const removePattern = new RegExp(`\\b${incoterm}(?:\\/[A-Z]+)*\\s*[\\(\\)]?\\s*:[^\\n]*(?:\\n(?!\\b(?:CIF|CFR|DAP|FOB))[^\\n]*)*`, 'gi');
        filteredText = filteredText.replace(removePattern, '').trim();
      }
    });
    
    // Nettoyer les espaces et lignes vides en trop
    return filteredText.replace(/\n\s*\n/g, '\n').trim();
  }
  function copyToClipboard(text, button) {
    try {
      // Tentative moderne avec navigator.clipboard
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text).then(() => {
          showCopySuccess(button);
        }).catch(() => {
          fallbackCopy(text, button);
        });
      } else {
        fallbackCopy(text, button);
      }
    } catch (error) {
      fallbackCopy(text, button);
    }
  }

  function fallbackCopy(text, button) {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    textArea.style.opacity = "0";
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand("copy");
    document.body.removeChild(textArea);
    showCopySuccess(button);
  }

  function showCopySuccess(button) {
    const originalHTML = button.innerHTML;
    const originalClass = button.className;
    
    // Animation pour tous les types de boutons copy
    button.classList.add('copy-success');
    
    if (button.classList.contains('modern-btn')) {
      // Pour les boutons modern-btn
      button.innerHTML = '<i data-lucide="check"></i> Copié !';
      button.style.background = 'linear-gradient(135deg, #27ae60, #229954)';
    } else {
      // Pour les autres boutons copy
      button.innerHTML = '<i data-lucide="check"></i>';
    }
    
    lucide.createIcons();

    setTimeout(() => {
      button.className = originalClass;
      button.innerHTML = originalHTML;
      button.style.background = ''; // Reset le style
      lucide.createIcons();
    }, 2500);
  }


  function initFilters(data) {
  let lastChangedSide = "seller";
  const gtcSet = new Set(data.map(d => d.GTCs));
  const categoryLabel = document.getElementById("categoryLabel");
  const clauseTypeLabel = document.getElementById("clauseTypeLabel");
  const clauseTypes = new Set(data.map(d => d["Clause Type"]));
  const clauseCategories = new Set(data.map(d => d["Clause Category"]));

  const gtcASelect = document.getElementById("gtcASelect");
  const gtcBSelect = document.getElementById("gtcBSelect");
  const incotermSellerSelect = document.getElementById("incotermSellerSelect");
  const incotermBuyerSelect = document.getElementById("incotermBuyerSelect");
  const b2bCheckbox = document.getElementById("backToBackCheckbox");
  const clauseCategoryContainer = document.getElementById("categoryDropdown");
  const clauseTypeContainer = document.getElementById("clauseTypeDropdown");


  // Réinitialiser les selects
  gtcASelect.innerHTML = "";
  gtcBSelect.innerHTML = "";
  incotermSellerSelect.innerHTML = "";
  incotermBuyerSelect.innerHTML = "";

  // Ajout des options GTC
  gtcASelect.add(new Option("-- Select GTC Seller --", ""));
  gtcBSelect.add(new Option("-- Select GTC Buyer --", ""));
  gtcSet.forEach(gtc => {
    gtcASelect.add(new Option(gtc, gtc));
    gtcBSelect.add(new Option(gtc, gtc));
  });

  // Gestion du changement de GTC
  gtcASelect.addEventListener("change", () => {
    const newVal = gtcASelect.value;
    if (newVal) lastChangedSide = "seller";
    if (b2bCheckbox.checked && newVal) {
      gtcBSelect.value = newVal;
      synchronizeIncoterms(incotermSellerSelect, incotermBuyerSelect);
    }
    updateDisplay();
  });

  gtcBSelect.addEventListener("change", () => {
    const newVal = gtcBSelect.value;
    if (newVal) lastChangedSide = "buyer";
    if (b2bCheckbox.checked && newVal) {
      gtcASelect.value = newVal;
      synchronizeIncoterms(incotermBuyerSelect, incotermSellerSelect);
    }
    updateDisplay();
  });

  // Gestion du Back to Back
  b2bCheckbox.addEventListener("change", () => {
    filterBackToBack = b2bCheckbox.checked;

    const gtcAValue = gtcASelect.value;
    const gtcBValue = gtcBSelect.value;

    if (filterBackToBack) {
      if (lastChangedSide === "seller" && gtcAValue && !gtcBValue) {
        gtcBSelect.value = gtcAValue;
        synchronizeIncoterms(incotermSellerSelect, incotermBuyerSelect);
      } else if (lastChangedSide === "buyer" && gtcBValue && !gtcAValue) {
        gtcASelect.value = gtcBValue;
        synchronizeIncoterms(incotermBuyerSelect, incotermSellerSelect);
      }
    }

    updateDisplay();
  });

  // 🔁 Remplir Incoterms + lier événements
const allIncoterms = new Set();
data.forEach(d => {
  const raw = d.Incoterm;
  if (Array.isArray(raw)) raw.forEach(t => allIncoterms.add(t.trim().toUpperCase()));
  else if (typeof raw === "string") raw.split(",").forEach(t => allIncoterms.add(t.trim().toUpperCase()));
});

Array.from(allIncoterms).sort().forEach(term => {
  incotermSellerSelect.add(new Option(term, term));
  incotermBuyerSelect.add(new Option(term, term));
});

// 🔁 Sélection multiple sans Ctrl
function setupIncotermMultiSelect(selectEl, side) {
  [...selectEl.options].forEach(option => {
    option.addEventListener('mousedown', e => {
      e.preventDefault(); // Évite le comportement natif
      option.selected = !option.selected; // toggle
      lastChangedSide = side;

      if (b2bCheckbox.checked) {
        const targetSelect = side === "seller" ? incotermBuyerSelect : incotermSellerSelect;
        const match = [...targetSelect.options].find(o => o.value === option.value);
        if (match) match.selected = option.selected;
      }

      updateDisplay();
    });
  });

  // Sécurité : mise à jour aussi sur changement natif
  selectEl.addEventListener('change', () => {
    lastChangedSide = side;
    if (b2bCheckbox.checked) {
      const source = side === "seller" ? incotermSellerSelect : incotermBuyerSelect;
      const target = side === "seller" ? incotermBuyerSelect : incotermSellerSelect;
      synchronizeIncoterms(source, target);
    }
    updateDisplay();
  });
}

setupIncotermMultiSelect(incotermSellerSelect, "seller");
setupIncotermMultiSelect(incotermBuyerSelect, "buyer");


  // Fonction de synchronisation incoterms
  function synchronizeIncoterms(sourceSelect, targetSelect) {
    const selectedOptions = [...sourceSelect.options].filter(opt => opt.selected);
    [...targetSelect.options].forEach(opt => opt.selected = false);
    selectedOptions.forEach(opt => {
      const match = [...targetSelect.options].find(o => o.value === opt.value);
      if (match) match.selected = true;
    });
  }


// Injection des filtres pour Clause Category
clauseCategories.forEach(cat => {
  const el = document.createElement("div");
  el.className = "dropdown-item";

  // Crée une checkbox visuelle
  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.checked = selectedCategories.has(cat);
  checkbox.style.marginRight = "8px";

  const label = document.createElement("span");
  label.textContent = cat;

  el.appendChild(checkbox);
  el.appendChild(label);

  el.addEventListener("click", () => {
    if (selectedCategories.has(cat)) {
      selectedCategories.delete(cat);
      checkbox.checked = false;
    } else {
      selectedCategories.add(cat);
      checkbox.checked = true;
    }

    document.getElementById("categoryLabel").innerText =
      selectedCategories.size ? `Selected: ${selectedCategories.size}` : "Select Category";
    updateDisplay();
  });

  clauseCategoryContainer.appendChild(el);
});


// Injection des filtres pour Clause Type
clauseTypes.forEach(type => {
  const el = document.createElement("div");
  el.className = "dropdown-item";

  // Crée une checkbox visuelle
  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.checked = selectedClauseTypes.has(type);
  checkbox.style.marginRight = "8px";

  const label = document.createElement("span");
  label.textContent = type;

  el.appendChild(checkbox);
  el.appendChild(label);

  el.addEventListener("click", () => {
    if (selectedClauseTypes.has(type)) {
      selectedClauseTypes.delete(type);
      checkbox.checked = false;
    } else {
      selectedClauseTypes.add(type);
      checkbox.checked = true;
    }

    document.getElementById("clauseTypeLabel").innerText =
      selectedClauseTypes.size ? `Selected: ${selectedClauseTypes.size}` : "Select Clause Type";

    updateDisplay();
  });

  clauseTypeContainer.appendChild(el);
});

setupDropdownToggle(categoryLabel, clauseCategoryContainer);
setupDropdownToggle(clauseTypeLabel, clauseTypeContainer);
// Severity 
["1", "2", "3", "4"].forEach(level => {
  const label = getLabelFromSeverity(level);

  const btnSeller = document.getElementById(`${label}Seller`);
  if (btnSeller) {
    btnSeller.addEventListener("click", () => toggleSeverity("Seller", level));
  }

  const btnBuyer = document.getElementById(`${label}Buyer`);
  if (btnBuyer) {
    btnBuyer.addEventListener("click", () => toggleSeverity("Buyer", level));
  }
});



}

  function updateDisplay() {
    const normalize = str => (str || "").trim().toLowerCase();
    const gtcA = normalize(document.getElementById("gtcASelect").value);
    const gtcB = normalize(document.getElementById("gtcBSelect").value);

    const incotermSellerValues = Array.from(document.getElementById("incotermSellerSelect").selectedOptions).map(opt => opt.value.toUpperCase());
    const incotermBuyerValues = Array.from(document.getElementById("incotermBuyerSelect").selectedOptions).map(opt => opt.value.toUpperCase());

    const filteredA = gtcA ? data.filter(d =>
      normalize(d.GTCs) === gtcA &&
      d["Buy/Sell"].trim().toUpperCase() === "SELL" &&
      (!filterBackToBack || isNotBackToBack(d)) &&
      (matchIncoterm(d.Incoterm, incotermSellerValues) || matchIncotermInContent(d, incotermSellerValues)) &&
      (selectedClauseTypes.size === 0 || selectedClauseTypes.has(d["Clause Type"])) &&
      (selectedCategories.size === 0 || selectedCategories.has(d["Clause Category"])) &&
      (selectedSeveritySeller.size === 0 || selectedSeveritySeller.has(normalizeSeverityNum(d["Severity Seller"])))
    ) : [];

    const filteredB = gtcB ? data.filter(d =>
      normalize(d.GTCs) === gtcB &&
      d["Buy/Sell"].trim().toUpperCase() === "BUY" &&
      (!filterBackToBack || isNotBackToBack(d)) &&
      (matchIncoterm(d.Incoterm, incotermBuyerValues) || matchIncotermInContent(d, incotermBuyerValues)) &&
      (selectedClauseTypes.size === 0 || selectedClauseTypes.has(d["Clause Type"])) &&
      (selectedCategories.size === 0 || selectedCategories.has(d["Clause Category"])) &&
      (selectedSeverityBuyer.size === 0 || selectedSeverityBuyer.has(normalizeSeverityNum(d["Severity Buyer"])))
    ) : [];


    let keys = new Set();

    if (filteredA.length > 0 || filteredB.length > 0) {
      filteredA.forEach(d => keys.add(d["Clause Type"]));
      filteredB.forEach(d => keys.add(d["Clause Type"]));
    } else {
      if (gtcA || gtcB) {
        data.forEach(d => {
          if ((gtcA && normalize(d.GTCs) === gtcA && d["Buy/Sell"].toUpperCase() === "SELL") ||
              (gtcB && normalize(d.GTCs) === gtcB && d["Buy/Sell"].toUpperCase() === "BUY")) {
            keys.add(d["Clause Type"]);
          }
        });
      }
    }

    console.log("🔍 GTC Seller sélectionné :", gtcA);
    console.log("🧩 Clauses filtrées SELL :", filteredA.map(d => d["Clause Type"]));
    console.log("📦 Clauses affichées :", Array.from(keys));

    const body = document.querySelector(".comparison-body");
    body.innerHTML = "";

    const rawA = (filteredA.length === 0 && gtcA) ? data.filter(d => normalize(d.GTCs) === gtcA && d["Buy/Sell"].toUpperCase() === "SELL") : filteredA;
    const rawB = (filteredB.length === 0 && gtcB) ? data.filter(d => normalize(d.GTCs) === gtcB && d["Buy/Sell"].toUpperCase() === "BUY") : filteredB;

    // 🎯 ENHANCED SORTING: Sort by severity for better color grouping
    const sortBySeverity = (a, b) => {
      const severityA = severityValue(a["Severity Seller"] || a["Severity Buyer"]);
      const severityB = severityValue(b["Severity Seller"] || b["Severity Buyer"]);
      return severityA - severityB;
    };

    // Sort both arrays by severity for color grouping
    filteredA.sort(sortBySeverity);
    filteredB.sort(sortBySeverity);

    rawA.splice(0, rawA.length, ...filteredA);
    rawB.splice(0, rawB.length, ...filteredB);

    // 🎯 ENHANCED: Create severity-grouped display
    const severityGroups = new Map();
    
    keys.forEach(clause => {
      const riskA = rawA.find(d => d["Clause Type"] === clause);
      const riskB = rawB.find(d => d["Clause Type"] === clause);

      const severityA = riskA ? normalizeSeverityNum(riskA["Severity Seller"]) : "";
      const severityB = riskB ? normalizeSeverityNum(riskB["Severity Buyer"]) : "";
      
      // Determine the highest priority severity for grouping
      const groupSeverity = Math.min(
        severityA ? parseInt(severityA) : 99,
        severityB ? parseInt(severityB) : 99
      );

      if (!severityGroups.has(groupSeverity)) {
        severityGroups.set(groupSeverity, []);
      }
      
      severityGroups.get(groupSeverity).push({
        clause,
        riskA,
        riskB,
        severityA,
        severityB
      });
    });

    // 🎯 DISPLAY: Show grouped results with severity headers
    const sortedSeverities = Array.from(severityGroups.keys()).sort((a, b) => a - b);
    
    sortedSeverities.forEach(severity => {
      // Add severity group header
      if (severityGroups.get(severity).length > 0 && (gtcA || gtcB)) {
        const severityHeader = document.createElement("div");
        severityHeader.className = "severity-group-header";
        const severityLabel = getSeverityDisplayLabel(severity);
        const severityColor = getSeverityColor(severity);
        severityHeader.innerHTML = `
          <div class="severity-group-indicator" style="background-color: ${severityColor}"></div>
          <span class="severity-group-title">${severityLabel} Risk Items (${severityGroups.get(severity).length})</span>
        `;
        body.appendChild(severityHeader);
      }

      // Add clauses in this severity group
      severityGroups.get(severity).forEach(({ clause, riskA, riskB, severityA, severityB }) => {
        const row = document.createElement("div");
        row.className = "row";
        row.setAttribute("data-severity-a", severityA);
        row.setAttribute("data-severity-b", severityB);
        row.setAttribute("data-group-severity", severity);

        const cellA = createCell(riskA, "seller", severityA);
        const cellB = createCell(riskB, "buyer", severityB);

        const cellClause = document.createElement("div");
        cellClause.className = "cell clause clickable";
        cellClause.innerHTML = `<strong>${clause}</strong>`;
        cellClause.addEventListener("click", () => {
          if (selectedClauseTypes.has(clause)) {
            selectedClauseTypes.delete(clause);
          } else {
            selectedClauseTypes.clear();
            selectedClauseTypes.add(clause);
          }
          document.getElementById("clauseTypeLabel").innerText = selectedClauseTypes.size ? `Selected: ${selectedClauseTypes.size}` : "Select Clause Type";
          updateDisplay();
        });

        // 📝 Zone des boutons copy dans le gap
        const copyZone = document.createElement("div");
        copyZone.className = "row-copy-zone";
        
        // Bouton copy pour Buyer (gauche)
        if (cellB.copyData) {
          const copyBtnB = createCopyButton(cellB.copyData.text, 'buyer');
          copyZone.appendChild(copyBtnB);
        }
        
        // Bouton copy pour Seller (droite)  
        if (cellA.copyData) {
          const copyBtnA = createCopyButton(cellA.copyData.text, 'seller');
          copyZone.appendChild(copyBtnA);
        }

        row.appendChild(cellB);
        if (cellB.copyData || cellA.copyData) {
          row.appendChild(copyZone);
        }
        row.appendChild(cellClause);
        row.appendChild(cellA);
        body.appendChild(row);
      });
    });

    if (body.children.length === 0) {
      const emptyRow = document.createElement("div");
      emptyRow.className = "row";
      emptyRow.innerHTML = `<div class="cell" style="text-align:center; width: 100%;">No clauses match your filters.</div>`;
      body.appendChild(emptyRow);
    }

    lucide.createIcons();
    generateAmendmentSummary([...filteredA, ...filteredB]);
  }  

  function createCell(risk, side, severity) {
    const cell = document.createElement("div");
    cell.className = `cell ${side} tooltip-container`;

    if (!risk) return cell;

    const amendment = (risk["Abbreviated Amendment"] || "").trim();
    const riskDescription = (risk["Risk Description"] || "").trim();
    const displayText = risk["Content of the clause"] || "";

    const isValidAmendment = amendment && !isEmptyValue(amendment);
    const isValidRiskDescription = riskDescription && !isEmptyValue(riskDescription);
    const isValidDisplayText = displayText && !isEmptyValue(displayText);
    const cleanedAmendment = isValidAmendment ? cleanAmendmentText(amendment) : "";
    
    // 🚢 Obtenir les Incoterms sélectionnés pour le filtrage
    const selectedIncotermValues = side === 'seller' 
      ? Array.from(document.getElementById("incotermSellerSelect").selectedOptions).map(opt => opt.value.toUpperCase())
      : Array.from(document.getElementById("incotermBuyerSelect").selectedOptions).map(opt => opt.value.toUpperCase());

    if (isValidDisplayText) {
      const container = document.createElement("div");
      container.className = "content-container";
      
      // 📝 Filtrer le texte selon les Incoterms sélectionnés
      const filteredDisplayText = filterTextByIncoterms(displayText, selectedIncotermValues);
      const filteredAmendment = filterTextByIncoterms(cleanedAmendment, selectedIncotermValues);
      
      // Debug pour vérifier le filtrage
      debugIncotermFilter(displayText, selectedIncotermValues, filteredDisplayText);
      debugIncotermFilter(cleanedAmendment, selectedIncotermValues, filteredAmendment);
      
      // 🚢 Détecter les Incoterms dans le contenu filtré
      const allContent = [filteredDisplayText, filteredAmendment, riskDescription].join(" ");
      const detectedIncoterms = detectIncoterms(allContent);
      
      // Afficher les Incoterms détectés (seulement ceux qui correspondent aux sélections)
      const relevantIncoterms = selectedIncotermValues.length > 0 
        ? detectedIncoterms.filter(term => selectedIncotermValues.includes(term))
        : detectedIncoterms;
        
      if (relevantIncoterms.length > 0) {
        const incotermTags = document.createElement("div");
        incotermTags.className = "incoterm-tags";
        relevantIncoterms.forEach(incoterm => {
          const tag = document.createElement("span");
          tag.className = "incoterm-tag";
          tag.textContent = incoterm;
          incotermTags.appendChild(tag);
        });
        container.appendChild(incotermTags);
      }
      
      const anchor = document.createElement("span");
      anchor.className = "tooltip-anchor";
      anchor.textContent = filteredDisplayText;

      if (isValidRiskDescription || filteredAmendment) {
        const tooltip = document.createElement("div");
        tooltip.className = "tooltip-box";
        tooltip.innerHTML = `
          ${relevantIncoterms.length > 0 ? `<div class="tooltip-incoterms"><strong>🚢 Incoterms:</strong> ${relevantIncoterms.join(', ')}</div>` : ""}
          ${isValidRiskDescription ? `<div class="tooltip-risk">${riskDescription}</div>` : ""}
          ${filteredAmendment ? `<div class="tooltip-amendment"><strong>Special Condition:</strong> ${filteredAmendment}</div>` : ""}
        `;
        anchor.appendChild(tooltip);
      }

      container.appendChild(anchor);
      cell.appendChild(container);
    } else if (cleanedAmendment || isValidRiskDescription) {
      // Si pas de contenu principal mais amendment/description existe
      const placeholder = document.createElement("span");
      placeholder.className = "tooltip-anchor empty-content";
      placeholder.textContent = "Voir détails";
      
      const tooltip = document.createElement("div");
      tooltip.className = "tooltip-box";
      tooltip.innerHTML = `
        ${isValidRiskDescription ? `<div class="tooltip-risk">${riskDescription}</div>` : ""}
        ${cleanedAmendment ? `<div class="tooltip-amendment"><strong>Condition Spéciale:</strong> ${cleanedAmendment}</div>` : ""}
      `;
      placeholder.appendChild(tooltip);
      cell.appendChild(placeholder);
    }

    // Stocker les données copy pour la gestion dans la row (avec le texte filtré)
    const finalAmendmentText = selectedIncotermValues.length > 0 ? filteredAmendment : cleanedAmendment;
    if (finalAmendmentText) {
      cell.copyData = {
        text: finalAmendmentText,
        side: side
      };
    }

    if (severity) {
      const indicator = document.createElement("div");
      indicator.className = `severity-indicator ${getSeverityLabel(severity)}`;
      cell.insertBefore(indicator, cell.firstChild);
    }

    return cell;
  }




  function generateAmendmentSummary(dataRows) {
    // 🏢 Groupement par département/catégorie
    const sellerByDepartment = {};
    const buyerByDepartment = {};

    dataRows.forEach(row => {
      let amendment = row["Abbreviated Amendment"]?.trim();
      if (!amendment || isEmptyValue(amendment)) return;

      const department = row["Clause Category"] || "Autres";
      const clauseType = row["Clause Type"] || "Clause inconnue";
      const cleanedAmendment = cleanAmendmentText(amendment);
      
      if (!cleanedAmendment) return;

      const formattedAmendment = `- ${cleanedAmendment}`;

      if (row["Buy/Sell"] === "Sell") {
        if (!sellerByDepartment[department]) sellerByDepartment[department] = [];
        sellerByDepartment[department].push(formattedAmendment);
      }
      
      if (row["Buy/Sell"] === "Buy") {
        if (!buyerByDepartment[department]) buyerByDepartment[department] = [];
        buyerByDepartment[department].push(formattedAmendment);
      }
    });

    // 📝 Format HTML par département
    function formatByDepartment(dataByDept) {
      let html = "";
      Object.keys(dataByDept).sort().forEach(dept => {
        html += `<div class="department-section">`;
        html += `<div class="department-header">${dept}</div>`;
        dataByDept[dept].forEach(amendment => {
          html += `<div class="amendment-item">${amendment}</div>`;
        });
        html += `</div><br>`;
      });
      return html;
    }

    const sellerHTML = formatByDepartment(sellerByDepartment);
    const buyerHTML = formatByDepartment(buyerByDepartment);

    ["Top", "Bottom"].forEach(pos => {
      const sellEl = document.getElementById(`amendmentSummarySell${pos}`);
      const buyEl = document.getElementById(`amendmentSummaryBuy${pos}`);
      if (sellEl) sellEl.innerHTML = sellerHTML;
      if (buyEl) buyEl.innerHTML = buyerHTML;
    });
  }



  // 🧹 Fonction pour vérifier si une valeur est vide ou inutile
  function isEmptyValue(value) {
    if (!value) return true;
    const cleanValue = value.toString().toLowerCase().trim();
    const emptyValues = ['nan', 'n/a', 'na', '-', '/', '', 'null', 'undefined', 'none'];
    return emptyValues.includes(cleanValue);
  }

  // 🚢 Fonction pour détecter les Incoterms dans le texte
  function detectIncoterms(text) {
    if (!text || isEmptyValue(text)) return [];
    
    const incoterms = ['CIF', 'CFR', 'DAP', 'FOB'];
    const detectedIncoterms = [];
    
    // Pattern pour détecter les Incoterms avec différents formats
    // Ex: "CIF:", "CIF/CFR:", "(CIF):", "DAP :", etc.
    const pattern = /\b(CIF|CFR|DAP|FOB)(?:\/([CIF|CFR|DAP|FOB]+))*\s*[\(\)]?\s*:/gi;
    
    let match;
    while ((match = pattern.exec(text)) !== null) {
      const mainTerm = match[1].toUpperCase();
      if (incoterms.includes(mainTerm) && !detectedIncoterms.includes(mainTerm)) {
        detectedIncoterms.push(mainTerm);
      }
      
      // Si il y a des termes séparés par /
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

  // 📝 Extraire le texte spécifique à un Incoterm
  function extractIncotermText(text, incoterm) {
    if (!text || isEmptyValue(text)) return '';
    
    // Pattern pour capturer le texte après un Incoterm spécifique
    const pattern = new RegExp(`\\b${incoterm}(?:\\/[A-Z]+)*\\s*[\\(\\)]?\\s*:([^\\n]*(?:\\n(?!\\b(?:CIF|CFR|DAP|FOB))[^\\n]*)*)`);
    const match = text.match(pattern);
    
    return match ? match[1].trim() : '';
  }

  // 🔍 Debug: Log pour vérifier le filtrage des Incoterms
  function debugIncotermFilter(text, selectedIncoterms, filteredText) {
    if (text !== filteredText) {
      console.log('🚢 Filtrage Incoterm:', {
        original: text,
        selected: selectedIncoterms,
        filtered: filteredText
      });
    }
  }

  // 🤖 Intelligence AI pour l'analyse des clauses
  function analyzeClauseWithAI(clauseText, clauseType) {
    if (!clauseText || isEmptyValue(clauseText)) return null;
    
    const analysis = {
      summary: generateClauseSummary(clauseText, clauseType),
      detectedRisk: detectRiskLevel(clauseText),
      keywords: extractKeywords(clauseText, clauseType)
    };
    
    return analysis;
  }

  function generateClauseSummary(text, type) {
    const lowerText = text.toLowerCase();
    const lowerType = (type || "").toLowerCase();
    
    // Patterns pour résumer intelligemment
    if (lowerType.includes('payment') || lowerText.includes('payment') || lowerText.includes('credit')) {
      return "Conditions de paiement et crédit";
    }
    if (lowerType.includes('delivery') || lowerText.includes('delivery') || lowerText.includes('shipping')) {
      return "Modalités de livraison";
    }
    if (lowerType.includes('insurance') || lowerText.includes('insurance')) {
      return "Couverture d'assurance";
    }
    if (lowerType.includes('liability') || lowerText.includes('liability')) {
      return "Responsabilité et limitations";
    }
    if (lowerType.includes('force majeure') || lowerText.includes('force majeure')) {
      return "Cas de force majeure";
    }
    if (lowerType.includes('sts') || lowerText.includes('ship to ship')) {
      return "Opérations navire-à-navire";
    }
    
    // Résumé générique basé sur les premiers mots
    const words = text.split(' ').slice(0, 6).join(' ');
    return words.length > 50 ? words.substring(0, 47) + "..." : words;
  }

  function detectRiskLevel(text) {
    const lowerText = text.toLowerCase();
    
    // Mots-clés haute priorité (risque élevé)
    const highRiskKeywords = ['unlimited', 'liability', 'penalty', 'termination', 'breach', 'default', 'force majeure exclusion'];
    const moderateRiskKeywords = ['limitation', 'caps', 'reasonable', 'standard', 'typical'];
    const lowRiskKeywords = ['administrative', 'notification', 'routine', 'standard practice'];
    
    const highRiskCount = highRiskKeywords.filter(keyword => lowerText.includes(keyword)).length;
    const moderateRiskCount = moderateRiskKeywords.filter(keyword => lowerText.includes(keyword)).length;
    const lowRiskCount = lowRiskKeywords.filter(keyword => lowerText.includes(keyword)).length;
    
    if (highRiskCount > 0) return "1"; // High
    if (moderateRiskCount > 0) return "2"; // Moderate
    if (lowRiskCount > 0) return "3"; // Low
    
    return "4"; // Informative par défaut
  }

  function extractKeywords(text, type) {
    const keywords = [];
    const lowerText = text.toLowerCase();
    
    // Tags basés sur le contenu
    const keywordMap = {
      'Payment': ['payment', 'credit', 'invoice', 'billing', 'financial'],
      'Shipping': ['delivery', 'transport', 'vessel', 'cargo', 'shipping'],
      'Insurance': ['insurance', 'coverage', 'claim', 'risk coverage'],
      'Legal': ['liability', 'breach', 'contract', 'legal', 'compliance'],
      'Operational': ['operation', 'procedure', 'process', 'technical'],
      'Time': ['timeline', 'deadline', 'duration', 'period', 'delay']
    };
    
    for (const [tag, words] of Object.entries(keywordMap)) {
      if (words.some(word => lowerText.includes(word))) {
        keywords.push(tag);
      }
    }
    
    return keywords;
  }

  function cleanAmendmentText(text) {
    if (isEmptyValue(text)) return "";
    return text
      .replace(/^[-–—]?\s*/i, '') // Supprime les tirets initiaux
      .replace(/\bwhen\s+(we|i)\s+(buy|sell)\b[:,]?\s*/gi, '') // Supprime les phrases types
      .trim();
  }







}); // 👈 CEC

function toggleSummary(button) {
  const pre = button.closest(".amendment-box").querySelector("pre");
  const currentMaxHeight = getComputedStyle(pre).maxHeight;
  const isCollapsed = currentMaxHeight !== "none" && currentMaxHeight !== "0px";

  if (isCollapsed) {
    pre.style.maxHeight = "none";
    button.innerHTML = '<i data-lucide="chevron-up"></i> Collapse';
  } else {
    pre.style.maxHeight = "4.5em";
    button.innerHTML = '<i data-lucide="chevron-down"></i> ';
  }

  lucide.createIcons();
}


function copyAllAmendments(side) {
  const pre = document.getElementById(`amendmentSummary${side === 'seller' ? 'Sell' : 'Buy'}Top`);
  
  // 📝 Formater le texte pour la copie avec headers et bullet points
  let formattedText = `===== AMENDEMENTS ${side.toUpperCase()} =====\n\n`;
  
  // Récupérer les sections par département
  const departments = pre.querySelectorAll('.department-section');
  
  departments.forEach(section => {
    const header = section.querySelector('.department-header');
    const items = section.querySelectorAll('.amendment-item');
    
    if (header && items.length > 0) {
      // Header de département en gras
      formattedText += `${header.textContent.toUpperCase()}\n`;
      formattedText += '='.repeat(header.textContent.length) + '\n\n';
      
      // Items en bullet points
      items.forEach(item => {
        const text = item.textContent.trim();
        if (text) {
          formattedText += `• ${text}\n`;
        }
      });
      
      formattedText += '\n';
    }
  });
  
  // Si pas de sections trouvées, utiliser le texte brut
  if (departments.length === 0) {
    formattedText += pre.textContent || 'Aucun amendement disponible.';
  }

  // Copier dans le presse-papiers
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(formattedText).then(() => {
      console.log('✅ Amendements copiés au format structuré');
    });
  } else {
    const textArea = document.createElement("textarea");
    textArea.value = formattedText;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand("copy");
    document.body.removeChild(textArea);
  }
}

// 🎯 NEW: Helper functions for enhanced sorting and display
function getSeverityDisplayLabel(severity) {
  const labels = {
    1: "🔴 High",
    2: "🟡 Moderate", 
    3: "🟢 Low",
    4: "🔵 Informative"
  };
  return labels[severity] || "⚪ Unknown";
}

function getSeverityColor(severity) {
  const colors = {
    1: "#e74c3c",  // Red
    2: "#e6c222",  // Yellow
    3: "#16f10f",  // Green
    4: "#3498db"   // Blue
  };
  return colors[severity] || "#95a5a6";
}

function createCopyButton(text, side) {
  const copyBtn = document.createElement("button");
  copyBtn.className = `copy-icon gap-copy ${side}-copy`;
  copyBtn.type = "button";
  copyBtn.title = `Copier amendment ${side}`;
  copyBtn.innerHTML = `<i data-lucide="copy"></i><span>${side === 'buyer' ? 'B' : 'S'}</span>`;
  copyBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    copyToClipboard(text, copyBtn);
  });
  return copyBtn;
}

function getRiskRecommendation(riskLevel) {
  const recommendations = {
    "1": "⚠️ Attention immédiate requise. Consultez l'équipe juridique avant signature.",
    "2": "📋 Révision recommandée. Vérifiez les implications opérationnelles.",
    "3": "✅ Risque acceptable. Procédures standard suffisantes.",
    "4": "ℹ️ Information uniquement. Aucune action particulière requise."
  };
  return recommendations[riskLevel] || "Évaluation manuelle recommandée.";
}

// 🤖 CHATBOT FUNCTIONALITY
function initializeChatbot() {
  console.log('🤖 Initialisation du chatbot...');
  
  const chatbotFab = document.getElementById('chatbot-fab');
  const chatbotContainer = document.getElementById('chatbot-container');
  const chatbotToggle = document.getElementById('chatbot-toggle');
  const chatbotInput = document.getElementById('chatbot-input');
  const chatbotSend = document.getElementById('chatbot-send');
  const chatbotMessages = document.getElementById('chatbot-messages');
  const quickActionBtns = document.querySelectorAll('.quick-action-btn');

  // Vérifications de sécurité
  if (!chatbotFab || !chatbotContainer || !chatbotToggle || !chatbotInput || !chatbotSend || !chatbotMessages) {
    console.error('❌ Éléments du chatbot non trouvés:', {
      fab: !!chatbotFab,
      container: !!chatbotContainer,
      toggle: !!chatbotToggle,
      input: !!chatbotInput,
      send: !!chatbotSend,
      messages: !!chatbotMessages
    });
    return;
  }

  console.log('✅ Tous les éléments du chatbot trouvés');
  let chatbotVisible = false;

  // Toggle chatbot visibility
  function toggleChatbot() {
    console.log('🔄 Toggle chatbot, état actuel:', chatbotVisible);
    chatbotVisible = !chatbotVisible;
    chatbotContainer.classList.toggle('active', chatbotVisible);
    console.log('🔄 Nouvel état:', chatbotVisible);
    
    if (chatbotVisible) {
      console.log('👁️ Chatbot ouvert, focus sur input');
      setTimeout(() => chatbotInput.focus(), 100);
      // Hide notification after opening
      const notification = document.querySelector('.chatbot-notification');
      if (notification) {
        notification.style.display = 'none';
      }
    }
  }

  // Event listeners avec debug
  console.log('🔗 Ajout des event listeners...');
  
  chatbotFab.addEventListener('click', (e) => {
    console.log('🔵 Clic sur FAB');
    e.preventDefault();
    toggleChatbot();
  });
  
  chatbotToggle.addEventListener('click', (e) => {
    console.log('🔘 Clic sur Toggle');
    e.preventDefault();
    toggleChatbot();
  });

  // Quick action buttons
  quickActionBtns.forEach((btn, index) => {
    console.log(`🚀 Quick action button ${index}:`, btn);
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const query = btn.getAttribute('data-query');
      console.log('🏃 Quick action:', query);
      handleUserMessage(query);
    });
  });

  // Send message on button click
  chatbotSend.addEventListener('click', (e) => {
    console.log('📤 Clic sur Send');
    e.preventDefault();
    const message = chatbotInput.value.trim();
    if (message) {
      handleUserMessage(message);
      chatbotInput.value = '';
    }
  });

  // Send message on Enter key
  chatbotInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      console.log('⌨️ Enter pressé');
      e.preventDefault();
      const message = chatbotInput.value.trim();
      if (message) {
        handleUserMessage(message);
        chatbotInput.value = '';
      }
    }
  });
  
  console.log('✅ Event listeners ajoutés avec succès');

  // Handle user messages
  async function handleUserMessage(message) {
    console.log('📤 Message utilisateur:', message);
    addMessage(message, 'user');
    
    // Vérifier si on a une API configurée pour une vraie conversation
    const config = JSON.parse(sessionStorage.getItem('ai_config') || '{}');
    
    if (config.apiKey && message.toLowerCase().includes('ai:')) {
      // Mode conversation AI réelle
      const aiMessage = message.replace(/ai:/i, '').trim();
      try {
        addMessage('🤖 Consultation de l\'IA en cours...', 'bot');
        const aiResponse = await callAIAPI(aiMessage);
        // Remplacer le message de chargement
        const messages = document.querySelectorAll('.bot-message');
        const lastMessage = messages[messages.length - 1];
        if (lastMessage) {
          lastMessage.querySelector('.message-content').innerHTML = `<p><strong>🤖 Réponse IA :</strong></p><p>${aiResponse}</p>`;
        }
      } catch (error) {
        addMessage(`❌ Erreur API : ${error.message}. Essayez "config" pour configurer l'API.`, 'bot');
      }
    } else {
      // Mode réponses locales classiques
      setTimeout(() => {
        const response = generateBotResponse(message);
        console.log('🤖 Réponse bot:', response);
        addMessage(response, 'bot');
      }, 500);
    }
  }

  // Add message to chat
  function addMessage(content, sender) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}-message`;
    
    const avatar = document.createElement('div');
    avatar.className = 'message-avatar';
    avatar.textContent = sender === 'user' ? '👤' : '🤖';
    
    const messageContent = document.createElement('div');
    messageContent.className = 'message-content';
    
    if (typeof content === 'string') {
      messageContent.innerHTML = content.replace(/\n/g, '<br>');
    } else {
      messageContent.appendChild(content);
    }
    
    messageDiv.appendChild(avatar);
    messageDiv.appendChild(messageContent);
    chatbotMessages.appendChild(messageDiv);
    
    // Scroll to bottom
    chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
  }

  // Generate bot responses based on user input
  function generateBotResponse(message) {
    console.log('🤖 Génération de réponse pour:', message);
    
    try {
      const lowerMessage = message.toLowerCase();
      
      // Configuration API
      if (lowerMessage.includes('config') || lowerMessage.includes('api') || lowerMessage.includes('clé')) {
        setupAPIKey();
        return '<p>🔑 Configuration de l\'API ouverte ! Pour utiliser l\'IA avancée, tapez "ai: votre question" après avoir configuré votre clé.</p>';
      }

      // Test simple first
      if (lowerMessage.includes('test') || lowerMessage.includes('hello') || lowerMessage.includes('salut')) {
        const config = JSON.parse(sessionStorage.getItem('ai_config') || '{}');
        const apiStatus = config.apiKey ? '✅ API configurée' : '❌ API non configurée (tapez "config")';
        return `<p>🤖 Chatbot opérationnel ! ${apiStatus}</p><p>Pour une IA avancée, tapez "ai: votre question"</p>`;
      }
      
      // Risk severity explanations
      if (lowerMessage.includes('high risk') || lowerMessage.includes('red') || lowerMessage.includes('risque élevé')) {
        return '<p><strong>🔴 Risque Élevé</strong></p><p>Les clauses à risque élevé nécessitent une attention immédiate et une évaluation approfondie par les équipes juridiques et commerciales.</p>';
      }

      if (lowerMessage.includes('moderate risk') || lowerMessage.includes('yellow') || lowerMessage.includes('risque modéré')) {
        return '<p><strong>🟡 Risque Modéré</strong></p><p>Les clauses à risque modéré nécessitent un examen attentif mais sont généralement gérables avec les pratiques commerciales standard.</p>';
      }

      if (lowerMessage.includes('low risk') || lowerMessage.includes('green') || lowerMessage.includes('risque faible')) {
        return '<p><strong>🟢 Risque Faible</strong></p><p>Les clauses à risque faible sont généralement acceptables avec un impact minimal sur les opérations.</p>';
      }

      if (lowerMessage.includes('informative') || lowerMessage.includes('blue') || lowerMessage.includes('informatif')) {
        return '<p><strong>🔵 Informatif</strong></p><p>Les éléments informatifs sont fournis pour information et contexte uniquement.</p>';
      }

      // Back to Back explanations
      if (lowerMessage.includes('back to back') || lowerMessage.includes('b2b') || lowerMessage.includes('dos-à-dos')) {
        return '<p><strong>🔄 Contrats Dos-à-Dos</strong></p><p>Utiliser les mêmes GTC et Incoterms pour l\'achat et la vente afin de minimiser les risques en alignant les termes contractuels.</p>';
      }

      // GTC explanations
      if (lowerMessage.includes('gtc') || lowerMessage.includes('general terms')) {
        return '<p><strong>📋 Conditions Générales (GTCs)</strong></p><p>Les GTCs sont des modèles de contrats standardisés qui définissent les obligations, droits et procédures générales.</p>';
      }

      // Incoterms explanations
      if (lowerMessage.includes('incoterm') || lowerMessage.includes('fob') || lowerMessage.includes('cif') || lowerMessage.includes('dap')) {
        return '<p><strong>🚢 Incoterms</strong></p><p>Les Incoterms définissent la répartition des coûts, risques et responsabilités. FOB, CIF, CFR, DAP ont des points de transfert de risque différents.</p>';
      }

      // Amendment guidance
      if (lowerMessage.includes('amendment') || lowerMessage.includes('amendement') || lowerMessage.includes('condition spéciale')) {
        return '<p><strong>📝 Amendements de Contrat</strong></p><p>Les amendements modifient les termes GTC standards pour adresser des risques spécifiques. Utilisez les boutons de copie intégrés.</p>';
      }

      // How to use the tool
      if (lowerMessage.includes('help') || lowerMessage.includes('aide') || lowerMessage.includes('comment')) {
        return '<p><strong>🎯 Comment Utiliser cet Outil</strong></p><p>1. Sélectionnez vos GTCs<br>2. Choisissez les Incoterms<br>3. Filtrez par niveau de risque<br>4. Examinez les clauses<br>5. Copiez les amendements</p>';
      }

      // 🤖 Analyse intelligente des clauses
      if (lowerMessage.includes('analyse') || lowerMessage.includes('analyser')) {
        return '<p><strong>🤖 Analyse de Clause</strong></p><p>Copiez le texte d\'une clause dans le chat et je pourrai vous fournir:</p><ul><li>Un résumé intelligent</li><li>Une évaluation du niveau de risque</li><li>Des mots-clés thématiques</li><li>Des recommandations</li></ul>';
      }

      // Si le message semble être une clause à analyser (texte long)
      if (message.length > 50 && !lowerMessage.includes('comment') && !lowerMessage.includes('aide')) {
        const analysis = analyzeClauseWithAI(message, 'Manuel');
        if (analysis) {
          return `<p><strong>🤖 Analyse de votre clause:</strong></p>
          <p><strong>Résumé:</strong> ${analysis.summary}</p>
          <p><strong>Niveau de risque détecté:</strong> ${getSeverityDisplayLabel(analysis.detectedRisk)}</p>
          <p><strong>Mots-clés:</strong> ${analysis.keywords.join(', ')}</p>
          <p><strong>Recommandation:</strong> ${getRiskRecommendation(analysis.detectedRisk)}</p>`;
        }
      }

      // Default response for unrecognized queries
      return `<p>Je comprends que vous demandez: "<em>${message}</em>"</p>
      <p>Je peux vous aider avec:</p>
      <ul>
        <li>🔴 Niveaux de risque (Élevé, Modéré, Faible, Informatif)</li>
        <li>📋 Comparaisons de GTC et implications</li>
        <li>🚢 Explications Incoterms (FOB, CIF, CFR, DAP)</li>
        <li>🔄 Stratégies de contrats dos-à-dos</li>
        <li>📝 Guide des amendements et conditions spéciales</li>
        <li>🎯 Comment utiliser cet outil d'analyse des risques</li>
        <li>🤖 Analyse intelligente de clauses (copiez le texte d\'une clause)</li>
      </ul>
      <p>Essayez de poser une question sur ces sujets, ou utilisez les boutons d'action rapide!</p>`;
    } catch (error) {
      console.error('❌ Erreur dans generateBotResponse:', error);
      return `<p>Désolé, une erreur s'est produite. Essayez de reformuler votre question.</p>`;
    }
  }

  // 🌐 Configuration API pour ChatGPT/Copilot
  const AI_CONFIG = {
    provider: 'openai', // 'openai' ou 'azure' pour Copilot
    apiKey: '', // À configurer par l'utilisateur
    endpoint: 'https://api.openai.com/v1/chat/completions',
    model: 'gpt-3.5-turbo'
  };

  // 🔑 Fonction pour configurer l'API Key
  function setupAPIKey() {
    const modal = document.createElement('div');
    modal.className = 'api-config-modal';
    modal.innerHTML = `
      <div class="modal-content">
        <h3>🔑 Configuration API IA</h3>
        <p>Pour activer les discussions avec l'IA, configurez votre clé API :</p>
        
        <label>
          <strong>Fournisseur :</strong>
          <select id="aiProvider">
            <option value="openai">OpenAI ChatGPT</option>
            <option value="azure">Microsoft Copilot (Azure)</option>
          </select>
        </label>
        
        <label>
          <strong>Clé API :</strong>
          <input type="password" id="apiKeyInput" placeholder="sk-..." />
        </label>
        
        <label>
          <strong>Endpoint (optionnel) :</strong>
          <input type="text" id="endpointInput" placeholder="https://api.openai.com/v1/chat/completions" />
        </label>
        
        <div class="modal-buttons">
          <button onclick="saveAPIConfig()">💾 Sauvegarder</button>
          <button onclick="closeAPIModal()">❌ Annuler</button>
          <button onclick="testAPIConnection()">🧪 Tester</button>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
  }

  // 💾 Sauvegarder la configuration API
  function saveAPIConfig() {
    const provider = document.getElementById('aiProvider').value;
    const apiKey = document.getElementById('apiKeyInput').value;
    const endpoint = document.getElementById('endpointInput').value;
    
    if (apiKey) {
      AI_CONFIG.provider = provider;
      AI_CONFIG.apiKey = apiKey;
      if (endpoint) AI_CONFIG.endpoint = endpoint;
      
      // Sauvegarde locale sécurisée (session seulement)
      sessionStorage.setItem('ai_config', JSON.stringify(AI_CONFIG));
      
      alert('✅ Configuration sauvegardée pour cette session !');
      closeAPIModal();
    } else {
      alert('❌ Veuillez saisir une clé API valide.');
    }
  }

  // 🧪 Tester la connexion API
  async function testAPIConnection() {
    const apiKey = document.getElementById('apiKeyInput').value;
    if (!apiKey) {
      alert('❌ Veuillez saisir une clé API d\'abord.');
      return;
    }
    
    try {
      const response = await callAIAPI('Hello, test de connexion.', apiKey);
      if (response) {
        alert('✅ Connexion API réussie !');
      } else {
        alert('❌ Échec de la connexion. Vérifiez votre clé API.');
      }
    } catch (error) {
      alert(`❌ Erreur de connexion: ${error.message}`);
    }
  }

  // 🤖 Appel à l'API IA
  async function callAIAPI(message, apiKey = null) {
    const config = JSON.parse(sessionStorage.getItem('ai_config') || '{}');
    const keyToUse = apiKey || config.apiKey || AI_CONFIG.apiKey;
    
    if (!keyToUse) {
      throw new Error('Clé API non configurée');
    }
    
    const requestBody = {
      model: config.model || AI_CONFIG.model,
      messages: [
        {
          role: "system",
          content: "Tu es un assistant expert en analyse de risques contractuels et GTCs. Tu aides les utilisateurs à comprendre et analyser les clauses contractuelles."
        },
        {
          role: "user",
          content: message
        }
      ],
      max_tokens: 500,
      temperature: 0.7
    };
    
    const response = await fetch(config.endpoint || AI_CONFIG.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${keyToUse}`
      },
      body: JSON.stringify(requestBody)
    });
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }
    
    const data = await response.json();
    return data.choices[0]?.message?.content || 'Pas de réponse de l\'IA.';
  }

  function closeAPIModal() {
    const modal = document.querySelector('.api-config-modal');
    if (modal) modal.remove();
  }

  // Rendre les fonctions globales
  window.saveAPIConfig = saveAPIConfig;
  window.closeAPIModal = closeAPIModal;
  window.testAPIConnection = testAPIConnection;
}