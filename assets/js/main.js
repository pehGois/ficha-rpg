function setActiveSheetPane(pane, save = true) {
  const normalizedPane = ['sword','book','magic'].includes(pane) ? pane : 'book';
  activeSheetPane = normalizedPane;

  document.querySelectorAll('.sheet-section-tab').forEach(tab => {
    const isActive = tab.dataset.sheetPane === normalizedPane;
    tab.classList.toggle('active', isActive);
    tab.setAttribute('aria-pressed', String(isActive));
  });

  document.querySelectorAll('.sheet-grid .card[data-sheet-pane]').forEach(card => {
    const panes = (card.dataset.sheetPane || '').split(/\s+/).filter(Boolean);
    card.style.display = panes.includes(normalizedPane) ? '' : 'none';
  });

  if (save && typeof _save === 'function') {
    _save();
  }
}

function initSheetSectionTabs() {
  document.querySelectorAll('.sheet-section-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      setActiveSheetPane(tab.dataset.sheetPane, true);
    });
  });

  setActiveSheetPane(activeSheetPane, false);
}

document.addEventListener('DOMContentLoaded', () => {
  setupPhotoUpload();
  setupImportInput();
  bindDerivedStats();
  setupAutoSave();
  initSheetSectionTabs();
  initTabsSystem();
  initDocsView();
});
