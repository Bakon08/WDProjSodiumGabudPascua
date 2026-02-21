/**
 * NOTES MANAGEMENT SYSTEM
 * Provides functionality for creating, editing, and deleting notes
 * Notes have: title, type (category), progress status, and description
 * All data is stored in localStorage under the key "notes"
 */

//--------------DOM ELEMENT REFERENCES--------------
// The entry bar container (always visible at top)
const notesForm = document.getElementById("notesForm");

// Buttons within the notes form
const saveNoteBtn = document.getElementById("saveNoteBtn");   // Confirms save
const cancelNoteBtn = document.getElementById("cancelNoteBtn"); // Hides form

// Form input fields for note properties
const noteTitle = document.getElementById("noteTitle");           // Note title/name
const noteType = document.getElementById("noteType");             // Category dropdown
const noteProgress = document.getElementById("noteProgress");     // Progress status dropdown
const noteDescription = document.getElementById("noteDescription"); // Text area for details

// tbody element where note rows will be rendered
const notesBody = document.getElementById("notesBody");
//-------------------------------------------------

//--------------DATA INITIALIZATION--------------
// Retrieve existing notes from localStorage
// If no data exists, initialize an empty array
let savedNotes = localStorage.getItem("notes");
let notes;
if (savedNotes) {
    // Parse the JSON string back into an array
    notes = JSON.parse(savedNotes);
} else {
    // No notes found, start with empty array
    notes = [];
}

// Tracks which note is being edited (null = adding new note, number = index of note being edited)
let editIndex = null;
//---------------------------------------------

//--------------FORM CANCEL FUNCTION--------------
/**
 * Clears the entry bar fields and resets to add mode
 * Called when user clicks Cancel (X) button
 */
function cancelForm() {
    clearForm(); // Reset all input fields and mode
}
// Attach function to the "Cancel" button
cancelNoteBtn.addEventListener("click", cancelForm);
//----------------------------------------------------

//--------------SAVE NOTE FUNCTION--------------
/**
 * Saves a new note or updates an existing note
 * Validates input, creates note object, updates localStorage, and re-renders the table
 */
function saveNote() {
    // Validation: Check if the title is empty
    if (noteTitle.value.trim() === "") {
        alert("Please enter a note title!");
        return; // Stop the function if title is empty
    }
    
    // Create an object to hold the note information
    let noteData = {
        title: noteTitle.value,
        type: noteType.value,
        progress: noteProgress.value,
        description: noteDescription.value
    };
    
    // Check if we are adding a new note or editing an existing one
    if (editIndex === null) {
        // Adding a new note - push to end of array
        notes.push(noteData);
    } else {
        // Editing an existing note - replace the note at editIndex
        notes[editIndex] = noteData;
        editIndex = null; // Reset editIndex to null (back to "add new" mode)
    }

    // Save the updated notes array to localStorage
    let notesString = JSON.stringify(notes); // Convert array to JSON string
    localStorage.setItem("notes", notesString); // Store in localStorage

    // Clear the form and re-render the table
    clearForm();
    renderNotes();
}

// Attach the function to the save button
saveNoteBtn.addEventListener("click", saveNote);
//--------------------------------------------

//--------------RENDER NOTES TABLE FUNCTION--------------
/**
 * Renders all notes into the table
 * Shows empty state if no notes exist
 * Each row displays note properties and action buttons (edit/delete)
 */
function renderNotes() {
    // Clear existing table rows
    notesBody.innerHTML = "";
    
    // If no notes exist, show empty state message
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
        return; // Exit function early
    }
    
    // Loop through all notes and create a table row for each
    notes.forEach((note, index) => {
        const row = document.createElement("tr");

        // Populate row with note data and action buttons
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

        // Add the row to the table body
        notesBody.appendChild(row);
    });
}
//------------------------------------------------------

//--------------EDIT NOTE FUNCTION--------------
/**
 * Loads note data into the top entry bar for editing
 * @param {number} index - The index of the note in the notes array
 */
function editNote(index) {
    const note = notes[index]; // Get the note object
    
    // Populate form fields with existing note data
    noteTitle.value = note.title;
    noteType.value = note.type;
    noteProgress.value = note.progress;
    noteDescription.value = note.description;
    
    // Store the index so saveNote() knows to update instead of add
    editIndex = index;
    
    // Change button text to indicate edit mode
    saveNoteBtn.textContent = "Update Note";
    
    // Scroll to top so user can see the populated entry bar
    window.scrollTo({ top: 0, behavior: 'smooth' });
}
//--------------------------------------------

//--------------DELETE NOTE FUNCTION--------------
/**
 * Removes a note from the array and updates localStorage
 * @param {number} index - The index of the note to delete
 */
function deleteNote(index) {
    // Remove the note at the specified index
    notes.splice(index, 1);
    
    // Convert updated array to JSON string and save to localStorage
    const notesString = JSON.stringify(notes);
    localStorage.setItem("notes", notesString);
    
    // Re-render the table to reflect deletion
    renderNotes();
}
//----------------------------------------------

//--------------HELPER FUNCTION--------------
/**
 * Clears all input fields in the note entry bar
 * Resets to default values for dropdowns and button text
 */
function clearForm() {
    noteTitle.value = "";                  // Clear title
    noteType.value = "Reminder";           // Reset to default type
    noteProgress.value = "Not Started";    // Reset to default progress
    noteDescription.value = "";            // Clear description
    editIndex = null;                      // Exit edit mode
    saveNoteBtn.textContent = "Add Note";  // Reset button text to add mode
}
//-----------------------------------------

//--------------INITIALIZATION--------------
// Render notes when page loads
renderNotes();
//----------------------------------------