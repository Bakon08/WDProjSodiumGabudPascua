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

    // Only run habit code if elements exist on page
    if (habitInput && addHabitBtn && habitChecklist) {
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
    };
    // --------------AUTH (Login/Logout)--------------
    const authBtn = document.getElementById('authBtn');
    const userGreeting = document.getElementById('userGreeting');
    const usernameDisplay = document.getElementById('usernameDisplay');

    // Only run auth code if elements exist on page
    if (!authBtn || !userGreeting || !usernameDisplay) {
      // Auth elements not on this page (e.g., Notes without sidebar login)
    } else {
      function updateAuthUI() {
        const user = localStorage.getItem('lockinUser');
        if (user) {
          authBtn.textContent = 'Logout';
          userGreeting.classList.add('show');
          usernameDisplay.textContent = user;
        } else {
          // If user is not logged in, send them to the main login page
          // Detect if on a Public page (works on both local files and web paths)
          const isPublicPage = window.location.href.includes('/Public/') || window.location.href.includes('\\Public\\');
          const redirectPath = isPublicPage ? '../index.html' : 'index.html';
          window.location.href = redirectPath;
        }
      }

      authBtn.addEventListener('click', function() {
        const user = localStorage.getItem('lockinUser');
        if (user) {
          // Logout: clear user and redirect to login
          localStorage.removeItem('lockinUser');
          // Detect if on Public page or dashboard
          const currentPage = window.location.href;
          const redirectPath = (currentPage.includes('Public') || currentPage.includes('\\Public\\')) 
            ? '../index.html' 
            : 'index.html';
          window.location.href = redirectPath;
        } else {
          const name = prompt('Enter your name to login:');
          if (name && name.trim()) {
            localStorage.setItem('lockinUser', name.trim());
            updateAuthUI();
          }
        }
      });

      // Initialize auth UI on load
      updateAuthUI();
    }
    //-----------------------------------------------
    //-------------------------------------------------

    //--------------DATA LOADING FROM LOCALSTORAGE--------------
    // Load all data needed for the dashboard widgets
    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    const goals = JSON.parse(localStorage.getItem('allGoals')) || { annual: [], quarterly: [], monthly: [], weekly: [], daily: [] };
    const notes = JSON.parse(localStorage.getItem('notes')) || [];

    // Calculate number of incomplete tasks
    const tasksLeft = tasks.filter(task => task.progress !== 'Completed').length;

    // Get next 5 upcoming deadlines (future dates only, sorted chronologically)
    const upcomingDeadlines = tasks
      .filter(task => task.dueDate && new Date(task.dueDate) > new Date()) // Only future dates
      .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))          // Sort by date ascending
      .slice(0, 5);                                                         // Take first 5

    // Get incomplete goals from all categories (up to 5 total)
    const progressReminders = Object.values(goals).flat().filter(goal => !goal.completed).slice(0, 5);
    //---------------------------------------------------------

    // Only render dashboard widgets if they exist on this page
    const tasksLeftChart = document.getElementById('tasksLeftChart');
    const upcomingDeadlinesList = document.getElementById('upcomingDeadlinesList');
    const progressRemindersList = document.getElementById('progressRemindersList');

    if (tasksLeftChart && upcomingDeadlinesList && progressRemindersList) {

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

      //--------------WIDGET INITIALIZATION--------------
      // Call all render functions to populate dashboard widgets
      renderTasksLeft();
      renderUpcomingDeadlines();
      renderProgressReminders();
      //-----------------------------------------------
    } // close if (tasksLeftChart && upcomingDeadlinesList && progressRemindersList)
});
