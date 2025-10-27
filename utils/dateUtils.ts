import { Task, TaskStatus } from '../types';

/**
 * Calculates the duration in whole days between two dates.
 * @param start - The start date.
 * @param end - The end date.
 * @returns The number of days, or null if dates are invalid.
 */
export const calculateDurationInDays = (start: Date, end: Date): number | null => {
    if (!start || !end) return null;
    // Calculate the difference in time, and round up to the nearest whole day.
    const diffTime = end.getTime() - start.getTime();
    if (diffTime < 0) return 0; // Duration cannot be negative
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays === 0 ? 1 : diffDays; // A task completed same day should be 1 day.
};

/**
 * Checks if a task is overdue.
 * A task is overdue if its status is not 'Done' and the current date is past its due date.
 * @param task - The task object.
 * @returns True if the task is overdue, false otherwise.
 */
export const isTaskOverdue = (task: Task): boolean => {
    return task.status !== TaskStatus.Done && new Date() > task.dueDate;
};

/**
 * Checks if a completed task was finished on time.
 * @param task - The task object.
 * @returns True if the completion date is on or before the due date.
 */
export const isTaskCompletedOnTime = (task: Task): boolean => {
    if (task.status !== TaskStatus.Done || !task.completionDate) {
        return false;
    }
    // Compare date parts only, ignoring time
    const completionDay = new Date(task.completionDate.getFullYear(), task.completionDate.getMonth(), task.completionDate.getDate());
    const dueDay = new Date(task.dueDate.getFullYear(), task.dueDate.getMonth(), task.dueDate.getDate());
    return completionDay <= dueDay;
};
