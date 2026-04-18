function setupAutoSave() {
  document.querySelectorAll('input:not([readonly]),textarea').forEach(el => {
    if (el.dataset.autosaveBound === '1') return;
    el.dataset.autosaveBound = '1';
    el.addEventListener('change', _save);
    el.addEventListener('input', debounce(_save, 1200));
  });
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
    corpo: g('corpo'),
    mente: g('mente'),
    espirito: g('espirito'),
    pv: g('pv'),
    ps: g('ps'),
    customConditions: [...customConditions],
    activeConditions: [...activeConditions],
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

  document.querySelectorAll('input[name="atributoPrincipal"]').forEach(el => {
    el.checked = !!d.selectedAtributo && el.value === d.selectedAtributo;
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
  activeConditions = new Set(Array.isArray(d.activeConditions) ? d.activeConditions : []);
  renderConditions();

  falhasFilled = d.falhasFilled ?? 0;
  renderFalhasMarks();

  trainings = (d.trainings ?? []).map(t => {
    if (typeof t === 'string') return { id: uid(), nome: t, descricao: '' };
    if (t.value !== undefined) return { id: uid(), nome: t.value, descricao: '' };
    return t;
  });

  abilities = (d.abilities ?? []).map(a => ({
    ...a,
    fundament: a?.fundament ?? a?.fundamento ?? ''
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
    descricao: ef?.descricao ?? ''
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

  renderTrainings();
  renderAbilities();
  renderEffects();
  renderClocks();
  renderCounters();

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
      try {
        const d = JSON.parse(ev.target.result);
        if (typeof addSheetTab === 'function') {
          addSheetTab(d);
          showToast('Ficha importada em nova aba');
        } else {
          applyData(d);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(d));
          showToast('Ficha importada');
        }
      } catch {
        alert('Arquivo inválido. Certifique-se de que é um JSON exportado por esta ficha.');
      }
    };
    r.readAsText(file);
  });
}

function clearData() {
  if (!confirm('Apagar toda a ficha? Esta ação não pode ser desfeita.')) return;

  customConditions = [];
  activeConditions = new Set();
  trainings = [];
  abilities = [];
  effects = [];
  clocks = [];
  counters = [];
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
