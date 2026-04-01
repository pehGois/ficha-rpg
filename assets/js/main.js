document.addEventListener('DOMContentLoaded', () => {
  renderConditions();
  renderFalhasMarks();
  loadData();
  setupPhotoUpload();
  setupImportInput();
  bindDerivedStats();
  setupAutoSave();
});
