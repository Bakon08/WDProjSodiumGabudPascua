// ============================================
// GOALS.JS - 5-Tier Goal Management System
// ============================================
// Manages goals across 5 different time horizons:
// - Annual (yearly goals)
// - Quarterly (3-month goals)
// - Monthly (30-day goals)
// - Weekly (7-day goals)
// - Daily (today's goals)
// ============================================

// ==========================================
// INITIALIZE DATA
// ==========================================
// Load goals from localStorage or create default structure if none exist
// Goals are stored as an object with 5 arrays (one for each time period)
let goals = JSON.parse(localStorage.getItem("allGoals")) || {
    annual: [],      // Long-term yearly goals
    quarterly: [],   // 3-month milestone goals
    monthly: [],     // Month-long objectives
    weekly: [],      // Week-long tasks
    daily: []        // Today's action items
};

// ==========================================
// HELPER FUNCTIONS FOR ELEMENT IDS
// ==========================================

/**
 * Gets the UL (unordered list) element ID based on goal type
 * @param {string} type - The goal type (annual, quarterly, monthly, weekly, daily)
 * @returns {string} The ID of the UL element (e.g., "annualGoalUL")
 */
function getUlId(type) {
    return `${type}GoalUL`;
}

/**
 * Gets the input field element ID based on goal type
 * @param {string} type - The goal type (annual, quarterly, monthly, weekly, daily)
 * @returns {string} The ID of the input element (e.g., "annualGoalInput")
 */
function getInputId(type) {
    return `${type}GoalInput`;
}

// ==========================================
// RENDER GOALS FUNCTION
// ==========================================

/**
 * Renders all goals across all 5 time periods
 * Creates list items with complete/delete buttons for each goal
 */
function renderGoals() {
  // Loop through each goal type (annual, quarterly, monthly, weekly, daily)
  for (const type in goals) {
    const ul = document.getElementById(getUlId(type));  // Get the UL element for this type
    if (!ul) continue;  // Skip if UL doesn't exist in HTML

    ul.innerHTML = "";  // Clear existing list items

    // Loop through each goal in this type's array
    goals[type].forEach((goal, index) => {
        const li = document.createElement("li");  // Create new list item
        
        // Apply "completed" class if goal is marked as done (adds strikethrough styling)
        li.className = goal.completed ? "completed" : "";

        // Populate list item with goal text and action buttons
        // Pass the goal type and index to the button onclick handlers
        li.innerHTML = `
            <span class="goal-text">${goal.text}</span>
            <div class="actions">
                <button onclick="completeGoal(event, '${type}', ${index})" class="complete-btn">✓</button>
                <button onclick="deleteGoal(event, '${type}', ${index})" class="delete-btn">✕</button>
            </div>
        `;
        
        // Add the list item to the UL
        ul.appendChild(li);
    });
  }
}

// ==========================================
// SAVE GOALS TO LOCALSTORAGE
// ==========================================

/**
 * Saves the entire goals object to localStorage
 * Called after any modification (add, complete, delete)
 */
function saveGoals() {
  localStorage.setItem("allGoals", JSON.stringify(goals));
}

// ==========================================
// ADD GOAL FUNCTION
// ==========================================

/**
 * Adds a new goal to the specified type's array
 * @param {Event} event - The click event (to prevent event bubbling)
 * @param {string} type - The goal type to add to (annual, quarterly, etc.)
 */
function addGoal(event, type) {
  event.stopPropagation();  // Prevent event from bubbling up to parent elements
  
  const input = document.getElementById(getInputId(type));  // Get the input field for this type
  const goalText = input.value.trim();  // Get the text and remove whitespace

  // Only add if user entered something
  if (goalText !== "") {
    // Add new goal object to the appropriate array
    goals[type].push({ text: goalText, completed: false });
    
    saveGoals();  // Save to localStorage
    renderGoals();  // Re-render the display to show new goal
    
    // Clear input field and refocus for quick entry of next goal
    input.value = "";
    input.focus();
  }
}

// ==========================================
// COMPLETE GOAL FUNCTION
// ==========================================

/**
 * Toggles a goal's completed status
 * @param {Event} event - The click event (to prevent event bubbling)
 * @param {string} type - The goal type (annual, quarterly, etc.)
 * @param {number} index - The index of the goal in the array
 */
function completeGoal(event, type, index) {
  event.stopPropagation();  // Prevent event from bubbling up
  
  // Toggle the completed flag (true → false, or false → true)
  goals[type][index].completed = !goals[type][index].completed;
  
  saveGoals();  // Save the updated state
  renderGoals();  // Re-render to show strikethrough/unstrike
}

// ==========================================
// DELETE GOAL FUNCTION
// ==========================================

/**
 * Permanently deletes a goal from its array
 * @param {Event} event - The click event (to prevent event bubbling)
 * @param {string} type - The goal type (annual, quarterly, etc.)
 * @param {number} index - The index of the goal to delete
 */
function deleteGoal(event, type, index) {
  event.stopPropagation();  // Prevent event from bubbling up
  
  // Remove 1 item at the specified index from the array
  goals[type].splice(index, 1);
  
  saveGoals();  // Save the updated array
  renderGoals();  // Re-render to remove the goal from display
}

// ==========================================
// INITIALIZATION
// ==========================================
// Render all goals when the page loads
window.onload = renderGoals;
