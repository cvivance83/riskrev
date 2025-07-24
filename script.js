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

        // 👇 Si aucun filtre de sévérité encore touché, on trie par la GTC sélectionnée
    if (lastSeverityChanged === "Seller") {
        filteredA.sort((a, b) => severityValue(a["Severity Seller"]) - severityValue(b["Severity Seller"]));
      } else if (lastSeverityChanged === "Buyer") {
        filteredB.sort((a, b) => severityValue(a["Severity Buyer"]) - severityValue(b["Severity Buyer"]));
      } else {
        // Cas initial ou aucune sélection : on trie les deux
        filteredA.sort((a, b) => severityValue(a["Severity Seller"]) - severityValue(b["Severity Seller"]));
        filteredB.sort((a, b) => severityValue(a["Severity Buyer"]) - severityValue(b["Severity Buyer"]));
      }

      rawA.splice(0, rawA.length, ...filteredA);
      rawB.splice(0, rawB.length, ...filteredB);



    keys.forEach(clause => {
      const riskA = rawA.find(d => d["Clause Type"] === clause);
      const riskB = rawB.find(d => d["Clause Type"] === clause);

      const severityA = riskA ? normalizeSeverityNum(riskA["Severity Seller"]) : "";
      const severityB = riskB ? normalizeSeverityNum(riskB["Severity Buyer"]) : "";

      const row = document.createElement("div");
      row.className = "row";
      row.setAttribute("data-severity-a", severityA);
      row.setAttribute("data-severity-b", severityB);

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