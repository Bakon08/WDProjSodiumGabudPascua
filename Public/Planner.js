//--------------gets the html elements--------------
const addNewNoteBtn = document.getElementById("addNewNoteBtn");
const notesForm = document.getElementById("notesForm");
const saveNoteBtn = document.getElementById("saveNoteBtn");
const cancelNoteBtn = document.getElementById("cancelNoteBtn");

const noteTitle = document.getElementById("noteTitle");
const noteType = document.getElementById("noteType");
const noteProgress = document.getElementById("noteProgress");
const plannerDueDate = document.getElementById("plannerDueDate");

const notesBody = document.getElementById("notesBody");
//-------------------------------------------------

//puts the data into an array
let savedNotes = localStorage.getItem("notes");
let notes;
if (savedNotes) {
    notes = JSON.parse(savedNotes);
} else {
    notes = [];
}

let editIndex = null;

// Show form to add new note
function showNoteForm() {
    notesForm.style.display = "flex";
    clearForm();
}
addNewNoteBtn.addEventListener("click", showNoteForm);

// Cancel adding/editing
function hideNoteForm() {
    notesForm.style.display = "none";
    clearForm();
}
cancelNoteBtn.addEventListener("click", hideNoteForm);

// Save new or edited note
function saveNote() {
    //Check if the title is empty
    if (noteTitle.value.trim() === "") {
        alert("Please enter a note title!");
        return; // Stop the function if title is empty
    }
    if (plannerDueDate.value === "") {
        alert("Please select a due date!");
        return; // Stop the function if due date is empty
    }

    //Create an object to hold the note information
    let noteData = {
        title: noteTitle.value,
        dueDate: plannerDueDate.value,
        type: noteType.value,
        progress: noteProgress.value,
    };

    //Check if we are adding a new note or editing an existing one
    if (editIndex === null) {
        // Adding a new note
        notes.push(noteData);
    } else {
        // Editing an existing note
        notes[editIndex] = noteData;
        editIndex = null; // Reset editIndex
    }

    // Save the updated notes array to localStorage
    localStorage.setItem("notes", JSON.stringify(notes));

    // Hide the form and clear the inputs
    notesForm.style.display = "none";
    clearForm();

    //Re-render the table with updated notes
    renderNotes();
}

//Attach the function to the save button
saveNoteBtn.addEventListener("click", saveNote);

// Render notes table
function renderNotes() {
    notesBody.innerHTML = "";

    // Sort notes by due date (earliest first)
    notes.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

    notes.forEach((note, index) => {
        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${note.title}</td>
            <td>${note.dueDate}</td>
            <td>${note.progress}</td>
            <td>${note.type}</td>
            <td>
                <button onclick="editNote(${index})">✏️</button>
                <button onclick="deleteNote(${index})">🗑️</button>
            </td>
        `;

        notesBody.appendChild(row);
    });
}

// Edit note
function editNote(index) {
    const note = notes[index];
    noteTitle.value = note.title;
    plannerDueDate.value = note.dueDate;
    noteType.value = note.type;
    noteProgress.value = note.progress;
    editIndex = index;
    notesForm.style.display = "flex";
}

// Delete note
function deleteNote(index) {
    notes.splice(index, 1);
    localStorage.setItem("notes", JSON.stringify(notes));
    renderNotes();
}

// Clear form
function clearForm() {
    noteTitle.value = "";
    plannerDueDate.value = "";
    noteType.value = "Reminder";
    noteProgress.value = "Not Started";
}

renderNotes();
