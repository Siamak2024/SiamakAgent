/**
 * EA_Navigation.js
 * Enterprise Architecture Navigation System - Sidebar-based navigation with state management
 * 
 * Features:
 * - Hierarchical sidebar navigation with collapsible sections
 * - Resizable sidebar (220px - 400px)
 * - Icon-only collapsed mode (48px)
 * - LocalStorage persistence for user preferences
 * - Navigation history tracking
 * - Workflow-based access control
 * 
 * @version V11
 * @date May 6, 2026
 */

(function() {
  'use strict';

  // Navigation Structure Configuration
  const NAVIGATION_CONFIG = {
    HOME: {
      id: 'HOME',
      label: 'Home',
      icon: 'fas fa-home',
      collapsible: false,
      items: [
        {
          id: 'home',
          label: 'Dashboard',
          icon: 'fas fa-table-cells-large',
          view: 'home',
          description: 'Enterprise Dashboard — management overview',
          requiresStep: null,
          render: 'renderNordicDashboard'
        },
        {
          id: 'survey',
          label: 'Data Collection',
          icon: 'fas fa-clipboard-list',
          view: 'survey',
          description: 'Data Collection & Surveys',
          requiresStep: null,
          render: null
        }
      ]
    },
    STRATEGY: {
      id: 'STRATEGY',
      label: 'Strategy',
      icon: 'fas fa-bullseye',
      collapsible: true,
      items: [
        {
          id: 'exec',
          label: 'Business Objectives',
          icon: 'fas fa-table-cells',
          view: 'exec',
          description: 'Business Objectives & Strategic Summary',
          requiresStep: 1,
          lockReason: 'Complete Discovery & Business Objectives (Step 1) first',
          render: 'renderExecSummary'
        }
      ]
    },
    ARCHITECTURE: {
      id: 'ARCHITECTURE',
      label: 'Architecture',
      icon: 'fas fa-sitemap',
      collapsible: true,
      items: [
        {
          id: 'capmap',
          label: 'Capability Map',
          icon: 'fas fa-diagram-project',
          view: 'capmap',
          description: 'APQC Capability Map & Architecture',
          requiresStep: 2,
          lockReason: 'Complete APQC Capability Mapping (Step 2) first',
          render: 'renderCapMap'
        },
        {
          id: 'layers',
          label: 'Architecture Layers',
          icon: 'fas fa-layer-group',
          view: 'layers',
          description: 'Technology, Data, Application, Business Layers',
          requiresStep: 2,
          lockReason: 'Complete APQC Capability Mapping (Step 2) first',
          render: 'renderLayers'
        }
      ]
    },
    TRANSFORMATION: {
      id: 'TRANSFORMATION',
      label: 'Transformation',
      icon: 'fas fa-rocket',
      collapsible: true,
      items: [
        {
          id: 'targetarch',
          label: 'Target Architecture',
          icon: 'fas fa-compass-drafting',
          view: 'targetarch',
          description: 'Target State Architecture Design',
          requiresStep: 3,
          lockReason: 'Complete Capability Architecture (Step 3) first',
          render: 'renderTargetArchVisual'
        },
        {
          id: 'roadmapvis',
          label: 'Roadmap',
          icon: 'fas fa-timeline',
          view: 'roadmapvis',
          description: 'Transformation Roadmap & Initiatives',
          requiresStep: 4,
          lockReason: 'Complete Operating Model (Step 4) first',
          render: 'renderRoadmapVisual'
        }
      ]
    },
    TOOLKIT: {
      id: 'TOOLKIT',
      label: 'Toolkit',
      icon: 'fas fa-toolbox',
      collapsible: false,
      items: [
        {
          id: 'toolkits',
          label: 'EA Toolkit',
          icon: 'fas fa-wrench',
          view: 'toolkits',
          description: 'EA Strategy & Portfolio Toolkit · BMC, Value Chain, Maturity',
          requiresStep: null,
          render: null
        }
      ]
    },
    ANALYTICS: {
      id: 'ANALYTICS',
      label: 'Analytics',
      icon: 'fas fa-chart-line',
      collapsible: true,
      items: [
        {
          id: 'analytics-di',
          label: 'Decision Intelligence',
          icon: 'fas fa-brain',
          view: 'analytics-di',
          description: 'AI-driven capability priorities & sequencing',
          requiresStep: 2,
          lockReason: 'Complete APQC Capability Mapping (Step 2) first',
          render: null
        },
        {
          id: 'analytics-financial',
          label: 'Financial Analytics',
          icon: 'fas fa-chart-bar',
          view: 'analytics-financial',
          description: 'ROI, value pool modelling, multi-scenario CBA',
          requiresStep: null,
          render: null
        },
        {
          id: 'analytics-scenarios',
          label: 'Scenario Analytics',
          icon: 'fas fa-shuffle',
          view: 'analytics-scenarios',
          description: 'Disruption modelling, dependency impact, resilience',
          requiresStep: null,
          render: null
        },
        {
          id: 'analytics-optimize',
          label: 'Optimize',
          icon: 'fas fa-circle-nodes',
          view: 'analytics-optimize',
          description: 'Alternative roadmap generation, trade-off analysis',
          requiresStep: 4,
          lockReason: 'Complete Operating Model (Step 4) first',
          render: null
        }
      ]
    }
  };

  // Default Configuration
  const DEFAULT_CONFIG = {
    sidebarWidth: 280,
    minWidth: 220,
    maxWidth: 400,
    collapsedWidth: 48,
    isCollapsed: false,
    defaultView: 'home',
    maxHistorySize: 20
  };

  // Navigation State Manager
  class NavigationManager {
    constructor() {
      this.config = NAVIGATION_CONFIG;
      this.state = {
        activeView: DEFAULT_CONFIG.defaultView,
        sidebarWidth: DEFAULT_CONFIG.sidebarWidth,
        isCollapsed: DEFAULT_CONFIG.isCollapsed,
        expandedSections: ['HOME'], // Default expanded sections
        navigationHistory: []
      };
      
      this.loadState();
      this.initializeEventListeners();
    }

    /**
     * Load state from localStorage
     */
    loadState() {
      try {
        const saved = localStorage.getItem('ea_nav_state');
        if (saved) {
          const savedState = JSON.parse(saved);
          this.state = { ...this.state, ...savedState };
        }
        
        // Load last visited view if available
        const lastView = localStorage.getItem('ea_last_view');
        if (lastView && this.isValidView(lastView)) {
          this.state.activeView = lastView;
        }
      } catch (error) {
        console.warn('Failed to load navigation state:', error);
      }
    }

    /**
     * Save state to localStorage
     */
    saveState() {
      try {
        localStorage.setItem('ea_nav_state', JSON.stringify(this.state));
        localStorage.setItem('ea_last_view', this.state.activeView);
      } catch (error) {
        console.warn('Failed to save navigation state:', error);
      }
    }

    /**
     * Check if view ID is valid
     */
    isValidView(viewId) {
      for (const domain of Object.values(this.config)) {
        if (domain.items.some(item => item.view === viewId)) {
          return true;
        }
      }
      return false;
    }

    /**
     * Navigate to a view
     */
    navigateTo(viewId, addToHistory = true) {
      const item = this.findViewItem(viewId);
      if (!item) {
        console.error('[Navigation] ❌ View not found:', viewId);
        return false;
      }

      console.log(`[Navigation] Attempting to navigate to: ${viewId}`, {
        requiresStep: item.requiresStep,
        viewLabel: item.label
      });

      // Check if view is locked
      const isLocked = this.isViewLocked(item);
      if (isLocked) {
        console.warn(`[Navigation] 🔒 View "${viewId}" is locked. Requires Step ${item.requiresStep}`);
        const reason = item.lockReason || 'This view is currently locked';
        if (typeof toast === 'function') {
          toast('🔒 ' + reason, true);
        }
        return false;
      }

      console.log(`[Navigation] ✅ View "${viewId}" is unlocked, navigating...`);

      // Update active view
      this.state.activeView = viewId;
      
      // Auto-expand parent section
      const parentSection = this.findParentSection(viewId);
      if (parentSection && parentSection.collapsible) {
        this.expandSection(parentSection.id);
      }

      // Add to history
      if (addToHistory) {
        this.addToHistory(viewId);
      }

      // Update UI
      this.updateActiveStates();
      this.saveState();

      // Trigger view render
      if (typeof showTab === 'function') {
        showTab(viewId);
      }

      return true;
    }

    /**
     * Find view item by ID
     */
    findViewItem(viewId) {
      for (const domain of Object.values(this.config)) {
        const item = domain.items.find(i => i.view === viewId);
        if (item) return item;
      }
      return null;
    }

    /**
     * Find parent section for a view
     */
    findParentSection(viewId) {
      for (const domain of Object.values(this.config)) {
        if (domain.items.some(i => i.view === viewId)) {
          return domain;
        }
      }
      return null;
    }

    /**
     * Check if view is locked based on workflow step completion
     */
    isViewLocked(item) {
      if (!item.requiresStep) return false;
      
      // Check if required step is completed
      if (typeof window.model !== 'undefined') {
        const m = window.model;
        const steps = m.steps || {};
        const stepNum = item.requiresStep;
        const stepKey = `step${stepNum}`;
        
        // Check step completion with fallback conditions (matching updateWorkflowStepStates logic)
        let isStepComplete = false;
        
        switch (stepNum) {
          case 1:
            isStepComplete = !!(steps.step1?.status === 'completed' || (m.businessContextConfirmed && m.businessContext));
            break;
          case 2:
            const formalComplete = steps.step2?.status === 'completed';
            const hasValidated = m.capabilityValidated;
            const hasCaps = m.capabilities?.length > 0;
            
            // CRITICAL FIX: If Step 2 is formally completed with capabilities, always unlock
            // (capabilityValidated flag might not be set due to auto-approval timeout)
            isStepComplete = !!(formalComplete && hasCaps) || (hasValidated && hasCaps);
            
            // Debug logging for Step 2 (most common issue)
            console.log(`[Navigation] 🔍 Step 2 lock check for "${item.view}":`, {
              formalStatus: steps.step2?.status,
              formalComplete,
              capabilityValidated: hasValidated,
              capabilitiesCount: m.capabilities?.length || 0,
              hasCaps,
              unlockLogic: `(formalComplete && hasCaps) = ${formalComplete && hasCaps} OR (hasValidated && hasCaps) = ${hasValidated && hasCaps}`,
              isComplete: isStepComplete
            });
            break;
          case 3:
            const step3Complete = steps.step3?.status === 'completed';
            const hasTargetArchDone = m.targetArchDone;
            const hasTargetArch = !!m.targetArch;
            
            isStepComplete = !!(step3Complete || (hasTargetArchDone && hasTargetArch));
            
            console.log(`[Navigation] 🔍 Step 3 lock check for "${item.view}":`, {
              formalStatus: steps.step3?.status,
              step3Complete,
              targetArchDone: hasTargetArchDone,
              hasTargetArch,
              targetArchType: typeof m.targetArch,
              unlockLogic: `(step3Complete) = ${step3Complete} OR (targetArchDone && hasTargetArch) = ${hasTargetArchDone && hasTargetArch}`,
              isComplete: isStepComplete
            });
            break;
          case 4:
            const step4Complete = steps.step4?.status === 'completed';
            const hasOpModelDelta = !!m.operatingModelDelta;
            const hasRoadmap = !!m.roadmap;
            
            isStepComplete = !!(step4Complete || (hasOpModelDelta && hasRoadmap));
            
            console.log(`[Navigation] 🔍 Step 4 lock check for "${item.view}":`, {
              formalStatus: steps.step4?.status,
              step4Complete,
              operatingModelDelta: hasOpModelDelta,
              hasRoadmap,
              roadmapType: typeof m.roadmap,
              unlockLogic: `(step4Complete) = ${step4Complete} OR (hasOpModelDelta && hasRoadmap) = ${hasOpModelDelta && hasRoadmap}`,
              isComplete: isStepComplete
            });
            break;
          default:
            isStepComplete = !!(steps[stepKey] && steps[stepKey].status === 'completed');
        }
        
        return !isStepComplete;
      }
      
      return true; // Lock by default if model not available
    }

    /**
     * Toggle section expansion
     */
    toggleSection(sectionId) {
      const index = this.state.expandedSections.indexOf(sectionId);
      if (index > -1) {
        this.state.expandedSections.splice(index, 1);
      } else {
        this.state.expandedSections.push(sectionId);
      }
      
      this.updateSectionStates();
      this.saveState();
    }

    /**
     * Expand a section
     */
    expandSection(sectionId) {
      if (!this.state.expandedSections.includes(sectionId)) {
        this.state.expandedSections.push(sectionId);
        this.updateSectionStates();
        this.saveState();
      }
    }

    /**
     * Toggle sidebar collapse
     */
    toggleCollapse() {
      this.state.isCollapsed = !this.state.isCollapsed;
      this.updateCollapseState();
      this.saveState();
    }

    /**
     * Resize sidebar
     */
    resizeSidebar(width) {
      width = Math.max(DEFAULT_CONFIG.minWidth, Math.min(DEFAULT_CONFIG.maxWidth, width));
      this.state.sidebarWidth = width;
      this.updateSidebarWidth();
      this.saveState();
    }

    /**
     * Add to navigation history
     */
    addToHistory(viewId) {
      this.state.navigationHistory = this.state.navigationHistory.filter(id => id !== viewId);
      this.state.navigationHistory.unshift(viewId);
      
      if (this.state.navigationHistory.length > DEFAULT_CONFIG.maxHistorySize) {
        this.state.navigationHistory = this.state.navigationHistory.slice(0, DEFAULT_CONFIG.maxHistorySize);
      }
    }

    /**
     * Update active states in UI
     */
    updateActiveStates() {
      const sidebar = document.getElementById('ea-nav-sidebar');
      if (!sidebar) return;

      // Remove all active classes
      sidebar.querySelectorAll('.ea-nav-item').forEach(el => {
        el.classList.remove('is-active');
      });

      // Add active class to current view
      const activeItem = sidebar.querySelector(`[data-view="${this.state.activeView}"]`);
      if (activeItem) {
        activeItem.classList.add('is-active');
      }
    }

    /**
     * Update section expansion states
     */
    updateSectionStates() {
      const sidebar = document.getElementById('ea-nav-sidebar');
      if (!sidebar) return;

      Object.keys(this.config).forEach(sectionId => {
        const section = sidebar.querySelector(`[data-section="${sectionId}"]`);
        if (!section) return;

        const isExpanded = this.state.expandedSections.includes(sectionId);
        const itemsContainer = section.querySelector('.ea-nav-section__items');
        const chevron = section.querySelector('.ea-nav-section__toggle i');

        if (itemsContainer) {
          if (isExpanded) {
            itemsContainer.style.display = 'block';
            if (chevron) chevron.classList.replace('fa-chevron-right', 'fa-chevron-down');
          } else {
            itemsContainer.style.display = 'none';
            if (chevron) chevron.classList.replace('fa-chevron-down', 'fa-chevron-right');
          }
        }
      });
    }

    /**
     * Update collapse state
     */
    updateCollapseState() {
      const sidebar = document.getElementById('ea-nav-sidebar');
      const grid = document.querySelector('.ea-shell-grid');
      
      if (!sidebar || !grid) return;

      if (this.state.isCollapsed) {
        sidebar.classList.add('is-collapsed');
        grid.style.gridTemplateColumns = `${DEFAULT_CONFIG.collapsedWidth}px minmax(0, 1fr)`;
      } else {
        sidebar.classList.remove('is-collapsed');
        grid.style.gridTemplateColumns = `${this.state.sidebarWidth}px minmax(0, 1fr)`;
      }
    }

    /**
     * Update sidebar width
     */
    updateSidebarWidth() {
      const sidebar = document.getElementById('ea-nav-sidebar');
      const grid = document.querySelector('.ea-shell-grid');
      
      if (!sidebar || !grid || this.state.isCollapsed) return;

      grid.style.gridTemplateColumns = `${this.state.sidebarWidth}px minmax(0, 1fr)`;
    }

    /**
     * Update lock states based on workflow progress
     */
    updateLockStates() {
      const sidebar = document.getElementById('ea-nav-sidebar');
      if (!sidebar) return;

      for (const domain of Object.values(this.config)) {
        for (const item of domain.items) {
          const navItem = sidebar.querySelector(`[data-view="${item.view}"]`);
          if (!navItem) continue;

          const isLocked = this.isViewLocked(item);
          navItem.classList.toggle('is-locked', isLocked);
          
          // Update lock icon
          const lockIcon = navItem.querySelector('.ea-nav-item__lock');
          if (lockIcon) {
            lockIcon.style.display = isLocked ? 'inline-block' : 'none';
          }

          // Update title tooltip
          if (isLocked && item.lockReason) {
            navItem.setAttribute('title', item.lockReason);
          } else {
            navItem.setAttribute('title', item.description);
          }
        }
      }
    }

    /**
     * Initialize resize functionality
     */
    initializeResize() {
      const handle = document.querySelector('.ea-nav-resize-handle');
      if (!handle) return;

      let isResizing = false;
      let startX = 0;
      let startWidth = 0;

      const onMouseDown = (e) => {
        if (this.state.isCollapsed) return;
        
        isResizing = true;
        startX = e.clientX;
        startWidth = this.state.sidebarWidth;
        
        document.body.style.cursor = 'col-resize';
        document.body.style.userSelect = 'none';
        
        e.preventDefault();
      };

      const onMouseMove = (e) => {
        if (!isResizing) return;
        
        const delta = e.clientX - startX;
        const newWidth = startWidth + delta;
        this.resizeSidebar(newWidth);
      };

      const onMouseUp = () => {
        if (!isResizing) return;
        
        isResizing = false;
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      };

      handle.addEventListener('mousedown', onMouseDown);
      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
    }

    /**
     * Initialize keyboard navigation
     */
    initializeKeyboardNavigation() {
      document.addEventListener('keydown', (e) => {
        // Ignore if user is typing in an input field
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable) {
          return;
        }

        // Ctrl+B: Toggle sidebar collapse
        if (e.ctrlKey && e.key === 'b') {
          e.preventDefault();
          this.toggleCollapse();
          return;
        }

        // Ctrl+1-9: Direct domain access
        if (e.ctrlKey && e.key >= '1' && e.key <= '9') {
          e.preventDefault();
          const domains = Object.keys(this.config);
          const index = parseInt(e.key) - 1;
          if (index < domains.length) {
            const domain = this.config[domains[index]];
            if (domain.items && domain.items.length > 0) {
              this.navigateTo(domain.items[0].view);
            }
          }
          return;
        }

        // Arrow keys: Navigate within sidebar (when sidebar is focused)
        const sidebar = document.getElementById('ea-nav-sidebar');
        if (!sidebar || !sidebar.contains(document.activeElement)) {
          return;
        }

        if (e.key === 'ArrowDown') {
          e.preventDefault();
          this.navigateDown();
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          this.navigateUp();
        } else if (e.key === 'ArrowLeft') {
          e.preventDefault();
          this.collapseCurrentSection();
        } else if (e.key === 'ArrowRight') {
          e.preventDefault();
          this.expandCurrentSection();
        } else if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          this.activateCurrentItem();
        }
      });
    }

    /**
     * Navigate down to next menu item
     */
    navigateDown() {
      const sidebar = document.getElementById('ea-nav-sidebar');
      if (!sidebar) return;

      const items = Array.from(sidebar.querySelectorAll('.ea-nav-item:not(.is-locked)'));
      const currentIndex = items.findIndex(item => item === document.activeElement);
      const nextIndex = currentIndex + 1;

      if (nextIndex < items.length) {
        items[nextIndex].focus();
      } else if (items.length > 0) {
        items[0].focus(); // Wrap to beginning
      }
    }

    /**
     * Navigate up to previous menu item
     */
    navigateUp() {
      const sidebar = document.getElementById('ea-nav-sidebar');
      if (!sidebar) return;

      const items = Array.from(sidebar.querySelectorAll('.ea-nav-item:not(.is-locked)'));
      const currentIndex = items.findIndex(item => item === document.activeElement);
      const prevIndex = currentIndex - 1;

      if (prevIndex >= 0) {
        items[prevIndex].focus();
      } else if (items.length > 0) {
        items[items.length - 1].focus(); // Wrap to end
      }
    }

    /**
     * Collapse currently focused section
     */
    collapseCurrentSection() {
      const focused = document.activeElement;
      if (!focused) return;

      const section = focused.closest('.ea-nav-section');
      if (!section) return;

      const sectionId = section.getAttribute('data-section');
      if (sectionId && this.state.expandedSections.includes(sectionId)) {
        this.toggleSection(sectionId);
      }
    }

    /**
     * Expand currently focused section
     */
    expandCurrentSection() {
      const focused = document.activeElement;
      if (!focused) return;

      const section = focused.closest('.ea-nav-section');
      if (!section) return;

      const sectionId = section.getAttribute('data-section');
      if (sectionId && !this.state.expandedSections.includes(sectionId)) {
        this.toggleSection(sectionId);
      }
    }

    /**
     * Activate currently focused item
     */
    activateCurrentItem() {
      const focused = document.activeElement;
      if (!focused) return;

      if (focused.classList.contains('ea-nav-item')) {
        focused.click();
      } else if (focused.classList.contains('ea-nav-section__header')) {
        focused.click();
      }
    }

    /**
     * Initialize event listeners
     */
    initializeEventListeners() {
      // Will be called after DOM is ready
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
          this.initializeResize();
          this.initializeKeyboardNavigation();
          this.updateCollapseState();
          this.updateSidebarWidth();
          this.updateSectionStates();
          this.updateActiveStates();
          this.updateLockStates();
        });
      }
    }

    /**
     * Get navigation configuration
     */
    getConfig() {
      return this.config;
    }

    /**
     * Get current state
     */
    getState() {
      return this.state;
    }
  }

  // Initialize and expose globally
  window.EANavigation = new NavigationManager();

  // Expose configuration for external access
  window.NAVIGATION_CONFIG = NAVIGATION_CONFIG;

})();
