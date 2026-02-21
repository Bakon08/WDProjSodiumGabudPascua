// ============================================
// PLANNER.JS - Task Management System
// ============================================
// Handles all task CRUD operations with:
// - Soft delete (complete) - keeps in localStorage
// - Hard delete (permanent) - removes from localStorage
// - Archive/restore functionality
// - Form validation and rendering
// ============================================

// ==========================================
// GET DOM ELEMENTS
// ==========================================
// Get references to all HTML elements we'll interact with

// Button to show the add task form
const addNewTaskBtn = document.getElementById("addNewTaskBtn");
// The form container for adding/editing tasks (hidden by default)
const tasksForm = document.getElementById("TasksForm");
// Save button in the form
const saveTaskBtn = document.getElementById("saveTaskBtn");
// Cancel button to hide the form
const cancelTaskBtn = document.getElementById("cancelTaskBtn");

// Form input fields
const taskTitle = document.getElementById("taskTitle");
const taskType = document.getElementById("taskType");
const taskProgress = document.getElementById("taskProgress");
const plannerDueDate = document.getElementById("plannerDueDate");

// Table body elements for rendering tasks
const tasksBody = document.getElementById("tasksBody"); // Active tasks
const completedTasksBody = document.getElementById("completedTasksBody"); // Completed tasks

// Archive section elements
const archiveToggle = document.getElementById("archiveToggle"); // Clickable header
const archiveContent = document.getElementById("archiveContent"); // Collapsible content
const archiveIcon = document.getElementById("archiveIcon"); // Arrow icon (▶/▼)
const archiveCount = document.getElementById("archiveCount"); // Count badge (0)

// ==========================================
// INITIALIZE DATA
// ==========================================
// Load tasks from localStorage or create empty array if none exist
let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
// Track which task is being edited (null = adding new task)
let editIndex = null;

// ========================================
// FORM DISPLAY FUNCTIONS
// ========================================

/**
 * Shows the task form for adding a new task
 * Clears any previous input values
 */
function showTaskForm() {
  tasksForm.style.display = "flex";  // Make form visible
  clearForm();  // Reset all input fields to default values
}
// Attach event listener to "+ New Task" button
addNewTaskBtn.addEventListener("click", showTaskForm);

/**
 * Hides the task form and resets it
 * Called when user clicks Cancel button
 */
function hideTaskForm() {
  tasksForm.style.display = "none";  // Hide the form
  clearForm();  // Reset all input fields
}
// Attach event listener to Cancel button
cancelTaskBtn.addEventListener("click", hideTaskForm);

// ========================================
// SAVE TASK FUNCTION
// ========================================

/**
 * Saves a new task or updates an existing task
 * Validates input and updates localStorage
 */
function saveTask() {
  // Validation: Ensure task title is not empty
  if (taskTitle.value.trim() === "") {
    alert("Please enter a task title!");
    return;  // Stop execution if validation fails
  }

  // Create task data object from form inputs
  const taskData = {
    title: taskTitle.value,
    dueDate: plannerDueDate.value,
    progress: taskProgress.value,
    type: taskType.value,
    completed: false,  // Soft delete flag - false means task is active
    completedDate: null  // Stores date when task was completed
  };

  // Determine if we're adding a new task or editing an existing one
  if (editIndex === null) {
    // Adding new task: push to end of tasks array
    tasks.push(taskData);
  } else {
    // Editing existing task:
    // Preserve completion status and date (don't reset when editing)
    taskData.completed = tasks[editIndex].completed;
    taskData.completedDate = tasks[editIndex].completedDate;
    tasks[editIndex] = taskData;  // Replace task at edit index
    editIndex = null;  // Reset edit mode
  }

  // Save updated tasks array to localStorage (converts to JSON string)
  localStorage.setItem("tasks", JSON.stringify(tasks));
  
  // Hide form and refresh the display
  hideTaskForm();
  renderTasks();
}

// Attach event listener to Save button
saveTaskBtn.addEventListener("click", saveTask);

// ========================================
// RENDER ACTIVE TASKS FUNCTION
// ========================================

/**
 * Renders the active (non-completed) tasks in the main table
 * Uses soft delete approach: tasks with completed=false are shown
 */
function renderTasks() {
  tasksBody.innerHTML = "";  // Clear existing table rows
  
  // Filter to get only active tasks (where completed flag is false)
  const activeTasks = tasks.filter(task => !task.completed);

  // Show empty state message if no active tasks exist
  if (activeTasks.length === 0) {
    tasksBody.innerHTML = `
      <tr>
        <td colspan="5">
          <div class="empty-state">
            <div class="empty-state-icon">📭</div>
            <div class="empty-state-text">No active tasks</div>
            <div class="empty-state-subtext">Click "+ New Task" to get started!</div>
          </div>
        </td>
      </tr>
    `;
  } else {
    // Loop through each active task and create a table row
    activeTasks.forEach((task, originalIndex) => {
      // Find the original index in the full tasks array (needed for edit/delete/complete)
      const taskIndex = tasks.findIndex(t => t === task);
      const row = document.createElement("tr");  // Create new table row

      // Populate row with task data and action buttons
      row.innerHTML = `
        <td>${task.title}</td>
        <td>${task.dueDate || "-"}</td>  <!-- Show "-" if no due date -->
        <td>${task.progress}</td>
        <td>${task.type}</td>
        <td>
          <button class="complete-btn" title="Mark as Complete">✓</button>
          <button class="edit-btn" title="Edit">✏️</button>
          <button class="delete-btn" title="Permanently Delete">🗑️</button>
        </td>
      `;

      // Attach event listeners to action buttons
      // Complete button: Soft delete (marks as completed, keeps in localStorage for stats)
      row.querySelector(".complete-btn").addEventListener("click", () => completeTask(taskIndex));
      
      // Edit button: Loads task data into form for editing
      row.querySelector(".edit-btn").addEventListener("click", () => editTask(taskIndex));
      
      // Delete button: Hard delete (permanently removes from localStorage)
      row.querySelector(".delete-btn").addEventListener("click", () => deleteTask(taskIndex));

      // Add the populated row to the table body
      tasksBody.appendChild(row);
    });
  }

  // Also render the completed tasks in archive section
  renderCompletedTasks();
}

// ========================================
// RENDER COMPLETED TASKS (ARCHIVE)
// ========================================

/**
 * Renders completed tasks in the archive section
 * Shows tasks with completed=true flag
 */
function renderCompletedTasks() {
  completedTasksBody.innerHTML = "";  // Clear existing archived tasks
  
  // Filter to get only completed tasks (where completed flag is true)
  const completedTasks = tasks.filter(task => task.completed);
  
  // Update the count badge in archive header
  archiveCount.textContent = `(${completedTasks.length})`;

  // Show empty state message if no completed tasks exist
  if (completedTasks.length === 0) {
    completedTasksBody.innerHTML = `
      <tr>
        <td colspan="4">
          <div class="empty-state">
            <div class="empty-state-icon">🎯</div>
            <div class="empty-state-text">No completed tasks yet</div>
            <div class="empty-state-subtext">Complete tasks to see them here!</div>
          </div>
        </td>
      </tr>
    `;
  } else {
    // Loop through each completed task and create a table row
    completedTasks.forEach((task) => {
      // Find the original index in the full tasks array (needed for restore/delete)
      const taskIndex = tasks.findIndex(t => t === task);
      const row = document.createElement("tr");  // Create new table row

      // Populate row with completed task data (strikethrough styling applied)
      row.innerHTML = `
        <td style="text-decoration: line-through; opacity: 0.7;">${task.title}</td>
        <td>${task.completedDate || task.dueDate || "-"}</td>  <!-- Show completion date, or due date, or "-" -->
        <td>${task.type}</td>
        <td>
          <button class="restore-btn" title="Restore to Active">↩️</button>
          <button class="delete-btn" title="Permanently Delete">🗑️</button>
        </td>
      `;

      // Attach event listeners to action buttons
      // Restore button: Moves task back to active list (sets completed=false)
      row.querySelector(".restore-btn").addEventListener("click", () => restoreTask(taskIndex));
      
      // Delete button: Hard delete (permanently removes from localStorage, affects stats)
      row.querySelector(".delete-btn").addEventListener("click", () => deleteTask(taskIndex));

      // Add the populated row to the archive table body
      completedTasksBody.appendChild(row);
    });
  }
}

// ========================================
// TASK ACTION FUNCTIONS
// ========================================

/**
 * Completes a task (SOFT DELETE)
 * Sets completed flag to true but keeps task in localStorage for statistics
 * @param {number} index - Index of task in tasks array
 */
function completeTask(index) {
  const today = new Date().toISOString().split('T')[0];  // Get current date in YYYY-MM-DD format
  
  // Update task properties to mark as completed
  tasks[index].completed = true;  // Soft delete flag
  tasks[index].completedDate = today;  // Record when it was completed
  tasks[index].progress = "Completed";  // Update progress status
  
  // Save updated tasks array to localStorage
  localStorage.setItem("tasks", JSON.stringify(tasks));
  
  // Refresh the display (moves task from active to archive)
  renderTasks();
  
  // Show success feedback to user
  showNotification("✓ Task completed!", "success");
}

/**
 * Restores a completed task back to active list
 * Sets completed flag back to false
 * @param {number} index - Index of task in tasks array
 */
function restoreTask(index) {
  // Update task properties to mark as active again
  tasks[index].completed = false;  // Reset soft delete flag
  tasks[index].completedDate = null;  // Clear completion date
  tasks[index].progress = "In Progress";  // Reset progress status
  
  // Save updated tasks array to localStorage
  localStorage.setItem("tasks", JSON.stringify(tasks));
  
  // Refresh the display (moves task from archive to active)
  renderTasks();
  
  // Show info feedback to user
  showNotification("↩️ Task restored to active list", "info");
}

/**
 * Edits an existing task
 * Loads task data into form and switches to edit mode
 * @param {number} index - Index of task in tasks array
 */
function editTask(index) {
  const task = tasks[index];  // Get the task to edit

  // Populate form fields with existing task data
  taskTitle.value = task.title;
  plannerDueDate.value = task.dueDate;
  taskProgress.value = task.progress;
  taskType.value = task.type;

  // Set edit mode (saveTask function will update instead of adding)
  editIndex = index;
  
  // Show the form
  tasksForm.style.display = "flex";
}

/**
 * Deletes a task permanently (HARD DELETE)
 * Removes task from localStorage entirely, affecting statistics
 * Shows different warnings for active vs completed tasks
 * @param {number} index - Index of task in tasks array
 */
function deleteTask(index) {
  const task = tasks[index];  // Get the task to delete
  
  // Create appropriate warning message based on task status
  const confirmMessage = task.completed 
    ? `Permanently delete "${task.title}"? This will remove it from statistics.`
    : `Permanently delete "${task.title}"? Consider completing it instead to keep it in statistics.`;
  
  // Show confirmation dialog before deleting
  if (confirm(confirmMessage)) {
    tasks.splice(index, 1);  // Remove task from array (hard delete)
    localStorage.setItem("tasks", JSON.stringify(tasks));  // Save updated array
    renderTasks();  // Refresh display
    showNotification("🗑️ Task permanently deleted", "warning");
  }
}

// ========================================
// UTILITY FUNCTIONS
// ========================================

/**
 * Clears all form input fields and resets to default values
 * Also resets edit mode
 */
function clearForm() {
  taskTitle.value = "";  // Clear title input
  plannerDueDate.value = "";  // Clear date picker
  taskProgress.value = "Not Started";  // Reset to default progress
  taskType.value = "School";  // Reset to default type
  editIndex = null;  // Exit edit mode
}

/**
 * Toggles the archive section visibility
 * Switches between expanded (▼) and collapsed (▶) states
 */
archiveToggle.addEventListener("click", () => {
  const isHidden = archiveContent.style.display === "none";  // Check current state
  archiveContent.style.display = isHidden ? "block" : "none";  // Toggle visibility
  archiveIcon.textContent = isHidden ? "▼" : "▶";  // Update arrow icon
});

/**
 * Shows a notification message to the user
 * Currently logs to console, can be enhanced with UI notifications
 * @param {string} message - The notification message
 * @param {string} type - Type of notification (info, success, warning)
 */
function showNotification(message, type = "info") {
  // Simple console logging for now
  // TODO: Could be enhanced with toast notifications or alert banners
  console.log(`[${type.toUpperCase()}] ${message}`);
}

// ========================================
// INITIALIZATION
// ========================================
// Render tasks when page loads
renderTasks();
