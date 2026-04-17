/**
 * SETTINGS OVERLAY MODULE
 * Provides a shared floating settings button and modal overlay.
 * Persists values in localStorage under "lockinSettings".
 */

document.addEventListener('DOMContentLoaded', function() {
  const STORAGE_KEY = 'lockinSettings';
  const hasStaticSettingsPage = !!document.querySelector('.settings-overlay');
  const themeQuery = window.matchMedia('(prefers-color-scheme: dark)');

  const defaultSettings = {
    displayName: '',
    email: '',
    density: 'Comfortable',
    startPage: 'Dashboard',
    themeMode: 'Light',
    fontScale: 'Normal',
    accentColor: 'Sage',
    animationsEnabled: true,
    compactCards: false,
    sidebarStyle: 'Glass',
    contentWidth: 'Standard',
    cornerStyle: 'Soft',
    showFooter: true,
    highContrastText: false
  };

  let settingsState = loadSettings();

  const accentMap = {
    Sage: { link: '#5fae83', sage: '#7a9b7f' },
    Ocean: { link: '#3f98c6', sage: '#4f8fb8' },
    Sunset: { link: '#c96f4a', sage: '#b77757' },
    Rose: { link: '#bf5f82', sage: '#a86b85' }
  };

  function ensureSettingsOverlay() {
    if (!document.getElementById('settingsTrigger')) {
      const triggerBtn = document.createElement('button');
      triggerBtn.id = 'settingsTrigger';
      triggerBtn.type = 'button';
      triggerBtn.className = 'settings-fab';
      triggerBtn.setAttribute('aria-label', 'Open settings');
      triggerBtn.innerHTML = '<i class="fas fa-cog" aria-hidden="true"></i>';
      document.body.appendChild(triggerBtn);
    }

    if (!document.getElementById('settingsModal')) {
      const modal = document.createElement('div');
      modal.id = 'settingsModal';
      modal.className = 'settings-modal-overlay';
      modal.style.display = 'none';
      modal.innerHTML = `
        <div class="settings-modal-content" role="dialog" aria-modal="true" aria-labelledby="settingsModalTitle">
          <div class="settings-modal-header">
            <h2 id="settingsModalTitle"><i class="fas fa-sliders-h"></i> Settings</h2>
            <button id="closeSettingsBtn" class="settings-modal-close" type="button" aria-label="Close settings">&times;</button>
          </div>
          <div class="settings-modal-body">
            <div class="settings-grid">
              <article class="settings-card">
                <h3>Account</h3>
                <div class="settings-row">
                  <label for="displayName">Display Name</label>
                  <input id="displayName" type="text" placeholder="Your name">
                </div>
                <div class="settings-row">
                  <label for="email">Email</label>
                  <input id="email" type="email" placeholder="name@email.com">
                </div>
              </article>

              <article class="settings-card">
                <h3>Appearance</h3>
                <div class="settings-row">
                  <label for="themeMode">Theme</label>
                  <select id="themeMode">
                    <option value="Light">Light</option>
                    <option value="Dark">Dark</option>
                    <option value="Auto">Auto</option>
                  </select>
                </div>
                <div class="settings-row">
                  <label for="fontScale">Font Size</label>
                  <select id="fontScale">
                    <option value="Normal">Normal</option>
                    <option value="Small">Small</option>
                    <option value="Large">Large</option>
                  </select>
                </div>
                <div class="settings-row">
                  <label for="accentColor">Accent</label>
                  <select id="accentColor">
                    <option value="Sage">Sage</option>
                    <option value="Ocean">Ocean</option>
                    <option value="Sunset">Sunset</option>
                    <option value="Rose">Rose</option>
                  </select>
                </div>
                <div class="settings-row">
                  <label for="density">Layout Density</label>
                  <select id="density">
                    <option value="Comfortable">Comfortable</option>
                    <option value="Compact">Compact</option>
                  </select>
                </div>
                <div class="settings-row">
                  <label for="startPage">Start Page</label>
                  <select id="startPage">
                    <option value="Dashboard">Dashboard</option>
                    <option value="Planner">Planner</option>
                    <option value="Goals">Goals</option>
                    <option value="Notes">Notes</option>
                    <option value="Stats">Stats</option>
                  </select>
                </div>
                <div class="settings-row">
                  <label for="animationsEnabled">Animations</label>
                  <input id="animationsEnabled" type="checkbox" checked>
                </div>
                <div class="settings-row">
                  <label for="compactCards">Compact Cards</label>
                  <input id="compactCards" type="checkbox">
                </div>
                <div class="settings-row">
                  <label for="sidebarStyle">Sidebar Style</label>
                  <select id="sidebarStyle">
                    <option value="Glass">Glass</option>
                    <option value="Solid">Solid</option>
                    <option value="Minimal">Minimal</option>
                  </select>
                </div>
                <div class="settings-row">
                  <label for="contentWidth">Content Width</label>
                  <select id="contentWidth">
                    <option value="Standard">Standard</option>
                    <option value="Wide">Wide</option>
                    <option value="Compact">Compact</option>
                  </select>
                </div>
                <div class="settings-row">
                  <label for="cornerStyle">Corner Style</label>
                  <select id="cornerStyle">
                    <option value="Soft">Soft</option>
                    <option value="Sharp">Sharp</option>
                    <option value="Rounded">Rounded</option>
                  </select>
                </div>
                <div class="settings-row">
                  <label for="showFooter">Show Footer</label>
                  <input id="showFooter" type="checkbox" checked>
                </div>
                <div class="settings-row">
                  <label for="highContrastText">High Contrast Text</label>
                  <input id="highContrastText" type="checkbox">
                </div>
              </article>

              <article class="settings-card settings-maintenance-card">
                <h3>Maintenance</h3>
                <p class="settings-maintenance-note">Seed demo data or wipe app storage from one place.</p>
                <div class="settings-maintenance-actions" id="maintenanceActions">
                  <button id="generateSampleDataBtn" class="settings-btn settings-btn-sage" type="button">Generate Sample Data</button>
                  <button id="clearAllDataBtn" class="settings-btn settings-btn-danger" type="button">Clear All Data</button>
                </div>
              </article>
            </div>
          </div>
          <div class="settings-modal-footer">
            <button id="saveSettingsBtn" class="settings-btn" type="button">Save Changes</button>
            <button id="resetSettingsBtn" class="settings-btn" type="button">Reset Defaults</button>
            <button id="closeSettingsBtn2" class="settings-btn" type="button">Close</button>
          </div>
        </div>`;
      document.body.appendChild(modal);
    }
  }

  function loadSettings() {
    try {
      const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      return { ...defaultSettings, ...(parsed || {}) };
    } catch (error) {
      return { ...defaultSettings };
    }
  }

  function saveSettings(nextSettings) {
    settingsState = { ...defaultSettings, ...nextSettings };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settingsState));
  }

  function updateGreeting(settings) {
    const userGreeting = document.getElementById('userGreeting');
    const usernameDisplay = document.getElementById('usernameDisplay');
    if (!userGreeting || !usernameDisplay) return;

    const fallbackUser = localStorage.getItem('lockinUser') || 'User';
    const greetingName = (settings.displayName || '').trim() || fallbackUser;
    usernameDisplay.textContent = greetingName;
    userGreeting.classList.add('show');
  }

  function applyTheme(themeMode) {
    const computedTheme = themeMode === 'Auto' ? (themeQuery.matches ? 'Dark' : 'Light') : themeMode;
    document.body.classList.toggle('dark-mode', computedTheme === 'Dark');
  }

  function applyDensity(density) {
    document.body.classList.toggle('compact-layout', density === 'Compact');
    document.body.classList.toggle('comfortable-layout', density !== 'Compact');
  }

  function applyFontScale(fontScale) {
    document.body.classList.remove('font-scale-small', 'font-scale-normal', 'font-scale-large');
    if (fontScale === 'Small') {
      document.body.classList.add('font-scale-small');
    } else if (fontScale === 'Large') {
      document.body.classList.add('font-scale-large');
    } else {
      document.body.classList.add('font-scale-normal');
    }
  }

  function applyAccentColor(accentColor) {
    const palette = accentMap[accentColor] || accentMap.Sage;
    document.documentElement.style.setProperty('--link-green', palette.link);
    document.documentElement.style.setProperty('--sage-green', palette.sage);
  }

  function applyAnimations(enabled) {
    document.body.classList.toggle('no-animations', !enabled);
  }

  function applyCompactCards(enabled) {
    document.body.classList.toggle('compact-cards', !!enabled);
  }

  function applySidebarStyle(sidebarStyle) {
    document.body.classList.remove('sidebar-style-glass', 'sidebar-style-solid', 'sidebar-style-minimal');
    if (sidebarStyle === 'Solid') {
      document.body.classList.add('sidebar-style-solid');
      return;
    }
    if (sidebarStyle === 'Minimal') {
      document.body.classList.add('sidebar-style-minimal');
      return;
    }
    document.body.classList.add('sidebar-style-glass');
  }

  function applyContentWidth(contentWidth) {
    document.body.classList.remove('content-width-standard', 'content-width-wide', 'content-width-compact');
    if (contentWidth === 'Wide') {
      document.body.classList.add('content-width-wide');
      return;
    }
    if (contentWidth === 'Compact') {
      document.body.classList.add('content-width-compact');
      return;
    }
    document.body.classList.add('content-width-standard');
  }

  function applyCornerStyle(cornerStyle) {
    document.body.classList.remove('corners-soft', 'corners-sharp', 'corners-rounded');
    if (cornerStyle === 'Sharp') {
      document.body.classList.add('corners-sharp');
      return;
    }
    if (cornerStyle === 'Rounded') {
      document.body.classList.add('corners-rounded');
      return;
    }
    document.body.classList.add('corners-soft');
  }

  function applyFooterVisibility(showFooter) {
    document.body.classList.toggle('hide-footer', !showFooter);
  }

  function applyHighContrastText(enabled) {
    document.body.classList.toggle('high-contrast-text', !!enabled);
  }

  function applyAllSettings(settings) {
    applyTheme(settings.themeMode);
    applyDensity(settings.density);
    applyFontScale(settings.fontScale);
    applyAccentColor(settings.accentColor);
    applyAnimations(settings.animationsEnabled);
    applyCompactCards(settings.compactCards);
    applySidebarStyle(settings.sidebarStyle);
    applyContentWidth(settings.contentWidth);
    applyCornerStyle(settings.cornerStyle);
    applyFooterVisibility(settings.showFooter);
    applyHighContrastText(settings.highContrastText);
    updateGreeting(settings);
  }

  function fieldValue(field) {
    if (!field) return undefined;
    return field.type === 'checkbox' ? !!field.checked : field.value;
  }

  function writeField(field, value) {
    if (!field || value === undefined) return;
    if (field.type === 'checkbox') {
      field.checked = !!value;
    } else {
      field.value = value;
    }
  }

  function collectSettingsFromForm() {
    const keys = Object.keys(defaultSettings);
    return keys.reduce(function(acc, key) {
      const element = document.getElementById(key);
      const value = fieldValue(element);
      acc[key] = value === undefined ? settingsState[key] : value;
      return acc;
    }, {});
  }

  function hydrateForm(settings) {
    Object.keys(defaultSettings).forEach(function(key) {
      writeField(document.getElementById(key), settings[key]);
    });
  }

  if (!hasStaticSettingsPage) {
    ensureSettingsOverlay();
  }

  const settingsModal = document.getElementById('settingsModal');
  const settingsTrigger = document.getElementById('settingsTrigger');
  const closeSettingsBtn = document.getElementById('closeSettingsBtn');
  const closeSettingsBtn2 = document.getElementById('closeSettingsBtn2');
  const saveSettingsBtn = document.getElementById('saveSettingsBtn');
  const resetSettingsBtn = document.getElementById('resetSettingsBtn');
  const generateSampleDataBtn = document.getElementById('generateSampleDataBtn');
  const clearAllDataBtn = document.getElementById('clearAllDataBtn');

  const sampleDataService = window.LockinSampleDataService || null;
  const refreshEventName = sampleDataService?.getRefreshEventName?.() || 'lockin:data-updated';
  const refreshableStorageKeys = sampleDataService?.getRefreshableStorageKeys?.() || [
    'tasks',
    'notes',
    'allGoals',
    'goals',
    'plannerData',
    'habits',
    'lockinSettings',
    'lockinUser',
    'lockin_users',
    'user',
    'token',
    'session'
  ];

  function emitDataRefresh() {
    window.dispatchEvent(new CustomEvent(refreshEventName, { detail: { source: 'settings' } }));
  }

  if (settingsTrigger && settingsModal) {
    settingsTrigger.addEventListener('click', function(e) {
      e.preventDefault();
      hydrateForm(settingsState);
      settingsModal.style.display = 'flex';
    });
  }

  if (closeSettingsBtn && settingsModal) {
    closeSettingsBtn.addEventListener('click', function() {
      settingsModal.style.display = 'none';
    });
  }

  if (closeSettingsBtn2 && settingsModal) {
    closeSettingsBtn2.addEventListener('click', function() {
      settingsModal.style.display = 'none';
    });
  }

  if (settingsModal) {
    settingsModal.addEventListener('click', function(e) {
      if (e.target === settingsModal) {
        settingsModal.style.display = 'none';
      }
    });
  }

  if (saveSettingsBtn) {
    saveSettingsBtn.addEventListener('click', function() {
      const nextSettings = collectSettingsFromForm();
      saveSettings(nextSettings);
      applyAllSettings(settingsState);
      emitDataRefresh();
      if (settingsModal) {
        settingsModal.style.display = 'none';
      }
    });
  }

  if (resetSettingsBtn) {
    resetSettingsBtn.addEventListener('click', function() {
      settingsState = { ...defaultSettings };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settingsState));
      hydrateForm(settingsState);
      applyAllSettings(settingsState);
      emitDataRefresh();
    });
  }

  Object.keys(defaultSettings).forEach(function(key) {
    const field = document.getElementById(key);
    if (!field) return;

    const eventName = field.type === 'checkbox' || field.tagName === 'SELECT' ? 'change' : 'input';
    field.addEventListener(eventName, function() {
      const nextSettings = collectSettingsFromForm();
      saveSettings(nextSettings);
      applyAllSettings(settingsState);
    });
  });

  if (generateSampleDataBtn) {
    generateSampleDataBtn.addEventListener('click', function() {
      if (sampleDataService?.generateSampleData) {
        sampleDataService.generateSampleData();
      } else {
        console.warn('Sample data service is not available.');
      }
    });
  }

  if (clearAllDataBtn) {
    clearAllDataBtn.addEventListener('click', function() {
      if (sampleDataService?.clearSampleData) {
        sampleDataService.clearSampleData();
      } else {
        console.warn('Sample data service is not available.');
      }
    });
  }

  themeQuery.addEventListener('change', function() {
    if (settingsState.themeMode === 'Auto') {
      applyTheme('Auto');
    }
  });

  window.addEventListener('storage', function(event) {
    if (!event.key || refreshableStorageKeys.includes(event.key)) {
      settingsState = loadSettings();
      applyAllSettings(settingsState);
      hydrateForm(settingsState);
      emitDataRefresh();
    }
  });

  hydrateForm(settingsState);
  applyAllSettings(settingsState);
});