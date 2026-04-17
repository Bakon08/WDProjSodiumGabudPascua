// ============================================
// PLANNER.JS - Task Management System
// ============================================

const saveTaskBtn = document.getElementById("saveTaskBtn");
const cancelTaskBtn = document.getElementById("cancelTaskBtn");
const taskTitle = document.getElementById("taskTitle");
const taskType = document.getElementById("taskType");
const taskProgress = document.getElementById("taskProgress");
const plannerDueDate = document.getElementById("plannerDueDate");
const relatedGoal = document.getElementById("relatedGoal");
const goalFilter = document.getElementById("goalFilter");

const tasksBody = document.getElementById("tasksBody");
const completedTasksBody = document.getElementById("completedTasksBody");
const archiveToggle = document.getElementById("archiveToggle");
const archiveContent = document.getElementById("archiveContent");
const archiveIcon = document.getElementById("archiveIcon");
const archiveCount = document.getElementById("archiveCount");

let tasks = [];
let editIndex = null;
let activeGoalFilter = "";
let goalLookup = new Map();

function makeId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function normalizeGoalStore(rawGoals) {
  const fallback = { annual: [], quarterly: [], monthly: [], weekly: [], daily: [] };
  const source = rawGoals && typeof rawGoals === "object" && !Array.isArray(rawGoals) ? rawGoals : fallback;
  const normalized = {};
  let changed = false;

  Object.keys(fallback).forEach(type => {
    const goalsForType = Array.isArray(source[type]) ? source[type] : [];
    normalized[type] = goalsForType.map(goal => {
      const normalizedGoal = {
        id: goal.id || makeId("goal"),
        text: goal.text || "Untitled goal",
        completed: !!goal.completed,
        linkedTaskIds: Array.isArray(goal.linkedTaskIds) ? goal.linkedTaskIds : []
      };
      if (!goal.id || !Array.isArray(goal.linkedTaskIds)) {
        changed = true;
      }
      return normalizedGoal;
    });
  });

  return { normalized, changed };
}

function loadGoalsStore() {
  const raw = JSON.parse(localStorage.getItem("allGoals")) || {};
  const { normalized, changed } = normalizeGoalStore(raw);
  if (changed) {
    localStorage.setItem("allGoals", JSON.stringify(normalized));
  }
  return normalized;
}

function buildGoalLookup() {
  const goalsStore = loadGoalsStore();
  goalLookup = new Map();

  Object.entries(goalsStore).forEach(([type, goalsForType]) => {
    goalsForType.forEach(goal => {
      goalLookup.set(goal.id, {
        ...goal,
        type
      });
    });
  });

  return goalsStore;
}

function getGoalLabel(goal) {
  const typeLabel = goal.type ? goal.type.charAt(0).toUpperCase() + goal.type.slice(1) : "Goal";
  return `${typeLabel}: ${goal.text}`;
}

function renderGoalSelectors() {
  const currentRelatedSelection = relatedGoal ? relatedGoal.value : "";
  const currentFilterSelection = goalFilter ? goalFilter.value : activeGoalFilter;
  const goalsStore = buildGoalLookup();

  if (relatedGoal) {
    relatedGoal.innerHTML = `<option value="">Related Goal (Optional)</option>`;
    Object.entries(goalsStore).forEach(([type, goalsForType]) => {
      goalsForType
        .filter(goal => !goal.completed)
        .forEach(goal => {
          const option = document.createElement("option");
          option.value = goal.id;
          option.textContent = `${type.charAt(0).toUpperCase() + type.slice(1)}: ${goal.text}`;
          relatedGoal.appendChild(option);
        });
    });
    relatedGoal.value = currentRelatedSelection && goalLookup.has(currentRelatedSelection)
      ? currentRelatedSelection
      : "";
  }

  if (goalFilter) {
    goalFilter.innerHTML = `<option value="">All Goals</option><option value="__unlinked">Unlinked Tasks</option>`;
    Object.values(goalsStore).flat().forEach(goal => {
      const option = document.createElement("option");
      option.value = goal.id;
      option.textContent = getGoalLabel({ ...goal, type: goalLookup.get(goal.id)?.type });
      goalFilter.appendChild(option);
    });

    goalFilter.value = currentFilterSelection;
    if (!["", "__unlinked"].includes(goalFilter.value) && !goalLookup.has(goalFilter.value)) {
      goalFilter.value = "";
    }
    activeGoalFilter = goalFilter.value;
  }
}

function normalizeTask(task) {
  const normalizedTask = {
    id: task.id || makeId("task"),
    title: task.title || "",
    dueDate: task.dueDate || "",
    progress: task.progress || "Not Started",
    type: task.type || "School",
    completed: !!task.completed,
    completedDate: task.completedDate || null,
    goalId: task.goalId || null
  };

  if (!task.id || task.goalId === undefined) {
    normalizedTask.__changed = true;
  }

  return normalizedTask;
}

function saveTasksAndSyncGoals() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
  syncGoalTaskLinks();
  window.dispatchEvent(new CustomEvent("lockin:data-updated", { detail: { source: "planner" } }));
}

function syncGoalTaskLinks() {
  const goalsStore = loadGoalsStore();
  const linkedByGoalId = {};

  tasks.forEach(task => {
    if (task.goalId) {
      if (!linkedByGoalId[task.goalId]) {
        linkedByGoalId[task.goalId] = [];
      }
      linkedByGoalId[task.goalId].push(task.id);
    }
  });

  let changed = false;
  Object.keys(goalsStore).forEach(type => {
    goalsStore[type].forEach(goal => {
      const nextLinks = linkedByGoalId[goal.id] || [];
      const prev = Array.isArray(goal.linkedTaskIds) ? goal.linkedTaskIds : [];
      if (JSON.stringify(prev) !== JSON.stringify(nextLinks)) {
        goal.linkedTaskIds = nextLinks;
        changed = true;
      }
    });
  });

  if (changed) {
    localStorage.setItem("allGoals", JSON.stringify(goalsStore));
  }
  buildGoalLookup();
}

function getGoalProgressChip(task) {
  if (!task.goalId) {
    return `<span class="goal-progress-chip unlinked">Unlinked</span>`;
  }

  const goal = goalLookup.get(task.goalId);
  if (!goal) {
    return `<span class="goal-progress-chip missing">Missing Goal</span>`;
  }

  return `<span class="goal-progress-chip">${goal.text}</span>`;
}

function applyGoalFilter(task) {
  if (!activeGoalFilter) {
    return true;
  }
  if (activeGoalFilter === "__unlinked") {
    return !task.goalId;
  }
  return task.goalId === activeGoalFilter;
}

function renderTasks() {
  tasksBody.innerHTML = "";

  const activeTasks = tasks
    .map((task, index) => ({ task, index }))
    .filter(item => !item.task.completed)
    .filter(item => applyGoalFilter(item.task));

  if (activeTasks.length === 0) {
    tasksBody.innerHTML = `
      <tr>
        <td colspan="6">
          <div class="empty-state">
            <div class="empty-state-icon">📭</div>
            <div class="empty-state-text">No active tasks</div>
            <div class="empty-state-subtext">Try changing your goal filter or add a new task.</div>
          </div>
        </td>
      </tr>
    `;
  } else {
    activeTasks.forEach(({ task, index }) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${task.title}</td>
        <td>${task.dueDate || "-"}</td>
        <td>${task.progress}</td>
        <td>${task.type}</td>
        <td>${getGoalProgressChip(task)}</td>
        <td>
          <button class="complete-btn" title="Mark as Complete">✓</button>
          <button class="edit-btn" title="Edit">✏️</button>
          <button class="delete-btn" title="Permanently Delete">🗑️</button>
        </td>
      `;

      row.querySelector(".complete-btn").addEventListener("click", () => completeTask(index));
      row.querySelector(".edit-btn").addEventListener("click", () => editTask(index));
      row.querySelector(".delete-btn").addEventListener("click", () => deleteTask(index));
      tasksBody.appendChild(row);
    });
  }

  renderCompletedTasks();
}

function renderCompletedTasks() {
  completedTasksBody.innerHTML = "";

  const completedTasks = tasks
    .map((task, index) => ({ task, index }))
    .filter(item => item.task.completed)
    .filter(item => applyGoalFilter(item.task));

  archiveCount.textContent = `(${completedTasks.length})`;

  if (completedTasks.length === 0) {
    completedTasksBody.innerHTML = `
      <tr>
        <td colspan="5">
          <div class="empty-state">
            <div class="empty-state-icon">🎯</div>
            <div class="empty-state-text">No completed tasks yet</div>
            <div class="empty-state-subtext">Complete tasks to see them here!</div>
          </div>
        </td>
      </tr>
    `;
  } else {
    completedTasks.forEach(({ task, index }) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td style="text-decoration: line-through; opacity: 0.7;">${task.title}</td>
        <td>${task.completedDate || task.dueDate || "-"}</td>
        <td>${task.type}</td>
        <td>${getGoalProgressChip(task)}</td>
        <td>
          <button class="restore-btn" title="Restore to Active">↩️</button>
          <button class="delete-btn" title="Permanently Delete">🗑️</button>
        </td>
      `;

      row.querySelector(".restore-btn").addEventListener("click", () => restoreTask(index));
      row.querySelector(".delete-btn").addEventListener("click", () => deleteTask(index));
      completedTasksBody.appendChild(row);
    });
  }
}

function saveTask() {
  if (taskTitle.value.trim() === "") {
    alert("Please enter a task title!");
    return;
  }

  const targetProgress = taskProgress.value;
  const completed = targetProgress === "Completed";
  const taskData = {
    id: editIndex === null ? makeId("task") : tasks[editIndex].id,
    title: taskTitle.value.trim(),
    dueDate: plannerDueDate.value,
    progress: targetProgress,
    type: taskType.value,
    completed,
    completedDate: completed ? (editIndex !== null ? tasks[editIndex].completedDate || new Date().toISOString().split("T")[0] : new Date().toISOString().split("T")[0]) : null,
    goalId: relatedGoal?.value || null
  };

  if (editIndex === null) {
    tasks.push(taskData);
  } else {
    tasks[editIndex] = taskData;
    editIndex = null;
  }

  saveTasksAndSyncGoals();
  clearForm();
  renderGoalSelectors();
  renderTasks();
}

function completeTask(index) {
  const today = new Date().toISOString().split("T")[0];
  tasks[index].completed = true;
  tasks[index].completedDate = today;
  tasks[index].progress = "Completed";

  saveTasksAndSyncGoals();
  renderTasks();
  showNotification("✓ Task completed!", "success");
}

function restoreTask(index) {
  tasks[index].completed = false;
  tasks[index].completedDate = null;
  tasks[index].progress = "In Progress";

  saveTasksAndSyncGoals();
  renderTasks();
  showNotification("↩️ Task restored to active list", "info");
}

function editTask(index) {
  const task = tasks[index];
  taskTitle.value = task.title;
  plannerDueDate.value = task.dueDate;
  taskProgress.value = task.progress;
  taskType.value = task.type;
  if (relatedGoal) {
    relatedGoal.value = task.goalId || "";
  }

  editIndex = index;
  saveTaskBtn.textContent = "Update Task";
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function deleteTask(index) {
  const task = tasks[index];
  const confirmMessage = task.completed
    ? `Permanently delete "${task.title}"? This will remove it from statistics.`
    : `Permanently delete "${task.title}"? Consider completing it instead to keep it in statistics.`;

  if (confirm(confirmMessage)) {
    tasks.splice(index, 1);
    saveTasksAndSyncGoals();
    renderTasks();
    showNotification("🗑️ Task permanently deleted", "warning");
  }
}

function clearForm() {
  taskTitle.value = "";
  plannerDueDate.value = "";
  taskProgress.value = "Not Started";
  taskType.value = "School";
  if (relatedGoal) {
    relatedGoal.value = "";
  }
  editIndex = null;
  saveTaskBtn.textContent = "Add Task";
}

function showNotification(message, type = "info") {
  console.log(`[${type.toUpperCase()}] ${message}`);
}

function cancelForm() {
  clearForm();
}

function refreshPlannerView() {
  const rawTasks = JSON.parse(localStorage.getItem("tasks")) || [];
  let migrated = false;
  tasks = rawTasks.map(task => {
    const normalized = normalizeTask(task);
    if (normalized.__changed) {
      migrated = true;
      delete normalized.__changed;
    }
    return normalized;
  });

  if (migrated) {
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }

  syncGoalTaskLinks();
  renderGoalSelectors();
  renderTasks();
}

saveTaskBtn.addEventListener("click", saveTask);
cancelTaskBtn.addEventListener("click", cancelForm);

if (goalFilter) {
  goalFilter.addEventListener("change", function() {
    activeGoalFilter = goalFilter.value;
    renderTasks();
  });
}

archiveToggle.addEventListener("click", () => {
  const isHidden = archiveContent.style.display === "none";
  archiveContent.style.display = isHidden ? "block" : "none";
  archiveIcon.textContent = isHidden ? "▼" : "▶";
});

window.LockinPlannerRefresh = refreshPlannerView;
window.addEventListener("lockin:data-updated", refreshPlannerView);
window.addEventListener("storage", function(event) {
  if (!event.key || ["tasks", "allGoals", "plannerData", "habits"].includes(event.key)) {
    refreshPlannerView();
  }
});

refreshPlannerView();
