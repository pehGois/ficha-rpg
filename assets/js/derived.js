function calcDerived() {
  const toInt = (id, fallback = 0) => {
    const n = parseInt(document.getElementById(id)?.value, 10);
    return isNaN(n) ? fallback : n;
  };

  const parseDice = value => {
    const match = String(value || '').trim().match(/^(\d+)\s*d\s*(\d+)$/i);
    if (!match) return null;

    return {
      qtd: parseInt(match[1], 10),
      faces: parseInt(match[2], 10)
    };
  };

  const pvCalc = 8 + 4 * toInt('corpo');
  const psCalc = 2 * toInt('mente');
  const peCalc = 2 * toInt('espirito', 4);

  const pvLabel = document.getElementById('pvLabel');
  if (pvLabel) pvLabel.textContent = `PV [${pvCalc}]`;

  const psLabel = document.getElementById('psLabel');
  if (psLabel) psLabel.textContent = `PS [${psCalc}]`;

  const peLabel = document.getElementById('inspiracaoLabel');
  if (peLabel) peLabel.textContent = `PE [${peCalc}]`;

  const peInput = document.getElementById('inspiracao');
  if (peInput) {
    peInput.placeholder = `${peCalc}`;
    const currentValue = String(peInput.value ?? '').trim();
    if (!currentValue) {
      peInput.value = `${peCalc}`;
    } else {
      const numericValue = parseInt(currentValue, 10);
      if (!Number.isNaN(numericValue)) {
        peInput.value = `${Math.min(peCalc, Math.max(0, numericValue))}`;
      }
    }
  }

}

function bindDerivedStats() {
  ['corpo', 'mente', 'espirito'].forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('input', calcDerived);
      el.addEventListener('change', calcDerived);
    }
  });

  calcDerived();
}
