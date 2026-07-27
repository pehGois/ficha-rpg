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

function renderArchetypeSection() {
  if (!document.getElementById('archetypeSection')) return;

  const currentArchetype = archetype && typeof archetype === 'object' ? archetype : createDefaultArchetypeData();
  archetype = {
    ...createDefaultArchetypeData(),
    ...currentArchetype,
    ideaisMaiores: {
      desafio: !!currentArchetype?.ideaisMaiores?.desafio,
      antecedente: !!currentArchetype?.ideaisMaiores?.antecedente,
      dificuldade: !!currentArchetype?.ideaisMaiores?.dificuldade
    },
    ideaisMenores: Array.isArray(currentArchetype?.ideaisMenores) ? currentArchetype.ideaisMenores : [],
    poderes: Array.isArray(currentArchetype?.poderes) ? currentArchetype.poderes : [],
    peculiaridade: {
      nome: currentArchetype?.peculiaridade?.nome ?? '',
      custoXp: currentArchetype?.peculiaridade?.custoXp ?? '',
      descricao: currentArchetype?.peculiaridade?.descricao ?? ''
    },
    sombra: {
      marcacoes: Array.isArray(currentArchetype?.sombra?.marcacoes) && currentArchetype.sombra.marcacoes.length
        ? currentArchetype.sombra.marcacoes
        : [
            { id: `${Date.now()}-0`, label: 'XP ≤ 0', descricao: '' },
            { id: `${Date.now()}-1`, label: 'XP ≤ 5', descricao: '' },
            { id: `${Date.now()}-2`, label: 'XP ≤ 10', descricao: '' }
          ]
    }
  };

  const nameInput = document.getElementById('archetypeNome');
  if (nameInput && nameInput.value !== (archetype.nome ?? '')) {
    nameInput.value = archetype.nome ?? '';
  }

  const xpInput = document.getElementById('archetypeXp');
  if (xpInput && xpInput.value !== (archetype.xp ?? '')) {
    xpInput.value = archetype.xp ?? '';
  }

  document.querySelectorAll('.archetype-ideal-checkbox').forEach(cb => {
    const key = cb.dataset.archetypeIdeal;
    cb.checked = !!archetype.ideaisMaiores?.[key];
  });

  const minorList = document.getElementById('archetypeMinorIdealsList');
  if (minorList) {
    minorList.innerHTML = '';
    archetype.ideaisMenores.forEach((item, index) => {
      const row = document.createElement('div');
      row.className = 'archetype-idea-row';
      row.innerHTML = `
        <input type="checkbox" class="archetype-minor-checkbox" ${item.checked ? 'checked' : ''}>
        <input type="text" value="${esc(item.texto || '')}" placeholder="Ideal menor ${index + 1}" data-field="texto">
        <button type="button" class="btn-remove" data-action="remove-minor">×</button>`;

      row.querySelector('.archetype-minor-checkbox').addEventListener('change', e => {
        archetype.ideaisMenores[index].checked = e.target.checked;
        _save();
      });
      row.querySelector('[data-field="texto"]').addEventListener('input', e => {
        archetype.ideaisMenores[index].texto = e.target.value;
        _save();
      });
      row.querySelector('[data-action="remove-minor"]').addEventListener('click', () => {
        archetype.ideaisMenores.splice(index, 1);
        renderArchetypeSection();
        _save();
      });
      minorList.appendChild(row);
    });
  }

  const powersList = document.getElementById('archetypePowersList');
  if (powersList) {
    powersList.innerHTML = '';
    archetype.poderes.forEach((power, index) => {
      const item = document.createElement('div');
      item.className = 'archetype-power-item';
      item.innerHTML = `
        <div class="field full"><label>Nome</label><input type="text" value="${esc(power.nome || '')}" placeholder="Nome do poder" data-field="nome"></div>
        <div class="field full"><label>Descrição</label><textarea placeholder="Descrição do poder..." data-field="descricao">${esc(power.descricao || '')}</textarea></div>
        <button type="button" class="btn-remove" data-action="remove-power">×</button>`;

      item.querySelector('[data-field="nome"]').addEventListener('input', e => {
        archetype.poderes[index].nome = e.target.value;
        _save();
      });
      item.querySelector('[data-field="descricao"]').addEventListener('input', e => {
        archetype.poderes[index].descricao = e.target.value;
        _save();
      });
      item.querySelector('[data-action="remove-power"]').addEventListener('click', () => {
        archetype.poderes.splice(index, 1);
        renderArchetypeSection();
        _save();
      });
      powersList.appendChild(item);
    });
  }

  const pecNome = document.getElementById('archetypePeculiaridadeNome');
  if (pecNome && pecNome.value !== (archetype.peculiaridade?.nome ?? '')) {
    pecNome.value = archetype.peculiaridade?.nome ?? '';
  }

  const pecCusto = document.getElementById('archetypePeculiaridadeCusto');
  if (pecCusto && pecCusto.value !== (archetype.peculiaridade?.custoXp ?? '')) {
    pecCusto.value = archetype.peculiaridade?.custoXp ?? '';
  }

  const pecDescricao = document.getElementById('archetypePeculiaridadeDescricao');
  if (pecDescricao && pecDescricao.value !== (archetype.peculiaridade?.descricao ?? '')) {
    pecDescricao.value = archetype.peculiaridade?.descricao ?? '';
  }

  const shadowBody = document.getElementById('archetypeShadowBody');
  if (shadowBody) {
    shadowBody.innerHTML = '';
    (archetype.sombra?.marcacoes || []).forEach((marcacao, index) => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${esc(marcacao.label || `Marcação ${index + 1}`)}</td>
        <td><input type="text" value="${esc(marcacao.descricao || '')}" placeholder="Descrição" data-index="${index}"></td>`;
      row.querySelector('input').addEventListener('input', e => {
        archetype.sombra.marcacoes[index].descricao = e.target.value;
        _save();
      });
      shadowBody.appendChild(row);
    });
  }
}

function attachArchetypeEvents() {
  const nameInput = document.getElementById('archetypeNome');
  if (nameInput) {
    nameInput.addEventListener('input', e => {
      archetype.nome = e.target.value;
      _save();
    });
  }

  const xpInput = document.getElementById('archetypeXp');
  if (xpInput) {
    xpInput.addEventListener('input', e => {
      archetype.xp = e.target.value;
      _save();
    });
  }

  document.querySelectorAll('.archetype-ideal-checkbox').forEach(cb => {
    cb.addEventListener('change', e => {
      const key = e.target.dataset.archetypeIdeal;
      if (key) {
        archetype.ideaisMaiores[key] = e.target.checked;
        _save();
      }
    });
  });

  const addMinorBtn = document.getElementById('addArchetypeMinorIdeal');
  if (addMinorBtn) {
    addMinorBtn.addEventListener('click', () => {
      archetype.ideaisMenores.push({ id: `arq-${Date.now()}-${Math.random().toString(16).slice(2)}`, texto: '', checked: false });
      renderArchetypeSection();
      _save();
    });
  }

  const addPowerBtn = document.getElementById('addArchetypePower');
  if (addPowerBtn) {
    addPowerBtn.addEventListener('click', () => {
      archetype.poderes.push({ id: `arq-${Date.now()}-${Math.random().toString(16).slice(2)}`, nome: '', descricao: '' });
      renderArchetypeSection();
      _save();
    });
  }

  const pecNome = document.getElementById('archetypePeculiaridadeNome');
  if (pecNome) {
    pecNome.addEventListener('input', e => {
      archetype.peculiaridade.nome = e.target.value;
      _save();
    });
  }

  const pecCusto = document.getElementById('archetypePeculiaridadeCusto');
  if (pecCusto) {
    pecCusto.addEventListener('input', e => {
      archetype.peculiaridade.custoXp = e.target.value;
      _save();
    });
  }

  const pecDescricao = document.getElementById('archetypePeculiaridadeDescricao');
  if (pecDescricao) {
    pecDescricao.addEventListener('input', e => {
      archetype.peculiaridade.descricao = e.target.value;
      _save();
    });
  }
}

function addTraining(data = {}) {
  trainings.push({ id: uid(), nome: '', descricao: '', collapsed: false, ...data });
  renderTrainings();
  _save();
}

function renderTrainings() {
  const list = document.getElementById('trainingList');
  list.innerHTML = '';

  trainings.forEach((t, i) => {
    const d = document.createElement('div');
    d.className = 'training-card accordion-card' + (t.collapsed ? ' collapsed' : '');
    const trainingLabel = (t.nome && t.nome.trim()) ? esc(t.nome) : `Treinamento ${i + 1}`;
    d.innerHTML = `
      <div class="card-header accordion-header">
        <button class="accordion-toggle" type="button">${t.collapsed ? '▸' : '▾'}</button>
        <span class="card-label">${trainingLabel}</span>
        <button class="btn-remove">× Remover</button>
      </div>
      <div class="accordion-body">
        <div class="spell-grid">
          <div class="field full"><label>Nome</label><input type="text" value="${esc(t.nome)}" placeholder="Nome do treinamento..." data-field="nome"></div>
          <div class="field full"><label>Descrição</label><textarea placeholder="Detalhes do treinamento..." data-field="descricao" style="min-height:70px;">${esc(t.descricao)}</textarea></div>
        </div>
      </div>`;

    const toggleBtn = d.querySelector('.accordion-toggle');
    toggleBtn.addEventListener('click', () => {
      trainings[i].collapsed = !trainings[i].collapsed;
      renderTrainings();
      _save();
    });

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
  abilities.push({ id: uid(), nome: '', fundament: '', custo: '', forma: '', duracao: '', alcance: '', intensidade: '', area: '', transfig: '', descricao: '', collapsed: false, ...data });
  renderAbilities();
}

function renderAbilities() {
  const list = document.getElementById('abilityList');
  list.innerHTML = '';

  abilities.forEach((a, i) => {
    const fundament = a.fundament ?? a.fundamento ?? '';
    const d = document.createElement('div');
    d.className = 'ability-card accordion-card' + (a.collapsed ? ' collapsed' : '');
    const abilityLabel = (a.nome && a.nome.trim()) ? esc(a.nome) : `Habilidade ${i + 1}`;
    d.innerHTML = `
      <div class="card-header accordion-header"><button class="accordion-toggle" type="button">${a.collapsed ? '▸' : '▾'}</button><span class="card-label">${abilityLabel}</span><button class="btn-remove">× Remover</button></div>
      <div class="accordion-body">
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
      </div>
      </div>`;

    const toggleBtn = d.querySelector('.accordion-toggle');
    toggleBtn.addEventListener('click', () => {
      abilities[i].collapsed = !abilities[i].collapsed;
      renderAbilities();
      _save();
    });

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
  effects.push({ id: uid(), nome: '', custo: '', intensidade: '', area: '', duracao: '', alcance: '', transfig: '', descricao: '', collapsed: false, ...data });
  renderEffects();
}

function renderEffects() {
  const list = document.getElementById('effectsList');
  list.innerHTML = '';

  effects.forEach((ef, i) => {
    const d = document.createElement('div');
    d.className = 'effect-item accordion-card' + (ef.collapsed ? ' collapsed' : '');
    const effectLabel = (ef.nome && ef.nome.trim()) ? esc(ef.nome) : `Efeito ${i + 1}`;
    d.innerHTML = `
      <div class="card-header accordion-header"><button class="accordion-toggle" type="button">${ef.collapsed ? '▸' : '▾'}</button><span class="card-label">${effectLabel}</span><button class="btn-remove">× Remover</button></div>
      <div class="accordion-body">
      <div class="spell-grid">
        <div class="field"><label>Nome</label><input type="text" value="${esc(ef.nome)}" placeholder="Nome do efeito" data-field="nome"></div>
        <div class="field"><label>Custo de Conjuração</label><input type="text" value="${esc(ef.custo)}" placeholder="X PS" data-field="custo"></div>
        <div class="field"><label>Intensidade</label><input type="text" value="${esc(ef.intensidade)}" placeholder="Intensidade" data-field="intensidade"></div>
        <div class="field"><label>Área de Efeito</label><input type="text" value="${esc(ef.area)}" placeholder="Área de efeito" data-field="area"></div>
        <div class="field"><label>Duração</label><input type="text" value="${esc(ef.duracao)}" placeholder="Duração" data-field="duracao"></div>
        <div class="field"><label>Alcance</label><input type="text" value="${esc(ef.alcance)}" placeholder="Alcance" data-field="alcance"></div>
        <div class="field full"><label>Transfigurações</label><input type="text" value="${esc(ef.transfig)}" placeholder="Modificadores" data-field="transfig"></div>
        <div class="field full"><label>Descrição</label><textarea data-field="descricao" placeholder="O que este efeito faz..." style="min-height:60px;">${esc(ef.descricao)}</textarea></div>
      </div>
      </div>`;

    const toggleBtn = d.querySelector('.accordion-toggle');
    toggleBtn.addEventListener('click', () => {
      effects[i].collapsed = !effects[i].collapsed;
      renderEffects();
      _save();
    });

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
  counters.push({ id: uid(), nome: '', valor: '', collapsed: false, ...data });
  renderCounters();
  _save();
}

function renderCounters() {
  const list = document.getElementById('countersList');
  if (!list) return;

  list.innerHTML = '';

  counters.forEach((counter, i) => {
    const d = document.createElement('div');
    d.className = 'counter-item accordion-card' + (counter.collapsed ? ' collapsed' : '');
    const counterLabel = (counter.nome && counter.nome.trim()) ? esc(counter.nome) : `Contador ${i + 1}`;
    d.innerHTML = `
      <div class="card-header accordion-header">
        <button class="accordion-toggle" type="button">${counter.collapsed ? '▸' : '▾'}</button>
        <span class="card-label">${counterLabel}</span>
        <button class="btn-remove">× Remover</button>
      </div>
      <div class="accordion-body">
        <div class="counter-grid">
          <div class="field"><label>Nome</label><input type="text" value="${esc(counter.nome)}" placeholder="Nome do contador" data-field="nome"></div>
          <div class="field"><label>Valor</label><input type="number" value="${esc(counter.valor)}" placeholder="0" data-field="valor"></div>
        </div>
      </div>`;

    const toggleBtn = d.querySelector('.accordion-toggle');
    toggleBtn.addEventListener('click', () => {
      counters[i].collapsed = !counters[i].collapsed;
      renderCounters();
      _save();
    });

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
      el.addEventListener('change', e => {
        counters[i][e.target.dataset.field] = e.target.value;
        _save();
      });
    });

    list.appendChild(d);
  });
}

function addInventoryItem(data = {}) {
  const source = (data && typeof data === 'object' && !Array.isArray(data)) ? data : {};
  if (!Array.isArray(inventory)) inventory = [];
  inventory.push({ id: uid(), nome: '', descricao: '', collapsed: false, ...source });
  renderInventory();
  _save();
}

function renderInventory() {
  const list = document.getElementById('inventoryList');
  if (!list) return;

  list.innerHTML = '';

  if (!Array.isArray(inventory)) inventory = [];

  inventory.forEach((item, i) => {
    const d = document.createElement('div');
    d.className = 'accordion-card' + (item.collapsed ? ' collapsed' : '');

    const itemLabel = (item.nome && item.nome.trim()) ? esc(item.nome) : `Item ${i + 1}`;
    d.innerHTML = `
      <div class="card-header accordion-header">
        <button class="accordion-toggle" type="button">${item.collapsed ? '▸' : '▾'}</button>
        <span class="card-label">${itemLabel}</span>
        <button class="btn-remove">× Remover</button>
      </div>
      <div class="accordion-body">
        <div class="spell-grid">
          <div class="field full"><label>Nome</label><input type="text" value="${esc(item.nome)}" placeholder="Nome do item" data-field="nome"></div>
          <div class="field full"><label>Descrição</label><textarea placeholder="Descrição do item..." data-field="descricao" style="min-height:70px;">${esc(item.descricao)}</textarea></div>
        </div>
      </div>`;

    d.querySelector('.accordion-toggle').addEventListener('click', () => {
      inventory[i].collapsed = !inventory[i].collapsed;
      renderInventory();
      _save();
    });

    d.querySelector('.btn-remove').addEventListener('click', () => {
      inventory.splice(i, 1);
      renderInventory();
      _save();
    });

    d.querySelectorAll('[data-field]').forEach(el => {
      el.addEventListener('input', e => {
        inventory[i][e.target.dataset.field] = e.target.value;
        _save();
      });
    });

    list.appendChild(d);
  });
}

function addWeapon(data = {}) {
  const source = (data && typeof data === 'object' && !Array.isArray(data)) ? data : {};
  if (!Array.isArray(weapons)) weapons = [];
  weapons.push({ id: uid(), nome: '', bonus: '', props: '', collapsed: false, ...source });
  renderWeapons();
  _save();
}

function renderWeapons() {
  const list = document.getElementById('weaponsList');
  if (!list) return;

  list.innerHTML = '';

  if (!Array.isArray(weapons)) weapons = [];

  weapons.forEach((weapon, i) => {
    const d = document.createElement('div');
    d.className = 'weapon-item accordion-card' + (weapon.collapsed ? ' collapsed' : '');
    const weaponLabel = (weapon.nome && weapon.nome.trim()) ? esc(weapon.nome) : `Arma ${i + 1}`;
    d.innerHTML = `
      <div class="card-header accordion-header">
        <button class="accordion-toggle" type="button">${weapon.collapsed ? '▸' : '▾'}</button>
        <span class="card-label">${weaponLabel}</span>
        <button class="btn-remove">× Remover</button>
      </div>
      <div class="accordion-body">
        <div class="weapon-row">
          <div class="field"><label>Nome</label><input type="text" value="${esc(weapon.nome)}" placeholder="Nome da arma" data-field="nome"></div>
          <div class="field"><label>Bônus de Dano</label><input type="text" value="${esc(weapon.bonus)}" placeholder="+0" data-field="bonus"></div>
        </div>
        <div class="field"><label>Propriedades</label><input type="text" value="${esc(weapon.props)}" placeholder="Perfurante, Arremessável II..." data-field="props"></div>
      </div>`;

    d.querySelector('.accordion-toggle').addEventListener('click', () => {
      weapons[i].collapsed = !weapons[i].collapsed;
      renderWeapons();
      _save();
    });

    d.querySelector('.btn-remove').addEventListener('click', () => {
      weapons.splice(i, 1);
      renderWeapons();
      _save();
    });

    d.querySelectorAll('[data-field]').forEach(el => {
      el.addEventListener('input', e => {
        weapons[i][e.target.dataset.field] = e.target.value;
        _save();
      });
    });

    list.appendChild(d);
  });
}

  function renderPericias() {
    const container = document.getElementById('periciasList');
    if (!container) return;

    container.innerHTML = '';

    const grid = document.createElement('div');
    grid.className = 'pericias-grid';

    Object.keys(pericias || {}).forEach(group => {
      const col = document.createElement('div');
      col.className = 'pericias-group';

      const title = document.createElement('div');
      title.className = 'pericias-group-title';
      // show attribute die next to group name, e.g. "Corpo [1d4]"
      const attrId = group === 'Corpo' ? 'corpo' : group === 'Mente' ? 'mente' : group === 'Espirito' ? 'espirito' : null;
      const attrVal = attrId ? (document.getElementById(attrId)?.value || '') : '';
      title.textContent = attrVal ? `${group} [1d${attrVal}]` : group;
      col.appendChild(title);

      Object.keys(pericias[group] || {}).forEach(skill => {
        const row = document.createElement('div');
        row.className = 'pericia-item';

        const lbl = document.createElement('label');
        lbl.textContent = skill;

        const inp = document.createElement('input');
        inp.type = 'number';
        inp.min = 0;
        inp.max = 3;
        inp.value = pericias[group][skill] ?? 0;
        inp.addEventListener('input', e => {
          const v = Math.min(3, Math.max(0, parseInt(e.target.value, 10) || 0));
          e.target.value = v;
          pericias[group][skill] = v;
          _save();
        });

        row.appendChild(lbl);
        row.appendChild(inp);
        col.appendChild(row);
      });

      grid.appendChild(col);
    });

    container.appendChild(grid);
  }
