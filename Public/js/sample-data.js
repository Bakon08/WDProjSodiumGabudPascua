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

  function getRelativeDateTime(daysOffset, hoursOffset, minutesOffset) {
    const date = new Date();
    date.setDate(date.getDate() + daysOffset);
    date.setHours(hoursOffset, minutesOffset || 0, 0, 0);
    return date.toISOString();
  }

  function normalizeTasksWithIds(rawTasks) {
    if (!Array.isArray(rawTasks)) {
      return [];
    }

    return rawTasks.map(task => ({
      ...task,
      id: task.id || makeSampleId('task'),
      goalId: task.goalId || null
    }));
  }

  const sampleSeedBlueprints = [
    {
      type: 'annual',
      text: 'Finish the capstone project with clean documentation.',
      completed: false,
      tasks: [
        { title: 'Outline capstone milestones', offset: -10, progress: 'Completed', type: 'School', priority: 'High', completed: true, completedDateOffset: -8, completionHour: 20, completionMinute: 15 },
        { title: 'Draft documentation checklist', offset: -4, progress: 'In Progress', type: 'School', priority: 'Medium', completed: false },
        { title: 'Review final presentation notes', offset: 2, progress: 'Not Started', type: 'School', priority: 'Low', completed: false },
        { title: 'Rehearse capstone demo script', offset: -2, progress: 'Completed', type: 'School', priority: 'High', completed: true, completedDateOffset: 0, completionHour: 10, completionMinute: 5 }
      ]
    },
    {
      type: 'quarterly',
      text: 'Improve grades in all core subjects before the next quarter ends.',
      completed: false,
      tasks: [
        { title: 'Plan weekly study schedule', offset: -6, progress: 'Completed', type: 'School', priority: 'High', completed: true, completedDateOffset: -6, completionHour: 7, completionMinute: 40 },
        { title: 'Email group members', offset: -2, progress: 'In Progress', type: 'Work', priority: 'Medium', completed: false },
        { title: 'Pack study materials', offset: 3, progress: 'Not Started', type: 'School', priority: 'Low', completed: false },
        { title: 'Solve practice exam set', offset: -3, progress: 'Completed', type: 'School', priority: 'High', completed: true, completedDateOffset: -2, completionHour: 14, completionMinute: 25 }
      ]
    },
    {
      type: 'monthly',
      text: 'Submit every major assignment at least one day early.',
      completed: true,
      tasks: [
        { title: 'Finish science slides', offset: -4, progress: 'Completed', type: 'School', priority: 'High', completed: true, completedDateOffset: -4, completionHour: 16, completionMinute: 50 },
        { title: 'Prepare weekly review', offset: 2, progress: 'In Progress', type: 'Personal', priority: 'Medium', completed: false },
        { title: 'Organize revision folder', offset: 6, progress: 'In Progress', type: 'School', priority: 'Low', completed: false },
        { title: 'Submit math worksheet early', offset: -1, progress: 'Completed', type: 'School', priority: 'Medium', completed: true, completedDateOffset: -1, completionHour: 11, completionMinute: 35 }
      ]
    },
    {
      type: 'weekly',
      text: 'Review planner tasks every Sunday night.',
      completed: false,
      tasks: [
        { title: 'Fold laundry', offset: -3, progress: 'Completed', type: 'House', priority: 'Low', completed: true, completedDateOffset: -3, completionHour: 18, completionMinute: 10 },
        { title: 'Weekend reflection', offset: 1, progress: 'Not Started', type: 'Personal', priority: 'Medium', completed: false },
        { title: 'Sunday reflection journal', offset: 7, progress: 'Not Started', type: 'Personal', priority: 'High', completed: false },
        { title: 'Reset planner priorities', offset: 0, progress: 'Completed', type: 'Personal', priority: 'High', completed: true, completedDateOffset: 0, completionHour: 21, completionMinute: 5 }
      ]
    },
    {
      type: 'daily',
      text: 'Plan the next three priorities before lunch.',
      completed: false,
      tasks: [
        { title: 'Water indoor plants', offset: -6, progress: 'Completed', type: 'House', priority: 'Low', completed: true, completedDateOffset: -6, completionHour: 6, completionMinute: 55 },
        { title: 'Clean study desk', offset: -1, progress: 'Completed', type: 'Personal', priority: 'High', completed: true, completedDateOffset: -1, completionHour: 9, completionMinute: 10 },
        { title: 'Finalize weekend schedule', offset: 5, progress: 'Not Started', type: 'Personal', priority: 'Medium', completed: false },
        { title: 'Daily top-3 check-in', offset: -1, progress: 'Completed', type: 'Personal', priority: 'High', completed: true, completedDateOffset: 0, completionHour: 12, completionMinute: 20 }
      ]
    }
  ];

  const unlinkedSampleTasks = [
    {
      title: 'Sort backpack and notes',
      offset: -1,
      progress: 'Completed',
      type: 'School',
      priority: 'Medium',
      completed: true,
      completedDateOffset: -1,
      completionHour: 15,
      completionMinute: 45
    },
    {
      title: 'Prep tomorrow\'s desk setup',
      offset: 4,
      progress: 'Not Started',
      type: 'Personal',
      priority: 'Low',
      completed: false
    },
    {
      title: 'Follow up on science questions',
      offset: -3,
      progress: 'Completed',
      type: 'School',
      priority: 'High',
      completed: true,
      completedDateOffset: -2,
      completionHour: 19,
      completionMinute: 0
    }
  ];

  function buildSampleGoalsAndTasks() {
    const goals = { annual: [], quarterly: [], monthly: [], weekly: [], daily: [] };
    const goalIdsByType = {};
    const tasks = [];

    sampleSeedBlueprints.forEach(function(seed) {
      const goalId = makeSampleId('sample-goal');
      const linkedTaskIds = [];

      goalIdsByType[seed.type] = goalId;
      goals[seed.type].push({
        id: goalId,
        text: seed.text,
        completed: !!seed.completed,
        isSample: true,
        linkedTaskIds
      });

      seed.tasks.forEach(function(task) {
        const taskId = makeSampleId('sample-task');
        const completionHour = Number.isInteger(task.completionHour) ? task.completionHour : 8 + (tasks.length % 9);
        const completionMinute = Number.isInteger(task.completionMinute) ? task.completionMinute : 30;
        linkedTaskIds.push(taskId);
        tasks.push({
          id: taskId,
          isSample: true,
          title: task.title,
          dueDate: getRelativeDate(task.offset),
          progress: task.progress,
          type: task.type,
          priority: task.priority || 'Medium',
          completed: task.completed,
          completedDate: task.completed ? getRelativeDate(task.completedDateOffset ?? task.offset) : null,
          completedAt: task.completed ? getRelativeDateTime(task.completedDateOffset ?? task.offset, completionHour, completionMinute) : null,
          goalId
        });
      });
    });

    unlinkedSampleTasks.forEach(function(task) {
      const taskId = makeSampleId('sample-task');
      const completionHour = Number.isInteger(task.completionHour) ? task.completionHour : 18;
      const completionMinute = Number.isInteger(task.completionMinute) ? task.completionMinute : 45;
      tasks.push({
        id: taskId,
        isSample: true,
        title: task.title,
        dueDate: getRelativeDate(task.offset),
        progress: task.progress,
        type: task.type,
        priority: task.priority || 'Medium',
        completed: task.completed,
        completedDate: task.completed ? getRelativeDate(task.completedDateOffset ?? task.offset) : null,
        completedAt: task.completed ? getRelativeDateTime(task.completedDateOffset ?? task.offset, completionHour, completionMinute) : null,
        goalId: null
      });
    });

    return { goals, goalIdsByType, tasks };
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

  function syncGoalLinkedTaskIds(goalsObject, allTasks) {
    const taskIdsByGoal = {};
    allTasks.forEach(task => {
      if (task.goalId) {
        if (!taskIdsByGoal[task.goalId]) {
          taskIdsByGoal[task.goalId] = [];
        }
        taskIdsByGoal[task.goalId].push(task.id);
      }
    });

    Object.keys(goalsObject).forEach(type => {
      goalsObject[type] = goalsObject[type].map(goal => ({
        ...goal,
        linkedTaskIds: taskIdsByGoal[goal.id] || []
      }));
    });

    return goalsObject;
  }

  function generateSampleData() {
    const authSnapshot = getAuthSnapshot();
    const existingTasks = normalizeTasksWithIds(JSON.parse(localStorage.getItem('tasks') || '[]'));
    const existingNotes = JSON.parse(localStorage.getItem('notes') || '[]');
    const existingGoals = readStoredGoals();
    const sampleGoalBundle = buildSampleGoalsAndTasks();
    const sampleGoals = sampleGoalBundle.goals;
    const safeTasks = Array.isArray(existingTasks) ? existingTasks : [];
    const safeNotes = Array.isArray(existingNotes) ? existingNotes : [];
    const sampleTasks = sampleGoalBundle.tasks;
    const mergedTasks = [...safeTasks, ...sampleTasks];

    const mergedGoals = {
      annual: [...existingGoals.annual, ...sampleGoals.annual],
      quarterly: [...existingGoals.quarterly, ...sampleGoals.quarterly],
      monthly: [...existingGoals.monthly, ...sampleGoals.monthly],
      weekly: [...existingGoals.weekly, ...sampleGoals.weekly],
      daily: [...existingGoals.daily, ...sampleGoals.daily]
    };

    syncGoalLinkedTaskIds(mergedGoals, mergedTasks);

    localStorage.setItem('tasks', JSON.stringify(mergedTasks));
    localStorage.setItem('notes', JSON.stringify([...safeNotes, ...buildSampleNotes()]));
    localStorage.setItem('allGoals', JSON.stringify(mergedGoals));

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
    const existingTasks = normalizeTasksWithIds(readStoredArray('tasks'));
    const existingNotes = readStoredArray('notes');
    const existingGoals = readStoredGoals();

    const remainingTasks = existingTasks.filter(function(task) {
      return !task?.isSample;
    });

    localStorage.setItem('tasks', JSON.stringify(remainingTasks));

    localStorage.setItem('notes', JSON.stringify(existingNotes.filter(function(note) {
      return !note?.isSample;
    })));

    const remainingGoals = {
      annual: existingGoals.annual.filter(function(goal) { return !goal?.isSample; }),
      quarterly: existingGoals.quarterly.filter(function(goal) { return !goal?.isSample; }),
      monthly: existingGoals.monthly.filter(function(goal) { return !goal?.isSample; }),
      weekly: existingGoals.weekly.filter(function(goal) { return !goal?.isSample; }),
      daily: existingGoals.daily.filter(function(goal) { return !goal?.isSample; })
    };

    syncGoalLinkedTaskIds(remainingGoals, remainingTasks);
    localStorage.setItem('allGoals', JSON.stringify(remainingGoals));

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
