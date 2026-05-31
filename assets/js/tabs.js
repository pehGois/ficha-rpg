function createDefaultSheetData() {
  return {
    nome: '',
    xp: '',
    inspiracao: '',
    lema: '',
    sheetPane: 'sword',
    selectedAtributo: '',
    fundamento_principal: '',
    corpo: '4',
    mente: '4',
    espirito: '4',
    pv: '',
    ps: '',
    customConditions: [],
    activeConditions: [],
    conditionCounters: {},
    armaduraNome: '',
    armaduraValor: '',
    armaduraProps: '',
    weapons: [
      { id: uid(), nome: '', bonus: '', props: '', collapsed: false },
      { id: uid(), nome: '', bonus: '', props: '', collapsed: false }
    ],
    arma1: { nome: '', bonus: '', props: '' },
    arma2: { nome: '', bonus: '', props: '' },
    markXp: '',
    falhasFilled: 0,
    marcaDesc: '',
    falhasTexto: '',
    trainings: [],
    abilities: [],
    effects: [],
    clocks: [],
    counters: [],
    pericias: {
      Corpo: { Forca: '0', Destreza: '0', Resistencia: '0', Furtividade: '0' },
      Mente: { Recordar: '0', Analisar: '0', Aprender: '0', Criar: '0' },
      Espirito: { Convencer: '0', Enganar: '0', Perceber: '0', Impor: '0' }
    },
    antecedente: '',
    notas: '',
    photoData: null
  };
}

function getTabLabel(sheet, index) {
  const nome = sheet?.data?.nome?.trim();
  return nome || `Personagem ${index + 1}`;
}

function persistSheets() {
  const payload = {
    version: 1,
    activeSheetId,
    sheets
  };

  // Persist full tabs payload under the tabs key
  localStorage.setItem(STORAGE_TABS_KEY, JSON.stringify(payload));

  // For compatibility and to ensure all open sheets are saved,
  // also store the full payload under the legacy STORAGE_KEY.
  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
}

function updateActiveSheetFromForm() {
  if (!activeSheetId) return;
  const idx = sheets.findIndex(sheet => sheet.id === activeSheetId);
  if (idx < 0) return;

  sheets[idx].data = collectData();
}

function renderTabs() {
  const tabsList = document.getElementById('tabsList');
  if (!tabsList) return;

  tabsList.innerHTML = '';

  sheets.forEach((sheet, index) => {
    const isActive = sheet.id === activeSheetId;

    const tab = document.createElement('button');
    tab.type = 'button';
    tab.className = 'tab-item' + (isActive ? ' active' : '');
    tab.title = getTabLabel(sheet, index);
    tab.addEventListener('click', () => switchSheetTab(sheet.id));

    const label = document.createElement('span');
    label.className = 'tab-label';
    label.textContent = getTabLabel(sheet, index);

    const close = document.createElement('span');
    close.className = 'tab-close';
    close.textContent = '×';
    close.title = 'Fechar ficha';
    close.addEventListener('click', e => {
      e.stopPropagation();
      removeSheetTab(sheet.id);
    });

    tab.appendChild(label);
    tab.appendChild(close);
    tabsList.appendChild(tab);
  });
}

function switchSheetTab(id) {
  if (id === activeSheetId) return;

  updateActiveSheetFromForm();
  const target = sheets.find(sheet => sheet.id === id);
  if (!target) return;

  activeSheetId = id;
  applyData(target.data || createDefaultSheetData());
  renderTabs();
  persistSheets();
}

function addSheetTab(importedData) {
  updateActiveSheetFromForm();

  const sheet = {
    id: uid(),
    data: importedData || createDefaultSheetData()
  };

  sheets.push(sheet);
  activeSheetId = sheet.id;

  applyData(sheet.data);
  renderTabs();
  persistSheets();
}

function removeSheetTab(id) {
  const idx = sheets.findIndex(sheet => sheet.id === id);
  if (idx < 0) return;

  if (sheets.length === 1) {
    sheets[0].data = createDefaultSheetData();
    activeSheetId = sheets[0].id;
    applyData(sheets[0].data);
    renderTabs();
    persistSheets();
    showToast('Ficha resetada');
    return;
  }

  sheets.splice(idx, 1);

  if (activeSheetId === id) {
    const fallbackIndex = Math.max(0, idx - 1);
    activeSheetId = sheets[fallbackIndex].id;
    applyData(sheets[fallbackIndex].data || createDefaultSheetData());
  }

  renderTabs();
  persistSheets();
}

function initTabsSystem() {
  const rawTabs = localStorage.getItem(STORAGE_TABS_KEY);

  if (rawTabs) {
    try {
      const parsed = JSON.parse(rawTabs);
      const loadedSheets = Array.isArray(parsed.sheets) ? parsed.sheets : [];
      sheets = loadedSheets
        .filter(sheet => sheet && sheet.id)
        .map(sheet => ({
          id: sheet.id,
          data: sheet.data || createDefaultSheetData()
        }));
      activeSheetId = parsed.activeSheetId;
    } catch {
      sheets = [];
      activeSheetId = null;
    }
  }

  if (!sheets.length) {
    const oldRaw = localStorage.getItem(STORAGE_KEY);
    let initialData = createDefaultSheetData();

    if (oldRaw) {
      try {
        const parsed = JSON.parse(oldRaw);
        // If the legacy STORAGE_KEY contains a full payload with sheets, restore from it
        if (parsed && Array.isArray(parsed.sheets)) {
          sheets = parsed.sheets.map(sheet => ({ id: sheet.id, data: sheet.data || createDefaultSheetData() }));
          activeSheetId = parsed.activeSheetId || (sheets[0] && sheets[0].id) || null;
        } else {
          initialData = parsed;
          const firstSheet = { id: uid(), data: initialData };
          sheets = [firstSheet];
          activeSheetId = firstSheet.id;
        }
      } catch {
        const firstSheet = { id: uid(), data: createDefaultSheetData() };
        sheets = [firstSheet];
        activeSheetId = firstSheet.id;
      }
    } else {
      const firstSheet = { id: uid(), data: createDefaultSheetData() };
      sheets = [firstSheet];
      activeSheetId = firstSheet.id;
    }

    persistSheets();
  }

  if (!sheets.some(sheet => sheet.id === activeSheetId)) {
    activeSheetId = sheets[0].id;
  }

  const active = sheets.find(sheet => sheet.id === activeSheetId);
  applyData(active?.data || createDefaultSheetData());
  renderTabs();
  persistSheets();
}
