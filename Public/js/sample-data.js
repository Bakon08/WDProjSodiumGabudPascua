/**
 * SAMPLE DATA SERVICE
 * Handles sample data generation and sample-only cleanup.
 */

(function(global) {
  const dataStorageKeys = ['tasks', 'notes', 'allGoals', 'goals', 'plannerData', 'habits'];
  const authStorageKeys = ['lockinUser', 'lockin_users', 'user', 'token', 'session'];
  const refreshEventName = 'lockin:data-updated';

  function readStoredArray(key) {
    try {
      const parsed = JSON.parse(localStorage.getItem(key) || '[]');
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      return [];
    }
  }

  function readStoredGoals() {
    try {
      const parsed = JSON.parse(localStorage.getItem('allGoals') || '{}');
      if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
        return { annual: [], quarterly: [], monthly: [], weekly: [], daily: [] };
      }

      return {
        annual: Array.isArray(parsed.annual) ? parsed.annual : [],
        quarterly: Array.isArray(parsed.quarterly) ? parsed.quarterly : [],
        monthly: Array.isArray(parsed.monthly) ? parsed.monthly : [],
        weekly: Array.isArray(parsed.weekly) ? parsed.weekly : [],
        daily: Array.isArray(parsed.daily) ? parsed.daily : []
      };
    } catch (error) {
      return { annual: [], quarterly: [], monthly: [], weekly: [], daily: [] };
    }
  }

  function getAuthSnapshot() {
    return authStorageKeys.reduce(function(snapshot, key) {
      const value = localStorage.getItem(key);
      if (value !== null) {
        snapshot[key] = value;
      }
      return snapshot;
    }, {});
  }

  function restoreAuthSnapshot(snapshot) {
    authStorageKeys.forEach(function(key) {
      if (snapshot[key] !== undefined && localStorage.getItem(key) === null) {
        localStorage.setItem(key, snapshot[key]);
      }
    });
  }

  function hasActiveSession(snapshot) {
    return authStorageKeys.some(function(key) {
      return snapshot[key] !== undefined && snapshot[key] !== null && snapshot[key] !== '';
    });
  }

  function ensureSessionPersistence(beforeSnapshot) {
    const beforeHadSession = hasActiveSession(beforeSnapshot);
    const afterSnapshot = getAuthSnapshot();
    const afterHasSession = hasActiveSession(afterSnapshot);

    if (beforeHadSession && !afterHasSession) {
      restoreAuthSnapshot(beforeSnapshot);
      return true;
    }

    return afterHasSession || !beforeHadSession;
  }

  function emitDataRefresh() {
    window.dispatchEvent(new CustomEvent(refreshEventName, { detail: { source: 'sample-data-service' } }));
  }

  function makeSampleId(prefix) {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  }

  function getRelativeDate(daysOffset) {
    const date = new Date();
    date.setHours(12, 0, 0, 0);
    date.setDate(date.getDate() + daysOffset);
    return date.toISOString().split('T')[0];
  }

  function buildSampleTasks() {
    const taskTemplates = [
      { title: 'Review algebra notes', offset: -7, progress: 'Completed', type: 'School', completed: true, completedDateOffset: -7 },
      { title: 'Water indoor plants', offset: -6, progress: 'Completed', type: 'House', completed: true, completedDateOffset: -6 },
      { title: 'Plan project outline', offset: -5, progress: 'Completed', type: 'Work', completed: true, completedDateOffset: -5 },
      { title: 'Finish science slides', offset: -4, progress: 'Completed', type: 'School', completed: true, completedDateOffset: -4 },
      { title: 'Fold laundry', offset: -3, progress: 'Completed', type: 'House', completed: true, completedDateOffset: -3 },
      { title: 'Email group members', offset: -2, progress: 'In Progress', type: 'Work', completed: false, completedDate: null },
      { title: 'Clean study desk', offset: -1, progress: 'Completed', type: 'Personal', completed: true, completedDateOffset: -1 },
      { title: 'Draft book summary', offset: 0, progress: 'In Progress', type: 'School', completed: false, completedDate: null },
      { title: 'Weekend reflection', offset: 1, progress: 'Not Started', type: 'Personal', completed: false, completedDate: null },
      { title: 'Prepare weekly review', offset: 2, progress: 'In Progress', type: 'Personal', completed: false, completedDate: null },
      { title: 'Pack study materials', offset: 3, progress: 'Not Started', type: 'School', completed: false, completedDate: null },
      { title: 'Call project teammates', offset: 4, progress: 'In Progress', type: 'Work', completed: false, completedDate: null },
      { title: 'Finalize weekend schedule', offset: 5, progress: 'Not Started', type: 'Personal', completed: false, completedDate: null },
      { title: 'Organize revision folder', offset: 6, progress: 'In Progress', type: 'School', completed: false, completedDate: null },
      { title: 'Sunday reflection journal', offset: 7, progress: 'Not Started', type: 'Personal', completed: false, completedDate: null }
    ];

    return taskTemplates.map(function(task) {
      return {
        id: makeSampleId('sample-task'),
        isSample: true,
        title: task.title,
        dueDate: getRelativeDate(task.offset),
        progress: task.progress,
        type: task.type,
        completed: task.completed,
        completedDate: task.completed ? getRelativeDate(task.completedDateOffset ?? task.offset) : null
      };
    });
  }

  function buildSampleNotes() {
    return [
      {
        id: makeSampleId('sample-note'),
        isSample: true,
        title: 'Focus rules',
        type: 'Reminder',
        progress: 'Completed',
        description: '<p>Start with the hardest task, then take a short walk before the next block.</p>',
        color: '#e8f5e9'
      },
      {
        id: makeSampleId('sample-note'),
        isSample: true,
        title: 'Group meeting ideas',
        type: 'Idea',
        progress: 'In Progress',
        description: '<ul><li>Open with summary</li><li>Assign tasks</li><li>Set next check-in</li></ul>',
        color: '#fff9c4'
      },
      {
        id: makeSampleId('sample-note'),
        isSample: true,
        title: 'Weekend errands',
        type: 'Task',
        progress: 'Not Started',
        description: '<p>Buy supplies, print worksheets, and organize notes.</p>',
        color: '#fce4ec'
      },
      {
        id: makeSampleId('sample-note'),
        isSample: true,
        title: 'Study break plan',
        type: 'Important',
        progress: 'Completed',
        description: '<p>After every 45 minutes, stand up and reset your desk.</p>',
        color: '#e3f2fd'
      },
      {
        id: makeSampleId('sample-note'),
        isSample: true,
        title: 'Monthly reflection',
        type: 'Reminder',
        progress: 'In Progress',
        description: '<p>Write down wins, blockers, and one improvement for next month.</p>',
        color: '#f3e5f5'
      }
    ];
  }

  function buildSampleGoals() {
    return {
      annual: [
        { id: makeSampleId('sample-goal'), text: 'Finish the capstone project with clean documentation.', completed: false, isSample: true }
      ],
      quarterly: [
        { id: makeSampleId('sample-goal'), text: 'Improve grades in all core subjects before the next quarter ends.', completed: false, isSample: true }
      ],
      monthly: [
        { id: makeSampleId('sample-goal'), text: 'Submit every major assignment at least one day early.', completed: true, isSample: true }
      ],
      weekly: [
        { id: makeSampleId('sample-goal'), text: 'Review planner tasks every Sunday night.', completed: false, isSample: true }
      ],
      daily: [
        { id: makeSampleId('sample-goal'), text: 'Plan the next three priorities before lunch.', completed: false, isSample: true }
      ]
    };
  }

  function generateSampleData() {
    const authSnapshot = getAuthSnapshot();
    const existingTasks = JSON.parse(localStorage.getItem('tasks') || '[]');
    const existingNotes = JSON.parse(localStorage.getItem('notes') || '[]');
    const existingGoals = readStoredGoals();
    const sampleGoals = buildSampleGoals();
    const safeTasks = Array.isArray(existingTasks) ? existingTasks : [];
    const safeNotes = Array.isArray(existingNotes) ? existingNotes : [];

    localStorage.setItem('tasks', JSON.stringify([...safeTasks, ...buildSampleTasks()]));
    localStorage.setItem('notes', JSON.stringify([...safeNotes, ...buildSampleNotes()]));
    localStorage.setItem('allGoals', JSON.stringify({
      annual: [...existingGoals.annual, ...sampleGoals.annual],
      quarterly: [...existingGoals.quarterly, ...sampleGoals.quarterly],
      monthly: [...existingGoals.monthly, ...sampleGoals.monthly],
      weekly: [...existingGoals.weekly, ...sampleGoals.weekly],
      daily: [...existingGoals.daily, ...sampleGoals.daily]
    }));

    const sessionIntact = ensureSessionPersistence(authSnapshot);
    if (!sessionIntact) {
      console.warn('Session check could not confirm auth state after generating sample data.');
    }

    emitDataRefresh();
  }

  function clearSampleData() {
    const confirmed = window.confirm('Remove only generated sample data and keep your real data?');
    if (!confirmed) {
      return;
    }

    const authSnapshot = getAuthSnapshot();
    const existingTasks = readStoredArray('tasks');
    const existingNotes = readStoredArray('notes');
    const existingGoals = readStoredGoals();

    localStorage.setItem('tasks', JSON.stringify(existingTasks.filter(function(task) {
      return !task?.isSample;
    })));

    localStorage.setItem('notes', JSON.stringify(existingNotes.filter(function(note) {
      return !note?.isSample;
    })));

    localStorage.setItem('allGoals', JSON.stringify({
      annual: existingGoals.annual.filter(function(goal) { return !goal?.isSample; }),
      quarterly: existingGoals.quarterly.filter(function(goal) { return !goal?.isSample; }),
      monthly: existingGoals.monthly.filter(function(goal) { return !goal?.isSample; }),
      weekly: existingGoals.weekly.filter(function(goal) { return !goal?.isSample; }),
      daily: existingGoals.daily.filter(function(goal) { return !goal?.isSample; })
    }));

    const sessionIntact = ensureSessionPersistence(authSnapshot);
    if (!sessionIntact) {
      console.warn('Session check could not confirm auth state after removing sample data.');
    }

    emitDataRefresh();
  }

  function getRefreshableStorageKeys() {
    return [...dataStorageKeys, ...authStorageKeys, 'lockinSettings'];
  }

  global.LockinSampleDataService = {
    generateSampleData,
    clearSampleData,
    getRefreshEventName: function() {
      return refreshEventName;
    },
    getRefreshableStorageKeys
  };
})(window);
