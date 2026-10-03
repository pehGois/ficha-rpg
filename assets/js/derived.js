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

  const pvCalc = 10 + 3 * toInt('FORÇA', 4);
  const psCalc = 2 * toInt('INTELIGÊNCIA', 4);

  const pvLabel = document.getElementById('pvLabel');
  if (pvLabel) pvLabel.textContent = `PV [${pvCalc}]`;

  const psLabel = document.getElementById('psLabel');
  if (psLabel) psLabel.textContent = `PS [${psCalc}]`;

}

function bindDerivedStats() {
  ['FORÇA', 'INTELIGÊNCIA'].forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('input', calcDerived);
      el.addEventListener('change', calcDerived);
    }
  });

  calcDerived();
}
