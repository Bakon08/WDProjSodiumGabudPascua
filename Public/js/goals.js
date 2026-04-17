// ============================================
// GOALS.JS - Goal + Linked Task Progress
// ============================================

const GOAL_TYPES = ["annual", "quarterly", "monthly", "weekly", "daily"];

let goals = {
  annual: [],
  quarterly: [],
  monthly: [],
  weekly: [],
  daily: []
};

function makeId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function getUlId(type) {
  return `${type}GoalUL`;
}

function getInputId(type) {
  return `${type}GoalInput`;
}

function emitDataRefresh() {
  window.dispatchEvent(new CustomEvent("lockin:data-updated", { detail: { source: "goals" } }));
}

function normalizeGoalsStore(rawGoals) {
  const normalized = { annual: [], quarterly: [], monthly: [], weekly: [], daily: [] };
  let changed = false;

  GOAL_TYPES.forEach(type => {
    const goalsForType = Array.isArray(rawGoals?.[type]) ? rawGoals[type] : [];
    normalized[type] = goalsForType.map(goal => {
      const nextGoal = {
        id: goal.id || makeId("goal"),
        text: goal.text || "Untitled goal",
        completed: !!goal.completed,
        linkedTaskIds: Array.isArray(goal.linkedTaskIds) ? goal.linkedTaskIds : []
      };
      if (!goal.id || !Array.isArray(goal.linkedTaskIds)) {
        changed = true;
      }
      return nextGoal;
    });
  });

  return { normalized, changed };
}

function normalizeTasks(rawTasks) {
  if (!Array.isArray(rawTasks)) {
    return [];
  }
  return rawTasks.map(task => ({
    id: task.id || makeId("task"),
    title: task.title || "Untitled task",
    dueDate: task.dueDate || "",
    progress: task.progress || "Not Started",
    type: task.type || "School",
    completed: !!task.completed || task.progress === "Completed",
    completedDate: task.completedDate || null,
    goalId: task.goalId || null
  }));
}

function loadGoals() {
  const raw = JSON.parse(localStorage.getItem("allGoals")) || {};
  const { normalized, changed } = normalizeGoalsStore(raw);
  goals = normalized;
  if (changed) {
    localStorage.setItem("allGoals", JSON.stringify(goals));
  }
}

function saveGoals({ emitRefresh = true } = {}) {
  localStorage.setItem("allGoals", JSON.stringify(goals));
  if (emitRefresh) {
    emitDataRefresh();
  }
}

function getLinkedTasks(goalId) {
  const tasks = normalizeTasks(JSON.parse(localStorage.getItem("tasks")) || []);
  return tasks.filter(task => task.goalId === goalId);
}

function syncLinkedTaskIds() {
  const tasks = normalizeTasks(JSON.parse(localStorage.getItem("tasks")) || []);
  const linkedByGoal = {};

  tasks.forEach(task => {
    if (task.goalId) {
      if (!linkedByGoal[task.goalId]) {
        linkedByGoal[task.goalId] = [];
      }
      linkedByGoal[task.goalId].push(task.id);
    }
  });

  let changed = false;
  GOAL_TYPES.forEach(type => {
    goals[type].forEach(goal => {
      const nextIds = linkedByGoal[goal.id] || [];
      if (JSON.stringify(goal.linkedTaskIds || []) !== JSON.stringify(nextIds)) {
        goal.linkedTaskIds = nextIds;
        changed = true;
      }
    });
  });

  if (changed) {
    saveGoals({ emitRefresh: false });
  }
}

function getGoalWidget(goal) {
  const linkedTasks = getLinkedTasks(goal.id)
    .sort((a, b) => {
      const dateA = a.dueDate ? new Date(a.dueDate).getTime() : 0;
      const dateB = b.dueDate ? new Date(b.dueDate).getTime() : 0;
      return dateB - dateA;
    });

  const total = linkedTasks.length;
  const completed = linkedTasks.filter(task => task.completed).length;
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
  const recentTasks = linkedTasks.slice(0, 3);

  const taskItemsHtml = recentTasks.length === 0
    ? `<li class="goal-task-list-empty">No linked tasks yet</li>`
    : recentTasks.map(task => `
      <li>
        <span>${task.title}</span>
        <span>${task.dueDate || "No date"}</span>
      </li>
    `).join("");

  return `
    <div class="goal-task-widget">
      <div class="goal-task-stats">
        <span>${completed}/${total} tasks done</span>
        <span>${percent}%</span>
      </div>
      <div class="goal-task-progress-bar">
        <div class="goal-task-progress-fill" style="width: ${percent}%"></div>
      </div>
      <ul class="goal-task-list">${taskItemsHtml}</ul>
    </div>
  `;
}

function renderGoals() {
  GOAL_TYPES.forEach(type => {
    const ul = document.getElementById(getUlId(type));
    if (!ul) return;

    ul.innerHTML = "";
    goals[type].forEach((goal, index) => {
      const li = document.createElement("li");
      li.className = goal.completed ? "completed" : "";
      li.innerHTML = `
        <div class="goal-item-header">
          <span class="goal-text">${goal.text}</span>
          <div class="actions">
            <button onclick="completeGoal(event, '${type}', ${index})" class="complete-btn">✓</button>
            <button onclick="deleteGoal(event, '${type}', ${index})" class="delete-btn">✕</button>
          </div>
        </div>
        ${getGoalWidget(goal)}
      `;
      ul.appendChild(li);
    });
  });
}

function addGoal(event, type) {
  event.stopPropagation();
  const input = document.getElementById(getInputId(type));
  const goalText = input.value.trim();

  if (goalText) {
    goals[type].push({
      id: makeId("goal"),
      text: goalText,
      completed: false,
      linkedTaskIds: []
    });
    saveGoals();
    renderGoals();
    input.value = "";
    input.focus();
  }
}

function completeGoal(event, type, index) {
  event.stopPropagation();
  goals[type][index].completed = !goals[type][index].completed;
  saveGoals();
  renderGoals();
}

function deleteGoal(event, type, index) {
  event.stopPropagation();
  const deletedGoalId = goals[type][index].id;
  goals[type].splice(index, 1);
  saveGoals({ emitRefresh: false });

  const tasks = normalizeTasks(JSON.parse(localStorage.getItem("tasks")) || []);
  const updatedTasks = tasks.map(task => {
    if (task.goalId === deletedGoalId) {
      return { ...task, goalId: null };
    }
    return task;
  });
  localStorage.setItem("tasks", JSON.stringify(updatedTasks));

  emitDataRefresh();
  renderGoals();
}

function refreshGoalsView() {
  loadGoals();
  syncLinkedTaskIds();
  renderGoals();
}

window.LockinGoalsRefresh = refreshGoalsView;
window.addEventListener("lockin:data-updated", refreshGoalsView);
window.addEventListener("storage", function(event) {
  if (!event.key || ["allGoals", "tasks", "notes", "plannerData", "habits"].includes(event.key)) {
    refreshGoalsView();
  }
});

window.onload = refreshGoalsView;
