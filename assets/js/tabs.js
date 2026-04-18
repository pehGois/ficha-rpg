function createDefaultSheetData() {
  return {
    nome: '',
    xp: '',
    inspiracao: '',
    lema: '',
    selectedAtributo: '',
    corpo: '4',
    mente: '4',
    espirito: '4',
    pv: '',
    ps: '',
    customConditions: [],
    activeConditions: [],
    armaduraNome: '',
    armaduraValor: '',
    armaduraProps: '',
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

  localStorage.setItem(STORAGE_TABS_KEY, JSON.stringify(payload));

  const active = sheets.find(sheet => sheet.id === activeSheetId);
  if (active?.data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(active.data));
  }
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
        initialData = JSON.parse(oldRaw);
      } catch {
        initialData = createDefaultSheetData();
      }
    }

    const firstSheet = { id: uid(), data: initialData };
    sheets = [firstSheet];
    activeSheetId = firstSheet.id;
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
