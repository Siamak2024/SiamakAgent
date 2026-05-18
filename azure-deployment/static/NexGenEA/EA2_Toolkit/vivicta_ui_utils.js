/**
 * ════════════════════════════════════════════════════════════════════
 * VIVICTA UI UTILITIES
 * Standardized UI components for NextGenEA platform
 * 
 * Components:
 * - AI Progress Bar (unified across all features)
 * - Notifications (toast)
 * - Loading indicators
 * 
 * @version 1.0
 * @date 2026-05-18
 * ════════════════════════════════════════════════════════════════════
 */

// ═══════════════════════════════════════════════════════════════════
// VIVICTA COLOR PALETTE
// ═══════════════════════════════════════════════════════════════════

const VIVICTA_COLORS = {
    primary: '#00472E',      // Dark green
    accent: '#006B3F',       // Medium green
    purple: '#7A0049',       // Vivicta purple
    success: '#4BE3A3',      // Light green
    warning: '#FFD166',      // Yellow
    danger: '#DC2626',       // Red
    lightGreen: '#E8F5E9',   // Background green
    lightPurple: '#F3E8FF'   // Background purple
};

// ═══════════════════════════════════════════════════════════════════
// UNIFIED AI PROGRESS BAR
// ═══════════════════════════════════════════════════════════════════

/**
 * Show standardized Vivicta AI progress bar
 * @param {string} message - Progress message to display
 * @param {object} options - Optional configuration
 */
window.showVivictaAIProgress = function(message = 'AI Assistant is working...', options = {}) {
    const {
        icon = 'fa-robot',
        title = 'AI Assistant Working',
        showPercentage = false
    } = options;

    // Remove existing progress bar if any
    hideVivictaAIProgress();

    const progressHTML = `
        <div id="vivicta-ai-progress-overlay" style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0, 71, 46, 0.4); backdrop-filter: blur(6px); z-index: 10000; display: flex; align-items: center; justify-content: center;">
            <div class="vivicta-ai-progress-box" style="background: white; border-radius: 16px; padding: 40px 56px; box-shadow: 0 20px 60px rgba(0, 0, 0, 0.35); max-width: 480px; width: 90%; border: 3px solid ${VIVICTA_COLORS.primary};">
                <div style="text-align: center;">
                    <div style="margin-bottom: 24px;">
                        <i class="fas ${icon}" style="font-size: 56px; color: ${VIVICTA_COLORS.purple}; animation: vivictaPulse 2s infinite;"></i>
                    </div>
                    <h3 style="font-size: 20px; font-weight: 700; color: ${VIVICTA_COLORS.primary}; margin-bottom: 12px; letter-spacing: -0.5px;">${title}</h3>
                    <p style="font-size: 15px; color: #6b7280; margin-bottom: 28px; line-height: 1.5;">${message}</p>
                    <div class="vivicta-progress-bar" style="width: 100%; height: 10px; background: #F3F4F6; border-radius: 5px; overflow: hidden; box-shadow: inset 0 2px 4px rgba(0,0,0,0.1);">
                        <div class="vivicta-progress-fill" style="width: 0%; height: 100%; background: linear-gradient(90deg, ${VIVICTA_COLORS.purple} 0%, ${VIVICTA_COLORS.primary} 100%); animation: vivictaProgressBar 2s ease-in-out infinite; border-radius: 5px;"></div>
                    </div>
                    ${showPercentage ? '<p id="vivicta-progress-percent" style="margin-top: 12px; font-size: 13px; color: #9ca3af; font-weight: 600;">0%</p>' : ''}
                </div>
            </div>
        </div>
        <style>
            @keyframes vivictaProgressBar {
                0% { width: 0%; }
                50% { width: 75%; }
                100% { width: 100%; }
            }
            @keyframes vivictaPulse {
                0%, 100% { transform: scale(1); opacity: 1; }
                50% { transform: scale(1.05); opacity: 0.9; }
            }
        </style>
    `;

    document.body.insertAdjacentHTML('beforeend', progressHTML);
};

/**
 * Hide Vivicta AI progress bar
 */
window.hideVivictaAIProgress = function() {
    const progressOverlay = document.getElementById('vivicta-ai-progress-overlay');
    if (progressOverlay) {
        progressOverlay.remove();
    }
};

/**
 * Update progress bar message
 * @param {string} message - New message to display
 */
window.updateVivictaAIProgress = function(message) {
    const messageEl = document.querySelector('#vivicta-ai-progress-overlay p');
    if (messageEl) {
        messageEl.textContent = message;
    }
};

// ═══════════════════════════════════════════════════════════════════
// VIVICTA NOTIFICATIONS (Toast)
// ═══════════════════════════════════════════════════════════════════

/**
 * Show standardized Vivicta notification
 * @param {string} message - Notification message
 * @param {string} type - Notification type: success|info|warning|error
 * @param {number} duration - Duration in milliseconds (default 3500)
 */
window.showVivictaNotification = function(message, type = 'info', duration = 3500) {
    const typeConfig = {
        success: { 
            bg: VIVICTA_COLORS.success, 
            icon: 'check-circle', 
            text: VIVICTA_COLORS.primary,
            border: VIVICTA_COLORS.primary
        },
        info: { 
            bg: VIVICTA_COLORS.purple, 
            icon: 'info-circle', 
            text: 'white',
            border: 'transparent'
        },
        warning: { 
            bg: VIVICTA_COLORS.warning, 
            icon: 'exclamation-triangle', 
            text: '#92400E',
            border: 'transparent'
        },
        error: { 
            bg: VIVICTA_COLORS.danger, 
            icon: 'times-circle', 
            text: 'white',
            border: 'transparent'
        }
    };

    const config = typeConfig[type] || typeConfig.info;

    const toast = document.createElement('div');
    toast.className = 'vivicta-notification';
    toast.style.cssText = `
        position: fixed;
        top: 80px;
        right: 24px;
        background: ${config.bg};
        color: ${config.text};
        padding: 16px 24px;
        border-radius: 12px;
        box-shadow: 0 10px 40px rgba(0,0,0,0.2);
        z-index: 10001;
        font-size: 14px;
        font-weight: 600;
        display: flex;
        align-items: center;
        gap: 12px;
        animation: vivictaSlideInRight 0.3s ease-out;
        border: 2px solid ${config.border};
    `;

    toast.innerHTML = `
        <i class="fas fa-${config.icon}" style="font-size: 18px;"></i>
        <span>${message}</span>
    `;

    document.body.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = 'vivictaSlideOutRight 0.3s ease-in';
        setTimeout(() => toast.remove(), 300);
    }, duration);
};

// ═══════════════════════════════════════════════════════════════════
// LEGACY COMPATIBILITY ALIASES
// ═══════════════════════════════════════════════════════════════════

// Alias for existing code that uses showAIProgress
if (typeof window.showAIProgress === 'undefined') {
    window.showAIProgress = window.showVivictaAIProgress;
    window.hideAIProgress = window.hideVivictaAIProgress;
}

// Alias for showToast (used in some legacy code)
if (typeof window.showToast === 'undefined') {
    window.showToast = function(title, message, type) {
        // Convert title + message format to single message
        const fullMessage = title ? `${title}: ${message}` : message;
        window.showVivictaNotification(fullMessage, type);
    };
}

console.log('[Vivicta UI Utils] Loaded successfully ✓');
