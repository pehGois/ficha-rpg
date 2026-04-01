// ── CONSTANTS ────────────────────────────────────────────────
const STORAGE_KEY = 'ficha_rpg';
const FALHAS_MAX = 5;
const DEFAULT_CONDITIONS = ['Nos Portões da Morte', 'Louco', 'Inconsciente'];

// ── STATE ────────────────────────────────────────────────────
let customConditions = [];
let activeConditions = new Set();
let trainings = [];
let abilities = [];
let effects = [];
let clocks = [];
let falhasFilled = 0;
let photoData = null;

// ── BOOT ─────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  renderConditions();
  renderFalhasMarks();
  loadData();
  setupPhotoUpload();
  setupImportInput();
  bindDerivedStats();
  setupAutoSave();
});

// ── AUTO-SAVE ─────────────────────────────────────────────────
function setupAutoSave() {
  document.querySelectorAll('input:not([readonly]),textarea').forEach(el => {
    el.addEventListener('change', _save);
    el.addEventListener('input', debounce(_save, 1200));
  });
}
function debounce(fn, ms) { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; }

// ── DERIVED STATS ─────────────────────────────────────────────
function calcDerived() {
  const toInt = (id, fb = 0) => { const n = parseInt(document.getElementById(id)?.value, 10); return isNaN(n) ? fb : n; };
  const pvCalc = 8 + 3 * toInt('espirito');
  const psCalc = 2 * toInt('mente');
  const pdCalc = 3 * toInt('corpo');

  const pvLabel = document.getElementById('pvLabel'); if (pvLabel) pvLabel.textContent = `PV [${pvCalc}]`;
  const psLabel = document.getElementById('psLabel'); if (psLabel) psLabel.textContent = `PS [${psCalc}]`;
  const pdLabel = document.getElementById('pdLabel'); if (pdLabel) pdLabel.textContent = `PD [${pdCalc}]`;
}
function bindDerivedStats() {
  ['corpo', 'mente', 'espirito'].forEach(id => {
    const el = document.getElementById(id);
    if (el) { el.addEventListener('input', calcDerived); el.addEventListener('change', calcDerived); }
  });
  calcDerived();
}

// ── PHOTO ─────────────────────────────────────────────────────
function setupPhotoUpload() {
  document.getElementById('photoUpload').addEventListener('click', () => document.getElementById('photoInput').click());
  document.getElementById('photoInput').addEventListener('change', e => {
    const file = e.target.files[0]; if (!file) return;
    const r = new FileReader();
    r.onload = ev => { photoData = ev.target.result; showPhoto(photoData); _save(); };
    r.readAsDataURL(file);
  });
}
function showPhoto(src) {
  document.getElementById('photoImg').src = src;
  document.getElementById('photoImg').style.display = 'block';
  document.getElementById('photoPlaceholder').style.display = 'none';
}
function clearPhoto() {
  photoData = null;
  document.getElementById('photoImg').src = '';
  document.getElementById('photoImg').style.display = 'none';
  document.getElementById('photoPlaceholder').style.display = 'flex';
}

// ── CONDITIONS ────────────────────────────────────────────────
function renderConditions() {
  const grid = document.getElementById('conditionsGrid');
  if (!grid) return;
  grid.innerHTML = '';
  [...DEFAULT_CONDITIONS, ...customConditions].forEach(name => {
    const isCustom = !DEFAULT_CONDITIONS.includes(name);
    const isActive = activeConditions.has(name);
    const item = document.createElement('div');
    item.className = 'condition-item' + (isActive ? ' active' : '');
    item.addEventListener('click', () => {
      activeConditions.has(name) ? activeConditions.delete(name) : activeConditions.add(name);
      item.classList.toggle('active');
      _save();
    });
    const main = document.createElement('div');
    main.className = 'condition-main';
    main.innerHTML = `<span class="cond-dot"></span><span class="cond-name">${name}</span>`;
    item.appendChild(main);
    if (isCustom) {
      const btn = document.createElement('button');
      btn.type = 'button'; btn.className = 'cond-remove'; btn.textContent = '✕';
      btn.addEventListener('click', e => { e.stopPropagation(); removeCondition(name); });
      item.appendChild(btn);
    }
    grid.appendChild(item);
  });
}
function addCondition() {
  const inp = document.getElementById('newConditionInput');
  const name = inp.value.trim();
  if (!name || DEFAULT_CONDITIONS.includes(name) || customConditions.includes(name)) return;
  customConditions.push(name);
  inp.value = '';
  renderConditions();
  _save();
}
function removeCondition(name) {
  customConditions = customConditions.filter(c => c !== name);
  activeConditions.delete(name);
  renderConditions();
  _save();
}

// ── FALHAS MARKS ─────────────────────────────────────────────
function renderFalhasMarks() {
  const c = document.getElementById('falhasMarks'); if (!c) return;
  c.innerHTML = '';
  for (let i = 0; i < FALHAS_MAX; i++) {
    const m = document.createElement('div');
    m.className = 'mark falha-mark' + (i < falhasFilled ? ' filled' : '');
    m.textContent = '✗';
    m.addEventListener('click', () => { falhasFilled = i < falhasFilled ? i : i + 1; renderFalhasMarks(); _save(); });
    c.appendChild(m);
  }
}

// ── TRAININGS ─────────────────────────────────────────────────
function addTraining(data = {}) {
  trainings.push({ id: uid(), nome: '', descricao: '', ...data });
  renderTrainings();
  _save();
}
function renderTrainings() {
  const list = document.getElementById('trainingList'); list.innerHTML = '';
  trainings.forEach((t, i) => {
    const d = document.createElement('div'); d.className = 'training-card';
    d.innerHTML = `
      <div class="card-header">
        <span class="card-label">Treinamento ${i + 1}</span>
        <button class="btn-remove">× Remover</button>
      </div>
      <div class="spell-grid">
        <div class="field full"><label>Nome</label><input type="text" value="${esc(t.nome)}" placeholder="Nome do treinamento..." data-field="nome"></div>
        <div class="field full"><label>Descrição</label><textarea placeholder="Detalhes do treinamento..." data-field="descricao" style="min-height:70px;">${esc(t.descricao)}</textarea></div>
      </div>`;
    d.querySelector('.btn-remove').addEventListener('click', () => { trainings.splice(i, 1); renderTrainings(); _save(); });
    d.querySelectorAll('[data-field]').forEach(el => el.addEventListener('input', e => { trainings[i][e.target.dataset.field] = e.target.value; _save(); }));
    list.appendChild(d);
  });
}

// ── ABILITIES ─────────────────────────────────────────────────
function addAbility(data = {}) {
  abilities.push({ id: uid(), nome: '', custo: '', forma: '', duracao: '', alcance: '', intensidade: '', area: '', transfig: '', descricao: '', ...data });
  renderAbilities();
}
function renderAbilities() {
  const list = document.getElementById('abilityList'); list.innerHTML = '';
  abilities.forEach((a, i) => {
    const d = document.createElement('div'); d.className = 'ability-card';
    d.innerHTML = `
      <div class="card-header"><span class="card-label">Habilidade ${i + 1}</span><button class="btn-remove">× Remover</button></div>
      <div class="spell-grid">
        <div class="field"><label>Nome</label><input type="text" value="${esc(a.nome)}" placeholder="Nome da habilidade" data-field="nome"></div>
        <div class="field"><label>Custo</label><input type="text" value="${esc(a.custo)}" placeholder="Custo" data-field="custo"></div>
        <div class="field"><label>Forma</label><input type="text" value="${esc(a.forma)}" placeholder="Ativa / Passiva / Reação" data-field="forma"></div>
        <div class="field"><label>Duração</label><input type="text" value="${esc(a.duracao)}" placeholder="Duração" data-field="duracao"></div>
        <div class="field"><label>Alcance</label><input type="text" value="${esc(a.alcance)}" placeholder="Alcance" data-field="alcance"></div>
        <div class="field"><label>Intensidade</label><input type="text" value="${esc(a.intensidade)}" placeholder="Intensidade" data-field="intensidade"></div>
        <div class="field"><label>Área de Efeito</label><input type="text" value="${esc(a.area)}" placeholder="Área de efeito" data-field="area"></div>
        <div class="field"><label>Transfigurações</label><input type="text" value="${esc(a.transfig)}" placeholder="Modificadores" data-field="transfig"></div>
        <div class="field full"><label>Descrição</label><textarea placeholder="Como esta habilidade funciona..." data-field="descricao">${esc(a.descricao)}</textarea></div>
      </div>`;
    d.querySelector('.btn-remove').addEventListener('click', () => { abilities.splice(i, 1); renderAbilities(); _save(); });
    d.querySelectorAll('[data-field]').forEach(el => el.addEventListener('input', e => { abilities[i][e.target.dataset.field] = e.target.value; _save(); }));
    list.appendChild(d);
  });
}

// ── EFFECTS ───────────────────────────────────────────────────
function addEffect(data = {}) {
  effects.push({ id: uid(), nome: '', tipo: '', descricao: '', ...data });
  renderEffects();
}
function renderEffects() {
  const list = document.getElementById('effectsList'); list.innerHTML = '';
  effects.forEach((ef, i) => {
    const d = document.createElement('div'); d.className = 'effect-item';
    d.innerHTML = `
      <div class="card-header"><span class="card-label">Efeito ${i + 1}</span><button class="btn-remove">× Remover</button></div>
      <div class="spell-grid">
        <div class="field"><label>Nome</label><input type="text" value="${esc(ef.nome)}" placeholder="Nome do efeito" data-field="nome"></div>
        <div class="field"><label>Tipo / Fonte</label><input type="text" value="${esc(ef.tipo)}" placeholder="Magia / Veneno..." data-field="tipo"></div>
        <div class="field full"><label>Descrição</label><textarea data-field="descricao" placeholder="O que este efeito faz..." style="min-height:60px;">${esc(ef.descricao)}</textarea></div>
      </div>`;
    d.querySelector('.btn-remove').addEventListener('click', () => { effects.splice(i, 1); renderEffects(); _save(); });
    d.querySelectorAll('[data-field]').forEach(el => el.addEventListener('input', e => { effects[i][e.target.dataset.field] = e.target.value; _save(); }));
    list.appendChild(d);
  });
}

// ── COLLECT ───────────────────────────────────────────────────
function collectData() {
  const g = id => document.getElementById(id)?.value ?? '';
  return {
    nome: g('nome'), xp: g('xp'), inspiracao: g('inspiracao'), origem: g('origem'),
    corpo: g('corpo'), mente: g('mente'), espirito: g('espirito'),
    pv: g('pv'), ps: g('ps'), pd: g('pd'),
    customConditions: [...customConditions],
    activeConditions: [...activeConditions],
    armaduraNome: g('armaduraNome'), armaduraValor: g('armaduraValor'), armaduraProps: g('armaduraProps'),
    arma1: { nome: g('arma1nome'), bonus: g('arma1bonus'), props: g('arma1props') },
    arma2: { nome: g('arma2nome'), bonus: g('arma2bonus'), props: g('arma2props') },
    markXp: g('mark-xp'), falhasFilled, marcaDesc: g('marcaDesc'), falhasTexto: g('falhasTexto'),
    trainings, abilities, effects, clocks,
    antecedente: g('antecedente'), notas: g('notas'),
    photoData
  };
}

// ── APPLY DATA (shared by loadData & importJSON) ──────────────
function applyData(d) {
  const s = (id, v) => { const el = document.getElementById(id); if (el && v !== undefined) el.value = v; };

  s('nome', d.nome); s('xp', d.xp); s('inspiracao', d.inspiracao); s('origem', d.origem);
  s('corpo', d.corpo); s('mente', d.mente); s('espirito', d.espirito);
  s('pv', d.pv); s('ps', d.ps); s('pd', d.pd);
  s('armaduraNome', d.armaduraNome); s('armaduraValor', d.armaduraValor); s('armaduraProps', d.armaduraProps);
  s('arma1nome', d.arma1?.nome); s('arma1bonus', d.arma1?.bonus); s('arma1props', d.arma1?.props);
  s('arma2nome', d.arma2?.nome); s('arma2bonus', d.arma2?.bonus); s('arma2props', d.arma2?.props);
  s('mark-xp', d.markXp); s('marcaDesc', d.marcaDesc); s('falhasTexto', d.falhasTexto);
  s('antecedente', d.antecedente); s('notas', d.notas);

  // Keep bracketed derived hints in sync with base attributes
  calcDerived();

  // Conditions
  if (Array.isArray(d.customConditions)) {
    customConditions = d.customConditions;
  } else if (Array.isArray(d.conditions)) {
    // Backwards compatibility with old format
    customConditions = d.conditions.filter(c => !DEFAULT_CONDITIONS.includes(c));
  } else {
    customConditions = [];
  }
  activeConditions = new Set(Array.isArray(d.activeConditions) ? d.activeConditions : []);
  renderConditions();

  // Falhas marks
  falhasFilled = d.falhasFilled ?? 0;
  renderFalhasMarks();

  // Dynamic lists — migrate old training format {value} → {nome, descricao}
  trainings = (d.trainings ?? []).map(t => {
    if (typeof t === 'string') return { id: uid(), nome: t, descricao: '' };
    if (t.value !== undefined) return { id: uid(), nome: t.value, descricao: '' };
    return t;
  });
  abilities = d.abilities ?? [];
  effects = d.effects ?? [];
  clocks = (d.clocks ?? []).map(c => ({
    id: c.id ?? uid(),
    nome: c.nome ?? '',
    segments: Math.min(20, Math.max(2, parseInt(c.segments) || 6)),
    filled: Math.min(c.filled ?? 0, c.segments ?? 6)
  }));

  renderTrainings();
  renderAbilities();
  renderEffects();
  renderClocks();

  // Photo
  if (d.photoData) { photoData = d.photoData; showPhoto(photoData); }
  else clearPhoto();

  setupAutoSave();
}

// ── SAVE / LOAD ───────────────────────────────────────────────
function _save() { localStorage.setItem(STORAGE_KEY, JSON.stringify(collectData())); }
function saveData() { _save(); showToast('Ficha salva'); }

function loadData() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return;
  try { applyData(JSON.parse(raw)); } catch (e) { console.error('Erro ao carregar ficha:', e); }
}

// ── EXPORT / IMPORT ───────────────────────────────────────────
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
  inp.value = ''; // reset so re-importing same file works
  inp.click();
}

function setupImportInput() {
  document.getElementById('importInput').addEventListener('change', e => {
    const file = e.target.files[0]; if (!file) return;
    const r = new FileReader();
    r.onload = ev => {
      try {
        const d = JSON.parse(ev.target.result);
        applyData(d);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(d));
        showToast('Ficha importada');
      } catch {
        alert('Arquivo inválido. Certifique-se de que é um JSON exportado por esta ficha.');
      }
    };
    r.readAsText(file);
  });
}

// ── CLEAR ─────────────────────────────────────────────────────
function clearData() {
  if (!confirm('Apagar toda a ficha? Esta ação não pode ser desfeita.')) return;

  // Reset all state variables in memory
  customConditions = [];
  activeConditions = new Set();
  trainings = [];
  abilities = [];
  effects = [];
  clocks = [];
  falhasFilled = 0;
  photoData = null;

  // Clear all simple inputs and textareas
  document.querySelectorAll('input[type=text], input[type=number]:not([readonly]), textarea').forEach(el => { el.value = ''; });

  // Reset base attrs to default
  ['corpo', 'mente', 'espirito'].forEach(id => { const el = document.getElementById(id); if (el) el.value = '4'; });

  // Re-render dynamic sections
  calcDerived();
  renderConditions();
  renderFalhasMarks();
  renderTrainings();
  renderAbilities();
  renderEffects();
  renderClocks();
  clearPhoto();

  localStorage.removeItem(STORAGE_KEY);
  showToast('Ficha limpa');
}

// ── CLOCKS ─────────────────────────────────────────────────────
function addClock(data = {}) {
  clocks.push({
    id: uid(),
    nome: '',
    segments: 6,
    filled: 0,
    ...data
  });
  renderClocks();
  _save();
}

function renderClocks() {
  const grid = document.getElementById('clocksGrid');
  if (!grid) return;
  grid.innerHTML = '';
  clocks.forEach((c, i) => renderClockCard(grid, c, i));
}

function renderClockCard(grid, c, i) {
  const card = document.createElement('div');
  card.className = 'clock-card';

  // ── Name row
  const nameRow = document.createElement('div');
  nameRow.className = 'clock-name-row';
  const nameInp = document.createElement('input');
  nameInp.type = 'text';
  nameInp.value = c.nome;
  nameInp.placeholder = 'Nome do relógio...';
  nameInp.addEventListener('input', e => { clocks[i].nome = e.target.value; _save(); });
  const removeBtn = document.createElement('button');
  removeBtn.className = 'btn-remove';
  removeBtn.textContent = '×';
  removeBtn.title = 'Remover relógio';
  removeBtn.addEventListener('click', () => { clocks.splice(i, 1); renderClocks(); _save(); });
  nameRow.appendChild(nameInp);
  nameRow.appendChild(removeBtn);
  card.appendChild(nameRow);

  // ── SVG clock face
  const svgWrap = document.createElement('div');
  svgWrap.className = 'clock-svg-wrap';
  svgWrap.appendChild(buildClockSVG(c, i));
  const counter = document.createElement('div');
  counter.className = 'clock-counter';
  counter.id = `clock-counter-${c.id}`;
  counter.textContent = `${c.filled}/${c.segments}`;
  svgWrap.appendChild(counter);
  card.appendChild(svgWrap);

  // ── Meta row: size + reset
  const meta = document.createElement('div');
  meta.className = 'clock-meta';

  const sizeWrap = document.createElement('div');
  sizeWrap.style.cssText = 'display:flex;align-items:center;gap:4px;';
  const sizeLbl = document.createElement('label');
  sizeLbl.textContent = 'Seg.';
  const sizeInp = document.createElement('input');
  sizeInp.type = 'number';
  sizeInp.className = 'clock-size-input';
  sizeInp.value = c.segments;
  sizeInp.min = 2; sizeInp.max = 20;
  sizeInp.addEventListener('change', e => {
    const v = Math.min(20, Math.max(2, parseInt(e.target.value) || 6));
    clocks[i].segments = v;
    clocks[i].filled = Math.min(clocks[i].filled, v);
    e.target.value = v;
    renderClocks(); _save();
  });
  sizeWrap.appendChild(sizeLbl);
  sizeWrap.appendChild(sizeInp);

  const resetBtn = document.createElement('button');
  resetBtn.className = 'clock-reset-btn';
  resetBtn.textContent = 'Reset';
  resetBtn.addEventListener('click', () => { clocks[i].filled = 0; renderClocks(); _save(); });

  meta.appendChild(sizeWrap);
  meta.appendChild(resetBtn);
  card.appendChild(meta);

  grid.appendChild(card);
}

function buildClockSVG(c, i) {
  const SIZE = 120;
  const cx = SIZE / 2, cy = SIZE / 2;
  const R = 48, rInner = 14; // outer and inner radius for donut hole
  const n = c.segments;
  const gap = 0.03; // radians gap between segments
  const svgNS = 'http://www.w3.org/2000/svg';

  const svg = document.createElementNS(svgNS, 'svg');
  svg.setAttribute('width', SIZE);
  svg.setAttribute('height', SIZE);
  svg.setAttribute('viewBox', `0 0 ${SIZE} ${SIZE}`);

  // Background circle
  const bg = document.createElementNS(svgNS, 'circle');
  bg.setAttribute('cx', cx); bg.setAttribute('cy', cy); bg.setAttribute('r', R);
  bg.setAttribute('fill', '#111'); bg.setAttribute('stroke', '#3a3a3a'); bg.setAttribute('stroke-width', '1');
  svg.appendChild(bg);

  for (let s = 0; s < n; s++) {
    const startAngle = (2 * Math.PI / n) * s - Math.PI / 2 + gap / 2;
    const endAngle = (2 * Math.PI / n) * (s + 1) - Math.PI / 2 - gap / 2;
    const isFilled = s < c.filled;

    const path = document.createElementNS(svgNS, 'path');
    path.setAttribute('d', describeSegment(cx, cy, rInner, R, startAngle, endAngle));
    path.setAttribute('fill', isFilled ? '#c0392b' : '#2a2a2a');
    path.setAttribute('stroke', '#1a1a1a');
    path.setAttribute('stroke-width', '1.5');
    path.setAttribute('stroke-linejoin', 'round');
    path.classList.add('clock-segment');

    path.addEventListener('click', () => {
      const target = s + 1;
      // clicking the last filled segment unfills it; otherwise fill up to s+1
      clocks[i].filled = (clocks[i].filled === target) ? s : target;
      renderClocks();
      _save();
    });

    svg.appendChild(path);
  }

  // Center hole cover
  const hole = document.createElementNS(svgNS, 'circle');
  hole.setAttribute('cx', cx); hole.setAttribute('cy', cy); hole.setAttribute('r', rInner);
  hole.setAttribute('fill', '#1a1a1a'); hole.setAttribute('pointer-events', 'none');
  svg.appendChild(hole);

  return svg;
}

function describeSegment(cx, cy, r1, r2, startA, endA) {
  const x1 = cx + r2 * Math.cos(startA), y1 = cy + r2 * Math.sin(startA);
  const x2 = cx + r2 * Math.cos(endA), y2 = cy + r2 * Math.sin(endA);
  const x3 = cx + r1 * Math.cos(endA), y3 = cy + r1 * Math.sin(endA);
  const x4 = cx + r1 * Math.cos(startA), y4 = cy + r1 * Math.sin(startA);
  const large = (endA - startA) > Math.PI ? 1 : 0;
  return [
    `M ${x1} ${y1}`,
    `A ${r2} ${r2} 0 ${large} 1 ${x2} ${y2}`,
    `L ${x3} ${y3}`,
    `A ${r1} ${r1} 0 ${large} 0 ${x4} ${y4}`,
    'Z'
  ].join(' ');
}

// ── TOAST ─────────────────────────────────────────────────────
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg; t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2500);
}

// ── UTILS ─────────────────────────────────────────────────────
function uid() { return Date.now() + Math.random(); }
function esc(s) {
  if (!s) return '';
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}