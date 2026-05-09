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
    const label = options.label ? `<span class="ea-heat-cell__label">${escapeHtml(options.label)}</span>` : '';
    const meta = options.meta ? `<span class="ea-heat-cell__meta">${escapeHtml(options.meta)}</span>` : '';
    return `<button type="button" class="ea-heat-cell ea-heat-${level} ${escapeHtml(options.className || '')}"${attrsToString(attrs)}>${label}${meta}</button>`;
  }

  function emptyState(text) {
    return `<div class="ea-empty-state">${escapeHtml(text)}</div>`;
  }

  function legendItem(colorClass, label) {
    return `<span class="ea-heat-legend__item"><span class="ea-heat-legend__swatch ${escapeHtml(colorClass)}"></span><span>${escapeHtml(label)}</span></span>`;
  }

  /**
   * Navigation Section (Domain)
   * @param {object} options - {id, label, icon, collapsible, expanded, items}
   * @returns {string} HTML
   */
  function navigationSection(options) {
    const sectionId = escapeHtml(options.id);
    const isCollapsible = options.collapsible !== false;
    const isExpanded = options.expanded !== false;
    const chevronIcon = isExpanded ? 'fa-chevron-down' : 'fa-chevron-right';
    const itemsDisplay = isExpanded ? 'block' : 'none';
    
    const toggleBtn = isCollapsible 
      ? `<div class="ea-nav-section__toggle"><i class="fas ${chevronIcon}"></i></div>`
      : '';
    
    const itemsHtml = options.items && options.items.length > 0
      ? options.items.map(item => navigationItem(item)).join('')
      : '';
    
    const itemsContainer = itemsHtml
      ? `<div class="ea-nav-section__items" style="display: ${itemsDisplay};">${itemsHtml}</div>`
      : '';
    
    return `
      <div class="ea-nav-section" data-section="${sectionId}">
        <button class="ea-nav-section__header" onclick="EANavigation.toggleSection('${sectionId}')" ${!isCollapsible ? 'style="cursor: default;"' : ''}>
          <div class="ea-nav-section__icon"><i class="${escapeHtml(options.icon)}"></i></div>
          <div class="ea-nav-section__label">${escapeHtml(options.label)}</div>
          ${toggleBtn}
        </button>
        ${itemsContainer}
      </div>`;
  }

  /**
   * Navigation Item (Menu Item)
   * @param {object} options - {id, view, label, icon, isActive, isLocked, badge, description}
   * @returns {string} HTML
   */
  function navigationItem(options) {
    const viewId = escapeHtml(options.view);
    const isActive = options.isActive === true;
    const isLocked = options.isLocked === true;
    const activeClass = isActive ? 'is-active' : '';
    const lockedClass = isLocked ? 'is-locked' : '';
    const title = escapeHtml(options.description || options.label);
    
    const lockIcon = isLocked
      ? `<span class="ea-nav-item__lock"><i class="fas fa-lock"></i></span>`
      : '';
    
    const badge = options.badge
      ? navigationBadge(options.badge)
      : '';
    
    // Always call navigateTo and let it handle lock checking
    // This allows dynamic lock state updates without re-rendering
    const onClick = `EANavigation.navigateTo('${viewId}')`;
    
    return `
      <button 
        class="ea-nav-item ${activeClass} ${lockedClass}" 
        data-view="${viewId}"
        onclick="${onClick}"
        title="${title}">
        <div class="ea-nav-item__icon"><i class="${escapeHtml(options.icon)}"></i></div>
        <div class="ea-nav-item__label">${escapeHtml(options.label)}</div>
        ${lockIcon}
        ${badge}
      </button>`;
  }

  /**
   * Navigation Badge
   * @param {object} badge - {type: 'count'|'completed'|'lock', value}
   * @returns {string} HTML
   */
  function navigationBadge(badge) {
    if (!badge) return '';
    
    if (badge.type === 'completed') {
      return `<span class="ea-nav-item__completed"><i class="fas fa-check"></i></span>`;
    }
    
    if (badge.type === 'count' && badge.value) {
      return `<span class="ea-nav-item__badge">${escapeHtml(badge.value)}</span>`;
    }
    
    if (badge.type === 'lock') {
      return `<span class="ea-nav-item__lock"><i class="fas fa-lock"></i></span>`;
    }
    
    return '';
  }

  window.EANordicUI = {
    escapeHtml,
    button,
    statusBadge,
    metricCard,
    heatCell,
    emptyState,
    legendItem,
    navigationSection,
    navigationItem,
    navigationBadge
  };
})();