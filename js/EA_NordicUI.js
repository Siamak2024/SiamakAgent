(function () {
  function escapeHtml(value) {
    return String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function attrsToString(attrs) {
    if (!attrs) return '';
    return Object.entries(attrs)
      .filter(([, value]) => value !== undefined && value !== null && value !== false)
      .map(([key, value]) => {
        if (value === true) {
          return ` ${key}`;
        }
        return ` ${key}="${escapeHtml(value)}"`;
      })
      .join('');
  }

  function button(options) {
    const variant = options.variant || 'secondary';
    const icon = options.icon ? `<i class="${escapeHtml(options.icon)}"></i>` : '';
    const label = `<span>${escapeHtml(options.label || '')}</span>`;
    const className = ['ea-btn', `ea-btn--${variant}`, options.className || ''].filter(Boolean).join(' ');
    return `<button class="${className}"${attrsToString(options.attrs)}>${icon}${label}</button>`;
  }

  function statusBadge(options) {
    const level = options.level || 'medium';
    const icon = options.icon ? `<i class="${escapeHtml(options.icon)}"></i>` : '';
    return `<span class="ea-status-badge is-${escapeHtml(level)}">${icon}<span>${escapeHtml(options.label || '')}</span></span>`;
  }

  function metricCard(options) {
    return `
      <div class="ea-dashboard-metric">
        <div class="ea-dashboard-metric__label">${escapeHtml(options.label || '')}</div>
        <div class="ea-dashboard-metric__value">${escapeHtml(options.value || '')}</div>
        <div class="ea-dashboard-metric__meta">${escapeHtml(options.meta || '')}</div>
      </div>`;
  }

  function heatCell(options) {
    const level = Math.min(5, Math.max(1, Number(options.level) || 1));
    const attrs = Object.assign({}, options.attrs || {}, {
      title: options.title || '',
      'aria-label': options.title || ''
    });
    return `<button type="button" class="ea-heat-cell ea-heat-${level} ${escapeHtml(options.className || '')}"${attrsToString(attrs)}></button>`;
  }

  function emptyState(text) {
    return `<div class="ea-empty-state">${escapeHtml(text)}</div>`;
  }

  function legendItem(colorClass, label) {
    return `<span class="ea-heat-legend__item"><span class="ea-heat-legend__swatch ${escapeHtml(colorClass)}"></span><span>${escapeHtml(label)}</span></span>`;
  }

  window.EANordicUI = {
    escapeHtml,
    button,
    statusBadge,
    metricCard,
    heatCell,
    emptyState,
    legendItem
  };
})();