let goals = JSON.parse(localStorage.getItem("allGoals")) || { // goals are now an object to store different types of goals
    annual: [],
    quarterly: [],
    monthly: [],
    weekly: [],
    daily: []
};
// these help get the UL element ID based on goal type
function getUlId(type) {
    return `${type}GoalUL`;
}

// these help get input element ID based on goal type
function getInputId(type) {
    return `${type}GoalInput`;
}


function renderGoals() {
  for (const type in goals) {
    const ul = document.getElementById(getUlId(type));
    if (!ul) continue;

    ul.innerHTML = "";

    goals[type].forEach((goal, index) => {
        const li = document.createElement("li");
        li.className = goal.completed ? "completed" : "";

        // these basically pass the goal type to the different functions
        li.innerHTML = `
            <span class="goal-text">${goal.text}</span>
            <div class="actions">
            <button onclick="completeGoal(event, '${type}', ${index})" class="complete-btn">✓</button>
            <button onclick="deleteGoal(event, '${type}', ${index})" class="delete-btn">✕</button>
            </div>
        `;
        ul.appendChild(li);
        });
    }
}

function saveGoals() {
  localStorage.setItem("allGoals", JSON.stringify(goals));
}


function addGoal(event, type) { // this takes the type of argument to know which array to add the goal to
  event.stopPropagation();
  const input = document.getElementById(getInputId(type));
  const goalText = input.value.trim();

  if (goalText !== "") {
    goals[type].push({ text: goalText, completed: false });
    saveGoals();
    renderGoals(); // updates the display
    input.value = "";
    input.focus();
  }
}

function completeGoal(event, type, index) {
  event.stopPropagation();
  goals[type][index].completed = !goals[type][index].completed;
  saveGoals();
  renderGoals(); //updates the display
}

function deleteGoal(event, type, index) {
  event.stopPropagation();
  goals[type].splice(index, 1); // removes 1 item at the specific index
  saveGoals();
  renderGoals();
}

window.onload = renderGoals; //loads all goals as the page loads
