(() => {
    const RANGE_DAYS = {
        week: 7,
        month: 30,
        "3-month": 90,
        all: null
    };

    const WEEKDAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const FULL_WEEKDAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const HOUR_LABELS = Array.from({ length: 24 }, (_, hour) => {
        if (hour === 0) return "12a";
        if (hour < 12) return `${hour}a`;
        if (hour === 12) return "12p";
        return `${hour - 12}p`;
    });

    const fallbackGoals = { annual: [], quarterly: [], monthly: [], weekly: [], daily: [] };

    const state = {
        range: "month",
        tasks: [],
        goals: { ...fallbackGoals }
    };

    const elements = {};

    function $(id) {
        return document.getElementById(id);
    }

    function escapeHtml(value) {
        return String(value ?? "")
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;")
            .replaceAll("'", "&#39;");
    }

    function clampPercent(value) {
        return Math.max(0, Math.min(100, Math.round(value)));
    }

    function makeId(prefix) {
        return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    }

    function parseDateOnly(value) {
        if (!value || typeof value !== "string") {
            return null;
        }

        if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
            const [year, month, day] = value.split("-").map(Number);
            return new Date(year, month - 1, day, 12, 0, 0, 0);
        }

        const parsed = new Date(value);
        return Number.isNaN(parsed.getTime()) ? null : parsed;
    }

    function startOfDay(date) {
        const next = new Date(date);
        next.setHours(0, 0, 0, 0);
        return next;
    }

    function endOfDay(date) {
        const next = new Date(date);
        next.setHours(23, 59, 59, 999);
        return next;
    }

    function addDays(date, days) {
        const next = new Date(date);
        next.setDate(next.getDate() + days);
        return next;
    }

    function formatShortDate(date) {
        return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(date);
    }

    function formatLongDate(date) {
        return new Intl.DateTimeFormat("en-US", {
            weekday: "long",
            month: "short",
            day: "numeric",
            year: "numeric"
        }).format(date);
    }

    function formatRangeLabel(startDate, endDate) {
        return `${formatShortDate(startDate)} - ${formatShortDate(endDate)}`;
    }

    function formatHourLabel(hour) {
        if (hour === 0) return "12 AM";
        if (hour < 12) return `${hour} AM`;
        if (hour === 12) return "12 PM";
        return `${hour - 12} PM`;
    }

    function getTaskCompletionInstant(task) {
        const source = task.completedAt || task.completedDate || task.dueDate;
        const parsed = parseDateOnly(source);
        return parsed || null;
    }

    function getTaskAnalyticsDate(task) {
        if (task.completed && task.completedAt) {
            return parseDateOnly(task.completedAt);
        }

        if (task.completed && task.completedDate) {
            return parseDateOnly(task.completedDate);
        }

        return parseDateOnly(task.dueDate);
    }

    function isCompletedTask(task) {
        return task.completed === true || task.progress === "Completed";
    }

    function normalizeTask(task) {
        const hasCompletionDate = task.completedDate || task.completedAt;
        return {
            id: task.id || makeId("task"),
            title: task.title || "Untitled task",
            dueDate: task.dueDate || "",
            progress: task.progress || (task.completed ? "Completed" : "Not Started"),
            type: task.type || "Other",
            completed: isCompletedTask(task),
            completedDate: task.completedDate || null,
            completedAt: task.completedAt || (hasCompletionDate ? `${task.completedDate || task.dueDate}T12:00:00` : null),
            goalId: task.goalId || null,
            isSample: !!task.isSample
        };
    }

    function normalizeGoalsStore(rawGoals) {
        const normalized = { ...fallbackGoals };

        Object.keys(fallbackGoals).forEach(type => {
            const goalsForType = Array.isArray(rawGoals?.[type]) ? rawGoals[type] : [];
            normalized[type] = goalsForType.map(goal => ({
                id: goal.id || makeId("goal"),
                text: goal.text || "Untitled goal",
                completed: !!goal.completed,
                linkedTaskIds: Array.isArray(goal.linkedTaskIds) ? goal.linkedTaskIds : [],
                isSample: !!goal.isSample
            }));
        });

        return normalized;
    }

    function loadState() {
        const rawTasks = JSON.parse(localStorage.getItem("tasks") || "[]");
        const rawGoals = JSON.parse(localStorage.getItem("allGoals") || "{}");

        state.tasks = Array.isArray(rawTasks) ? rawTasks.map(normalizeTask) : [];
        state.goals = normalizeGoalsStore(rawGoals);
    }

    function getRangeStart(rangeKey) {
        const rangeDays = RANGE_DAYS[rangeKey];
        if (!rangeDays) {
            return null;
        }

        const start = startOfDay(new Date());
        start.setDate(start.getDate() - (rangeDays - 1));
        return start;
    }

    function isWithinRange(date, rangeKey) {
        if (!date) {
            return false;
        }

        const rangeStart = getRangeStart(rangeKey);
        if (!rangeStart) {
            return true;
        }

        return date >= rangeStart;
    }

    function filterTasksForRange(tasks, rangeKey) {
        if (rangeKey === "all") {
            return tasks.slice();
        }

        return tasks.filter(task => isWithinRange(getTaskAnalyticsDate(task), rangeKey));
    }

    function getGoalTaskMap() {
        const map = {};

        state.tasks.forEach(task => {
            if (!task.goalId) {
                return;
            }

            if (!map[task.goalId]) {
                map[task.goalId] = [];
            }

            map[task.goalId].push(task);
        });

        return map;
    }

    function getAllGoals() {
        return Object.entries(state.goals).flatMap(([type, goalsForType]) =>
            goalsForType.map(goal => ({ ...goal, type }))
        );
    }

    function getGoalStats(tasksByGoal) {
        const allGoals = getAllGoals();
        let totalGoals = 0;
        let completedGoals = 0;

        const goalsWithProgress = allGoals.map(goal => {
            const linkedTasks = tasksByGoal[goal.id] || [];
            const linkedTaskIds = Array.isArray(goal.linkedTaskIds) ? goal.linkedTaskIds : [];
            const total = linkedTaskIds.length > 0 ? linkedTaskIds.length : linkedTasks.length;
            const completed = total > 0
                ? linkedTasks.filter(task => !linkedTaskIds.length || linkedTaskIds.includes(task.id)).filter(isCompletedTask).length
                : 0;
            const percent = total > 0 ? Math.round((completed / total) * 100) : goal.completed ? 100 : 0;
            const resolvedCompleted = total > 0 ? percent === 100 : !!goal.completed;

            totalGoals += 1;
            if (resolvedCompleted) {
                completedGoals += 1;
            }

            return {
                ...goal,
                total,
                completed,
                percent,
                resolvedCompleted
            };
        });

        const goalProgress = totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0;

        return {
            totalGoals,
            completedGoals,
            goalProgress,
            goalsWithProgress
        };
    }

    function getCompletionSummary(tasks, goalStats) {
        const totalTasks = tasks.length;
        const completedTasks = tasks.filter(isCompletedTask).length;
        const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

        return {
            totalTasks,
            completedTasks,
            completionRate,
            totalGoals: goalStats.totalGoals,
            completedGoals: goalStats.completedGoals,
            goalProgress: goalStats.goalProgress
        };
    }

    function getCompletionDates(tasks) {
        return tasks
            .filter(isCompletedTask)
            .map(getTaskCompletionInstant)
            .filter(Boolean);
    }

    function getCurrentAndLongestStreak(tasks) {
        const dates = getCompletionDates(tasks).map(date => dateKey(startOfDay(date)));
        const dateSet = new Set(dates);

        let currentStreak = 0;
        let cursor = startOfDay(new Date());

        while (dateSet.has(dateKey(cursor))) {
            currentStreak += 1;
            cursor = addDays(cursor, -1);
        }

        const sortedDates = Array.from(dateSet).sort();
        let longestStreak = 0;
        let streak = 0;
        let previousDate = null;

        sortedDates.forEach(dateString => {
            const current = parseDateOnly(dateString);
            if (!current) {
                return;
            }

            if (previousDate && dateKey(addDays(previousDate, 1)) === dateKey(current)) {
                streak += 1;
            } else {
                streak = 1;
            }

            longestStreak = Math.max(longestStreak, streak);
            previousDate = current;
        });

        return { currentStreak, longestStreak, dateSet };
    }

    function dateKey(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
    }

    function getBestDay(tasks) {
        const dayCounts = new Map();

        tasks.filter(isCompletedTask).forEach(task => {
            const date = getTaskCompletionInstant(task);
            if (!date) {
                return;
            }

            const dayName = FULL_WEEKDAY_NAMES[date.getDay()];
            dayCounts.set(dayName, (dayCounts.get(dayName) || 0) + 1);
        });

        if (dayCounts.size === 0) {
            return null;
        }

        return Array.from(dayCounts.entries()).reduce((best, current) => (current[1] > best[1] ? current : best));
    }

    function getBestHour(tasks) {
        const hourCounts = new Map();

        tasks.filter(isCompletedTask).forEach(task => {
            const date = getTaskCompletionInstant(task);
            if (!date) {
                return;
            }

            const hour = date.getHours();
            hourCounts.set(hour, (hourCounts.get(hour) || 0) + 1);
        });

        if (hourCounts.size === 0) {
            return null;
        }

        return Array.from(hourCounts.entries()).reduce((best, current) => (current[1] > best[1] ? current : best));
    }

    function buildTrendData(tasks) {
        const buckets = [];
        const today = startOfDay(new Date());

        for (let index = 3; index >= 0; index -= 1) {
            const bucketEnd = addDays(today, -(index * 7));
            const bucketStart = addDays(bucketEnd, -6);
            buckets.push({
                start: bucketStart,
                end: bucketEnd,
                total: 0,
                completed: 0
            });
        }

        tasks.forEach(task => {
            const date = getTaskAnalyticsDate(task);
            if (!date) {
                return;
            }

            const bucket = buckets.find(entry => date >= entry.start && date <= endOfDay(entry.end));
            if (!bucket) {
                return;
            }

            bucket.total += 1;
            if (isCompletedTask(task)) {
                bucket.completed += 1;
            }
        });

        return buckets.map(bucket => ({
            label: formatRangeLabel(bucket.start, bucket.end),
            percent: bucket.total > 0 ? Math.round((bucket.completed / bucket.total) * 100) : 0,
            total: bucket.total,
            completed: bucket.completed,
            start: bucket.start,
            end: bucket.end
        }));
    }

    function buildCategoryEffort(tasks) {
        const map = new Map();

        tasks.filter(isCompletedTask).forEach(task => {
            const category = task.type || "Other";
            const completionInstant = getTaskCompletionInstant(task);
            const dueInstant = parseDateOnly(task.dueDate);
            let effortHours = 1;

            if (completionInstant && dueInstant) {
                // When the app stores a completion timestamp, the gap between due and done
                // becomes a useful proxy for the amount of effort a task consumed.
                effortHours = Math.max(1, Math.round(Math.abs(completionInstant.getTime() - dueInstant.getTime()) / 36e5));
            }

            const current = map.get(category) || { category, totalHours: 0, completedTasks: 0 };
            current.totalHours += effortHours;
            current.completedTasks += 1;
            map.set(category, current);
        });

        return Array.from(map.values()).sort((a, b) => b.totalHours - a.totalHours);
    }

    function buildHourHeatmap(tasks) {
        const grid = Array.from({ length: 7 }, () => Array(24).fill(0));

        tasks.filter(isCompletedTask).forEach(task => {
            const completionInstant = getTaskCompletionInstant(task);
            if (!completionInstant) {
                return;
            }

            grid[completionInstant.getDay()][completionInstant.getHours()] += 1;
        });

        return grid;
    }

    function buildCalendarHeatmap(tasks) {
        const days = [];
        const today = startOfDay(new Date());
        const start = addDays(today, -29);
        const counts = new Map();

        tasks.filter(isCompletedTask).forEach(task => {
            const completionInstant = getTaskCompletionInstant(task);
            if (!completionInstant) {
                return;
            }

            const key = dateKey(startOfDay(completionInstant));
            counts.set(key, (counts.get(key) || 0) + 1);
        });

        for (let offset = 0; offset < 30; offset += 1) {
            const date = addDays(start, offset);
            const key = dateKey(date);
            days.push({
                date,
                key,
                count: counts.get(key) || 0
            });
        }

        return days;
    }

    function getProductivityByWeekday(tasks) {
        const counts = Array.from({ length: 7 }, () => ({ completed: 0, total: 0 }));

        tasks.forEach(task => {
            const date = getTaskAnalyticsDate(task);
            if (!date) {
                return;
            }

            const weekday = date.getDay();
            counts[weekday].total += 1;
            if (isCompletedTask(task)) {
                counts[weekday].completed += 1;
            }
        });

        return counts.map((entry, weekday) => ({
            weekday,
            label: WEEKDAY_NAMES[weekday],
            completed: entry.completed,
            total: entry.total,
            rate: entry.total > 0 ? entry.completed / entry.total : 0
        }));
    }

    function getProductivityByHour(tasks) {
        const counts = Array.from({ length: 24 }, () => ({ completed: 0, total: 0 }));

        tasks.forEach(task => {
            const date = getTaskAnalyticsDate(task);
            if (!date) {
                return;
            }

            const hour = date.getHours();
            counts[hour].total += 1;
            if (isCompletedTask(task)) {
                counts[hour].completed += 1;
            }
        });

        return counts.map((entry, hour) => ({
            hour,
            label: HOUR_LABELS[hour],
            completed: entry.completed,
            total: entry.total,
            rate: entry.total > 0 ? entry.completed / entry.total : 0
        }));
    }

    function getStrongestPattern(values) {
        const filtered = values.filter(entry => entry.total > 0);
        if (filtered.length === 0) {
            return null;
        }

        return filtered.reduce((best, current) => (current.rate > best.rate ? current : best));
    }

    function generateInsights(summary, weekdayStats, hourStats, streaks) {
        const insights = [];

        if (summary.totalTasks === 0) {
            return [
                {
                    tone: "warning",
                    title: "No data yet",
                    body: "Start adding tasks and completing them to unlock trend lines, streaks, and records."
                }
            ];
        }

        if (summary.completionRate >= 80) {
            insights.push({
                tone: "positive",
                title: "Strong completion rate",
                body: `You completed ${summary.completionRate}% of the tasks in this range.`
            });
        } else if (summary.completionRate >= 50) {
            insights.push({
                tone: "positive",
                title: "Solid momentum",
                body: `You are completing about ${summary.completionRate}% of your tasks.`
            });
        } else {
            insights.push({
                tone: "warning",
                title: "Room to recover",
                body: `Completion rate is ${summary.completionRate}%. Focusing on smaller daily wins could move this quickly.`
            });
        }

        const weekdayBest = getStrongestPattern(weekdayStats);
        if (weekdayBest) {
            const averageShare = 1 / 7;
            const actualShare = weekdayBest.completed / Math.max(1, weekdayStats.reduce((sum, entry) => sum + entry.completed, 0));
            const boost = averageShare > 0 ? ((actualShare - averageShare) / averageShare) * 100 : 0;
            if (boost >= 40) {
                insights.push({
                    tone: "positive",
                    title: "Weekday strength",
                    body: `You're ${Math.round(boost)}% more productive on ${weekdayBest.label}s.`
                });
            }
        }

        const hourBest = getStrongestPattern(hourStats);
        if (hourBest && hourBest.completed >= 2) {
            insights.push({
                tone: "positive",
                title: "Best working window",
                body: `Your highest completion rate appears around ${hourBest.label}.`
            });
        }

        if (streaks.currentStreak >= 3) {
            insights.push({
                tone: "positive",
                title: "Streak in progress",
                body: `You are on a ${streaks.currentStreak}-day streak. Keep it alive.`
            });
        } else if (streaks.longestStreak >= 5) {
            insights.push({
                tone: "warning",
                title: "Streak potential",
                body: `Your longest streak is ${streaks.longestStreak} days. A small daily habit could raise the current run.`
            });
        }

        if (summary.goalProgress >= 75) {
            insights.push({
                tone: "positive",
                title: "Goal momentum",
                body: `${summary.completedGoals} of ${summary.totalGoals} goals are complete.`
            });
        }

        return insights;
    }

    function renderMetrics(summary, streaks, bestDay, bestHour) {
        const currentStreakEl = elements.currentStreak;
        const longestStreakEl = elements.longestStreak;
        const productiveDayEl = elements.productiveDay;
        const productiveCountEl = elements.productiveCount;
        const productiveHourEl = elements.productiveHour;
        const productiveHourCountEl = elements.productiveHourCount;

        elements.totalTasks.textContent = summary.totalTasks;
        elements.completedTasks.textContent = summary.completedTasks;
        elements.completionRate.textContent = `${summary.completionRate}%`;
        elements.completedGoals.textContent = summary.completedGoals;
        elements.tasksProgress.style.width = `${summary.completionRate}%`;
        elements.goalProgress.style.width = `${summary.goalProgress}%`;

        currentStreakEl.textContent = streaks.currentStreak;
        longestStreakEl.textContent = streaks.longestStreak;

        if (bestDay) {
            productiveDayEl.textContent = bestDay[0];
            productiveCountEl.textContent = `${bestDay[1]} completed tasks`;
        } else {
            productiveDayEl.textContent = "-";
            productiveCountEl.textContent = "No data yet";
        }

        if (bestHour) {
            productiveHourEl.textContent = formatHourLabel(bestHour[0]);
            productiveHourCountEl.textContent = `${bestHour[1]} completed tasks`;
        } else {
            productiveHourEl.textContent = "-";
            productiveHourCountEl.textContent = "No data yet";
        }

        elements.recordTotalCompleted.textContent = summary.completedTasks;
        elements.recordLongestStreak.textContent = streaks.longestStreak;
    }

    function createSvgElement(name) {
        return document.createElementNS("http://www.w3.org/2000/svg", name);
    }

    function renderTrendChart(container, data) {
        if (data.length === 0) {
            container.innerHTML = '<div class="stats-empty-state">No trend data available yet.</div>';
            return;
        }

        const width = 920;
        const height = 320;
        const padding = { top: 24, right: 24, bottom: 54, left: 48 };
        const innerWidth = width - padding.left - padding.right;
        const innerHeight = height - padding.top - padding.bottom;
        const maxValue = 100;

        const points = data.map((entry, index) => ({
            x: padding.left + (innerWidth / Math.max(1, data.length - 1)) * index,
            y: padding.top + innerHeight - (entry.percent / maxValue) * innerHeight,
            label: entry.label,
            value: entry.percent
        }));

        const linePath = points.map((point, index) => `${index === 0 ? "M" : "L"}${point.x},${point.y}`).join(" ");
        const areaPath = `${linePath} L ${points[points.length - 1].x},${padding.top + innerHeight} L ${points[0].x},${padding.top + innerHeight} Z`;

        const gridLines = [0, 25, 50, 75, 100].map(value => {
            const y = padding.top + innerHeight - (value / maxValue) * innerHeight;
            return `
                <line x1="${padding.left}" y1="${y}" x2="${width - padding.right}" y2="${y}" class="stats-grid-line"></line>
                <text x="${padding.left - 10}" y="${y + 4}" class="stats-axis-label" text-anchor="end">${value}%</text>
            `;
        }).join("");

        const axisLabels = points.map(point => `
            <text x="${point.x}" y="${height - 20}" class="stats-axis-label" text-anchor="middle">${escapeHtml(point.label)}</text>
        `).join("");

        const svg = `
            <svg viewBox="0 0 ${width} ${height}" role="img" aria-label="Weekly productivity trend chart">
                ${gridLines}
                <path d="${areaPath}" class="stats-line-area"></path>
                <path d="${linePath}" class="stats-line-path"></path>
                ${points.map(point => `
                    <circle cx="${point.x}" cy="${point.y}" r="6" class="stats-point"></circle>
                    <text x="${point.x}" y="${point.y - 14}" class="stats-point-label" text-anchor="middle">${point.value}%</text>
                `).join("")}
                ${axisLabels}
            </svg>
        `;

        container.innerHTML = svg;
    }

    function renderCategoryEffortChart(container, categories) {
        if (categories.length === 0) {
            container.innerHTML = '<div class="stats-empty-state">No completed tasks yet.</div>';
            return;
        }

        const maxHours = Math.max(...categories.map(entry => entry.totalHours), 1);
        container.innerHTML = categories.map(entry => {
            const percent = (entry.totalHours / maxHours) * 100;
            return `
                <div class="stats-bar-row">
                    <div class="stats-bar-label">${escapeHtml(entry.category)}</div>
                    <div class="stats-bar-track">
                        <div class="stats-bar-fill" style="width:${percent}%"></div>
                    </div>
                    <div class="stats-bar-meta">${entry.totalHours}h</div>
                </div>
            `;
        }).join("");
    }

    function renderHourlyHeatmap(container, grid) {
        const maxValue = Math.max(...grid.flat(), 1);
        const headerRow = `
            <div class="stats-heatmap-row header">
                <span></span>
                ${HOUR_LABELS.map(label => `<span>${label}</span>`).join("")}
            </div>
        `;

        const rows = grid.map((dayRow, weekday) => {
            const cells = dayRow.map(count => {
                const intensity = count === 0 ? 0.06 : 0.1 + (count / maxValue) * 0.85;
                return `<div class="stats-heatmap-cell" title="${WEEKDAY_NAMES[weekday]} - ${count} completions" style="background: rgba(90, 143, 105, ${intensity});"></div>`;
            }).join("");

            return `
                <div class="stats-heatmap-row">
                    <span class="stats-heatmap-day">${WEEKDAY_NAMES[weekday]}</span>
                    ${cells}
                </div>
            `;
        }).join("");

        container.innerHTML = `
            <div class="stats-heatmap-legend">
                <span>Low activity</span>
                <span class="stats-heatmap-swatch" style="background: rgba(90, 143, 105, 0.12);"></span>
                <span class="stats-heatmap-swatch" style="background: rgba(90, 143, 105, 0.85);"></span>
                <span>High activity</span>
            </div>
            <div class="stats-heatmap-grid">${headerRow}${rows}</div>
        `;
    }

    function renderCalendarHeatmap(container, days, streaks) {
        const maxValue = Math.max(...days.map(day => day.count), 1);
        const weekStartOffset = days[0].date.getDay();
        const blanks = Array.from({ length: weekStartOffset }, () => '<div class="stats-calendar-cell empty"></div>').join("");

        const cells = days.map(day => {
            const intensity = day.count === 0 ? 0.06 : 0.1 + (day.count / maxValue) * 0.85;
            return `
                <div class="stats-calendar-cell" title="${formatLongDate(day.date)} - ${day.count} completions" style="background: rgba(90, 143, 105, ${intensity});">
                    ${day.date.getDate()}
                </div>
            `;
        }).join("");

        container.innerHTML = `
            <div class="stats-calendar-legend">
                <span>30-day activity</span>
                <strong>${streaks.currentStreak} day current streak</strong>
                <span>Current run</span>
                <strong>${streaks.longestStreak} day longest streak</strong>
            </div>
            <div class="stats-calendar-weekdays">
                ${WEEKDAY_NAMES.map(day => `<span>${day}</span>`).join("")}
            </div>
            <div class="stats-calendar-grid">${blanks}${cells}</div>
        `;
    }

    function renderGoalProgress(goalsWithProgress) {
        const container = elements.goalProgressList;
        if (goalsWithProgress.length === 0) {
            container.innerHTML = '<div class="stats-empty-state">No goals saved yet.</div>';
            return;
        }

        container.innerHTML = goalsWithProgress.map(goal => `
            <article class="stats-goal-item">
                <div class="stats-goal-header">
                    <div>
                        <div class="stats-goal-badge">${escapeHtml(goal.type)}</div>
                        <h3 class="stats-goal-title">${escapeHtml(goal.text)}</h3>
                        <div class="stats-goal-subtitle">${goal.total > 0 ? `${goal.completed} of ${goal.total} linked tasks completed` : goal.completed ? 'Marked complete with no linked tasks' : 'No linked tasks yet'}</div>
                    </div>
                    <strong class="stats-summary-value">${goal.percent}%</strong>
                </div>
                <div class="stats-goal-progress">
                    <div class="stats-goal-progress-fill" style="width:${goal.percent}%"></div>
                </div>
                <div class="stats-goal-meta">${goal.total > 0 ? `${goal.completed} completed out of ${goal.total}` : "Progress is based on the goal's saved completion state"}</div>
            </article>
        `).join("");
    }

    function renderInsights(insights) {
        const container = elements.insightsContent;
        if (insights.length === 0) {
            container.innerHTML = '<div class="stats-empty-state">No data available yet. Start adding tasks and goals.</div>';
            return;
        }

        container.innerHTML = insights.map(insight => `
            <article class="stats-insight-card ${insight.tone}">
                <div class="stats-insight-title">${escapeHtml(insight.title)}</div>
                <div class="stats-insight-body">${escapeHtml(insight.body)}</div>
            </article>
        `).join("");
    }

    function renderRecords(summary, bestDay, bestHour, streaks, topWeekday, topHour) {
        elements.recordBestDay.textContent = bestDay ? bestDay[0] : "-";
        elements.recordBestHour.textContent = bestHour ? formatHourLabel(bestHour[0]) : "-";
        elements.recordTotalCompleted.textContent = summary.completedTasks;
        elements.recordLongestStreak.textContent = streaks.longestStreak;

        if (topWeekday) {
            elements.productiveDay.textContent = topWeekday.label;
            elements.productiveCount.textContent = `${topWeekday.completed} completed tasks`;
        }

        if (topHour) {
            elements.productiveHour.textContent = formatHourLabel(topHour.hour);
            elements.productiveHourCount.textContent = `${topHour.completed} completed tasks`;
        }
    }

    function updatePage() {
        loadState();

        const rangeTasks = filterTasksForRange(state.tasks, state.range);
        const tasksByGoal = getGoalTaskMap();
        const goalStats = getGoalStats(tasksByGoal);
        const summary = getCompletionSummary(rangeTasks, goalStats);
        const streaks = getCurrentAndLongestStreak(state.tasks);
        const bestDay = getBestDay(rangeTasks);
        const bestHour = getBestHour(rangeTasks);
        const trendData = buildTrendData(rangeTasks);
        const categoryData = buildCategoryEffort(rangeTasks);
        const weekdayStats = getProductivityByWeekday(rangeTasks);
        const hourStats = getProductivityByHour(rangeTasks);
        const topWeekday = getStrongestPattern(weekdayStats);
        const topHour = getStrongestPattern(hourStats);
        const heatmapGrid = buildHourHeatmap(rangeTasks);
        const calendarDays = buildCalendarHeatmap(rangeTasks);

        summary.currentStreak = streaks.currentStreak;
        summary.longestStreak = streaks.longestStreak;
        summary.bestDay = bestDay ? bestDay[0] : "";
        summary.bestHour = bestHour ? formatHourLabel(bestHour[0]) : "";

        renderMetrics(summary, streaks, bestDay, bestHour);
        renderTrendChart(elements.trendChart, trendData);
        renderCategoryEffortChart(elements.categoryEffortChart, categoryData);
        renderHourlyHeatmap(elements.hourlyHeatmapChart, heatmapGrid);
        renderCalendarHeatmap(elements.calendarHeatmap, calendarDays, streaks);
        renderGoalProgress(goalStats.goalsWithProgress);

        const insights = generateInsights(summary, weekdayStats, hourStats, streaks);
        renderInsights(insights);
        renderRecords(summary, bestDay, bestHour, streaks, topWeekday, topHour);

        elements.trendSummary.textContent = `Range: ${state.range}. Charts and metrics are derived from your locally stored planner data.`;
    }

    function bindElements() {
        elements.totalTasks = $("totalTasks");
        elements.completedTasks = $("completedTasks");
        elements.completionRate = $("completionRate");
        elements.completedGoals = $("completedGoals");
        elements.tasksProgress = $("tasksProgress");
        elements.goalProgress = $("goalProgress");
        elements.currentStreak = $("currentStreak");
        elements.longestStreak = $("longestStreak");
        elements.productiveDay = $("productiveDay");
        elements.productiveCount = $("productiveCount");
        elements.productiveHour = $("productiveHour");
        elements.productiveHourCount = $("productiveHourCount");
        elements.trendChart = $("trendChart");
        elements.trendSummary = $("trendSummary");
        elements.categoryEffortChart = $("categoryEffortChart");
        elements.hourlyHeatmapChart = $("hourlyHeatmapChart");
        elements.calendarHeatmap = $("calendarHeatmap");
        elements.goalProgressList = $("goalProgressList");
        elements.insightsContent = $("insightsContent");
        elements.recordTotalCompleted = $("recordTotalCompleted");
        elements.recordBestDay = $("recordBestDay");
        elements.recordBestHour = $("recordBestHour");
        elements.recordLongestStreak = $("recordLongestStreak");
        elements.statsRange = $("statsRange");
    }

    function refreshStatsView() {
        updatePage();
    }

    function init() {
        bindElements();

        if (elements.statsRange) {
            state.range = elements.statsRange.value || "month";
            elements.statsRange.addEventListener("change", () => {
                state.range = elements.statsRange.value;
                refreshStatsView();
            });
        }

        refreshStatsView();
    }

    window.LockinStatsRefresh = refreshStatsView;
    window.addEventListener("lockin:data-updated", refreshStatsView);
    window.addEventListener("storage", event => {
        if (!event.key || ["tasks", "notes", "allGoals", "plannerData", "habits"].includes(event.key)) {
            refreshStatsView();
        }
    });

    document.addEventListener("DOMContentLoaded", init);
})();
