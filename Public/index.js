document.addEventListener('DOMContentLoaded', function() {
    const habitInput = document.getElementById('habitInput');
    const addHabitBtn = document.getElementById('addHabitBtn');
    const habitChecklist = document.getElementById('habitChecklist');

    let habits = JSON.parse(localStorage.getItem('habits')) || [];

    function renderHabits() {
        habitChecklist.innerHTML = '';
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

    // add habit button
    addHabitBtn.addEventListener('click', function() {
        const newHabit = habitInput.value.trim();
        if (newHabit) {
            habits.push(newHabit);
            localStorage.setItem('habits', JSON.stringify(habits));
            habitInput.value = '';
            renderHabits();
        }
    });
    // edit and delete buttons
    habitChecklist.addEventListener('click', function(e) {
        if (e.target.classList.contains('habit-edit')) {
            const index = e.target.dataset.index;
            const newHabit = prompt('Edit habit:', habits[index]);
            if (newHabit !== null && newHabit.trim()) {
                habits[index] = newHabit.trim();
                localStorage.setItem('habits', JSON.stringify(habits));
                renderHabits();
            }
        } else if (e.target.classList.contains('habit-delete')) {
            const index = e.target.dataset.index;
            if (confirm('Delete this habit?')) {
                habits.splice(index, 1);
                localStorage.setItem('habits', JSON.stringify(habits));
                renderHabits();
            }
        }
    });

    renderHabits();

    // tasks left and upcoming deadlines section

    // gets data from localStorage
    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    const goals = JSON.parse(localStorage.getItem('allGoals')) || { annual: [], quarterly: [], monthly: [], weekly: [], daily: [] };
    const notes = JSON.parse(localStorage.getItem('notes')) || [];

    // calculates # of tasks left
    const tasksLeft = tasks.filter(task => task.progress !== 'Completed').length;

    // gets the upcoming deadlines
    const upcomingDeadlines = tasks
      .filter(task => task.dueDate && new Date(task.dueDate) > new Date())
      .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
      .slice(0, 5);

    // incomplete goals for progress reminders
    const progressReminders = Object.values(goals).flat().filter(goal => !goal.completed).slice(0, 5);

    function renderTasksLeft() {
      const canvas = document.getElementById('tasksLeftChart');
      const ctx = canvas.getContext('2d');
      const totalTasks = tasks.length;
      const completedTasks = totalTasks - tasksLeft;
      
      // ring chart drawing (taken from Google Charts doughnut chart concept)
      const percentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.beginPath();
      ctx.arc(100, 100, 80, 0, 2 * Math.PI);
      ctx.strokeStyle = '#ddd';
      ctx.lineWidth = 10;
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(100, 100, 80, -0.5 * Math.PI, (percentage / 100 * 2 * Math.PI) - 0.5 * Math.PI);
      ctx.strokeStyle = '#4CAF50';
      ctx.stroke();
      
      // legend for the tasks left chart
      const legend = document.getElementById('tasksLeftLegend');
      legend.innerHTML = `
        <p>Total Tasks: ${totalTasks}</p>
        <p>Completed: ${completedTasks}</p>
        <p>Left: ${tasksLeft}</p>
      `;
    }

    function renderUpcomingDeadlines() {
      const list = document.getElementById('upcomingDeadlinesList');
      list.innerHTML = '';
      if (upcomingDeadlines.length === 0) {
        list.innerHTML = '<li>No upcoming deadlines</li>';
        return;
      }
      upcomingDeadlines.forEach(task => {
        const li = document.createElement('li');
        li.textContent = `${task.title} - Due: ${task.dueDate}`;
        list.appendChild(li);
      });
    }

    function renderProgressReminders() {
      const list = document.getElementById('progressRemindersList');
      list.innerHTML = '';
      if (progressReminders.length === 0) {
        list.innerHTML = '<li>No progress reminders</li>';
        return;
      }
      progressReminders.forEach(goal => {
        const li = document.createElement('li');
        li.textContent = goal.text;
        list.appendChild(li);
      });
    }

    // calls the different render funcs
    renderTasksLeft();
    renderUpcomingDeadlines();
    renderProgressReminders();
});
