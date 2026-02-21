// ============================================
// STATISTICS DASHBOARD - DATA RETRIEVAL
// ============================================

// Load data from localStorage
const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
const goals = JSON.parse(localStorage.getItem("allGoals")) || {
    annual: [],
    quarterly: [],
    monthly: [],
    weekly: [],
    daily: []
};
const notes = JSON.parse(localStorage.getItem("notes")) || [];

// ============================================
// CALCULATE KEY METRICS
// ============================================

function calculateMetrics() {
    // Total Tasks
    const totalTasks = tasks.length;

    // Completed Tasks
    const completedTasks = tasks.filter(task => task.progress === "Completed").length;

    // Completion Rate
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    // Goals Metrics
    let totalGoals = 0;
    let completedGoalCount = 0;
    for (const type in goals) {
        totalGoals += goals[type].length;
        completedGoalCount += goals[type].filter(g => g.completed).length;
    }

    const goalProgress = totalGoals > 0 ? Math.round((completedGoalCount / totalGoals) * 100) : 0;

    return {
        totalTasks,
        completedTasks,
        completionRate,
        totalGoals,
        completedGoalCount,
        goalProgress
    };
}

// ============================================
// PRODUCTIVITY ANALYSIS
// ============================================

function getMostProductiveDay() {
    if (tasks.length === 0) return null;

    const dayCompletionMap = {};

    tasks.forEach(task => {
        if (task.progress === "Completed" && task.dueDate) {
            const date = new Date(task.dueDate);
            const dayName = date.toLocaleDateString("en-US", { weekday: "long" });

            if (!dayCompletionMap[dayName]) {
                dayCompletionMap[dayName] = 0;
            }
            dayCompletionMap[dayName]++;
        }
    });

    if (Object.keys(dayCompletionMap).length === 0) return null;

    const mostProductiveDay = Object.keys(dayCompletionMap).reduce((a, b) =>
        dayCompletionMap[a] > dayCompletionMap[b] ? a : b
    );

    return { day: mostProductiveDay, count: dayCompletionMap[mostProductiveDay] };
}

function getLast7DaysData() {
    const last7Days = [];
    const completionData = {};

    // Initialize last 7 days
    for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split("T")[0];
        last7Days.push(dateStr);
        completionData[dateStr] = 0;
    }

    // Count completions for each day
    tasks.forEach(task => {
        if (task.progress === "Completed" && task.dueDate) {
            const dateStr = task.dueDate;
            if (completionData.hasOwnProperty(dateStr)) {
                completionData[dateStr]++;
            }
        }
    });

    return {
        labels: last7Days.map(date => new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" })),
        data: last7Days.map(date => completionData[date])
    };
}

function getTasksByCategory() {
    const categoryMap = {};

    tasks.forEach(task => {
        const category = task.type || "Other";
        if (!categoryMap[category]) {
            categoryMap[category] = 0;
        }
        categoryMap[category]++;
    });

    return {
        labels: Object.keys(categoryMap),
        data: Object.values(categoryMap)
    };
}

function getGoalsBreakdown() {
    const goalTypes = [];
    const goalCounts = [];
    const completedCounts = [];

    for (const type in goals) {
        const typeLabel = type.charAt(0).toUpperCase() + type.slice(1);
        const total = goals[type].length;
        const completed = goals[type].filter(g => g.completed).length;

        if (total > 0) {
            goalTypes.push(typeLabel);
            goalCounts.push(total);
            completedCounts.push(completed);
        }
    }

    return {
        labels: goalTypes,
        total: goalCounts,
        completed: completedCounts
    };
}

// ============================================
// UI UPDATES
// ============================================

function updateMetrics() {
    const metrics = calculateMetrics();

    // Update DOM
    document.getElementById("totalTasks").textContent = metrics.totalTasks;
    document.getElementById("completedTasks").textContent = metrics.completedTasks;
    document.getElementById("completionRate").textContent = metrics.completionRate + "%";
    document.getElementById("completedGoals").textContent = metrics.completedGoalCount;

    // Update progress bars
    document.getElementById("tasksProgress").style.width = metrics.completionRate + "%";
    document.getElementById("rateProgress").style.width = metrics.completionRate + "%";
    document.getElementById("goalProgress").style.width = metrics.goalProgress + "%";

    // Update most productive day
    const productiveDay = getMostProductiveDay();
    if (productiveDay) {
        document.getElementById("productiveDay").textContent = productiveDay.day;
        document.getElementById("productiveCount").textContent = `${productiveDay.count} tasks`;
    } else {
        document.getElementById("productiveDay").textContent = "-";
        document.getElementById("productiveCount").textContent = "No data";
    }
}

function generateInsights() {
    const metrics = calculateMetrics();
    const insightsContainer = document.getElementById("insightsContent");
    let insights = [];

    // Insight 1: Completion Rate
    if (metrics.completionRate >= 80) {
        insights.push({
            type: "high",
            label: "🔥 Excellent Completion Rate",
            value: `You've completed ${metrics.completionRate}% of your tasks! Keep up the great work!`
        });
    } else if (metrics.completionRate >= 50) {
        insights.push({
            type: "high",
            label: "✅ Good Progress",
            value: `You're at a ${metrics.completionRate}% completion rate. Keep pushing!`
        });
    } else if (metrics.completionRate > 0) {
        insights.push({
            type: "warning",
            label: "⚠️ Low Completion Rate",
            value: `Only ${metrics.completionRate}% of tasks are completed. Try breaking them into smaller steps!`
        });
    }

    // Insight 2: Task Backlog
    const incompleteTasks = metrics.totalTasks - metrics.completedTasks;
    if (incompleteTasks > 10) {
        insights.push({
            type: "warning",
            label: "📋 Large Task Backlog",
            value: `You have ${incompleteTasks} incomplete tasks. Consider prioritizing the most important ones.`
        });
    }

    // Insight 3: Goal Progress
    if (metrics.goalProgress >= 75) {
        insights.push({
            type: "high",
            label: "🎯 Goal Crushing",
            value: `${metrics.completedGoalCount} out of ${metrics.totalGoals} goals completed! ${metrics.goalProgress}% done.`
        });
    } else if (metrics.totalGoals > 0) {
        insights.push({
            type: "high",
            label: "📌 Goals in Progress",
            value: `${metrics.completedGoalCount} out of ${metrics.totalGoals} goals completed. ${metrics.goalProgress}% done.`
        });
    }

    // Insight 4: Most Productive Day
    const productiveDay = getMostProductiveDay();
    if (productiveDay) {
        insights.push({
            type: "high",
            label: "📅 Most Productive Day",
            value: `Your most productive day is ${productiveDay.day} with ${productiveDay.count} tasks completed.`
        });
    }

    // Insight 5: Daily Average
    if (metrics.completedTasks > 0) {
        const avgDaily = (metrics.completedTasks / 7).toFixed(1);
        insights.push({
            type: "high",
            label: "📊 Daily Average",
            value: `You average ${avgDaily} tasks completed per day.`
        });
    }

    // Render insights
    if (insights.length === 0) {
        insightsContainer.innerHTML = '<div class="no-data">No data available yet. Start adding tasks and goals!</div>';
    } else {
        insightsContainer.innerHTML = insights
            .map(
                insight => `
            <div class="insight-item ${insight.type}">
                <div class="insight-label">${insight.label}</div>
                <div class="insight-value">${insight.value}</div>
            </div>
        `
            )
            .join("");
    }
}

// ============================================
// CHART.JS INITIALIZATION
// ============================================

let tasksChartInstance = null;
let categoryChartInstance = null;
let goalsChartInstance = null;

function initCharts() {
    // 1. Last 7 Days Chart
    const last7DaysData = getLast7DaysData();
    const tasksCtx = document.getElementById("tasksChart").getContext("2d");

    if (tasksChartInstance) {
        tasksChartInstance.destroy();
    }

    tasksChartInstance = new Chart(tasksCtx, {
        type: "bar",
        data: {
            labels: last7DaysData.labels,
            datasets: [
                {
                    label: "Tasks Completed",
                    data: last7DaysData.data,
                    backgroundColor: "rgba(102, 126, 234, 0.7)",
                    borderColor: "rgba(102, 126, 234, 1)",
                    borderWidth: 2,
                    borderRadius: 8,
                    tension: 0.1
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: true,
                    labels: {
                        color: "#333",
                        font: { size: 12 }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1,
                        color: "#666"
                    },
                    grid: {
                        color: "rgba(200, 200, 200, 0.1)"
                    }
                },
                x: {
                    ticks: {
                        color: "#666"
                    },
                    grid: {
                        display: false
                    }
                }
            }
        }
    });

    // 2. Tasks by Category Chart
    const categoryData = getTasksByCategory();
    const categoryCtx = document.getElementById("categoryChart").getContext("2d");

    if (categoryChartInstance) {
        categoryChartInstance.destroy();
    }

    const colors = [
        "rgba(240, 147, 251, 0.8)",
        "rgba(64, 224, 208, 0.8)",
        "rgba(255, 193, 7, 0.8)",
        "rgba(244, 67, 54, 0.8)",
        "rgba(76, 175, 80, 0.8)"
    ];

    categoryChartInstance = new Chart(categoryCtx, {
        type: categoryData.labels.length > 0 ? "doughnut" : "doughnut",
        data: {
            labels: categoryData.labels.length > 0 ? categoryData.labels : ["No Data"],
            datasets: [
                {
                    data: categoryData.data.length > 0 ? categoryData.data : [1],
                    backgroundColor:
                        categoryData.labels.length > 0
                            ? categoryData.labels.map((_, i) => colors[i % colors.length])
                            : ["rgba(200, 200, 200, 0.5)"],
                    borderColor: "#fff",
                    borderWidth: 2
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: true,
                    position: "right",
                    labels: {
                        color: "#333",
                        font: { size: 12 },
                        padding: 15
                    }
                }
            }
        }
    });

    // 3. Goals Breakdown Chart
    const goalsData = getGoalsBreakdown();
    const goalsCtx = document.getElementById("goalsChart").getContext("2d");

    if (goalsChartInstance) {
        goalsChartInstance.destroy();
    }

    goalsChartInstance = new Chart(goalsCtx, {
        type: goalsData.labels.length > 0 ? "bar" : "bar",
        data: {
            labels: goalsData.labels.length > 0 ? goalsData.labels : ["No Data"],
            datasets: [
                {
                    label: "Total Goals",
                    data: goalsData.total.length > 0 ? goalsData.total : [0],
                    backgroundColor: "rgba(79, 172, 254, 0.7)",
                    borderColor: "rgba(79, 172, 254, 1)",
                    borderWidth: 2,
                    borderRadius: 6
                },
                {
                    label: "Completed Goals",
                    data: goalsData.completed.length > 0 ? goalsData.completed : [0],
                    backgroundColor: "rgba(67, 233, 123, 0.7)",
                    borderColor: "rgba(67, 233, 123, 1)",
                    borderWidth: 2,
                    borderRadius: 6
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: true,
                    labels: {
                        color: "#333",
                        font: { size: 12 }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1,
                        color: "#666"
                    },
                    grid: {
                        color: "rgba(200, 200, 200, 0.1)"
                    }
                },
                x: {
                    ticks: {
                        color: "#666"
                    },
                    grid: {
                        display: false
                    }
                }
            }
        }
    });
}

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener("DOMContentLoaded", () => {
    updateMetrics();
    generateInsights();
    initCharts();

    // Add visual feedback
    console.log("📊 Statistics Dashboard Loaded");
    console.log(`📋 Total Tasks: ${tasks.length}`);
    console.log(`🎖️ Total Goals: ${Object.values(goals).reduce((sum, arr) => sum + arr.length, 0)}`);
});

// Optional: Auto-refresh stats every 30 seconds if data changes
setInterval(() => {
    const updatedTasks = JSON.parse(localStorage.getItem("tasks")) || [];
    if (updatedTasks.length !== tasks.length) {
        location.reload(); // Refresh page if data changes
    }
}, 30000);
