/**
 * DASHBOARD INDEX SCRIPT
 * Main script for the dashboard page (dashboard.html)
 * Manages 4 widget areas:
 * 1. Habit Checklist - daily habits tracking with add/edit/delete
 * 2. Tasks Left Chart - ring chart showing task completion percentage
 * 3. Upcoming Deadlines - list of next 5 upcoming task due dates
 * 4. Progress Reminders - list of incomplete goals (up to 5)
 */

// Wait for DOM to load before running script
document.addEventListener('DOMContentLoaded', function() {
    //--------------HABIT CHECKLIST SECTION--------------
    // Get DOM elements for habit checklist
    const habitInput = document.getElementById('habitInput');      // Input field for new habit
    const addHabitBtn = document.getElementById('addHabitBtn');    // Button to add habit
    const habitChecklist = document.getElementById('habitChecklist'); // ul element for habit list

    // Load habits from localStorage (or empty array if none exist)
    // Load habits from localStorage (or empty array if none exist)
    let habits = JSON.parse(localStorage.getItem('habits')) || [];

    /**
     * Renders the habit checklist
     * Creates li elements for each habit with edit and delete buttons
     */
    function renderHabits() {
        // Clear existing list
        habitChecklist.innerHTML = '';
        
        // Loop through habits and create li for each
        habits.forEach((habit, index) => {
            const li = document.createElement('li');
            li.innerHTML = `
                <span class="habit-item">${habit}</span>
                <div>
                    <button class="habit-btn habit-edit" data-index="${index}">✏️</button>
                    <button class="habit-btn habit-delete" data-index="${index}">🗑️</button>
                </div>
            `;
            habitChecklist.appendChild(li);
        });
    }

    /**
     * Add habit button event listener
     * Adds new habit to array and saves to localStorage
     */
    addHabitBtn.addEventListener('click', function() {
        const newHabit = habitInput.value.trim(); // Get input value and remove whitespace
        
        if (newHabit) { // Only add if not empty
            habits.push(newHabit);                          // Add to array
            localStorage.setItem('habits', JSON.stringify(habits)); // Save to localStorage
            habitInput.value = '';                          // Clear input field
            renderHabits();                                 // Re-render list
        }
    });
    
    /**
     * Event delegation for edit and delete buttons
     * Handles clicks on dynamically created buttons
     */
    habitChecklist.addEventListener('click', function(e) {
        // Check if edit button was clicked
        if (e.target.classList.contains('habit-edit')) {
            const index = e.target.dataset.index;              // Get habit index
            const newHabit = prompt('Edit habit:', habits[index]); // Show prompt with current value
            
            if (newHabit !== null && newHabit.trim()) {        // If user didn't cancel and entered text
                habits[index] = newHabit.trim();               // Update habit
                localStorage.setItem('habits', JSON.stringify(habits)); // Save
                renderHabits();                                // Re-render
            }
        } 
        // Check if delete button was clicked
        else if (e.target.classList.contains('habit-delete')) {
            const index = e.target.dataset.index;              // Get habit index
            
            if (confirm('Delete this habit?')) {               // Confirm deletion
                habits.splice(index, 1);                       // Remove from array
                localStorage.setItem('habits', JSON.stringify(habits)); // Save
                renderHabits();                                // Re-render
            }
        }
    });

    // Initial render of habits
    renderHabits();
    // Initial render of habits
    renderHabits();
    // Initialize auth UI on load
    updateAuthUI();
    //-----------------------------------------------
    //-------------------------------------------------

    //--------------DATA LOADING FROM LOCALSTORAGE--------------
    // Load all data needed for the dashboard widgets
    let tasks = [];
    let goals = { annual: [], quarterly: [], monthly: [], weekly: [], daily: [] };
    let notes = [];
    let tasksLeft = 0;
    let upcomingDeadlines = [];
    let progressReminders = [];

    function syncDashboardData() {
      tasks = JSON.parse(localStorage.getItem('tasks')) || [];
      goals = JSON.parse(localStorage.getItem('allGoals')) || { annual: [], quarterly: [], monthly: [], weekly: [], daily: [] };
      notes = JSON.parse(localStorage.getItem('notes')) || [];
      tasksLeft = tasks.filter(task => task.progress !== 'Completed').length;
      upcomingDeadlines = tasks
        .filter(task => task.dueDate && new Date(task.dueDate) > new Date())
        .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
        .slice(0, 5);
      progressReminders = Object.values(goals).flat().filter(goal => !goal.completed).slice(0, 5);
    }
    //---------------------------------------------------------

    //--------------TASKS LEFT WIDGET--------------
    /**
     * Renders a ring chart showing task completion progress
     * Uses HTML5 Canvas API to draw a custom doughnut/ring chart
     * Also displays a legend with task counts below the chart
     */
    function renderTasksLeft() {
      const canvas = document.getElementById('tasksLeftChart');
      const ctx = canvas.getContext('2d'); // Get 2D drawing context
      
      // Calculate task statistics
      const totalTasks = tasks.length;
      const completedTasks = totalTasks - tasksLeft;
      
      // Draw ring chart (concept based on Google Charts doughnut chart)
      const percentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
      
      // Clear canvas before drawing
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw background ring (gray)
      ctx.beginPath();
      ctx.arc(100, 100, 80, 0, 2 * Math.PI); // Full circle at center (100,100), radius 80
      ctx.strokeStyle = '#ddd';               // Light gray color
      ctx.lineWidth = 10;                     // Thickness of ring
      ctx.stroke();
      
      // Draw completed portion (green arc)
      ctx.beginPath();
      // Arc starts at -0.5π (top of circle), ends at percentage of full circle
      ctx.arc(100, 100, 80, -0.5 * Math.PI, (percentage / 100 * 2 * Math.PI) - 0.5 * Math.PI);
      ctx.strokeStyle = '#4CAF50'; // Green color
      ctx.stroke();
      
      // Update legend text below chart
      const legend = document.getElementById('tasksLeftLegend');
      legend.innerHTML = `
        <p>Total Tasks: ${totalTasks}</p>
        <p>Completed: ${completedTasks}</p>
        <p>Left: ${tasksLeft}</p>
      `;
    }
    //-------------------------------------------

    //--------------UPCOMING DEADLINES WIDGET--------------
    /**
     * Renders a list of the next 5 upcoming task deadlines
     * Shows message if no upcoming deadlines exist
     */
    function renderUpcomingDeadlines() {
      const list = document.getElementById('upcomingDeadlinesList');
      list.innerHTML = ''; // Clear existing list
      
      // Check if there are any upcoming deadlines
      if (upcomingDeadlines.length === 0) {
        list.innerHTML = '<li>No upcoming deadlines</li>';
        return; // Exit early
      }
      
      // Create li element for each deadline
      upcomingDeadlines.forEach(task => {
        const li = document.createElement('li');
        li.textContent = `${task.title} - Due: ${task.dueDate}`;
        list.appendChild(li);
      });
    }
    //----------------------------------------------------

    //--------------PROGRESS REMINDERS WIDGET--------------
    /**
     * Renders a list of incomplete goals (up to 5)
     * Shows message if no incomplete goals exist
     */
    function renderProgressReminders() {
      const list = document.getElementById('progressRemindersList');
      list.innerHTML = ''; // Clear existing list
      
      // Check if there are any incomplete goals
      if (progressReminders.length === 0) {
        list.innerHTML = '<li>No progress reminders</li>';
        return; // Exit early
      }
      
      // Create li element for each goal
      progressReminders.forEach(goal => {
        const li = document.createElement('li');
        li.textContent = goal.text; // Display goal text
        list.appendChild(li);
      });
    }
    //----------------------------------------------------

    function renderGoalTaskProgressSummary() {
      const list = document.getElementById('goalTaskProgressSummary');
      if (!list) return;

      const allGoals = Object.values(goals).flat();
      list.innerHTML = '';

      if (allGoals.length === 0) {
        list.innerHTML = '<li>No goals yet</li>';
        return;
      }

      allGoals.forEach(goal => {
        const linkedTasks = tasks.filter(task => task.goalId && goal.id && task.goalId === goal.id);
        const completedCount = linkedTasks.filter(task => task.completed || task.progress === 'Completed').length;
        const percent = linkedTasks.length ? Math.round((completedCount / linkedTasks.length) * 100) : 0;

        const li = document.createElement('li');
        li.innerHTML = `
          <div class="goal-summary-row">
            <span>${goal.text}</span>
            <span>${percent}%</span>
          </div>
          <div class="goal-task-progress-bar">
            <div class="goal-task-progress-fill" style="width: ${percent}%"></div>
          </div>
        `;
        list.appendChild(li);
      });
    }

    function refreshDashboardView() {
      syncDashboardData();
      renderTasksLeft();
      renderUpcomingDeadlines();
      renderProgressReminders();
      renderGoalTaskProgressSummary();
    }

    window.LockinDashboardRefresh = refreshDashboardView;

    window.addEventListener('lockin:data-updated', refreshDashboardView);
    window.addEventListener('storage', function(event) {
      if (!event.key || ['tasks', 'notes', 'allGoals', 'plannerData', 'habits'].includes(event.key)) {
        refreshDashboardView();
      }
    });

    //--------------WIDGET INITIALIZATION--------------
    // Call all render functions to populate dashboard widgets
    refreshDashboardView();
    //-----------------------------------------------
});
