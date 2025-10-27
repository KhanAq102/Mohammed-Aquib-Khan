import React from 'react';
import { Task, Employee, TaskStatus } from '../types';
import TaskItem from './TaskItem';

interface TaskListProps {
    tasks: Task[];
    tenderId: string;
    employees: Employee[];
    onAssignTask: (tenderId: string, taskId: string, employeeId: string | undefined) => void;
    onAiAssignTask: (tenderId: string, taskId: string) => Promise<{ employeeId: string; reason: string; } | null>;
    onUpdateTaskStatus: (tenderId: string, taskId: string, status: TaskStatus) => void;
    onUpdateTaskDetails: (tenderId: string, taskId: string, taskData: Pick<Task, 'title' | 'description' | 'dueDate'>) => void;
    onDeleteTask: (tenderId: string, taskId: string) => void;
}

const TaskList: React.FC<TaskListProps> = ({ tasks, tenderId, employees, onAssignTask, onAiAssignTask, onUpdateTaskStatus, onUpdateTaskDetails, onDeleteTask }) => {
    return (
        <div className="divide-y divide-slate-200">
            {tasks.length > 0 ? (
                tasks.map(task => (
                    <TaskItem
                        key={task.id}
                        tenderId={tenderId}
                        task={task}
                        employees={employees}
                        onAssignTask={onAssignTask}
                        onAiAssignTask={onAiAssignTask}
                        onUpdateTaskStatus={onUpdateTaskStatus}
                        onUpdateTaskDetails={onUpdateTaskDetails}
                        onDeleteTask={onDeleteTask}
                    />
                ))
            ) : (
                <div className="text-center py-10">
                    <p className="text-slate-500">No tasks match the current filters.</p>

                </div>
            )}
        </div>
    );
};

export default TaskList;