// demoMode.js

// Sample data for each view
const sampleData = {
    dashboard: { welcomeMessage: "Welcome to Demo Mode!", notifications: 5 },
    planner: { tasks: [{ id: 1, title: "Sample Task", completed: false }] },
    notes: { content: "This is a sample note in Demo Mode." },
    goals: { progress: 75, goal: "Complete Demo Mode Feature" },
    stats: { totalTasks: 10, completedTasks: 7 },
};

// State management
let appState = {}; // Original state snapshot
let demoState = {}; // Demo state

// Function to enable Demo Mode
function loadSampleData() {
    // Save current state as a snapshot
    appState = { ...getCurrentAppState() };

    // Load sample data into the app
    demoState = { ...sampleData };
    setAppState(demoState);

    // Show visual feedback
    showDemoModeBanner();
}

// Function to revert to original state
function revertChanges() {
    // Restore the original state
    setAppState(appState);

    // Clear demo state
    demoState = {};

    // Remove visual feedback
    hideDemoModeBanner();
}

// Utility to get the current app state (mock implementation)
function getCurrentAppState() {
    return {
        dashboard: { welcomeMessage: "Your Dashboard", notifications: 3 },
        planner: { tasks: [{ id: 1, title: "Real Task", completed: true }] },
        notes: { content: "Your real notes." },
        goals: { progress: 50, goal: "Achieve something great" },
        stats: { totalTasks: 20, completedTasks: 10 },
    };
}

// Utility to set the app state (mock implementation)
function setAppState(state) {
    console.log("App state updated:", state);
    // Here, you would update your app's UI with the new state
}

// Visual feedback for Demo Mode
function showDemoModeBanner() {
    const banner = document.createElement("div");
    banner.id = "demoModeBanner";
    banner.textContent = "Demo Mode: Sample data loaded.";
    banner.style.cssText =
        "position: fixed; top: 0; left: 0; width: 100%; background: orange; color: white; text-align: center; padding: 10px; z-index: 1000;";
    document.body.appendChild(banner);
}

function hideDemoModeBanner() {
    const banner = document.getElementById("demoModeBanner");
    if (banner) {
        banner.remove();
    }
}

// Event listeners for buttons
document.getElementById("loadSampleDataBtn").addEventListener("click", loadSampleData);
document.getElementById("revertChangesBtn").addEventListener("click", revertChanges);