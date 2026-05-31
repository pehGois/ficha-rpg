function setupAutoSave() {
  document.querySelectorAll('input:not([readonly]),textarea').forEach(el => {
    if (el.dataset.autosaveBound === '1') return;
    el.dataset.autosaveBound = '1';
    el.addEventListener('change', _save);
    el.addEventListener('input', debounce(_save, 1200));
    // Update Perícias titles when attribute values change
    if (['corpo', 'mente', 'espirito'].includes(el.id)) {
      if (typeof renderPericias === 'function') {
        el.addEventListener('input', debounce(() => { try { renderPericias(); } catch (e) {} }, 150));
        el.addEventListener('change', () => { try { renderPericias(); } catch (e) {} });
      }
    }
  });

  // Initial render of pericias titles
  if (typeof renderPericias === 'function') {
    try { renderPericias(); } catch (e) {}
  }
}

function normalizeImportedData(d) {
  if (!d || typeof d !== 'object') return {};

  const toArray = v => (Array.isArray(v) ? v : []);
  const toObject = v => (v && typeof v === 'object' && !Array.isArray(v) ? v : {});

  return {
    ...d,
    customConditions: toArray(d.customConditions ?? d.conditions),
    activeConditions: toArray(d.activeConditions),
    conditionCounters: toObject(d.conditionCounters ?? d.condicoesContadores),
    pericias: toObject(d.pericias),
    trainings: toArray(d.trainings),
    abilities: toArray(d.abilities),
    effects: toArray(d.effects),
    clocks: toArray(d.clocks),
    counters: toArray(d.counters)
  };
}

function collectData() {
  const g = id => document.getElementById(id)?.value ?? '';
  const selectedAtributo = document.querySelector('input[name="atributoPrincipal"]:checked')?.value ?? '';
  return {
    nome: g('nome'),
    xp: g('xp'),
    inspiracao: g('inspiracao'),
    lema: g('lema'),
    sheetPane: activeSheetPane,
    selectedAtributo,
    fundamento_principal: selectedAtributo,
    corpo: g('corpo'),
    mente: g('mente'),
    espirito: g('espirito'),
    pv: g('pv'),
    ps: g('ps'),
    customConditions: [...customConditions],
    activeConditions: [...activeConditions],
    conditionCounters: { ...conditionCounters },
    armaduraNome: g('armaduraNome'),
    armaduraValor: g('armaduraValor'),
    armaduraProps: g('armaduraProps'),
    arma1: { nome: g('arma1nome'), bonus: g('arma1bonus'), props: g('arma1props') },
    arma2: { nome: g('arma2nome'), bonus: g('arma2bonus'), props: g('arma2props') },
    markXp: g('mark-xp'),
    falhasFilled,
    marcaDesc: g('marcaDesc'),
    falhasTexto: g('falhasTexto'),
    trainings,
    abilities,
    effects,
    clocks,
    counters,
    pericias,
    antecedente: g('antecedente'),
    notas: g('notas'),
    photoData
  };
}

function applyData(d) {
  const s = (id, v) => {
    const el = document.getElementById(id);
    if (el && v !== undefined) el.value = v;
  };

  s('nome', d.nome); s('xp', d.xp); s('inspiracao', d.inspiracao); s('lema', d.lema);
  s('corpo', d.corpo); s('mente', d.mente); s('espirito', d.espirito);
  s('pv', d.pv); s('ps', d.ps);

  const atributoSelecionado = d.selectedAtributo ?? d.fundamento_principal ?? '';
  document.querySelectorAll('input[name="atributoPrincipal"]').forEach(el => {
    el.checked = !!atributoSelecionado && el.value === atributoSelecionado;
  });

  s('armaduraNome', d.armaduraNome); s('armaduraValor', d.armaduraValor); s('armaduraProps', d.armaduraProps);
  s('arma1nome', d.arma1?.nome); s('arma1bonus', d.arma1?.bonus); s('arma1props', d.arma1?.props);
  s('arma2nome', d.arma2?.nome); s('arma2bonus', d.arma2?.bonus); s('arma2props', d.arma2?.props);
  s('mark-xp', d.markXp); s('marcaDesc', d.marcaDesc); s('falhasTexto', d.falhasTexto);
  s('antecedente', d.antecedente); s('notas', d.notas);

  if (typeof setActiveSheetPane === 'function') {
    setActiveSheetPane(d.sheetPane, false);
  }

  calcDerived();

  if (Array.isArray(d.customConditions)) {
    customConditions = d.customConditions;
  } else if (Array.isArray(d.conditions)) {
    customConditions = d.conditions.filter(c => !DEFAULT_CONDITIONS.includes(c));
  } else {
    customConditions = [];
  }
  const importedActiveConditions = Array.isArray(d.activeConditions) ? d.activeConditions : [];
  activeConditions = new Set(
    importedActiveConditions
      .map(c => (typeof c === 'string' ? c : c?.nome))
      .filter(Boolean)
  );

  const importedConditionCounters =
    d.conditionCounters && typeof d.conditionCounters === 'object' && !Array.isArray(d.conditionCounters)
      ? d.conditionCounters
      : {};

  const countersFromLegacyActive = importedActiveConditions.reduce((acc, c) => {
    if (c && typeof c === 'object' && c.nome && c.contador !== undefined) {
      acc[c.nome] = c.contador;
    }
    return acc;
  }, {});

  conditionCounters = { ...countersFromLegacyActive, ...importedConditionCounters };

  Object.keys(conditionCounters).forEach(name => {
    if (!activeConditions.has(name)) delete conditionCounters[name];
  });

  renderConditions();

  falhasFilled = d.falhasFilled ?? 0;
  renderFalhasMarks();

  trainings = (d.trainings ?? []).map(t => {
    if (typeof t === 'string') return { id: uid(), nome: t, descricao: '', collapsed: false };
    if (t.value !== undefined) return { id: uid(), nome: t.value, descricao: '', collapsed: false };
    return { ...t, collapsed: t.collapsed ?? false };
  });

  abilities = (d.abilities ?? []).map(a => ({
    ...a,
    fundament: a?.fundament ?? a?.fundamento ?? '',
    collapsed: a?.collapsed ?? false
  }));
  effects = (d.effects ?? []).map(ef => ({
    id: ef?.id ?? uid(),
    nome: ef?.nome ?? '',
    custo: ef?.custo ?? ef?.custoConjuracao ?? '',
    intensidade: ef?.intensidade ?? '',
    area: ef?.area ?? ef?.areaEfeito ?? '',
    duracao: ef?.duracao ?? '',
    alcance: ef?.alcance ?? '',
    transfig: ef?.transfig ?? ef?.transfiguracoes ?? '',
    descricao: ef?.descricao ?? '',
    collapsed: ef?.collapsed ?? false
  }));
  clocks = (d.clocks ?? []).map(c => ({
    id: c.id ?? uid(),
    nome: c.nome ?? '',
    segments: Math.min(20, Math.max(2, parseInt(c.segments, 10) || 6)),
    filled: Math.min(c.filled ?? 0, c.segments ?? 6)
  }));
  counters = (d.counters ?? []).map(c => ({
    id: c.id ?? uid(),
    nome: c.nome ?? '',
    valor: c.valor ?? ''
  }));

  // Perícias: normalize to default structure and coerce values to ints
  const defaultPericias = (typeof createDefaultSheetData === 'function' ? createDefaultSheetData().pericias : {
    Corpo: { Forca: 0, Destreza: 0, Resistencia: 0, Furtividade: 0 },
    Mente: { Recordar: 0, Analisar: 0, Aprender: 0, Criar: 0 },
    Espirito: { Convencer: 0, Enganar: 0, Perceber: 0, Impor: 0 }
  });

  const importedPericias = d.pericias && typeof d.pericias === 'object' ? d.pericias : {};
  pericias = JSON.parse(JSON.stringify(defaultPericias));
  Object.keys(defaultPericias).forEach(group => {
    Object.keys(defaultPericias[group]).forEach(skill => {
      let v = importedPericias?.[group]?.[skill];
      if (v === undefined) v = importedPericias?.[skill];
      pericias[group][skill] = Math.min(3, Math.max(0, parseInt(v, 10) || 0));
    });
  });

  renderTrainings();
  renderAbilities();
  renderEffects();
  renderClocks();
  renderCounters();
  renderPericias();

  if (d.photoData) {
    photoData = d.photoData;
    showPhoto(photoData);
  } else {
    clearPhoto();
  }

  setupAutoSave();
}

function _save() {
  if (Array.isArray(sheets) && sheets.length && typeof updateActiveSheetFromForm === 'function' && typeof persistSheets === 'function') {
    updateActiveSheetFromForm();
    if (typeof renderTabs === 'function') renderTabs();
    persistSheets();
    return;
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(collectData()));
}

function saveData() {
  _save();
  showToast('Ficha salva');
}

function loadData() {
  if (Array.isArray(sheets) && sheets.length && activeSheetId) {
    const active = sheets.find(sheet => sheet.id === activeSheetId);
    if (active?.data) {
      applyData(active.data);
      return;
    }
  }

  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return;

  try {
    applyData(JSON.parse(raw));
  } catch (e) {
    console.error('Erro ao carregar ficha:', e);
  }
}

function downloadJSON() {
  const data = collectData();
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = `ficha_${(data.nome || 'personagem').replace(/\s+/g, '_')}.json`;
  a.click();

  URL.revokeObjectURL(url);
  showToast('Ficha exportada');
}

function triggerImport() {
  const inp = document.getElementById('importInput');
  inp.value = '';
  inp.click();
}

function setupImportInput() {
  document.getElementById('importInput').addEventListener('change', e => {
    const file = e.target.files[0];
    if (!file) return;

    const r = new FileReader();
    r.onload = ev => {
      let parsed;
      try {
        const rawText = String(ev.target.result ?? '').replace(/^\uFEFF/, '').trim();
        parsed = JSON.parse(rawText);
      } catch {
        alert('Arquivo inválido. Certifique-se de que é um JSON exportado por esta ficha.');
        return;
      }

      try {
        const d = normalizeImportedData(parsed);
        if (typeof addSheetTab === 'function') {
          addSheetTab(d);
          showToast('Ficha importada em nova aba');
        } else {
          applyData(d);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(d));
          showToast('Ficha importada');
        }
      } catch (err) {
        console.error('Erro ao importar ficha:', err);
        alert('Não foi possível importar esta ficha. Verifique o arquivo JSON e tente novamente.');
      }
    };
    r.readAsText(file);
  });
}

function clearData() {
  if (!confirm('Apagar toda a ficha? Esta ação não pode ser desfeita.')) return;

  customConditions = [];
  activeConditions = new Set();
  conditionCounters = {};
  trainings = [];
  abilities = [];
  effects = [];
  clocks = [];
  counters = [];
  pericias = (typeof createDefaultSheetData === 'function' ? createDefaultSheetData().pericias : {});
  falhasFilled = 0;
  photoData = null;

  document.querySelectorAll('input[type=text], input[type=number]:not([readonly]), textarea').forEach(el => {
    el.value = '';
  });

  ['corpo', 'mente', 'espirito'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '4';
  });

  document.querySelectorAll('input[name="atributoPrincipal"]').forEach(el => {
    el.checked = false;
  });

  calcDerived();
  renderConditions();
  renderFalhasMarks();
  renderTrainings();
  renderAbilities();
  renderEffects();
  renderClocks();
  renderCounters();
  clearPhoto();

  _save();
  showToast('Ficha limpa');
}
