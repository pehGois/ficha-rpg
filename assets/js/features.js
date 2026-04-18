function setupPhotoUpload() {
  document.getElementById('photoUpload').addEventListener('click', () => {
    document.getElementById('photoInput').click();
  });

  document.getElementById('photoInput').addEventListener('change', e => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = ev => {
      photoData = ev.target.result;
      showPhoto(photoData);
      _save();
    };
    reader.readAsDataURL(file);
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
      btn.type = 'button';
      btn.className = 'cond-remove';
      btn.textContent = '✕';
      btn.addEventListener('click', e => {
        e.stopPropagation();
        removeCondition(name);
      });
      item.appendChild(btn);
    }

    grid.appendChild(item);
  });
}

function addCondition() {
  const input = document.getElementById('newConditionInput');
  const name = input.value.trim();
  if (!name || DEFAULT_CONDITIONS.includes(name) || customConditions.includes(name)) return;

  customConditions.push(name);
  input.value = '';
  renderConditions();
  _save();
}

function removeCondition(name) {
  customConditions = customConditions.filter(c => c !== name);
  activeConditions.delete(name);
  renderConditions();
  _save();
}

function renderFalhasMarks() {
  const container = document.getElementById('falhasMarks');
  if (!container) return;

  container.innerHTML = '';
  for (let i = 0; i < FALHAS_MAX; i++) {
    const mark = document.createElement('div');
    mark.className = 'mark falha-mark' + (i < falhasFilled ? ' filled' : '');
    mark.textContent = '✗';
    mark.addEventListener('click', () => {
      falhasFilled = i < falhasFilled ? i : i + 1;
      renderFalhasMarks();
      _save();
    });
    container.appendChild(mark);
  }
}

function addTraining(data = {}) {
  trainings.push({ id: uid(), nome: '', descricao: '', ...data });
  renderTrainings();
  _save();
}

function renderTrainings() {
  const list = document.getElementById('trainingList');
  list.innerHTML = '';

  trainings.forEach((t, i) => {
    const d = document.createElement('div');
    d.className = 'training-card';
    d.innerHTML = `
      <div class="card-header">
        <span class="card-label">Treinamento ${i + 1}</span>
        <button class="btn-remove">× Remover</button>
      </div>
      <div class="spell-grid">
        <div class="field full"><label>Nome</label><input type="text" value="${esc(t.nome)}" placeholder="Nome do treinamento..." data-field="nome"></div>
        <div class="field full"><label>Descrição</label><textarea placeholder="Detalhes do treinamento..." data-field="descricao" style="min-height:70px;">${esc(t.descricao)}</textarea></div>
      </div>`;

    d.querySelector('.btn-remove').addEventListener('click', () => {
      trainings.splice(i, 1);
      renderTrainings();
      _save();
    });

    d.querySelectorAll('[data-field]').forEach(el => {
      el.addEventListener('input', e => {
        trainings[i][e.target.dataset.field] = e.target.value;
        _save();
      });
    });

    list.appendChild(d);
  });
}

function addAbility(data = {}) {
  abilities.push({ id: uid(), nome: '', fundament: '', custo: '', forma: '', duracao: '', alcance: '', intensidade: '', area: '', transfig: '', descricao: '', ...data });
  renderAbilities();
}

function renderAbilities() {
  const list = document.getElementById('abilityList');
  list.innerHTML = '';

  abilities.forEach((a, i) => {
    const fundament = a.fundament ?? a.fundamento ?? '';
    const d = document.createElement('div');
    d.className = 'ability-card';
    d.innerHTML = `
      <div class="card-header"><span class="card-label">Habilidade ${i + 1}</span><button class="btn-remove">× Remover</button></div>
      <div class="spell-grid">
        <div class="field"><label>Nome</label><input type="text" value="${esc(a.nome)}" placeholder="Nome da habilidade" data-field="nome"></div>
        <div class="field"><label>Fundamento</label><select placeholder="Nome do Fundamento" data-field="fundament">
          <option value="">Selecione...</option>
          <option value="Corpo"${fundament === 'Corpo' ? ' selected' : ''}>Corpo</option>
          <option value="Mente"${fundament === 'Mente' ? ' selected' : ''}>Mente</option>
          <option value="Espirito"${fundament === 'Espirito' ? ' selected' : ''}>Espirito</option>
        </select></div>
        <div class="field"><label>Custo</label><input type="text" value="${esc(a.custo)}" placeholder="X PS" data-field="custo"></div>
        <div class="field"><label>Forma</label><input type="text" value="${esc(a.forma)}" placeholder="Gestual Duas Mãos, Ritual ..." data-field="forma"></div>
        <div class="field"><label>Duração</label><input type="text" value="${esc(a.duracao)}" placeholder="Duração" data-field="duracao"></div>
        <div class="field"><label>Alcance</label><input type="text" value="${esc(a.alcance)}" placeholder="Alcance" data-field="alcance"></div>
        <div class="field"><label>Intensidade</label><input type="text" value="${esc(a.intensidade)}" placeholder="Intensidade" data-field="intensidade"></div>
        <div class="field"><label>Área de Efeito</label><input type="text" value="${esc(a.area)}" placeholder="Área de efeito" data-field="area"></div>
        <div class="field"><label>Transfigurações</label><input type="text" value="${esc(a.transfig)}" placeholder="Modificadores" data-field="transfig"></div>
        <div class="field full"><label>Descrição</label><textarea placeholder="Como esta habilidade funciona..." data-field="descricao">${esc(a.descricao)}</textarea></div>
      </div>`;

    d.querySelector('.btn-remove').addEventListener('click', () => {
      abilities.splice(i, 1);
      renderAbilities();
      _save();
    });

    d.querySelectorAll('[data-field]').forEach(el => {
      const syncField = e => {
        abilities[i][e.target.dataset.field] = e.target.value;
        _save();
      };
      el.addEventListener('input', syncField);
      el.addEventListener('change', syncField);
    });

    list.appendChild(d);
  });
}

function addEffect(data = {}) {
  effects.push({ id: uid(), nome: '', custo: '', intensidade: '', area: '', duracao: '', alcance: '', transfig: '', descricao: '', ...data });
  renderEffects();
}

function renderEffects() {
  const list = document.getElementById('effectsList');
  list.innerHTML = '';

  effects.forEach((ef, i) => {
    const d = document.createElement('div');
    d.className = 'effect-item';
    d.innerHTML = `
      <div class="card-header"><span class="card-label">Efeito ${i + 1}</span><button class="btn-remove">× Remover</button></div>
      <div class="spell-grid">
        <div class="field"><label>Nome</label><input type="text" value="${esc(ef.nome)}" placeholder="Nome do efeito" data-field="nome"></div>
        <div class="field"><label>Custo de Conjuração</label><input type="text" value="${esc(ef.custo)}" placeholder="X PS" data-field="custo"></div>
        <div class="field"><label>Intensidade</label><input type="text" value="${esc(ef.intensidade)}" placeholder="Intensidade" data-field="intensidade"></div>
        <div class="field"><label>Área de Efeito</label><input type="text" value="${esc(ef.area)}" placeholder="Área de efeito" data-field="area"></div>
        <div class="field"><label>Duração</label><input type="text" value="${esc(ef.duracao)}" placeholder="Duração" data-field="duracao"></div>
        <div class="field"><label>Alcance</label><input type="text" value="${esc(ef.alcance)}" placeholder="Alcance" data-field="alcance"></div>
        <div class="field full"><label>Transfigurações</label><input type="text" value="${esc(ef.transfig)}" placeholder="Modificadores" data-field="transfig"></div>
        <div class="field full"><label>Descrição</label><textarea data-field="descricao" placeholder="O que este efeito faz..." style="min-height:60px;">${esc(ef.descricao)}</textarea></div>
      </div>`;

    d.querySelector('.btn-remove').addEventListener('click', () => {
      effects.splice(i, 1);
      renderEffects();
      _save();
    });

    d.querySelectorAll('[data-field]').forEach(el => {
      el.addEventListener('input', e => {
        effects[i][e.target.dataset.field] = e.target.value;
        _save();
      });
    });

    list.appendChild(d);
  });
}

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

  const nameRow = document.createElement('div');
  nameRow.className = 'clock-name-row';

  const nameInp = document.createElement('input');
  nameInp.type = 'text';
  nameInp.value = c.nome;
  nameInp.placeholder = 'Nome do relógio...';
  nameInp.addEventListener('input', e => {
    clocks[i].nome = e.target.value;
    _save();
  });

  const removeBtn = document.createElement('button');
  removeBtn.className = 'btn-remove';
  removeBtn.textContent = '×';
  removeBtn.title = 'Remover relógio';
  removeBtn.addEventListener('click', () => {
    clocks.splice(i, 1);
    renderClocks();
    _save();
  });

  nameRow.appendChild(nameInp);
  nameRow.appendChild(removeBtn);
  card.appendChild(nameRow);

  const svgWrap = document.createElement('div');
  svgWrap.className = 'clock-svg-wrap';
  svgWrap.appendChild(buildClockSVG(c, i));

  const counter = document.createElement('div');
  counter.className = 'clock-counter';
  counter.id = `clock-counter-${c.id}`;
  counter.textContent = `${c.filled}/${c.segments}`;
  svgWrap.appendChild(counter);
  card.appendChild(svgWrap);

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
  sizeInp.min = 2;
  sizeInp.max = 20;
  sizeInp.addEventListener('change', e => {
    const v = Math.min(20, Math.max(2, parseInt(e.target.value, 10) || 6));
    clocks[i].segments = v;
    clocks[i].filled = Math.min(clocks[i].filled, v);
    e.target.value = v;
    renderClocks();
    _save();
  });

  sizeWrap.appendChild(sizeLbl);
  sizeWrap.appendChild(sizeInp);

  const resetBtn = document.createElement('button');
  resetBtn.className = 'clock-reset-btn';
  resetBtn.textContent = 'Reset';
  resetBtn.addEventListener('click', () => {
    clocks[i].filled = 0;
    renderClocks();
    _save();
  });

  meta.appendChild(sizeWrap);
  meta.appendChild(resetBtn);
  card.appendChild(meta);

  grid.appendChild(card);
}

function buildClockSVG(c, i) {
  const SIZE = 120;
  const cx = SIZE / 2;
  const cy = SIZE / 2;
  const R = 48;
  const rInner = 14;
  const n = c.segments;
  const gap = 0.03;
  const svgNS = 'http://www.w3.org/2000/svg';

  const svg = document.createElementNS(svgNS, 'svg');
  svg.setAttribute('width', SIZE);
  svg.setAttribute('height', SIZE);
  svg.setAttribute('viewBox', `0 0 ${SIZE} ${SIZE}`);

  const bg = document.createElementNS(svgNS, 'circle');
  bg.setAttribute('cx', cx);
  bg.setAttribute('cy', cy);
  bg.setAttribute('r', R);
  bg.setAttribute('fill', '#111');
  bg.setAttribute('stroke', '#3a3a3a');
  bg.setAttribute('stroke-width', '1');
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
      clocks[i].filled = clocks[i].filled === target ? s : target;
      renderClocks();
      _save();
    });

    svg.appendChild(path);
  }

  const hole = document.createElementNS(svgNS, 'circle');
  hole.setAttribute('cx', cx);
  hole.setAttribute('cy', cy);
  hole.setAttribute('r', rInner);
  hole.setAttribute('fill', '#1a1a1a');
  hole.setAttribute('pointer-events', 'none');
  svg.appendChild(hole);

  return svg;
}

function describeSegment(cx, cy, r1, r2, startA, endA) {
  const x1 = cx + r2 * Math.cos(startA);
  const y1 = cy + r2 * Math.sin(startA);
  const x2 = cx + r2 * Math.cos(endA);
  const y2 = cy + r2 * Math.sin(endA);
  const x3 = cx + r1 * Math.cos(endA);
  const y3 = cy + r1 * Math.sin(endA);
  const x4 = cx + r1 * Math.cos(startA);
  const y4 = cy + r1 * Math.sin(startA);
  const large = endA - startA > Math.PI ? 1 : 0;

  return [
    `M ${x1} ${y1}`,
    `A ${r2} ${r2} 0 ${large} 1 ${x2} ${y2}`,
    `L ${x3} ${y3}`,
    `A ${r1} ${r1} 0 ${large} 0 ${x4} ${y4}`,
    'Z'
  ].join(' ');
}

function addCounter(data = {}) {
  counters.push({ id: uid(), nome: '', valor: '', ...data });
  renderCounters();
  _save();
}

function renderCounters() {
  const list = document.getElementById('countersList');
  if (!list) return;

  list.innerHTML = '';

  counters.forEach((counter, i) => {
    const d = document.createElement('div');
    d.className = 'counter-item';
    d.innerHTML = `
      <div class="card-header">
        <span class="card-label">Contador ${i + 1}</span>
        <button class="btn-remove">× Remover</button>
      </div>
      <div class="counter-grid">
        <div class="field"><label>Nome</label><input type="text" value="${esc(counter.nome)}" placeholder="Nome do contador" data-field="nome"></div>
        <div class="field"><label>Valor</label><input type="number" value="${esc(counter.valor)}" placeholder="0" data-field="valor"></div>
      </div>`;

    d.querySelector('.btn-remove').addEventListener('click', () => {
      counters.splice(i, 1);
      renderCounters();
      _save();
    });

    d.querySelectorAll('[data-field]').forEach(el => {
      el.addEventListener('input', e => {
        counters[i][e.target.dataset.field] = e.target.value;
        _save();
      });
    });

    list.appendChild(d);
  });
}
