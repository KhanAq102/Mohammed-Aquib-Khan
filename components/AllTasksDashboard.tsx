import React, { useState, useMemo } from 'react';
import { Tender, Employee, Task, TaskStatus } from '../types';
import { ChevronUpDownIcon } from './icons/ChevronUpDownIcon';
import { isTaskOverdue } from '../utils/dateUtils';

type AllTasksItem = Task & {
    tenderId: string;
    tenderTitle: string;
};

type SortKey = 'title' | 'tenderTitle' | 'dueDate' | 'assignee' | 'status';

interface AllTasksDashboardProps {
    tenders: Tender[];
    employees: Employee[];
    onViewTender: (tenderId: string) => void;
}

const AllTasksDashboard: React.FC<AllTasksDashboardProps> = ({ tenders, employees, onViewTender }) => {
    const [filterStatus, setFilterStatus] = useState<TaskStatus | 'all'>('all');
    const [filterAssignee, setFilterAssignee] = useState<string>('all');
    const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: 'ascending' | 'descending' } | null>({ key: 'dueDate', direction: 'ascending' });

    const allTasks: AllTasksItem[] = useMemo(() => {
        return tenders.flatMap(tender =>
            tender.tasks.map(task => ({
                ...task,
                tenderId: tender.id,
                tenderTitle: tender.title,
            }))
        );
    }, [tenders]);

    const filteredTasks = useMemo(() => {
        return allTasks.filter(task => {
            const statusMatch = filterStatus === 'all' || task.status === filterStatus;

            let assigneeMatch = true;
            if (filterAssignee === 'all') {
                assigneeMatch = true;
            } else if (filterAssignee === 'unassigned') {
                assigneeMatch = !task.assignedTo;
            } else {
                assigneeMatch = task.assignedTo === filterAssignee;
            }

            return statusMatch && assigneeMatch;
        });
    }, [allTasks, filterStatus, filterAssignee]);

    const sortedTasks = useMemo(() => {
        let sortableItems = [...filteredTasks];
        if (sortConfig !== null) {
            const { key, direction } = sortConfig;
            sortableItems.sort((a, b) => {
                let aValue: any;
                let bValue: any;

                if (key === 'assignee') {
                    // Sort by name, putting unassigned at the end
                    aValue = employees.find(e => e.id === a.assignedTo)?.name || 'zzz_unassigned';
                    bValue = employees.find(e => e.id === b.assignedTo)?.name || 'zzz_unassigned';
                } else {
                    aValue = a[key as keyof typeof a];
                    bValue = b[key as keyof typeof b];
                }

                if (aValue < bValue) {
                    return direction === 'ascending' ? -1 : 1;
                }
                if (aValue > bValue) {
                    return direction === 'ascending' ? 1 : -1;
                }
                return 0;
            });
        }
        return sortableItems;
    }, [filteredTasks, sortConfig, employees]);

    const requestSort = (key: SortKey) => {
        let direction: 'ascending' | 'descending' = 'ascending';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    const handleClearFilters = () => {
        setFilterStatus('all');
        setFilterAssignee('all');
    };
    
    const getAssigneeName = (assignedTo?: string) => employees.find(e => e.id === assignedTo)?.name || 'Unassigned';

    const statusOptions: { value: TaskStatus | 'all'; label: string }[] = [
        { value: 'all', label: 'All' },
        { value: TaskStatus.Todo, label: 'To Do' },
        { value: TaskStatus.InProgress, label: 'In Progress' },
        { value: TaskStatus.Done, label: 'Done' },
    ];
    
    const statusPillClasses = {
        [TaskStatus.Todo]: 'bg-slate-200 text-slate-700',
        [TaskStatus.InProgress]: 'bg-blue-200 text-blue-800',
        [TaskStatus.Done]: 'bg-green-200 text-green-800',
    };

    const SortableHeader: React.FC<{ sortKey: SortKey, label: string }> = ({ sortKey, label }) => (
        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
            <button onClick={() => requestSort(sortKey)} className="flex items-center gap-1 group">
                {label}
                <ChevronUpDownIcon className={`h-4 w-4 text-slate-400 group-hover:text-slate-600 ${sortConfig?.key === sortKey ? 'text-slate-800' : ''}`} />
            </button>
        </th>
    );

    return (
        <div className="p-4 sm:p-6 lg:p-8 space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <h2 className="text-xl font-semibold text-slate-700 mb-4">All Tasks</h2>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                     <div className="flex items-center gap-4 flex-wrap">
                        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
                            {statusOptions.map(option => (
                                <button
                                    key={option.value}
                                    onClick={() => setFilterStatus(option.value)}
                                    className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                                        filterStatus === option.value
                                            ? 'bg-white text-indigo-600 shadow-sm'
                                            : 'text-slate-600 hover:bg-slate-200'
                                    }`}
                                >
                                    {option.label}
                                </button>
                            ))}
                        </div>
                        <select
                            value={filterAssignee}
                            onChange={(e) => setFilterAssignee(e.target.value)}
                            className="bg-white border border-slate-300 rounded-lg text-sm px-3 py-1.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                            aria-label="Filter by assignee"
                        >
                            <option value="all">All Assignees</option>
                            <option value="unassigned">Unassigned</option>
                            {employees.map(emp => (
                                <option key={emp.id} value={emp.id}>{emp.name}</option>
                            ))}
                        </select>
                        {(filterStatus !== 'all' || filterAssignee !== 'all') && (
                            <button
                                onClick={handleClearFilters}
                                className="px-3 py-1.5 text-sm font-medium text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                                title="Clear all filters"
                            >
                                Clear Filters
                            </button>
                        )}
                     </div>
                     <div className="text-sm font-medium text-slate-600">
                        Showing {sortedTasks.length} of {allTasks.length} tasks
                     </div>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <SortableHeader sortKey="title" label="Task" />
                                <SortableHeader sortKey="tenderTitle" label="Tender" />
                                <SortableHeader sortKey="dueDate" label="Due Date" />
                                <SortableHeader sortKey="assignee" label="Assignee" />
                                <SortableHeader sortKey="status" label="Status" />
                                <th scope="col" className="relative px-6 py-3">
                                    <span className="sr-only">Actions</span>
                                </th>
                            </tr>
                        </thead>
                         <tbody className="bg-white divide-y divide-slate-200">
                            {sortedTasks.map((task) => {
                                const overdue = isTaskOverdue(task);
                                return (
                                <tr key={task.id} className={overdue ? 'bg-red-50/50' : ''}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{task.title}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{task.tenderTitle}</td>
                                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${overdue ? 'text-red-600 font-medium' : 'text-slate-500'}`}>
                                        {task.dueDate.toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{getAssigneeName(task.assignedTo)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                         <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusPillClasses[task.status]}`}>
                                             {task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button onClick={() => onViewTender(task.tenderId)} className="text-indigo-600 hover:text-indigo-900">
                                            View in Tender
                                        </button>
                                    </td>
                                </tr>
                            )})}
                        </tbody>
                    </table>
                     {sortedTasks.length === 0 && (
                        <div className="text-center py-10">
                            <p className="text-slate-500">No tasks match the current filters.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AllTasksDashboard;
