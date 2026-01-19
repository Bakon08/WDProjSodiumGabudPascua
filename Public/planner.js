// ---------- Get HTML elements ----------
const addNewTaskBtn = document.getElementById("addNewTaskBtn");
const tasksForm = document.getElementById("TasksForm");
const saveTaskBtn = document.getElementById("saveTaskBtn");
const cancelTaskBtn = document.getElementById("cancelTaskBtn");

const taskTitle = document.getElementById("taskTitle");
const taskType = document.getElementById("taskType");
const taskProgress = document.getElementById("taskProgress");
const plannerDueDate = document.getElementById("plannerDueDate");

const tasksBody = document.getElementById("tasksBody");
// --------------------------------------

// Load tasks from localStorage
let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
let editIndex = null;

// Show form
function showTaskForm() {
  tasksForm.style.display = "flex";
  clearForm();
}
addNewTaskBtn.addEventListener("click", showTaskForm);

// Hide form
function hideTaskForm() {
  tasksForm.style.display = "none";
  clearForm();
}
cancelTaskBtn.addEventListener("click", hideTaskForm);

// Save task
function saveTask() {
  if (taskTitle.value.trim() === "") {
    alert("Please enter a task title!");
    return;
  }

  const taskData = {
    title: taskTitle.value,
    dueDate: plannerDueDate.value,
    progress: taskProgress.value,
    type: taskType.value
  };

  if (editIndex === null) {
    tasks.push(taskData);
  } else {
    tasks[editIndex] = taskData;
    editIndex = null;
  }

  localStorage.setItem("tasks", JSON.stringify(tasks));
  hideTaskForm();
  renderTasks();
}

saveTaskBtn.addEventListener("click", saveTask);

// Render table
function renderTasks() {
  tasksBody.innerHTML = "";

  tasks.forEach((task, index) => {
    const row = document.createElement("tr");

    row.innerHTML = `
      <td>${task.title}</td>
      <td>${task.dueDate || "-"}</td>
      <td>${task.progress}</td>
      <td>${task.type}</td>
      <td>
        <button class="edit-btn">✏️</button>
        <button class="delete-btn">🗑️</button>
      </td>
    `;

    row.querySelector(".edit-btn").addEventListener("click", () => editTask(index));
    row.querySelector(".delete-btn").addEventListener("click", () => deleteTask(index));

    tasksBody.appendChild(row);
  });
}

// Edit task
function editTask(index) {
  const task = tasks[index];

  taskTitle.value = task.title;
  plannerDueDate.value = task.dueDate;
  taskProgress.value = task.progress;
  taskType.value = task.type;

  editIndex = index;
  tasksForm.style.display = "flex";
}

// Delete task
function deleteTask(index) {
  tasks.splice(index, 1);
  localStorage.setItem("tasks", JSON.stringify(tasks));
  renderTasks();
}

// Clear form
function clearForm() {
  taskTitle.value = "";
  plannerDueDate.value = "";
  taskProgress.value = "Not Started";
  taskType.value = "Reminder";
}

// Initial render
renderTasks();