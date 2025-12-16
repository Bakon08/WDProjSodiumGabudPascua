//--------------gets the html elements--------------
const addNewPlannerBtn = document.getElementById("addNewNoteBtn");
const plannerForm = document.getElementById("notesForm");
const savePlannerBtn = document.getElementById("saveNoteBtn");
const cancelPlannerBtn = document.getElementById("cancelNoteBtn");

const plannerTitle = document.getElementById("noteTitle");
const plannerDueDate = document.getElementById("plannerDueDate");
const plannerProgress = document.getElementById("noteProgress");
const plannerDescription = document.getElementById("noteDescription");
const plannerType = document.getElementById("noteType");

const plannerBody = document.getElementById("notesBody");
//-------------------------------------------------

// puts the data into an array
let savedPlanners = localStorage.getItem("planners");
let planners;

if (savedPlanners) {
    planners = JSON.parse(savedPlanners);
} else {
    planners = [];
}

let editIndex = null;

// Show form to add new planner
function showPlannerForm() {
    plannerForm.style.display = "flex";
    clearPlannerForm();
}
addNewPlannerBtn.addEventListener("click", showPlannerForm);

// Cancel adding/editing
function hidePlannerForm() {
    plannerForm.style.display = "none";
    clearPlannerForm();
}
cancelPlannerBtn.addEventListener("click", hidePlannerForm);

// Save new or edited planner
function savePlanner() {
    if (plannerTitle.value.trim() === "") {
        alert("Please enter a task title!");
        return;
    }

    let plannerData = {
    title: plannerTitle.value,
    dueDate: plannerDueDate.value, //calendar date
    type: plannerType.value,
    progress: plannerProgress.value,
    description: plannerDescription.value
};
    if (editIndex === null) {
        planners.push(plannerData);
    } else {
        planners[editIndex] = plannerData;
        editIndex = null;
    }

    localStorage.setItem("planners", JSON.stringify(planners));

    plannerForm.style.display = "none";
    clearPlannerForm();
    renderPlanner();
}

savePlannerBtn.addEventListener("click", savePlanner);

// Render planner table
function renderPlanner() {
    plannerBody.innerHTML = "";

    planners.forEach((planner, index) => {
        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${planner.title}</td>
            <td>${planner.dueDate || "-"}</td>
            <td>${planner.progress}</td>
            <td>${planner.type}</td>
            <td>
                <button onclick="editPlanner(${index})">✏️</button>
                <button onclick="deletePlanner(${index})">🗑️</button>
            </td>
        `;
        plannerBody.appendChild(row);
    });
}

// Edit planner
function editPlanner(index) {
    const planner = planners[index];
    plannerTitle.value = planner.title;
    plannerType.value = planner.type;
    plannerProgress.value = planner.progress;
    plannerDescription.value = planner.description;
    plannerDueDate.value = planner.dueDate || "";
    editIndex = index;
    plannerForm.style.display = "flex";
}

// Delete planner
function deletePlanner(index) {
    planners.splice(index, 1);
    localStorage.setItem("planners", JSON.stringify(planners));
    renderPlanner();
}

// Clear form
function clearPlannerForm() {
    plannerTitle.value = "";
    plannerType.value = "Reminder";
    plannerProgress.value = "Not Started";
    plannerDescription.value = "";
    plannerDueDate.value = "";

}

renderPlanner();