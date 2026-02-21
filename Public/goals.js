// ============================================
// GOALS.JS - 5-Tier Goal Tracking System
// ============================================
// Manages goals across 5 time periods:
// - Annual (yearly objectives)
// - Quarterly (3-month objectives)
// - Monthly (30-day objectives)
// - Weekly (7-day objectives)
// - Daily (today's objectives)
// ============================================

// ==========================================
// INITIALIZE DATA
// ==========================================

/**
 * Goals data structure
 * Object with 5 arrays (one for each goal type)
 * Loaded from localStorage or initialized with empty arrays
 */
let goals = JSON.parse(localStorage.getItem("allGoals")) || {
    annual: [],      // Yearly goals
    quarterly: [],   // 3-month goals
    monthly: [],     // 30-day goals
    weekly: [],      // 7-day goals
    daily: []        // Daily goals
};

// ==========================================
// HELPER FUNCTIONS
// ==========================================

/**
 * Gets the UL element ID for a specific goal type
 * @param {string} type - Goal type (annual, quarterly, monthly, weekly, daily)
 * @returns {string} - Element ID (e.g., "annualGoalUL")
 */
function getUlId(type) {
    return `${type}GoalUL`;
}

/**
 * Gets the input element ID for a specific goal type
 * @param {string} type - Goal type (annual, quarterly, monthly, weekly, daily)
 * @returns {string} - Element ID (e.g., "annualGoalInput")
 */
function getInputId(type) {
    return `${type}GoalInput`;
}


// ==========================================
// RENDER GOALS FUNCTION
// ==========================================

/**
 * Renders all goals for all types to their respective UL elements
 * - Loops through each goal type (annual, quarterly, etc.)
 * - Creates list items with goal text and action buttons
 * - Applies completed styling for finished goals
 */
function renderGoals() {
  // Loop through each goal type (annual, quarterly, monthly, weekly, daily)
  for (const type in goals) {
    const ul = document.getElementById(getUlId(type));  // Get the UL element for this type
    if (!ul) continue;  // Skip if element doesn't exist

    ul.innerHTML = "";  // Clear existing list items

    // Loop through each goal in this type's array
    goals[type].forEach((goal, index) => {
        const li = document.createElement("li");  // Create list item
        // Add "completed" class if goal is marked as completed
        li.className = goal.completed ? "completed" : "";

        // Populate list item with goal text and action buttons
        // The onclick handlers pass the goal type and index to the functions
        li.innerHTML = `
            <span class="goal-text">${goal.text}</span>
            <div class="actions">
            <button onclick="completeGoal(event, '${type}', ${index})" class="complete-btn">✓</button>
            <button onclick="deleteGoal(event, '${type}', ${index})" class="delete-btn">✕</button>
            </div>
        `;
        ul.appendChild(li);  // Add list item to the UL
        });
    }
}

// ==========================================
// SAVE GOALS FUNCTION
// ==========================================

/**
 * Saves the goals object to localStorage
 * Converts object to JSON string for storage
 */
function saveGoals() {
  localStorage.setItem("allGoals", JSON.stringify(goals));
}


// ==========================================
// ADD GOAL FUNCTION
// ==========================================

/**
 * Adds a new goal to a specific type
 * @param {Event} event - Click event (used to stop propagation)
 * @param {string} type - Goal type (annual, quarterly, monthly, weekly, daily)
 */
function addGoal(event, type) {
  event.stopPropagation();  // Prevent dropdown from closing when clicking inside
  
  const input = document.getElementById(getInputId(type));  // Get the input field for this type
  const goalText = input.value.trim();  // Get and trim the input value

  // Only add if user entered some text
  if (goalText !== "") {
    // Add new goal object to the appropriate array
    goals[type].push({ text: goalText, completed: false });
    saveGoals();  // Save to localStorage
    renderGoals();  // Update the display
    input.value = "";  // Clear the input field
    input.focus();  // Keep focus on input for quick adding
  }
}

// ==========================================
// COMPLETE GOAL FUNCTION
// ==========================================

/**
 * Toggles the completed status of a goal
 * @param {Event} event - Click event (used to stop propagation)
 * @param {string} type - Goal type
 * @param {number} index - Index of goal in the type's array
 */
function completeGoal(event, type, index) {
  event.stopPropagation();  // Prevent dropdown from closing
  
  // Toggle completed flag (true becomes false, false becomes true)
  goals[type][index].completed = !goals[type][index].completed;
  
  saveGoals();  // Save to localStorage
  renderGoals();  // Update display (applies/removes strikethrough styling)
}

// ==========================================
// DELETE GOAL FUNCTION
// ==========================================

/**
 * Deletes a goal permanently from the array
 * @param {Event} event - Click event (used to stop propagation)
 * @param {string} type - Goal type
 * @param {number} index - Index of goal in the type's array
 */
function deleteGoal(event, type, index) {
  event.stopPropagation();  // Prevent dropdown from closing
  
  // Remove 1 item at the specific index from the array
  goals[type].splice(index, 1);
  
  saveGoals();  // Save to localStorage
  renderGoals();  // Update display
}

// ==========================================
// INITIALIZATION
// ==========================================

/**
 * Render all goals when page loads
 * Ensures goals from localStorage are displayed immediately
 */
window.onload = renderGoals;
