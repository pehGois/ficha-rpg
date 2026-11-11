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
  const currentObjective = typeof currentArchetype?.objetivo === 'string'
    ? { texto: currentArchetype.objetivo, concluido: false }
    : currentArchetype?.objetivo;
  archetype = {
    nome: currentArchetype?.nome ?? '',
    objetivo: {
      texto: currentObjective?.texto ?? '',
      concluido: !!currentObjective?.concluido
    },
    talentos: Array.isArray(currentArchetype?.talentos) ? currentArchetype.talentos.map(talent => ({
      id: talent?.id ?? uid(),
      nome: talent?.nome ?? '',
      descricao: talent?.descricao ?? ''
    })) : [],
    dadiva: {
      nome: currentArchetype?.dadiva?.nome ?? '',
      custoXp: currentArchetype?.dadiva?.custoXp ?? '',
      descricao: currentArchetype?.dadiva?.descricao ?? ''
    }
  };

  const nameInput = document.getElementById('archetypeNome');
  if (nameInput && nameInput.value !== (archetype.nome ?? '')) {
    nameInput.value = archetype.nome ?? '';
  }

  const objectiveInput = document.getElementById('archetypeObjetivo');
  if (objectiveInput && objectiveInput.value !== archetype.objetivo.texto) {
    objectiveInput.value = archetype.objetivo.texto;
  }

  const objectiveCompletedInput = document.getElementById('archetypeObjetivoConcluido');
  if (objectiveCompletedInput) {
    objectiveCompletedInput.checked = archetype.objetivo.concluido;
  }

  const talentsList = document.getElementById('archetypeTalentsList');
  if (talentsList) {
    talentsList.innerHTML = '';
    archetype.talentos.forEach((talent, index) => {
      const item = document.createElement('div');
      item.className = 'archetype-power-item';
      item.innerHTML = `
        <div class="field full"><label>Nome</label><input type="text" value="${esc(talent.nome)}" placeholder="Nome do talento" data-field="nome"></div>
        <div class="field full"><label>Descrição</label><textarea placeholder="Descrição do talento..." data-field="descricao">${esc(talent.descricao)}</textarea></div>
        <button type="button" class="btn-remove" data-action="remove-talent">×</button>`;

      item.querySelector('[data-field="nome"]').addEventListener('input', e => {
        archetype.talentos[index].nome = e.target.value;
        _save();
      });
      item.querySelector('[data-field="descricao"]').addEventListener('input', e => {
        archetype.talentos[index].descricao = e.target.value;
        _save();
      });
      item.querySelector('[data-action="remove-talent"]').addEventListener('click', () => {
        archetype.talentos.splice(index, 1);
        renderArchetypeSection();
        _save();
      });
      talentsList.appendChild(item);
    });
  }

  const pecNome = document.getElementById('archetypedadivaNome');
  if (pecNome && pecNome.value !== (archetype.dadiva?.nome ?? '')) {
    pecNome.value = archetype.dadiva?.nome ?? '';
  }

  const pecCusto = document.getElementById('archetypedadivaCusto');
  if (pecCusto && pecCusto.value !== (archetype.dadiva?.custoXp ?? '')) {
    pecCusto.value = archetype.dadiva?.custoXp ?? '';
  }

  const pecDescricao = document.getElementById('archetypedadivaDescricao');
  if (pecDescricao && pecDescricao.value !== (archetype.dadiva?.descricao ?? '')) {
    pecDescricao.value = archetype.dadiva?.descricao ?? '';
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

  const objectiveInput = document.getElementById('archetypeObjetivo');
  if (objectiveInput) {
    objectiveInput.addEventListener('input', e => {
      archetype.objetivo.texto = e.target.value;
      _save();
    });
  }

  const objectiveCompletedInput = document.getElementById('archetypeObjetivoConcluido');
  if (objectiveCompletedInput) {
    objectiveCompletedInput.addEventListener('change', e => {
      archetype.objetivo.concluido = e.target.checked;
      _save();
    });
  }

  const addTalentBtn = document.getElementById('addArchetypeTalent');
  if (addTalentBtn) {
    addTalentBtn.addEventListener('click', () => {
      archetype.talentos.push({ id: uid(), nome: '', descricao: '' });
      renderArchetypeSection();
      _save();
    });
  }

  const pecNome = document.getElementById('archetypedadivaNome');
  if (pecNome) {
    pecNome.addEventListener('input', e => {
      archetype.dadiva.nome = e.target.value;
      _save();
    });
  }

  const pecCusto = document.getElementById('archetypedadivaCusto');
  if (pecCusto) {
    pecCusto.addEventListener('input', e => {
      archetype.dadiva.custoXp = e.target.value;
      _save();
    });
  }

  const pecDescricao = document.getElementById('archetypedadivaDescricao');
  if (pecDescricao) {
    pecDescricao.addEventListener('input', e => {
      archetype.dadiva.descricao = e.target.value;
      _save();
    });
  }
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
      <div class="card-header accordion-header"><button class="accordion-toggle" type="button">${ef.collapsed ? '▸' : '▾'}</button><span class="card-label">${effectLabel}</span><button class="btn-remove">× REMOVER</button></div>
      <div class="accordion-body">
      <div class="spell-grid">
        <div class="field"><label>Nome</label><input type="text" value="${esc(ef.nome)}" placeholder="Nome do efeito" data-field="nome"></div>
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
  removeBtn.title = 'REMOVER RELÓGIO';
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
        <button class="btn-remove">× REMOVER</button>
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

function addGridItem(type = 'item') {
  if (!Array.isArray(gridItems)) gridItems = [];
  if (type !== 'item' || getGridItemsUsedSlots() >= 8) {
    showToast(type === 'item' ? 'Inventário cheio' : 'Apenas itens podem ocupar o inventário');
    return;
  }
  gridItems.push({
    id: uid(),
    type: 'item',
    nome: '',
    descricao: '',
    quantidade: 1,
    span: 1
  });
  renderGridItems();
  _save();
}

function renderGridItems() {
  const grid = document.getElementById('itemsGrid');
  const empty = document.getElementById('itemsGridEmpty');
  if (!grid || !empty) return;

  gridItems = fitGridItemsToCapacity(gridItems);
  grid.innerHTML = '';
  empty.hidden = gridItems.length > 0;
  grid.classList.toggle('is-full', getGridItemsUsedSlots() >= 8);

  gridItems.forEach((item, index) => {
    const card = document.createElement('article');
    const title = item.nome && item.nome.trim()
      ? item.nome
      : `Item ${index + 1}`;
    const safeSpan = Math.min(4, Math.max(1, parseInt(item.span, 10) || 1));
    card.className = 'grid-item-card';
    card.style.setProperty('--item-span', safeSpan);
    card.draggable = true;
    card.dataset.itemId = item.id;
    card.innerHTML = `
      <div class="grid-item-header">
        <span class="grid-item-drag" title="Arraste para reorganizar" aria-label="Arraste para reorganizar">⠿</span>
        <span class="grid-item-type">ITEM</span>
        <button type="button" class="btn-remove grid-item-remove" aria-label="Remover ${escAttr(title)}">×</button>
      </div>
      <div class="grid-item-summary" title="Clique para editar">
        <strong>${esc(title)}</strong>
        <span>${esc(item.quantidade ?? 0)}x</span>
      </div>`;

    card.querySelector('.grid-item-remove').addEventListener('click', () => {
      gridItems.splice(index, 1);
      renderGridItems();
      _save();
    });

    card.querySelector('.grid-item-summary').addEventListener('click', () => openGridEditor('item', index));

    card.addEventListener('dragstart', event => {
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('text/plain', item.id);
      card.classList.add('is-dragging');
    });
    card.addEventListener('dragend', () => card.classList.remove('is-dragging'));
    card.addEventListener('dragover', event => {
      event.preventDefault();
      event.dataTransfer.dropEffect = 'move';
      card.classList.add('is-drag-target');
    });
    card.addEventListener('dragleave', () => card.classList.remove('is-drag-target'));
    card.addEventListener('drop', event => {
      event.preventDefault();
      card.classList.remove('is-drag-target');
      reorderGridItems(event.dataTransfer.getData('text/plain'), item.id);
    });

    grid.appendChild(card);
  });

  const emptySlots = 8 - getGridItemsUsedSlots();
  for (let index = 0; index < emptySlots; index += 1) {
    const slot = document.createElement('div');
    slot.className = 'inventory-empty-slot';
    slot.textContent = 'Vazio';
    grid.appendChild(slot);
  }
}

function updateGridItem(index, field) {
  const value = field.dataset.field === 'span'
    ? Math.min(4, Math.max(1, parseInt(field.value, 10) || 1))
    : field.value;
  if (field.dataset.field === 'span') {
    const currentSpan = parseInt(gridItems[index].span, 10) || 1;
    if (getGridItemsUsedSlots() - currentSpan + value > 8) {
      showToast('O item não cabe nos espaços restantes');
      renderGridItems();
      return;
    }
  }
  gridItems[index][field.dataset.field] = value;
  if (field.dataset.field === 'span') renderGridItems();
  _save();
}

function moveGridItem(index, offset) {
  const target = index + offset;
  if (target < 0 || target >= gridItems.length) return;
  [gridItems[index], gridItems[target]] = [gridItems[target], gridItems[index]];
  renderGridItems();
  _save();
}

function reorderGridItems(sourceId, targetId) {
  if (!sourceId || sourceId === targetId) return;
  const sourceIndex = gridItems.findIndex(item => String(item.id) === sourceId);
  const targetIndex = gridItems.findIndex(item => String(item.id) === String(targetId));
  if (sourceIndex < 0 || targetIndex < 0) return;
  const [moved] = gridItems.splice(sourceIndex, 1);
  gridItems.splice(targetIndex, 0, moved);
  renderGridItems();
  _save();
}

function getGridItemsUsedSlots() {
  return gridItems.reduce((total, item) => total + Math.min(4, Math.max(1, parseInt(item.span, 10) || 1)), 0);
}

function fitGridItemsToCapacity(items) {
  let remaining = 8;
  return (Array.isArray(items) ? items : []).reduce((fitted, item) => {
    const span = Math.min(4, Math.max(1, parseInt(item.span, 10) || 1));
    if (span > remaining) return fitted;
    fitted.push({ ...item, type: 'item', span });
    remaining -= span;
    return fitted;
  }, []);
}

function getAttributeValue(attribute) {
  return Math.max(0, parseInt(document.getElementById(attribute)?.value, 10) || 0);
}

function getRepertoireCapacity(attribute) {
  return Math.floor(getAttributeValue(attribute) / 2);
}

function addRepertoireTraining(attribute) {
  const capacity = getRepertoireCapacity(attribute);
  if (getRepertoireUsedSlots(attribute) >= capacity) {
    showToast(`Repertório de ${attribute} cheio`);
    return;
  }
  repertoires[attribute].push({ id: uid(), nome: '', descricao: '', span: 1 });
  renderRepertoires();
  _save();
}

function renderRepertoires() {
  const definitions = [
    { attribute: 'FORÇA', gridId: 'strengthRepertoireGrid', capacityId: 'strengthRepertoireCapacity' },
    { attribute: 'INTELIGÊNCIA', gridId: 'intelligenceRepertoireGrid', capacityId: 'intelligenceRepertoireCapacity' }
  ];

  definitions.forEach(({ attribute, gridId, capacityId }) => {
    const grid = document.getElementById(gridId);
    const capacityLabel = document.getElementById(capacityId);
    if (!grid || !capacityLabel) return;

    const capacity = getRepertoireCapacity(attribute);
    repertoires[attribute] = fitRepertoireToCapacity(repertoires[attribute], capacity);
    capacityLabel.textContent = `${getRepertoireUsedSlots(attribute)}/${capacity} slots`;
    grid.innerHTML = '';

    repertoires[attribute].forEach((training, index) => {
      const slot = document.createElement('article');
      const safeSpan = Math.min(4, Math.max(1, parseInt(training.span, 10) || 1));
      slot.className = 'repertoire-slot repertoire-slot-filled';
      slot.style.setProperty('--item-span', safeSpan);

      slot.innerHTML = `
        <div class="grid-item-header">
          <span class="grid-item-drag">⠿</span>
          <span class="grid-item-type">TREINAMENTO</span>
          <button type="button" class="btn-remove repertoire-remove" aria-label="Remover treinamento">×</button>
        </div>
        <div class="grid-item-summary" title="Clique para editar">
          <strong>${esc(training.nome || `Treinamento ${index + 1}`)}</strong>
        </div>`;

      slot.querySelector('.repertoire-remove').addEventListener('click', () => {
        repertoires[attribute].splice(index, 1);
        renderRepertoires();
        _save();
      });
      slot.querySelector('.grid-item-summary').addEventListener('click', () => openGridEditor('training', index, attribute));
      grid.appendChild(slot);
    });

    for (let index = getRepertoireUsedSlots(attribute); index < capacity; index += 1) {
      const slot = document.createElement('article');
      slot.className = 'repertoire-slot';
      slot.innerHTML = '<span class="repertoire-slot-empty">Slot vazio</span>';
      grid.appendChild(slot);
    }
  });
}

function getRepertoireUsedSlots(attribute) {
  return repertoires[attribute].reduce((total, training) => total + Math.min(4, Math.max(1, parseInt(training.span, 10) || 1)), 0);
}

function fitRepertoireToCapacity(items, capacity) {
  let remaining = capacity;
  return items.reduce((fitted, training) => {
    const span = Math.min(4, Math.max(1, parseInt(training.span, 10) || 1));
    if (span <= remaining) {
      fitted.push({ ...training, span });
      remaining -= span;
    }
    return fitted;
  }, []);
}

let activeGridEditor = null;

function openGridEditor(type, index, attribute = null) {
  const modal = document.getElementById('gridEditorModal');
  const data = type === 'item' ? gridItems[index] : repertoires[attribute][index];
  if (!modal || !data) return;
  activeGridEditor = { type, index, attribute };
  document.getElementById('gridEditorTitle').textContent = type === 'item' ? 'Editar item' : 'Editar treinamento';
  document.getElementById('gridEditorName').value = data.nome ?? '';
  document.getElementById('gridEditorDescription').value = data.descricao ?? '';
  document.getElementById('gridEditorQuantityField').hidden = type !== 'item';
  document.getElementById('gridEditorQuantity').value = data.quantidade ?? 1;
  document.getElementById('gridEditorSpan').value = Math.min(4, Math.max(1, parseInt(data.span, 10) || 1));
  modal.hidden = false;
  document.getElementById('gridEditorName').focus();
}

function closeGridEditor() {
  const modal = document.getElementById('gridEditorModal');
  if (modal) modal.hidden = true;
  activeGridEditor = null;
}

function saveGridEditor() {
  if (!activeGridEditor) return;
  const { type, index, attribute } = activeGridEditor;
  const data = type === 'item' ? gridItems[index] : repertoires[attribute][index];
  const span = Math.min(4, Math.max(1, parseInt(document.getElementById('gridEditorSpan').value, 10) || 1));
  const used = type === 'item' ? getGridItemsUsedSlots() - (parseInt(data.span, 10) || 1) : getRepertoireUsedSlots(attribute) - (parseInt(data.span, 10) || 1);
  const capacity = type === 'item' ? 8 : getRepertoireCapacity(attribute);
  if (used + span > capacity) {
    showToast('O cartão não cabe nos espaços disponíveis');
    return;
  }
  data.nome = document.getElementById('gridEditorName').value;
  data.descricao = document.getElementById('gridEditorDescription').value;
  data.span = span;
  if (type === 'item') data.quantidade = document.getElementById('gridEditorQuantity').value;
  closeGridEditor();
  renderGridItems();
  renderRepertoires();
  _save();
}

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('[data-modal-close]').forEach(element => element.addEventListener('click', closeGridEditor));
  document.getElementById('gridEditorSave')?.addEventListener('click', saveGridEditor);
  document.getElementById('gridEditorRemove')?.addEventListener('click', () => {
    if (!activeGridEditor) return;
    if (activeGridEditor.type === 'item') gridItems.splice(activeGridEditor.index, 1);
    else repertoires[activeGridEditor.attribute].splice(activeGridEditor.index, 1);
    closeGridEditor();
    renderGridItems();
    renderRepertoires();
    _save();
  });
});

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
    const weaponLabel = (weapon.nome && weapon.nome.trim()) ? esc(weapon.nome) : `ARMA ${i + 1}`;
    d.innerHTML = `
      <div class="card-header accordion-header">
        <button class="accordion-toggle" type="button">${weapon.collapsed ? '▸' : '▾'}</button>
        <span class="card-label">${weaponLabel}</span>
        <button class="btn-remove">× REMOVER</button>
      </div>
      <div class="accordion-body">
        <div class="weapon-row">
          <div class="field"><label>Nome</label><input type="text" value="${esc(weapon.nome)}" placeholder="Nome da arma" data-field="nome"></div>
          <div class="field"><label>Bônus</label><input type="text" value="${esc(weapon.bonus)}" placeholder="+0" data-field="bonus"></div>
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

    const col = document.createElement('div');
    col.className = 'pericias-group';

    const title = document.createElement('div');
    title.className = 'pericias-group-title';
    title.textContent = 'PERÍCIAS';
    col.appendChild(title);

    Object.keys(pericias || {}).forEach(skill => {
        const row = document.createElement('div');
        row.className = 'pericia-item';

        const lbl = document.createElement('label');
        lbl.textContent = skill;

        const inp = document.createElement('input');
        inp.type = 'number';
        inp.min = 0;
        inp.max = 3;
        inp.value = pericias[skill] ?? 0;
        inp.addEventListener('input', e => {
          const v = Math.min(3, Math.max(0, parseInt(e.target.value, 10) || 0));
          e.target.value = v;
          pericias[skill] = v;
          _save();
        });

        row.appendChild(lbl);
        row.appendChild(inp);
        col.appendChild(row);
    });
    grid.appendChild(col);

    container.appendChild(grid);
  }
