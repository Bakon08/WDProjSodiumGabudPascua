/**
 * NOTES MANAGEMENT SYSTEM
 * Card grid layout with modal dialog and rich text editor
 * Notes have: title, type, progress, description (rich text), color
 * All data stored in localStorage under "notes"
 */

// ─── Card color palette (matches Lockin's nature theme) ───────────────────
const CARD_COLORS = [
    "#e8f5e9", "#fff9c4", "#fce4ec", "#e3f2fd",
    "#f3e5f5", "#fff3e0", "#e0f7fa", "#f1f8e9"
];

const PROGRESS_STYLES = {
    "Not Started": { bg: "#f5f5f5",  text: "#757575" },
    "In Progress":  { bg: "#fff8e1",  text: "#e67e00" },
    "Completed":    { bg: "#e8f5e9",  text: "#2e7d32" }
};

// ─── Load from localStorage ────────────────────────────────────────────────
let notes = JSON.parse(localStorage.getItem("notes") || "[]");

// Migrate old notes that don't have a color field
notes = notes.map((n, i) => ({
    color: CARD_COLORS[i % CARD_COLORS.length],
    ...n
}));

let editIndex = null;

// ─── DOM refs ──────────────────────────────────────────────────────────────
const notesGrid    = document.getElementById("notesGrid");
const openModalBtn = document.getElementById("openModalBtn");
const modalOverlay = document.getElementById("modalOverlay");
const modalTitle   = document.getElementById("modalTitle");
const modalClose   = document.getElementById("modalClose");
const modalCancel  = document.getElementById("modalCancel");
const modalSave    = document.getElementById("modalSave");
const noteTitle    = document.getElementById("noteTitle");
const noteType     = document.getElementById("noteType");
const noteProgress = document.getElementById("noteProgress");
const richEditor   = document.getElementById("richEditor");
const colorPicker  = document.getElementById("colorPicker");

// ─── Build color swatches ──────────────────────────────────────────────────
let selectedColor = CARD_COLORS[0];

function buildColorPicker() {
    colorPicker.innerHTML = "";
    CARD_COLORS.forEach(color => {
        const swatch = document.createElement("div");
        swatch.className = "color-swatch" + (color === selectedColor ? " selected" : "");
        swatch.style.background = color;
        swatch.addEventListener("click", () => {
            selectedColor = color;
            document.querySelectorAll(".color-swatch").forEach(s => s.classList.remove("selected"));
            swatch.classList.add("selected");
        });
        colorPicker.appendChild(swatch);
    });
}

// ─── Rich text toolbar ─────────────────────────────────────────────────────
document.querySelectorAll(".rich-btn").forEach(btn => {
    btn.addEventListener("mousedown", e => {
        e.preventDefault();
        document.execCommand(btn.dataset.cmd, false, null);
        richEditor.focus();
    });
});

// ─── Open / close modal ────────────────────────────────────────────────────
function openModal(index = null) {
    editIndex = index;
    if (index !== null) {
        const note = notes[index];
        modalTitle.textContent  = "✏️ Edit Note";
        noteTitle.value         = note.title;
        noteType.value          = note.type;
        noteProgress.value      = note.progress;
        richEditor.innerHTML    = note.description || "";
        selectedColor           = note.color || CARD_COLORS[0];
        modalSave.textContent   = "Save Changes";
    } else {
        modalTitle.textContent  = "📝 New Note";
        noteTitle.value         = "";
        noteType.value          = "Reminder";
        noteProgress.value      = "Not Started";
        richEditor.innerHTML    = "";
        selectedColor           = CARD_COLORS[0];
        modalSave.textContent   = "Add Note";
    }
    buildColorPicker();
    modalOverlay.classList.add("active");
    noteTitle.focus();
}

function closeModal() {
    modalOverlay.classList.remove("active");
    editIndex = null;
}

openModalBtn.addEventListener("click",  () => openModal());
modalClose.addEventListener("click",   closeModal);
modalCancel.addEventListener("click",  closeModal);
modalOverlay.addEventListener("click", e => { if (e.target === modalOverlay) closeModal(); });

// ─── Save note ─────────────────────────────────────────────────────────────
modalSave.addEventListener("click", () => {
    const title = noteTitle.value.trim();
    if (!title) {
        noteTitle.focus();
        noteTitle.style.borderColor = "#e53935";
        return;
    }
    noteTitle.style.borderColor = "";

    const noteData = {
        title,
        type:        noteType.value,
        progress:    noteProgress.value,
        description: richEditor.innerHTML,
        color:       selectedColor
    };

    if (editIndex !== null) {
        notes[editIndex] = noteData;
    } else {
        notes.push(noteData);
    }

    localStorage.setItem("notes", JSON.stringify(notes));
    closeModal();
    renderNotes();
});

// ─── Delete note ───────────────────────────────────────────────────────────
function deleteNote(index) {
    if (!confirm('Delete "' + notes[index].title + '"?')) return;
    notes.splice(index, 1);
    localStorage.setItem("notes", JSON.stringify(notes));
    renderNotes();
}

function editNote(index) { openModal(index); }

// ─── Render card grid ──────────────────────────────────────────────────────
function renderNotes() {
    notesGrid.innerHTML = "";

    if (notes.length === 0) {
        notesGrid.innerHTML = `
            <div class="notes-empty-state">
                <div class="empty-state-icon">📝</div>
                <div class="empty-state-text">No notes yet</div>
                <div class="empty-state-subtext">Click "+ New Note" to create your first card!</div>
            </div>`;
        return;
    }

    notes.forEach((note, index) => {
        const prog = PROGRESS_STYLES[note.progress] || PROGRESS_STYLES["Not Started"];
        const card = document.createElement("div");
        card.className = "note-card";
        card.style.background = note.color || CARD_COLORS[0];

        const tempDiv = document.createElement("div");
        tempDiv.innerHTML = note.description || "";
        const plainText = tempDiv.textContent || tempDiv.innerText || "";

        card.innerHTML = `
            <div class="note-card-header">
                <div class="note-card-title">${escHtml(note.title)}</div>
                <div class="note-card-actions">
                    <button class="note-card-btn edit-card-btn"   onclick="editNote(${index})"   title="Edit">✏️</button>
                    <button class="note-card-btn delete-card-btn" onclick="deleteNote(${index})" title="Delete">🗑️</button>
                </div>
            </div>
            <div class="note-card-tags">
                <span class="note-tag progress-tag" style="background:${prog.bg};color:${prog.text};border:1px solid ${prog.text}55">${note.progress}</span>
                <span class="note-tag type-tag">${note.type}</span>
            </div>
            <div class="note-card-preview">${plainText ? escHtml(plainText.substring(0, 120)) + (plainText.length > 120 ? "…" : "") : "<em>No content yet…</em>"}</div>
            <button class="note-expand-btn" onclick="toggleExpand(this, ${index})">▼ Show more</button>
            <div class="note-card-full" style="display:none">${note.description || "<em>No content</em>"}</div>
        `;
        notesGrid.appendChild(card);
    });
}

// ─── Expand / collapse card ────────────────────────────────────────────────
function toggleExpand(btn, index) {
    const card    = btn.closest(".note-card");
    const preview = card.querySelector(".note-card-preview");
    const full    = card.querySelector(".note-card-full");
    const isOpen  = full.style.display !== "none";
    full.style.display    = isOpen ? "none"  : "block";
    preview.style.display = isOpen ? "block" : "none";
    btn.textContent       = isOpen ? "▼ Show more" : "▲ Show less";
}

function escHtml(str) {
    return String(str)
        .replace(/&/g,"&amp;")
        .replace(/</g,"&lt;")
        .replace(/>/g,"&gt;")
        .replace(/"/g,"&quot;");
}

renderNotes();

function refreshNotesView() {
    notes = JSON.parse(localStorage.getItem("notes") || "[]");
    notes = notes.map((n, i) => ({
        color: CARD_COLORS[i % CARD_COLORS.length],
        ...n
    }));
    renderNotes();
}

window.LockinNotesRefresh = refreshNotesView;
window.addEventListener("lockin:data-updated", refreshNotesView);
window.addEventListener("storage", function(event) {
    if (!event.key || ["notes", "tasks", "allGoals", "plannerData", "habits"].includes(event.key)) {
        refreshNotesView();
    }
});
