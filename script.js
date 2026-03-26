// ── CONSTANTS ────────────────────────────────────────────────
const STORAGE_KEY = 'ficha_rpg';
const FALHAS_MAX  = 5;
const DEFAULT_CONDITIONS = ['Debilitado', 'Enfeitiçado', 'Exausto'];

// ── STATE ────────────────────────────────────────────────────
let customConditions = [];
let activeConditions  = new Set();
let trainings  = [];
let abilities  = [];
let effects    = [];
let falhasFilled = 0;
let photoData    = null;

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
  const toInt = (id, fb=0) => { const n = parseInt(document.getElementById(id)?.value, 10); return isNaN(n) ? fb : n; };
  const pv = document.getElementById('pv'); if (pv) pv.value = 8 + 3 * toInt('espirito');
  const ps = document.getElementById('ps'); if (ps) ps.value = 2 * toInt('mente');
  const pd = document.getElementById('pd'); if (pd) pd.value = 3 * toInt('corpo');
}
function bindDerivedStats() {
  ['corpo','mente','espirito'].forEach(id => {
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
  abilities.push({ id: uid(), nome:'', custo:'', forma:'', duracao:'', alcance:'', intensidade:'', area:'', transfig:'', descricao:'', ...data });
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
  effects.push({ id: uid(), nome:'', tipo:'', descricao:'', ...data });
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
    trainings, abilities, effects,
    antecedente: g('antecedente'), notas: g('notas'),
    photoData
  };
}

// ── APPLY DATA (shared by loadData & importJSON) ──────────────
function applyData(d) {
  const s = (id, v) => { const el = document.getElementById(id); if (el && v !== undefined) el.value = v; };

  s('nome', d.nome); s('xp', d.xp); s('inspiracao', d.inspiracao); s('origem', d.origem);
  s('corpo', d.corpo); s('mente', d.mente); s('espirito', d.espirito);
  s('armaduraNome', d.armaduraNome); s('armaduraValor', d.armaduraValor); s('armaduraProps', d.armaduraProps);
  s('arma1nome', d.arma1?.nome); s('arma1bonus', d.arma1?.bonus); s('arma1props', d.arma1?.props);
  s('arma2nome', d.arma2?.nome); s('arma2bonus', d.arma2?.bonus); s('arma2props', d.arma2?.props);
  s('mark-xp', d.markXp); s('marcaDesc', d.marcaDesc); s('falhasTexto', d.falhasTexto);
  s('antecedente', d.antecedente); s('notas', d.notas);

  // Derived stats are readonly — recalculate from base attrs
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
  effects   = d.effects   ?? [];
  renderTrainings();
  renderAbilities();
  renderEffects();

  // Photo
  if (d.photoData) { photoData = d.photoData; showPhoto(photoData); }
  else clearPhoto();

  setupAutoSave();
}

// ── SAVE / LOAD ───────────────────────────────────────────────
function _save()    { localStorage.setItem(STORAGE_KEY, JSON.stringify(collectData())); }
function saveData() { _save(); showToast('Ficha salva'); }

function loadData() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return;
  try { applyData(JSON.parse(raw)); } catch(e) { console.error('Erro ao carregar ficha:', e); }
}

// ── EXPORT / IMPORT ───────────────────────────────────────────
function downloadJSON() {
  const data = collectData();
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
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
  activeConditions  = new Set();
  trainings  = [];
  abilities  = [];
  effects    = [];
  falhasFilled = 0;
  photoData    = null;

  // Clear all simple inputs and textareas
  document.querySelectorAll('input[type=text], input[type=number]:not([readonly]), textarea').forEach(el => { el.value = ''; });

  // Reset base attrs to default
  ['corpo','mente','espirito'].forEach(id => { const el = document.getElementById(id); if (el) el.value = '4'; });

  // Re-render dynamic sections
  calcDerived();
  renderConditions();
  renderFalhasMarks();
  renderTrainings();
  renderAbilities();
  renderEffects();
  clearPhoto();

  localStorage.removeItem(STORAGE_KEY);
  showToast('Ficha limpa');
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
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}