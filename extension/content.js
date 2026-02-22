// content.js
// Fügt ein Seiten-System und Item-Limit zu den Vinted-Benachrichtigungen hinzu

(function() {
  const STORAGE_KEY = 'vinted_notifications_settings';
  let settings = { maxItems: 20, currentPage: 1 };

  // Einstellungen laden
  function loadSettings() {
    return new Promise(resolve => {
      if (typeof chrome !== 'undefined' && chrome.storage) {
        chrome.storage.sync.get([STORAGE_KEY], result => {
          if (result[STORAGE_KEY]) Object.assign(settings, result[STORAGE_KEY]);
          resolve();
        });
      } else {
        resolve();
      }
    });
  }

  // UI für Seiten und Limit einfügen
  function insertControls(totalItems) {
    let controls = document.getElementById('vinted-unlocker-controls');
    if (controls) controls.remove();
    controls = document.createElement('div');
    controls.id = 'vinted-unlocker-controls';
    controls.style = 'margin: 16px 0; display: flex; gap: 12px; align-items: center;';

    // Seitensteuerung
    const totalPages = Math.ceil(totalItems / settings.maxItems);
    const pageLabel = document.createElement('span');
    pageLabel.textContent = `Seite ${settings.currentPage} / ${totalPages}`;
    const prevBtn = document.createElement('button');
    prevBtn.textContent = '<';
    prevBtn.disabled = settings.currentPage === 1;
    prevBtn.onclick = () => {
      settings.currentPage--;
      saveSettings();
      renderNotifications();
    };
    const nextBtn = document.createElement('button');
    nextBtn.textContent = '>';
    nextBtn.disabled = settings.currentPage === totalPages;
    nextBtn.onclick = () => {
      settings.currentPage++;
      saveSettings();
      renderNotifications();
    };

    // Item-Limit
    const limitInput = document.createElement('input');
    limitInput.type = 'number';
    limitInput.min = 1;
    limitInput.max = 100;
    limitInput.value = settings.maxItems;
    limitInput.style = 'width: 60px;';
    limitInput.onchange = () => {
      settings.maxItems = Math.max(1, Math.min(100, parseInt(limitInput.value, 10) || 20));
      settings.currentPage = 1;
      saveSettings();
      renderNotifications();
    };
    const limitLabel = document.createElement('span');
    limitLabel.textContent = 'Items pro Seite:';

    controls.append(prevBtn, pageLabel, nextBtn, limitLabel, limitInput);
    const container = document.querySelector('.notifications-list, .notifications__list');
    if (container && container.parentNode) {
      container.parentNode.insertBefore(controls, container);
    }
  }

  // Einstellungen speichern
  function saveSettings() {
    if (typeof chrome !== 'undefined' && chrome.storage) {
      chrome.storage.sync.set({ [STORAGE_KEY]: settings });
    }
  }

  // Benachrichtigungen filtern und anzeigen
  function renderNotifications() {
    const list = document.querySelector('.notifications-list, .notifications__list');
    if (!list) return;
    const items = Array.from(list.children);
    const totalItems = items.length;
    const start = (settings.currentPage - 1) * settings.maxItems;
    const end = start + settings.maxItems;
    items.forEach((item, idx) => {
      item.style.display = (idx >= start && idx < end) ? '' : 'none';
    });
    insertControls(totalItems);
  }

  // Initialisierung
  function init() {
    loadSettings().then(() => {
      renderNotifications();
      // Beobachte DOM-Änderungen (z.B. neue Benachrichtigungen)
      const list = document.querySelector('.notifications-list, .notifications__list');
      if (list) {
        const observer = new MutationObserver(() => renderNotifications());
        observer.observe(list, { childList: true, subtree: false });
      }
    });
  }

  // Starte, wenn DOM bereit
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
