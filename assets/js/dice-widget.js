(function () {
  const fab = document.getElementById('fab');
  const chatPanel = document.getElementById('chatPanel');
  const messages = document.getElementById('messages');
  const rollInput = document.getElementById('rollInput');
  const sendBtn = document.getElementById('sendBtn');
  const clearBtn = document.getElementById('clearBtn');
  const suggestions = document.getElementById('suggestions');

  if (!fab || !chatPanel || !messages || !rollInput || !sendBtn || !clearBtn || !suggestions) return;

  let isOpen = false;
  let parser = null;

  function initParser() {
    parser = {
      tryParse: parseRollExpression
    };

    return !!parser;
  }

  function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function parseRollExpression(input) {
    const source = String(input || '').trim().toLowerCase().replace(/\s+/g, '');
    if (!source) return { error: 'Expressão vazia.' };

    let idx = 0;
    let total = 0;
    const chunks = [];
    let parsedAny = false;

    while (idx < source.length) {
      let sign = 1;
      if (source[idx] === '+') {
        idx += 1;
      } else if (source[idx] === '-') {
        sign = -1;
        idx += 1;
      }

      if (idx >= source.length) return { error: 'Expressão incompleta no final.' };

      const numMatch = source.slice(idx).match(/^(\d+)/);
      if (!numMatch) return { error: 'Esperado número ou dado após operador.' };
      idx += numMatch[0].length;
      const firstNum = parseInt(numMatch[1], 10);

      if (source[idx] !== 'd') {
        total += sign * firstNum;
        chunks.push(`${sign < 0 ? '-' : '+'}${firstNum}`);
        parsedAny = true;
        continue;
      }

      idx += 1;
      const facesMatch = source.slice(idx).match(/^(\d+)/);
      if (!facesMatch) return { error: 'Faltou número de faces após d.' };
      idx += facesMatch[0].length;

      const count = Math.max(1, Math.min(200, firstNum));
      const faces = parseInt(facesMatch[1], 10);
      if (!Number.isFinite(faces) || faces < 2) return { error: 'O dado precisa ter pelo menos 2 faces.' };

      let keepMode = null;
      let keepCountRaw = null;
      let perDieAdjust = 0;

      const keepMatch = source.slice(idx).match(/^(kh|kl|dh|dl)(\d+)/);
      if (keepMatch) {
        keepMode = keepMatch[1] === 'dh' ? 'kh' : keepMatch[1] === 'dl' ? 'kl' : keepMatch[1];
        keepCountRaw = parseInt(keepMatch[2], 10);
        idx += keepMatch[0].length;
      }

      const perDieMatch = source.slice(idx).match(/^(\+\+|--)(\d+)/);
      if (perDieMatch) {
        const amount = parseInt(perDieMatch[2], 10);
        perDieAdjust = perDieMatch[1] === '++' ? amount : -amount;
        idx += perDieMatch[0].length;
      }

      const rolls = Array.from({ length: count }, () => randomInt(1, faces));
      const adjustedRolls = rolls.map(n => n + perDieAdjust);
      let keptIndexes = adjustedRolls.map((_, i) => i);

      if (keepMode && keepCountRaw !== null) {
        const keepCount = Math.max(1, Math.min(count, keepCountRaw));
        const indexed = adjustedRolls.map((value, index2) => ({ value, index: index2 }));
        indexed.sort((a, b) => keepMode === 'kh' ? b.value - a.value : a.value - b.value);
        keptIndexes = indexed.slice(0, keepCount).map(item => item.index);
      }

      const keptSet = new Set(keptIndexes);
      const keptValues = adjustedRolls.filter((_, i) => keptSet.has(i));
      const termBase = keptValues.reduce((sum, n) => sum + n, 0);
      const termValue = sign * termBase;
      total += termValue;

      const rawPretty = rolls
        .map((n, i) => {
          if (perDieAdjust === 0) return keptSet.has(i) ? `**${n}**` : `~~${n}~~`;
          const op = perDieAdjust > 0 ? '+' : '-';
          const amount = Math.abs(perDieAdjust);
          const expr = `${n}${op}${amount}`;
          return keptSet.has(i) ? `**${expr}**` : `~~${expr}~~`;
        })
        .join(', ');

      const adjustedPretty = adjustedRolls
        .map((n, i) => (keptSet.has(i) ? `**${n}**` : `~~${n}~~`))
        .join(', ');

      const keepText = keepMode ? `${keepMode}${Math.max(1, Math.min(count, keepCountRaw || 1))}` : '';
      const perDieText = perDieAdjust === 0 ? '' : `${perDieAdjust > 0 ? '++' : '--'}${Math.abs(perDieAdjust)}`;
      const expr = `${count}d${faces}${keepText}${perDieText}`;
      const prettyRoll = perDieAdjust === 0 ? `[${rawPretty}]` : `[${rawPretty}] -> [${adjustedPretty}]`;
      chunks.push(`${sign < 0 ? '-' : '+'}${expr}: ${prettyRoll} = **${termValue}**`);
      parsedAny = true;
    }

    if (!parsedAny) return { error: 'Nenhum termo válido foi encontrado.' };

    const details = chunks.join(' · ').replace(/^\+/, '');
    return {
      value: total,
      label: 'Expressão composta',
      pretties: details
    };
  }

  initParser();

  fab.addEventListener('click', () => {
    isOpen = !isOpen;
    fab.classList.toggle('open', isOpen);
    chatPanel.classList.toggle('open', isOpen);
    if (isOpen) {
      setTimeout(() => {
        rollInput.focus();
        scrollBottom();
      }, 220);
    }
  });

  suggestions.addEventListener('click', e => {
    const chip = e.target.closest('.chip');
    if (!chip) return;
    rollInput.value = chip.dataset.roll;
    rollInput.focus();
    processRoll(chip.dataset.roll);
  });

  sendBtn.addEventListener('click', () => {
    const val = rollInput.value.trim();
    if (val) {
      processRoll(val);
      rollInput.value = '';
    }
  });

  rollInput.addEventListener('keydown', e => {
    if (e.key !== 'Enter') return;
    const val = rollInput.value.trim();
    if (val) {
      processRoll(val);
      rollInput.value = '';
    }
  });

  clearBtn.addEventListener('click', () => {
    messages.innerHTML = '<div class="msg-system">Histórico limpo.</div>';
  });

  function scrollBottom() {
    messages.scrollTop = messages.scrollHeight;
  }

  function addMsg(html, type = 'bot') {
    const div = document.createElement('div');
    div.className = 'msg-' + type;
    div.innerHTML = `<div class="bubble">${html}</div>`;
    messages.appendChild(div);
    scrollBottom();
    return div;
  }

  function addLoading() {
    const div = document.createElement('div');
    div.className = 'msg-bot';
    div.innerHTML = '<div class="bubble"><div class="loading-dots"><span></span><span></span><span></span></div></div>';
    messages.appendChild(div);
    scrollBottom();
    return div;
  }

  function formatPretties(str) {
    return str.replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>').replace(/~~([^~]+)~~/g, '<s>$1</s>');
  }

  function escHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function renderResult(expression, result) {
    const label = result.label ? `<div class="roll-label">${escHtml(result.label)}</div>` : '';
    const pretties = formatPretties(escHtml(result.pretties || ''));
    const expressionHtml = `<div class="roll-expression">${escHtml(expression)}</div>`;

    return `
      <div class="roll-result">
        ${expressionHtml}
        <div class="roll-divider"></div>
        <div class="roll-total">${result.value}</div>
        ${label}
        <div class="roll-pretties">${pretties}</div>
      </div>
    `;
  }

  function processRoll(input) {
    addMsg(escHtml(input), 'user');

    if (!parser) initParser();
    if (!parser) {
      addMsg('Não foi possível inicializar o parser de rolagem.', 'error');
      return;
    }

    const loadingEl = addLoading();

    setTimeout(() => {
      loadingEl.remove();

      try {
        const result = parser.tryParse(input);

        if (result === false || result === undefined || result === null) {
          addMsg(`Não consegui interpretar <code>${escHtml(input)}</code> como expressão válida.`, 'error');
          return;
        }

        if (result.error) {
          addMsg(`Erro: ${escHtml(result.error)}`, 'error');
          return;
        }

        addMsg(renderResult(input, result), 'bot');
      } catch (err) {
        addMsg(`Erro ao processar: ${escHtml(err.message || String(err))}`, 'error');
      }
    }, 280 + Math.random() * 120);
  }
})();
