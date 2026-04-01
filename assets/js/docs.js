const DOCS_URL = 'https://docs.google.com/document/d/1oZHkT9sgJaXpW4pNNO2tsLp0rCAOQd-7JFTNv0t9AKM/edit?usp=sharing';
const DOCS_EMBED_URL = DOCS_URL;
const DOCS_VIEW_KEY = 'ficha_rpg_docs_view';

function setDocsView(isDocs) {
  const sheetWorkspace = document.getElementById('sheetWorkspace');
  const docsPanel = document.getElementById('docsPanel');
  const btnDocs = document.getElementById('btnDocs');
  const docsFrame = document.getElementById('docsFrame');
  const docsFallback = document.getElementById('docsFallback');

  if (!sheetWorkspace || !docsPanel || !btnDocs || !docsFrame || !docsFallback) return;

  sheetWorkspace.style.display = isDocs ? 'none' : '';
  docsPanel.style.display = isDocs ? '' : 'none';
  btnDocs.classList.toggle('active', isDocs);
  btnDocs.textContent = isDocs ? 'Voltar para Ficha' : 'Documentação';

  if (isDocs) {
    if (!docsFrame.src) {
      docsFrame.src = DOCS_EMBED_URL;
    }
    docsFallback.style.display = 'none';
  }

  localStorage.setItem(DOCS_VIEW_KEY, isDocs ? '1' : '0');
}

function toggleDocsView() {
  const isDocsVisible = document.getElementById('docsPanel')?.style.display !== 'none';
  setDocsView(!isDocsVisible);
}

function initDocsView() {
  const docsFrame = document.getElementById('docsFrame');
  const docsLink = document.querySelector('.docs-open-link');
  const docsFallback = document.getElementById('docsFallback');

  if (docsFrame) {
    docsFrame.addEventListener('error', () => {
      if (docsFallback) docsFallback.style.display = '';
    });
    if (!docsFrame.src) docsFrame.src = DOCS_EMBED_URL;
  }

  if (docsLink) {
    docsLink.href = DOCS_URL;
  }

  const saved = localStorage.getItem(DOCS_VIEW_KEY) === '1';
  setDocsView(saved);
}
