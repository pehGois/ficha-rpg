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
  const inspiracaoMax = Math.max(1, toInt('espirito', 4));

  const pvLabel = document.getElementById('pvLabel');
  if (pvLabel) pvLabel.textContent = `PV [${pvCalc}]`;

  const psLabel = document.getElementById('psLabel');
  if (psLabel) psLabel.textContent = `PS [${psCalc}]`;

  const inspiracaoLabel = document.getElementById('inspiracaoLabel');
  if (inspiracaoLabel) inspiracaoLabel.textContent = `Inspiração [1d${inspiracaoMax}]`;

  const inspiracaoInput = document.getElementById('inspiracao');
  if (inspiracaoInput) {
    inspiracaoInput.placeholder = `1d${inspiracaoMax}`;

    const dice = parseDice(inspiracaoInput.value);
    if (dice) {
      const faces = Math.min(inspiracaoMax, Math.max(1, dice.faces));
      if (dice.qtd !== 1 || faces !== dice.faces) {
        inspiracaoInput.value = `1d${faces}`;
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
