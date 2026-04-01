function calcDerived() {
  const toInt = (id, fallback = 0) => {
    const n = parseInt(document.getElementById(id)?.value, 10);
    return isNaN(n) ? fallback : n;
  };

  const pvCalc = 8 + 3 * toInt('espirito');
  const psCalc = 2 * toInt('mente');
  const pdCalc = 3 * toInt('corpo');

  const pvLabel = document.getElementById('pvLabel');
  if (pvLabel) pvLabel.textContent = `PV [${pvCalc}]`;

  const psLabel = document.getElementById('psLabel');
  if (psLabel) psLabel.textContent = `PS [${psCalc}]`;

  const pdLabel = document.getElementById('pdLabel');
  if (pdLabel) pdLabel.textContent = `PD [${pdCalc}]`;
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
