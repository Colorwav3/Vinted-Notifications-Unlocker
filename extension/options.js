// options.js
const STORAGE_KEY = 'vinted_notifications_settings';
const form = document.getElementById('options-form');
const maxItemsInput = document.getElementById('maxItems');
const status = document.getElementById('status');

// Einstellungen laden
function loadOptions() {
  if (typeof chrome !== 'undefined' && chrome.storage) {
    chrome.storage.sync.get([STORAGE_KEY], result => {
      if (result[STORAGE_KEY] && result[STORAGE_KEY].maxItems) {
        maxItemsInput.value = result[STORAGE_KEY].maxItems;
      }
    });
  }
}

// Einstellungen speichern
form.onsubmit = function(e) {
  e.preventDefault();
  const maxItems = Math.max(1, Math.min(100, parseInt(maxItemsInput.value, 10) || 20));
  if (typeof chrome !== 'undefined' && chrome.storage) {
    chrome.storage.sync.set({ [STORAGE_KEY]: { maxItems, currentPage: 1 } }, () => {
      status.textContent = 'Gespeichert!';
      setTimeout(() => status.textContent = '', 1500);
    });
  }
};

loadOptions();
