function setupAutoSave() {
  document.querySelectorAll('input:not([readonly]),textarea').forEach(el => {
    if (el.dataset.autosaveBound === '1') return;
    el.dataset.autosaveBound = '1';
    el.addEventListener('change', _save);
    el.addEventListener('input', debounce(_save, 1200));
    // Update Perícias titles when attribute values change
    if (['FORÇA', 'INTELIGÊNCIA'].includes(el.id)) {
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

  return {
    ...d,
    archetype: d.archetype || createDefaultArchetypeData(),
    pericias: d.pericias || createDefaultSheetData().pericias,
    weapons: Array.isArray(d.weapons) ? d.weapons : [],
    effects: Array.isArray(d.effects) ? d.effects : [],
    clocks: Array.isArray(d.clocks) ? d.clocks : [],
    counters: Array.isArray(d.counters) ? d.counters : [],
    gridItems: Array.isArray(d.gridItems) ? d.gridItems : [],
    repertoires: d.repertoires || { FORÇA: [], INTELIGÊNCIA: [] }
  };
}

function collectData() {
  const g = id => document.getElementById(id)?.value ?? '';
  return {
    nome: g('nome'),
    xpAtual: g('xpAtual'),
    xpTotal: g('xpTotal'),
    lema: g('lema'),
    sheetPane: activeSheetPane,
    FORÇA: g('FORÇA'),
    INTELIGÊNCIA: g('INTELIGÊNCIA'),
    pv: g('pv'),
    ps: g('ps'),
    armaduraNome: g('armaduraNome'),
    armaduraValor: g('armaduraValor'),
    armaduraProps: g('armaduraProps'),
    weapons: Array.isArray(weapons) ? weapons.map(w => ({
      id: w.id ?? uid(),
      nome: w.nome ?? '',
      bonus: w.bonus ?? '',
      props: w.props ?? '',
      collapsed: w.collapsed ?? false
    })) : [],
    gridItems: Array.isArray(gridItems) ? gridItems.map(item => ({
      id: item.id ?? uid(),
      type: 'item',
      nome: item.nome ?? '',
      descricao: item.descricao ?? '',
      quantidade: item.quantidade ?? '',
      span: Math.min(4, Math.max(1, parseInt(item.span, 10) || 1))
    })) : [],
    repertoires: {
      FORÇA: Array.isArray(repertoires?.FORÇA) ? repertoires.FORÇA.map(training => ({
        id: training.id ?? uid(),
        nome: training.nome ?? '',
        descricao: training.descricao ?? '',
        span: Math.min(4, Math.max(1, parseInt(training.span, 10) || 1))
      })) : [],
      INTELIGÊNCIA: Array.isArray(repertoires?.INTELIGÊNCIA) ? repertoires.INTELIGÊNCIA.map(training => ({
        id: training.id ?? uid(),
        nome: training.nome ?? '',
        descricao: training.descricao ?? '',
        span: Math.min(4, Math.max(1, parseInt(training.span, 10) || 1))
      })) : []
    },
    markXp: g('mark-xp'),
    falhasFilled,
    marcaDesc: g('marcaDesc'),
    falhasTexto: g('falhasTexto'),
    archetype,
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

  s('nome', d.nome);
  s('xpAtual', d.xpAtual);
  s('xpTotal', d.xpTotal);
  s('lema', d.lema);
  s('FORÇA', d.FORÇA); s('INTELIGÊNCIA', d.INTELIGÊNCIA);
  s('pv', d.pv); s('ps', d.ps);

  s('armaduraNome', d.armaduraNome); s('armaduraValor', d.armaduraValor); s('armaduraProps', d.armaduraProps);
  s('mark-xp', d.markXp); s('marcaDesc', d.marcaDesc); s('falhasTexto', d.falhasTexto);
  s('antecedente', d.antecedente); s('notas', d.notas);

  if (typeof setActiveSheetPane === 'function') {
    setActiveSheetPane(d.sheetPane, false);
  }

  calcDerived();

  falhasFilled = d.falhasFilled ?? 0;
  renderFalhasMarks();

  archetype = normalizeImportedData(d).archetype || createDefaultArchetypeData();
  renderArchetypeSection();

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
    valor: c.valor ?? '',
    collapsed: c.collapsed ?? false
  }));

  gridItems = d.gridItems.map(item => ({
    id: item.id ?? uid(),
    type: 'item',
    nome: item.nome ?? '',
    descricao: item.descricao ?? '',
    quantidade: item.quantidade ?? '',
    span: Math.min(4, Math.max(1, parseInt(item.span, 10) || 1))
  })).slice(0, 8);

  repertoires = {
    FORÇA: (d.repertoires?.FORÇA ?? []).map(training => ({
      id: training.id ?? uid(),
      nome: training.nome ?? '',
      descricao: training.descricao ?? '',
      span: Math.min(4, Math.max(1, parseInt(training.span, 10) || 1))
    })),
    INTELIGÊNCIA: (d.repertoires?.INTELIGÊNCIA ?? []).map(training => ({
      id: training.id ?? uid(),
      nome: training.nome ?? '',
      descricao: training.descricao ?? '',
      span: Math.min(4, Math.max(1, parseInt(training.span, 10) || 1))
    }))
  };

  weapons = d.weapons.map(w => ({
    id: w.id ?? uid(),
    nome: w.nome ?? '',
    bonus: w.bonus ?? '',
    props: w.props ?? '',
    collapsed: w.collapsed ?? false
  }));

  if (!weapons.length) weapons = [{ id: uid(), nome: '', bonus: '', props: '', collapsed: false }];

  // Perícias: normalize to default structure and coerce values to ints
  const defaultPericias = {
    FORÇA: 0,
    Destreza: 0,
    Resistência: 0,
    Discrição: 0,
    Percepção: 0,
    Intimidação: 0,
    Conhecimento: 0,
    Análise: 0,
    Aprendizado: 0,
    Criação: 0,
    Lábia: 0,
    Sobrevivência: 0,
    Empatia: 0
  };

  const importedPericias = d.pericias && typeof d.pericias === 'object' ? d.pericias : {};
  const flatPericias = {
    ...(importedPericias.FORÇA && typeof importedPericias.FORÇA === 'object' ? importedPericias.FORÇA : {}),
    ...(importedPericias.INTELIGÊNCIA && typeof importedPericias.INTELIGÊNCIA === 'object' ? importedPericias.INTELIGÊNCIA : {}),
    ...Object.keys(importedPericias).reduce((flat, key) => {
      if (!['FORÇA', 'INTELIGÊNCIA'].includes(key)) flat[key] = importedPericias[key];
      return flat;
    }, {})
  };
  pericias = Object.keys(defaultPericias).reduce((normalized, skill) => {
    normalized[skill] = Math.min(3, Math.max(0, parseInt(flatPericias[skill], 10) || 0));
    return normalized;
  }, {});

  renderArchetypeSection();
  renderEffects();
  renderClocks();
  renderCounters();
  renderGridItems();
  renderRepertoires();
  renderWeapons();
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

  const active = sheets.find(sheet => sheet.id === activeSheetId);
  if (active?.data) applyData(active.data);
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

  effects = [];
  clocks = [];
  counters = [];
  gridItems = [];
  repertoires = { FORÇA: [], INTELIGÊNCIA: [] };
  weapons = [
    { id: uid(), nome: '', bonus: '', props: '', collapsed: false },
    { id: uid(), nome: '', bonus: '', props: '', collapsed: false }
  ];
  pericias = (typeof createDefaultSheetData === 'function' ? createDefaultSheetData().pericias : {});
  falhasFilled = 0;
  archetype = createDefaultArchetypeData();
  photoData = null;

  document.querySelectorAll('input[type=text], input[type=number]:not([readonly]), textarea').forEach(el => {
    el.value = '';
  });

  ['FORÇA', 'INTELIGÊNCIA'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '4';
  });

  calcDerived();
  renderFalhasMarks();
  renderArchetypeSection();
  renderEffects();
  renderClocks();
  renderCounters();
  renderGridItems();
  renderRepertoires();
  renderWeapons();
  clearPhoto();

  _save();
  showToast('Ficha limpa');
}
