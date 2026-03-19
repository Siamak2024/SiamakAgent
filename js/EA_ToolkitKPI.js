(function () {
  function readApiKey() {
    const candidates = [
      'ea_api_key',
      'openai_api_key',
      'openai_key',
      'EA_OPENAI_KEY'
    ];

    for (const key of candidates) {
      const val = localStorage.getItem(key);
      if (val && String(val).trim()) {
        return String(val).trim();
      }
    }

    return '';
  }

  function resolveSyncStatus() {
    const syncEl = document.querySelector('[id$="-sync-status"]');
    if (!syncEl) {
      return 'Local Mode';
    }

    const txt = (syncEl.textContent || '').toLowerCase();
    if (/error|fail|misslyck|problem/.test(txt)) {
      return 'Sync Issue';
    }

    if (/sync|synk/.test(txt)) {
      return 'EA Platform Active';
    }

    return 'Connected';
  }

  function resolvePhaseStatus() {
    const activePhase = Array.from(document.querySelectorAll('span')).find((el) => {
      const cls = el.className || '';
      const text = (el.textContent || '').toLowerCase();
      return cls.includes('bg-white') && /phase/.test(text);
    });

    return activePhase ? activePhase.textContent.trim() : '';
  }

  function setValue(selector, value) {
    document.querySelectorAll(selector).forEach((el) => {
      el.textContent = value;
    });
  }

  function updateKpis() {
    const apiKey = readApiKey();
    const syncStatus = resolveSyncStatus();
    const phaseStatus = resolvePhaseStatus();

    setValue('.ea-kpi-value[data-kpi="sync"]', syncStatus);
    setValue('.ea-kpi-value[data-kpi="api"]', apiKey ? 'Connected' : 'Key Missing');
    setValue('.ea-kpi-value[data-kpi="ai"]', apiKey ? 'Connected' : 'Key Missing');

    if (phaseStatus) {
      setValue('.ea-kpi-value[data-kpi="phase"]', phaseStatus);
    }
  }

  window.addEventListener('DOMContentLoaded', function () {
    updateKpis();
    setInterval(updateKpis, 5000);
  });
})();
