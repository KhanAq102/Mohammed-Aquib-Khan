import React from 'react';
import { Task, Employee, TaskStatus } from '../types';
import { CalendarIcon } from './icons/CalendarIcon';
import { UserIcon } from './icons/UserIcon';
import { isTaskOverdue } from '../utils/dateUtils';

interface KanbanCardProps {
    task: Task;
    employee?: Employee;
    onDragStart: (e: React.DragEvent<HTMLDivElement>, taskId: string) => void;
    isDraggable: boolean;
}

const KanbanCard: React.FC<KanbanCardProps> = ({ task, employee, onDragStart, isDraggable }) => {
    const overdue = isTaskOverdue(task);

    return (
        <div
            draggable={isDraggable}
            onDragStart={(e) => onDragStart(e, task.id)}
            className={`bg-white p-3 rounded-lg shadow-sm border border-slate-200 cursor-grab active:cursor-grabbing ${isDraggable ? '' : 'cursor-not-allowed bg-slate-50'}`}
            title={isDraggable ? task.title : "Cannot move unassigned task to 'In Progress' or 'Done'"}
        >
            <p className="font-semibold text-sm text-slate-800 mb-2">{task.title}</p>
            <div className="flex justify-between items-center">
                <div className={`flex items-center text-xs ${overdue ? 'text-red-600 font-medium' : 'text-slate-500'}`}>
                    <CalendarIcon className="h-4 w-4 mr-1" />
                    <span>{task.dueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                </div>
                {employee ? (
                    <img src={employee.avatar} alt={employee.name} className="h-6 w-6 rounded-full" title={`Assigned to ${employee.name}`} />
                ) : (
                    <div className="flex items-center justify-center h-6 w-6 bg-slate-200 rounded-full" title="Unassigned">
                        <UserIcon className="h-4 w-4 text-slate-500" />
                    </div>
                )}
            </div>
        </div>
    );
};


interface KanbanBoardProps {
    tasks: Task[];
    employees: Employee[];
    onUpdateTaskStatus: (taskId: string, newStatus: TaskStatus) => void;
}

const KANBAN_COLUMNS: { id: TaskStatus; title: string }[] = [
    { id: TaskStatus.Todo, title: 'To Do' },
    { id: TaskStatus.InProgress, title: 'In Progress' },
    { id: TaskStatus.Done, title: 'Done' },
];

const KanbanBoard: React.FC<KanbanBoardProps> = ({ tasks, employees, onUpdateTaskStatus }) => {

    const handleDragStart = (e: React.DragEvent<HTMLDivElement>, taskId: string) => {
        e.dataTransfer.setData('taskId', taskId);
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>, newStatus: TaskStatus) => {
        e.preventDefault();
        const taskId = e.dataTransfer.getData('taskId');
        const task = tasks.find(t => t.id === taskId);

        if (task && !task.assignedTo && (newStatus === TaskStatus.InProgress || newStatus === TaskStatus.Done)) {
            alert("Cannot move an unassigned task to 'In Progress' or 'Done'. Please assign it first.");
            return;
        }

        if (taskId) {
            onUpdateTaskStatus(taskId, newStatus);
        }
    };

    const tasksByStatus = {
        [TaskStatus.Todo]: tasks.filter(t => t.status === TaskStatus.Todo),
        [TaskStatus.InProgress]: tasks.filter(t => t.status === TaskStatus.InProgress),
        [TaskStatus.Done]: tasks.filter(t => t.status === TaskStatus.Done),
    };

    const columnStyles = {
        [TaskStatus.Todo]: 'border-t-slate-400',
        [TaskStatus.InProgress]: 'border-t-blue-500',
        [TaskStatus.Done]: 'border-t-green-500',
    };

    return (
        <div className="flex gap-4 overflow-x-auto py-4 -mx-6 px-6">
            {KANBAN_COLUMNS.map(column => (
                <div
                    key={column.id}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, column.id)}
                    className={`w-80 flex-shrink-0 bg-slate-100 rounded-lg p-3 border-t-4 ${columnStyles[column.id]}`}
                >
                    <h4 className="font-semibold text-slate-700 mb-3 px-1">{column.title} <span className="text-sm font-normal text-slate-500">({tasksByStatus[column.id].length})</span></h4>
                    <div className="space-y-3 h-full">
                        {tasksByStatus[column.id].length > 0 ? (
                             tasksByStatus[column.id].map(task => {
                                const employee = employees.find(e => e.id === task.assignedTo);
                                const isDraggable = !!task.assignedTo || column.id === TaskStatus.Todo;
                                return (
                                     <KanbanCard
                                        key={task.id}
                                        task={task}
                                        employee={employee}
                                        onDragStart={handleDragStart}
                                        isDraggable={isDraggable}
                                    />
                                );
                            })
                        ) : (
                           <div className="flex items-center justify-center h-32 border-2 border-dashed border-slate-300 rounded-md">
                                <p className="text-sm text-slate-500">No tasks here</p>
                           </div>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default KanbanBoard;