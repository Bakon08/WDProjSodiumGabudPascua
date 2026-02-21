//--------------gets the html elements--------------
const addNewNoteBtn = document.getElementById("addNewNoteBtn");
const notesForm = document.getElementById("notesForm");
const saveNoteBtn = document.getElementById("saveNoteBtn");
const cancelNoteBtn = document.getElementById("cancelNoteBtn");

const noteTitle = document.getElementById("noteTitle");
const noteType = document.getElementById("noteType");
const noteProgress = document.getElementById("noteProgress");
const noteDescription = document.getElementById("noteDescription");

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
    //Create an object to hold the note information
    let noteData = {
        title: noteTitle.value,
        type: noteType.value,
        progress: noteProgress.value,
        description: noteDescription.value
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
    let notesString = JSON.stringify(notes); // Convert array to string
    localStorage.setItem("notes", notesString);

    //  Hide the form and clear the inputs
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
    
    if (notes.length === 0) {
        notesBody.innerHTML = `
            <tr>
                <td colspan="5">
                    <div class="empty-state">
                        <div class="empty-state-icon">📝</div>
                        <div class="empty-state-text">No notes yet</div>
                        <div class="empty-state-subtext">Click "+ New Note" to create your first note!</div>
                    </div>
                </td>
            </tr>
        `;
        return;
    }
    
    notes.forEach((note, index) => {
        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${note.title}</td>
            <td>${note.progress}</td>
            <td>${note.type}</td>
            <td>${note.description}</td>
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
    noteType.value = note.type;
    noteProgress.value = note.progress;
    noteDescription.value = note.description;
    editIndex = index;
    notesForm.style.display = "flex";
}

// Delete note
function deleteNote(index) {
    notes.splice(index, 1);
    const notesString = JSON.stringify(notes); // Convert array to string
    localStorage.setItem("notes", notesString);
    renderNotes();
}

// Clear form
function clearForm() {
    noteTitle.value = "";
    noteType.value = "Reminder";
    noteProgress.value = "Not Started";
    noteDescription.value = "";
}

renderNotes();