import React, { useState, useMemo, useEffect } from 'react';
import { Task, Employee, TaskStatus, EmployeeStatus } from '../types';
import { SparklesIcon } from './icons/SparklesIcon';
import { UserIcon } from './icons/UserIcon';
import { CalendarIcon } from './icons/CalendarIcon';
import { PencilIcon } from './icons/PencilIcon';
import { isTaskOverdue, calculateDurationInDays } from '../utils/dateUtils';
import { TrashIcon } from './icons/TrashIcon';
import { ClockIcon } from './icons/ClockIcon';
import { ChevronDownIcon } from './icons/ChevronDownIcon';

interface TaskItemProps {
    tenderId: string;
    task: Task;
    employees: Employee[];
    onAssignTask: (tenderId: string, taskId: string, employeeId: string | undefined) => void;
    onAiAssignTask: (tenderId: string, taskId: string) => Promise<{ employeeId: string; reason: string; } | null>;
    onUpdateTaskStatus: (tenderId: string, taskId: string, status: TaskStatus) => void;
    onUpdateTaskDetails: (tenderId: string, taskId: string, taskData: Pick<Task, 'title' | 'description' | 'dueDate'>) => void;
    onDeleteTask: (tenderId: string, taskId: string) => void;
}

const TaskItem: React.FC<TaskItemProps> = ({ tenderId, task, employees, onAssignTask, onAiAssignTask, onUpdateTaskStatus, onUpdateTaskDetails, onDeleteTask }) => {
    const [isAiLoading, setIsAiLoading] = useState(false);
    const [aiSuggestion, setAiSuggestion] = useState<string | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState({
        title: task.title,
        description: task.description,
        dueDate: task.dueDate.toISOString().split('T')[0], // Format for <input type="date">
    });
    const [showHistory, setShowHistory] = useState(false);

    // Reset edit form if the underlying task changes (e.g., from an AI assignment)
    useEffect(() => {
        setEditData({
           title: task.title,
           description: task.description,
           dueDate: task.dueDate.toISOString().split('T')[0],
        });
    }, [task]);


    const assignedEmployee = useMemo(() => {
        return employees.find(e => e.id === task.assignedTo);
    }, [task.assignedTo, employees]);

    const activeEmployees = useMemo(() => employees.filter(e => e.status === EmployeeStatus.Active), [employees]);
    
    const overdue = useMemo(() => isTaskOverdue(task), [task]);

    const completionDuration = useMemo(() => {
        if (task.status === TaskStatus.Done && task.assignedDate && task.completionDate) {
            return calculateDurationInDays(task.assignedDate, task.completionDate);
        }
        return null;
    }, [task.status, task.assignedDate, task.completionDate]);

    const handleAiClick = async () => {
        setIsAiLoading(true);
        setAiSuggestion(null);
        const suggestion = await onAiAssignTask(tenderId, task.id);
        if (suggestion) {
            setAiSuggestion(`AI recommended ${employees.find(e => e.id === suggestion.employeeId)?.name}: "${suggestion.reason}"`);
        } else {
            setAiSuggestion("AI could not make a suggestion. Please assign manually.");
        }
        setIsAiLoading(false);
    };

    const handleEditFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setEditData(prev => ({ ...prev, [name]: value }));
    };

    const handleSaveEdit = (e: React.FormEvent) => {
        e.preventDefault();
        onUpdateTaskDetails(tenderId, task.id, {
            title: editData.title,
            description: editData.description,
            dueDate: new Date(editData.dueDate + 'T23:59:59'),
        });
        setIsEditing(false);
    };
    
    const handleDeleteClick = () => {
        if (window.confirm(`Are you sure you want to delete the task "${task.title}"? This action cannot be undone.`)) {
            onDeleteTask(tenderId, task.id);
        }
    };

    const formatDate = (date: Date) => new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(date);
    
    const statusPillClasses = {
        [TaskStatus.Todo]: 'bg-slate-200 text-slate-700 hover:bg-slate-300',
        [TaskStatus.InProgress]: 'bg-blue-200 text-blue-800 hover:bg-blue-300',
        [TaskStatus.Done]: 'bg-green-200 text-green-800 hover:bg-green-300',
    };

    const hasHistory = task.assignmentHistory && task.assignmentHistory.length > 0;

    if (isEditing) {
        return (
             <div className="py-4">
                <form onSubmit={handleSaveEdit} className="space-y-4 p-4 border rounded-lg bg-slate-50">
                    <h4 className="text-lg font-medium text-slate-600">Edit Task</h4>
                    <div>
                        <label htmlFor={`title-${task.id}`} className="block text-sm font-medium text-slate-700">Title</label>
                        <input type="text" name="title" id={`title-${task.id}`} value={editData.title} onChange={handleEditFormChange} required className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                    </div>
                    <div>
                        <label htmlFor={`description-${task.id}`} className="block text-sm font-medium text-slate-700">Description</label>
                        <textarea name="description" id={`description-${task.id}`} value={editData.description} onChange={handleEditFormChange} rows={3} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                    </div>
                        <div>
                        <label htmlFor={`dueDate-${task.id}`} className="block text-sm font-medium text-slate-700">Due Date</label>
                        <input type="date" name="dueDate" id={`dueDate-${task.id}`} value={editData.dueDate} onChange={handleEditFormChange} required className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                    </div>
                    <div className="flex justify-end gap-2">
                        <button type="button" onClick={() => setIsEditing(false)} className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                            Cancel
                        </button>
                        <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                            Save Changes
                        </button>
                    </div>
                </form>
            </div>
        )
    }


    return (
        <div className={`py-4 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 transition-all ${overdue ? 'bg-red-50/50 rounded-lg border-l-4 border-red-400 pl-4 -ml-4' : ''}`}>
            <div className="flex-grow">
                <div className="flex items-center gap-3">
                    <h4 className="font-semibold text-slate-800">{task.title}</h4>
                     <select
                        value={task.status}
                        onChange={(e) => onUpdateTaskStatus(tenderId, task.id, e.target.value as TaskStatus)}
                        className={`text-xs font-medium rounded-full border-0 focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition ${statusPillClasses[task.status]}`}
                        aria-label={`Current status: ${task.status}. Change status.`}
                    >
                        <option value={TaskStatus.Todo}>To Do</option>
                        <option value={TaskStatus.InProgress} disabled={!task.assignedTo}>In Progress</option>
                        <option value={TaskStatus.Done} disabled={!task.assignedTo}>Done</option>
                    </select>
                </div>
                <p className="text-sm text-slate-500 mt-1">{task.description}</p>
                <div className="flex flex-wrap items-center text-sm text-slate-500 mt-2 gap-x-4 gap-y-1">
                    <div className={`flex items-center ${overdue ? 'text-red-600 font-medium' : ''}`} title={`Due Date: ${task.dueDate.toLocaleDateString()}`}>
                        <CalendarIcon className={`h-4 w-4 mr-1.5 ${overdue ? 'text-red-500' : 'text-slate-400'}`} />
                        <span>Due: {formatDate(task.dueDate)} {overdue && '(Overdue)'}</span>
                    </div>
                    {task.assignedDate && (
                        <div className="flex items-center" title={`Assigned Date: ${task.assignedDate.toLocaleDateString()}`}>
                            <CalendarIcon className="h-4 w-4 mr-1.5 text-blue-500" />
                            <span>Assigned: {formatDate(task.assignedDate)}</span>
                        </div>
                    )}
                    {task.completionDate && (
                         <div className="flex items-center" title={`Completion Date: ${task.completionDate.toLocaleDateString()}`}>
                            <CalendarIcon className="h-4 w-4 mr-1.5 text-green-500" />
                             <span>
                                Completed: {formatDate(task.completionDate)}
                                {completionDuration !== null && <span className="text-green-700 font-medium"> (took {completionDuration} {completionDuration === 1 ? 'day' : 'days'})</span>}
                            </span>
                        </div>
                    )}
                </div>
                {aiSuggestion && (
                    <div className="mt-2 text-sm text-indigo-700 bg-indigo-50 p-2 rounded-md">
                        {aiSuggestion}
                    </div>
                )}

                {hasHistory && (
                    <div className="mt-3">
                        <button 
                            onClick={() => setShowHistory(!showHistory)}
                            className="flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-800 transition-colors"
                            aria-expanded={showHistory}
                        >
                            <ClockIcon className="h-4 w-4 text-slate-400" />
                            <span>Assignment History</span>
                            <ChevronDownIcon className={`h-4 w-4 text-slate-400 transition-transform ${showHistory ? 'rotate-180' : ''}`} />
                        </button>
                        {showHistory && (
                            <div className="mt-3 pl-5 border-l-2 border-slate-200 space-y-3">
                                {task.assignmentHistory.slice().reverse().map((entry, index) => {
                                    const employee = employees.find(e => e.id === entry.assignedTo);
                                    return (
                                        <div key={index} className="flex items-center gap-3 text-sm">
                                            <img src={employee?.avatar || `https://i.pravatar.cc/150?u=${entry.assignedTo}`} alt={employee?.name || 'Unknown'} className="h-6 w-6 rounded-full" />
                                            <div>
                                                <span className="font-medium text-slate-700">{employee?.name || 'Unknown User'}</span>
                                                <span className="text-slate-500"> was assigned on </span>
                                                <span className="text-slate-500">{formatDate(entry.assignedDate)}</span>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </div>
                )}

            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
                {assignedEmployee ? (
                    <div className="flex items-center gap-2 bg-slate-100 p-2 rounded-lg">
                        <img src={assignedEmployee.avatar} alt={assignedEmployee.name} className="h-8 w-8 rounded-full" />
                        <span className="font-medium text-sm text-slate-700">{assignedEmployee.name}</span>
                    </div>
                ) : (
                    <div className="flex items-center justify-center gap-2 bg-slate-100 p-2 rounded-lg h-[44px] w-[150px]">
                        <UserIcon className="h-5 w-5 text-slate-400"/>
                        <span className="text-sm text-slate-500">Unassigned</span>
                    </div>
                )}

                <select
                    value={task.assignedTo || ''}
                    onChange={(e) => onAssignTask(tenderId, task.id, e.target.value || undefined)}
                    className="h-[44px] bg-white border border-slate-300 rounded-lg text-sm px-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                >
                    <option value="">Unassign</option>
                    {activeEmployees.map(emp => (
                        <option key={emp.id} value={emp.id}>{emp.name}</option>
                    ))}
                </select>
                
                 <button
                    onClick={() => setIsEditing(true)}
                    className="h-[44px] w-[44px] flex items-center justify-center bg-white border border-slate-300 text-slate-500 rounded-lg hover:bg-slate-100 transition-colors shadow-sm"
                    title="Edit Task"
                >
                    <PencilIcon className="h-5 w-5" />
                </button>

                <button
                    onClick={handleDeleteClick}
                    className="h-[44px] w-[44px] flex items-center justify-center bg-white border border-slate-300 text-red-500 rounded-lg hover:bg-red-50 transition-colors shadow-sm"
                    title="Delete Task"
                >
                    <TrashIcon className="h-5 w-5" />
                </button>

                <button
                    onClick={handleAiClick}
                    disabled={isAiLoading}
                    className="h-[44px] w-[44px] flex items-center justify-center bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-indigo-300 transition-all duration-200 shadow-sm"
                    title="Suggest Assignee with AI"
                >
                    {isAiLoading ? (
                         <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    ) : (
                        <SparklesIcon className="h-5 w-5" />
                    )}
                </button>
            </div>
        </div>
    );
};

export default TaskItem;
