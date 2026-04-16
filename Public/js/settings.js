/**
 * SETTINGS OVERLAY MODULE
 * Provides a shared floating settings button and modal overlay.
 * Persists values in localStorage under "lockinSettings".
 */

document.addEventListener('DOMContentLoaded', function() {
  const hasStaticSettingsPage = !!document.querySelector('.settings-overlay');

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
                <h3>Notifications</h3>
                <div class="settings-row">
                  <label for="deadlineAlerts">Deadline Alerts</label>
                  <input id="deadlineAlerts" type="checkbox" checked>
                </div>
                <div class="settings-row">
                  <label for="dailyReminder">Daily Reminder</label>
                  <input id="dailyReminder" type="checkbox" checked>
                </div>
              </article>

              <article class="settings-card">
                <h3>Appearance</h3>
                <div class="settings-row">
                  <label for="density">Layout Density</label>
                  <select id="density">
                    <option>Comfortable</option>
                    <option>Compact</option>
                  </select>
                </div>
                <div class="settings-row">
                  <label for="startPage">Start Page</label>
                  <select id="startPage">
                    <option>Dashboard</option>
                    <option>Planner</option>
                    <option>Goals</option>
                  </select>
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

  const settingsFields = [
    'displayName',
    'email',
    'deadlineAlerts',
    'dailyReminder',
    'density',
    'startPage'
  ];

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

  if (saveSettingsBtn && settingsModal) {
    saveSettingsBtn.addEventListener('click', function() {
      const settingsPayload = {
        displayName: document.getElementById('displayName')?.value || '',
        email: document.getElementById('email')?.value || '',
        deadlineAlerts: !!document.getElementById('deadlineAlerts')?.checked,
        dailyReminder: !!document.getElementById('dailyReminder')?.checked,
        density: document.getElementById('density')?.value || 'Comfortable',
        startPage: document.getElementById('startPage')?.value || 'Dashboard'
      };

      localStorage.setItem('lockinSettings', JSON.stringify(settingsPayload));
      settingsModal.style.display = 'none';
    });
  }

  if (resetSettingsBtn) {
    resetSettingsBtn.addEventListener('click', function() {
      localStorage.removeItem('lockinSettings');
      settingsFields.forEach(function(fieldId) {
        const field = document.getElementById(fieldId);
        if (!field) return;

        if (field.type === 'checkbox') {
          field.checked = true;
        } else if (fieldId === 'density') {
          field.value = 'Comfortable';
        } else if (fieldId === 'startPage') {
          field.value = 'Dashboard';
        } else {
          field.value = '';
        }
      });
    });
  }

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

  window.addEventListener('storage', function(event) {
    if (!event.key || refreshableStorageKeys.includes(event.key)) {
      emitDataRefresh();
    }
  });

  const savedSettings = JSON.parse(localStorage.getItem('lockinSettings') || '{}');
  if (savedSettings && typeof savedSettings === 'object') {
    settingsFields.forEach(function(fieldId) {
      const field = document.getElementById(fieldId);
      if (!field || savedSettings[fieldId] === undefined) return;

      if (field.type === 'checkbox') {
        field.checked = !!savedSettings[fieldId];
      } else {
        field.value = savedSettings[fieldId];
      }
    });
  }
});
