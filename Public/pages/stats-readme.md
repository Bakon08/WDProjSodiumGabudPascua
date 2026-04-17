# Stats Page README

## Purpose
The Stats page is LockIn's analytics dashboard. It reads task, goal, and sample-data records from `localStorage` and turns them into productivity summaries, charts, streaks, insights, and export files.

## Main Features
- Productivity Trends: shows completion rate over the last 4 weeks.
- Time Analysis: highlights which categories take the most effort and which hours or days are most productive.
- Goal Progress: displays progress bars for each goal using linked planner tasks.
- Streak Counter: shows current and longest streaks, plus a 30-day calendar heatmap.
- Auto-Generated Insights: creates plain-language observations from the stored data.
- Personal Records: tracks best day, best hour, total tasks completed, and longest streak.

## Controls
- Date range filter: Week, Month, 3-Month, or All-Time.

## Data Source
- Tasks are read from `localStorage.tasks`.
- Goals are read from `localStorage.allGoals`.
- The page uses the completion timestamp stored by the planner so the heatmaps and hour analytics can work.
- The trend line uses completed tasks grouped into 4 weekly buckets and calculates completion percentage for each bucket.
- The time analysis bars estimate effort from the gap between a task's due date and completion timestamp.
- The weekday and hourly heatmaps count completed tasks by the day and hour they were finished.
- Goal progress is derived from linked planner tasks, and the app falls back to the goal's completed state when no linked tasks exist yet.
- Streaks are calculated by counting consecutive calendar days with at least one completed task.
- No backend is required.

## Notes
- The page is designed for vanilla JavaScript only.
- Styling uses the green and sage color palette.
- If you add new task fields in the planner, update the aggregation logic in `Public/js/stats.js` so the analytics stay accurate.
