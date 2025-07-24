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

  // 🤖 CHATBOT INITIALIZATION
  initializeChatbot();

  fetch("http://portal.dts.corp.local/dpts/contracts/_layouts/15/download.aspx?UniqueId=%7Bb82c6aba%2Dafcc%2D4832%2Dbf94%2D14fc3a832140%7D&Source=http%3A%2F%2Fportal%2Edts%2Ecorp%2Elocal%2Fdpts%2Fcontracts%2FSiteAssets%2FForms%2FAllItems%2Easpx%3FRootFolder%3D%252Fdpts%252Fcontracts%252FSiteAssets%252FGTCS%255FDev%26FolderCTID%3D0x012000D5D1FADBC8861742BDC627451942500C%26View%3D%257B954C25BC%252D2637%252D4D50%252DA01D%252D338BA474858F%257D")
    .then(response => response.json())
    .then(json => {
      data = json;
      initFilters(data);
      updateDisplay();


      // ✅ Appelle Lucide une fois que le DOM a été mis à jour
      lucide.createIcons();
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
  function copyToClipboard(text, button) {

    const textArea = document.createElement("textarea");
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand("copy");
    document.body.removeChild(textArea);

    button.innerHTML = '<i data-lucide="check" class="check-success"></i>';
    lucide.createIcons();

    setTimeout(() => {
      button.innerHTML = '<i data-lucide="clipboard-copy"></i>';
      lucide.createIcons();
    }, 3000);
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
      matchIncoterm(d.Incoterm, incotermSellerValues) &&
      (selectedClauseTypes.size === 0 || selectedClauseTypes.has(d["Clause Type"])) &&
      (selectedCategories.size === 0 || selectedCategories.has(d["Clause Category"])) &&
      (selectedSeveritySeller.size === 0 || selectedSeveritySeller.has(normalizeSeverityNum(d["Severity Seller"])))
    ) : [];

    const filteredB = gtcB ? data.filter(d =>
      normalize(d.GTCs) === gtcB &&
      d["Buy/Sell"].trim().toUpperCase() === "BUY" &&
      (!filterBackToBack || isNotBackToBack(d)) &&
      matchIncoterm(d.Incoterm, incotermBuyerValues) &&
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

        row.appendChild(cellB);
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
    const displayText = risk["Content of the clause"] || "-";

    const isValidAmendment = amendment && amendment.toLowerCase() !== "nan" && amendment !== "/";
    const isValidRiskDescription = riskDescription && riskDescription.toLowerCase() !== "nan";
    const cleanedAmendment = isValidAmendment ? cleanAmendmentText(amendment) : "";

    if (displayText.toLowerCase() !== "nan") {
      const anchor = document.createElement("span");
      anchor.className = "tooltip-anchor";
      anchor.textContent = displayText;

      if (isValidRiskDescription || cleanedAmendment) {
        const tooltip = document.createElement("div");
        tooltip.className = "tooltip-box";
        tooltip.innerHTML = `
          ${isValidRiskDescription ? `<div class="tooltip-risk">${riskDescription}</div>` : ""}
          ${cleanedAmendment ? `<div class="tooltip-amendment"><strong>Special Condition:</strong> ${cleanedAmendment}</div>` : ""}
        `;
        anchor.appendChild(tooltip);
      }

      cell.appendChild(anchor);
    }

    if (cleanedAmendment) {
      const copyBtn = document.createElement("button");
      copyBtn.className = "copy-icon";
      copyBtn.type = "button";
      copyBtn.title = "Copy amendment";
      copyBtn.innerHTML = `<i data-lucide="copy"></i>`;
      copyBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        copyToClipboard(cleanedAmendment, copyBtn);
      });
      cell.appendChild(copyBtn);
    }

    if (severity) {
      const indicator = document.createElement("div");
      indicator.className = `severity-indicator ${getSeverityLabel(severity)}`;
      cell.insertBefore(indicator, cell.firstChild);
    }

    return cell;
  }




  function generateAmendmentSummary(dataRows) {
  let sellerText = "", buyerText = "";

  dataRows.forEach(row => {
    let amendment = row["Abbreviated Amendment"]?.trim();
    if (!amendment || amendment.toLowerCase() === "nan" || amendment === "/") return;

    const clauseTitle = row["Clause"] || row["Clause Type"] || "Untitled";
    amendment = cleanAmendmentText(amendment);
    const formatted = `<strong>${clauseTitle}</strong>: ${amendment}<br><br>`;

    if (row["Buy/Sell"] === "Sell") sellerText += formatted;
    if (row["Buy/Sell"] === "Buy") buyerText += formatted;
  });

  ["Top", "Bottom"].forEach(pos => {
    const sellEl = document.getElementById(`amendmentSummarySell${pos}`);
    const buyEl = document.getElementById(`amendmentSummaryBuy${pos}`);
    if (sellEl) sellEl.innerHTML = sellerText.trim();
    if (buyEl) buyEl.innerHTML = buyerText.trim();
  });
}



  function cleanAmendmentText(text) {
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
  const text = pre.textContent;

  const textArea = document.createElement("textarea");
  textArea.value = text;
  document.body.appendChild(textArea);
  textArea.select();
  document.execCommand("copy");
  document.body.removeChild(textArea);

  // navigator.clipboard.writeText(text).then(() => {
  //   alert("Amendments copiés !");
  // });
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

// 🤖 CHATBOT FUNCTIONALITY
function initializeChatbot() {
  const chatbotFab = document.getElementById('chatbot-fab');
  const chatbotContainer = document.getElementById('chatbot-container');
  const chatbotToggle = document.getElementById('chatbot-toggle');
  const chatbotInput = document.getElementById('chatbot-input');
  const chatbotSend = document.getElementById('chatbot-send');
  const chatbotMessages = document.getElementById('chatbot-messages');
  const quickActionBtns = document.querySelectorAll('.quick-action-btn');

  let chatbotVisible = false;

  // Toggle chatbot visibility
  function toggleChatbot() {
    chatbotVisible = !chatbotVisible;
    chatbotContainer.classList.toggle('active', chatbotVisible);
    
    if (chatbotVisible) {
      chatbotInput.focus();
      // Hide notification after opening
      const notification = document.querySelector('.chatbot-notification');
      if (notification) {
        notification.style.display = 'none';
      }
    }
  }

  // Event listeners
  chatbotFab.addEventListener('click', toggleChatbot);
  chatbotToggle.addEventListener('click', toggleChatbot);

  // Quick action buttons
  quickActionBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const query = btn.getAttribute('data-query');
      handleUserMessage(query);
    });
  });

  // Send message on button click
  chatbotSend.addEventListener('click', () => {
    const message = chatbotInput.value.trim();
    if (message) {
      handleUserMessage(message);
      chatbotInput.value = '';
    }
  });

  // Send message on Enter key
  chatbotInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      const message = chatbotInput.value.trim();
      if (message) {
        handleUserMessage(message);
        chatbotInput.value = '';
      }
    }
  });

  // Handle user messages
  function handleUserMessage(message) {
    addMessage(message, 'user');
    
    // Simulate thinking delay
    setTimeout(() => {
      const response = generateBotResponse(message);
      addMessage(response, 'bot');
    }, 500);
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
    const lowerMessage = message.toLowerCase();
    
    // Risk severity explanations
    if (lowerMessage.includes('high risk') || lowerMessage.includes('red') || lowerMessage.includes('severity 1')) {
      return `
        <p><strong>🔴 High Risk (Level 1)</strong></p>
        <p>High risk clauses require immediate attention and careful consideration:</p>
        <ul>
          <li><strong>Impact:</strong> Could significantly affect contract performance or expose the company to substantial liability</li>
          <li><strong>Action Required:</strong> Should be reviewed by legal and commercial teams</li>
          <li><strong>Examples:</strong> Unlimited liability clauses, force majeure exclusions, critical delivery terms</li>
          <li><strong>Mitigation:</strong> Consider amendments or additional insurance coverage</li>
        </ul>
        <p>Always escalate high-risk clauses to senior management for approval.</p>
      `;
    }

    if (lowerMessage.includes('moderate risk') || lowerMessage.includes('yellow') || lowerMessage.includes('severity 2')) {
      return `
        <p><strong>🟡 Moderate Risk (Level 2)</strong></p>
        <p>Moderate risk clauses need careful review but are generally manageable:</p>
        <ul>
          <li><strong>Impact:</strong> May affect operations but with limited financial exposure</li>
          <li><strong>Action Required:</strong> Review terms and assess mitigation options</li>
          <li><strong>Examples:</strong> Standard liability caps, typical warranty terms, routine compliance requirements</li>
          <li><strong>Mitigation:</strong> Standard business practices usually sufficient</li>
        </ul>
        <p>Document any concerns and ensure operational teams are aware of obligations.</p>
      `;
    }

    if (lowerMessage.includes('low risk') || lowerMessage.includes('green') || lowerMessage.includes('severity 3')) {
      return `
        <p><strong>🟢 Low Risk (Level 3)</strong></p>
        <p>Low risk clauses are generally acceptable with minimal impact:</p>
        <ul>
          <li><strong>Impact:</strong> Minimal effect on operations or financial exposure</li>
          <li><strong>Action Required:</strong> Standard review and documentation</li>
          <li><strong>Examples:</strong> Administrative procedures, standard reporting requirements</li>
          <li><strong>Mitigation:</strong> Normal business processes adequate</li>
        </ul>
        <p>These clauses typically require no special handling beyond standard compliance.</p>
      `;
    }

    if (lowerMessage.includes('informative') || lowerMessage.includes('blue') || lowerMessage.includes('severity 4') || lowerMessage.includes('severity 0')) {
      return `
        <p><strong>🔵 Informative (Level 4/0)</strong></p>
        <p>Informative items are for awareness only:</p>
        <ul>
          <li><strong>Purpose:</strong> Provide context and background information</li>
          <li><strong>Action Required:</strong> Read and acknowledge</li>
          <li><strong>Examples:</strong> Definitions, standard market practices, reference materials</li>
          <li><strong>Impact:</strong> No direct operational or financial implications</li>
        </ul>
        <p>These are included for completeness and better understanding of contract context.</p>
      `;
    }

    // Back to Back explanations
    if (lowerMessage.includes('back to back') || lowerMessage.includes('b2b')) {
      return `
        <p><strong>🔄 Back to Back Contracts</strong></p>
        <p>Back to back means using the same GTC and Incoterm for both buying and selling:</p>
        <ul>
          <li><strong>Purpose:</strong> Minimize risk by aligning contract terms</li>
          <li><strong>Benefits:</strong> Reduced exposure to conflicting obligations</li>
          <li><strong>Process:</strong> When one GTC is selected, the system automatically suggests the same for the counterpart</li>
          <li><strong>Considerations:</strong> May limit flexibility but provides better risk control</li>
        </ul>
        <p>Enable the "Back to Back" checkbox to automatically synchronize GTC selections.</p>
      `;
    }

    // GTC explanations
    if (lowerMessage.includes('gtc') || lowerMessage.includes('general terms')) {
      return `
        <p><strong>📋 General Terms and Conditions (GTCs)</strong></p>
        <p>GTCs are standardized contract templates that define:</p>
        <ul>
          <li><strong>Scope:</strong> General obligations, rights, and procedures</li>
          <li><strong>Risk Allocation:</strong> How risks are distributed between parties</li>
          <li><strong>Operational Terms:</strong> Delivery, payment, and performance requirements</li>
          <li><strong>Legal Framework:</strong> Dispute resolution and governing law</li>
        </ul>
        <p>Different GTCs may have varying risk profiles for the same transaction type. Use this tool to compare and understand the implications of each GTC selection.</p>
      `;
    }

    // Incoterms explanations
    if (lowerMessage.includes('incoterm') || lowerMessage.includes('fob') || lowerMessage.includes('cif') || lowerMessage.includes('dap')) {
      return `
        <p><strong>🚢 Incoterms Explained</strong></p>
        <p>Incoterms define the distribution of costs, risks, and responsibilities:</p>
        <ul>
          <li><strong>FOB:</strong> Free on Board - Seller delivers when goods pass ship's rail</li>
          <li><strong>CIF:</strong> Cost, Insurance & Freight - Seller pays for shipping and insurance</li>
          <li><strong>CFR:</strong> Cost & Freight - Seller pays freight but not insurance</li>
          <li><strong>DAP:</strong> Delivered at Place - Seller delivers to named destination</li>
        </ul>
        <p>Different Incoterms affect risk transfer points and cost responsibilities. Select appropriate terms based on your risk appetite and operational capabilities.</p>
      `;
    }

    // Amendment guidance
    if (lowerMessage.includes('amendment') || lowerMessage.includes('special condition')) {
      return `
        <p><strong>📝 Contract Amendments</strong></p>
        <p>Amendments modify standard GTC terms to address specific risks:</p>
        <ul>
          <li><strong>Purpose:</strong> Tailor contracts to specific transaction requirements</li>
          <li><strong>Implementation:</strong> Add special conditions that override standard terms</li>
          <li><strong>Review:</strong> Ensure amendments are clear and legally sound</li>
          <li><strong>Documentation:</strong> Copy amendments using the built-in copy buttons</li>
        </ul>
        <p>Use the amendment summary sections to review all proposed changes before finalizing contracts.</p>
      `;
    }

    // How to use the tool
    if (lowerMessage.includes('how to') || lowerMessage.includes('help') || lowerMessage.includes('guide')) {
      return `
        <p><strong>🎯 How to Use This Tool</strong></p>
        <p>Follow these steps for effective risk analysis:</p>
        <ol>
          <li><strong>Select GTCs:</strong> Choose your buying and selling GTCs</li>
          <li><strong>Choose Incoterms:</strong> Select applicable delivery terms</li>
          <li><strong>Filter by Risk:</strong> Click severity pills to focus on specific risk levels</li>
          <li><strong>Review Clauses:</strong> Examine highlighted clauses and their risk implications</li>
          <li><strong>Use Amendments:</strong> Copy suggested amendments for contract modifications</li>
          <li><strong>Enable Back-to-Back:</strong> For simplified risk management</li>
        </ol>
        <p>The tool automatically sorts results by risk level (red, yellow, green, blue) for easy prioritization.</p>
      `;
    }

    // Department/Category guidance
    if (lowerMessage.includes('department') || lowerMessage.includes('category') || lowerMessage.includes('sts') || lowerMessage.includes('logistics')) {
      return `
        <p><strong>🏢 Department Categories</strong></p>
        <p>Clauses are organized by relevant departments:</p>
        <ul>
          <li><strong>STS:</strong> Ship-to-Ship operations and marine logistics</li>
          <li><strong>Logistics:</strong> Transportation and delivery coordination</li>
          <li><strong>Commercial:</strong> Pricing, payment, and business terms</li>
          <li><strong>Legal:</strong> Compliance, liability, and dispute resolution</li>
          <li><strong>Operations:</strong> Technical specifications and performance standards</li>
        </ul>
        <p>Filter by department to focus on clauses relevant to your role and responsibilities.</p>
      `;
    }

    // Default response for unrecognized queries
    return `
      <p>I understand you're asking about: "<em>${message}</em>"</p>
      <p>I can help you with:</p>
      <ul>
        <li>🔴 Risk severity levels (High, Moderate, Low, Informative)</li>
        <li>📋 GTC comparisons and implications</li>
        <li>🚢 Incoterm explanations (FOB, CIF, CFR, DAP)</li>
        <li>🔄 Back-to-back contract strategies</li>
        <li>📝 Amendment and special condition guidance</li>
        <li>🎯 How to use this risk analysis tool</li>
      </ul>
      <p>Try asking about any of these topics, or use the quick action buttons below!</p>
    `;
  }
}