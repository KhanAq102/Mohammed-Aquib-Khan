import React, { useState, useMemo, useEffect } from 'react';
import { Tender, Employee, Task, TaskStatus, Vehicle, DriverOption, Attachment, AttachmentType, EmployeeStatus, VehicleTypeMaster, UserRole } from '../types';
import { CalendarIcon } from './icons/CalendarIcon';
import TaskList from './TaskList';
import TimelineChart from './TimelineChart';
import VehicleList from './VehicleList';
import { calculateDurationInDays } from '../utils/dateUtils';
import { ClockIcon } from './icons/ClockIcon';
import AttachmentList from './AttachmentList';
import { PencilIcon } from './icons/PencilIcon';
import KanbanBoard from './KanbanBoard';
import CalendarView from './CalendarView';
import { Bars3Icon } from './icons/Bars3Icon';
import { ViewColumnsIcon } from './icons/ViewColumnsIcon';
import { CalendarDaysIcon } from './icons/CalendarDaysIcon';
import { CheckBadgeIcon } from './icons/CheckBadgeIcon';


interface TenderDetailsProps {
    tender: Tender;
    employees: Employee[];
    vehicleTypes: VehicleTypeMaster[];
    userRole: UserRole;
    onAssignTask: (tenderId: string, taskId: string, employeeId: string | undefined) => void;
    onAiAssignTask: (tenderId: string, taskId: string) => Promise<{ employeeId: string; reason: string; } | null>;
    onUpdateTaskStatus: (tenderId: string, taskId: string, status: TaskStatus) => void;
    onAddVehicle: (tenderId: string, vehicleData: Omit<Vehicle, 'id'>) => void;
    onDeleteVehicle: (tenderId: string, vehicleId: string) => void;
    onAddAttachment: (tenderId: string, attachmentData: Omit<Attachment, 'id'>) => void;
    onDeleteAttachment: (tenderId: string, attachmentId: string) => void;
    onAddTask: (tenderId: string, taskData: Omit<Task, 'id' | 'status' | 'completionDate'>) => void;
    onUpdateTaskDetails: (tenderId: string, taskId: string, taskData: Pick<Task, 'title' | 'description' | 'dueDate'>) => void;
    onDeleteTask: (tenderId: string, taskId: string) => void;
    onUpdateTenderRemarks: (tenderId: string, remarks: string) => void;
    onEditTender: (tender: Tender) => void;
}

const TenderDetails: React.FC<TenderDetailsProps> = ({ tender, employees, vehicleTypes, userRole, onAssignTask, onAiAssignTask, onUpdateTaskStatus, onAddVehicle, onDeleteVehicle, onAddAttachment, onDeleteAttachment, onAddTask, onUpdateTaskDetails, onDeleteTask, onUpdateTenderRemarks, onEditTender }) => {
    const [filterStatus, setFilterStatus] = useState<TaskStatus | 'all'>('all');
    const [filterAssignee, setFilterAssignee] = useState<string>('all');
    const [taskView, setTaskView] = useState<'list' | 'kanban' | 'calendar'>('list');
    
    // Vehicle form state
    const [isAddingVehicle, setIsAddingVehicle] = useState(false);
    const [newVehicleData, setNewVehicleData] = useState({
        make: '',
        model: '',
        modelYear: new Date().getFullYear(),
        qty: 1,
        vehicleTypeId: '',
        driverOption: DriverOption.SelfDrive,
        leasePeriod: '',
    });
    
    // Attachment form state
    const [isAddingAttachment, setIsAddingAttachment] = useState(false);
    const [newAttachmentData, setNewAttachmentData] = useState({
        type: AttachmentType.Link,
        name: '',
        url: '',
    });
    
    // Task form state
    const [isAddingTask, setIsAddingTask] = useState(false);
    const [newTaskData, setNewTaskData] = useState({
        title: '',
        description: '',
        dueDate: '',
        assignedTo: '',
        assignedDate: '',
    });

    // Remarks state
    const [isEditingRemarks, setIsEditingRemarks] = useState(false);
    const [remarksText, setRemarksText] = useState(tender.remarks || '');
    const isTenderCompleted = !!tender.completionDate;
    const isReadOnly = isTenderCompleted && userRole !== 'admin';


    useEffect(() => {
        setRemarksText(tender.remarks || '');
        setIsEditingRemarks(false);
    }, [tender.id, tender.remarks]);

    const activeEmployees = useMemo(() => employees.filter(e => e.status === EmployeeStatus.Active), [employees]);

    const formatDate = (date: Date) => new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    }).format(date);

    const filteredTasks = useMemo(() => {
        // Sort tasks by due date, oldest first
        return [...tender.tasks]
            .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime())
            .filter(task => {
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
    }, [tender.tasks, filterStatus, filterAssignee]);
    
    const totalWorkDuration = useMemo(() => {
        return tender.tasks
            .filter(task => task.status === TaskStatus.Done && task.assignedDate && task.completionDate)
            .reduce((total, task) => {
                const duration = calculateDurationInDays(task.assignedDate!, task.completionDate!);
                return total + (duration || 0);
            }, 0);
    }, [tender.tasks]);


    const statusOptions: { value: TaskStatus | 'all'; label: string }[] = [
        { value: 'all', label: 'All' },
        { value: TaskStatus.Todo, label: 'To Do' },
        { value: TaskStatus.InProgress, label: 'In Progress' },
        { value: TaskStatus.Done, label: 'Done' },
    ];

    const handleVehicleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setNewVehicleData(prev => ({
            ...prev,
            [name]: name === 'modelYear' || name === 'qty' || name === 'leasePeriod' ? parseInt(value, 10) || '' : value,
        }));
    };

    const handleAddVehicleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onAddVehicle(tender.id, {
            ...newVehicleData,
            modelYear: Number(newVehicleData.modelYear),
            qty: Number(newVehicleData.qty),
            leasePeriod: newVehicleData.leasePeriod ? Number(newVehicleData.leasePeriod) : undefined,
            vehicleTypeId: newVehicleData.vehicleTypeId || (vehicleTypes[0]?.id || '')
        });
        // Reset form and hide it
        setNewVehicleData({
            make: '',
            model: '',
            modelYear: new Date().getFullYear(),
            qty: 1,
            vehicleTypeId: '',
            driverOption: DriverOption.SelfDrive,
            leasePeriod: '',
        });
        setIsAddingVehicle(false);
    };
    
    const handleAttachmentFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setNewAttachmentData(prev => ({ ...prev, [name]: value }));
    };

    const handleAttachmentFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            // For this simulation, we'll just use the file name.
            // In a real app, you'd handle the file upload here.
            setNewAttachmentData(prev => ({ ...prev, name: e.target.files![0].name, url: '' }));
        }
    };

    const handleAddAttachmentSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newAttachmentData.name) return;
        if (newAttachmentData.type === AttachmentType.Link && !newAttachmentData.url) return;

        onAddAttachment(tender.id, {
            type: newAttachmentData.type,
            name: newAttachmentData.name,
            ...(newAttachmentData.type === AttachmentType.Link && { url: newAttachmentData.url }),
        });
        
        // Reset form and hide it
        setNewAttachmentData({ type: AttachmentType.Link, name: '', url: '' });
        setIsAddingAttachment(false);
    };
    
     const handleTaskFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setNewTaskData(prev => ({ ...prev, [name]: value }));
    };

    const handleAddTaskSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTaskData.title || !newTaskData.dueDate) return;
        
        onAddTask(tender.id, {
            title: newTaskData.title,
            description: newTaskData.description,
            dueDate: new Date(newTaskData.dueDate + 'T23:59:59'),
            assignedTo: newTaskData.assignedTo || undefined,
            assignedDate: newTaskData.assignedTo && newTaskData.assignedDate ? new Date(newTaskData.assignedDate + 'T00:00:00') : undefined,
        });

        // Reset form and hide it
        setNewTaskData({ title: '', description: '', dueDate: '', assignedTo: '', assignedDate: '' });
        setIsAddingTask(false);
    };

    const handleClearFilters = () => {
        setFilterStatus('all');
        setFilterAssignee('all');
    };

    const handleSaveRemarks = () => {
        onUpdateTenderRemarks(tender.id, remarksText);
        setIsEditingRemarks(false);
    };

    const handleCancelRemarks = () => {
        setIsEditingRemarks(false);
        setRemarksText(tender.remarks || ''); // Reset on cancel
    };

    const ViewSwitcherButton: React.FC<{
        view: 'list' | 'kanban' | 'calendar';
        label: string;
        icon: React.ReactNode;
    }> = ({ view, label, icon }) => (
        <button
            onClick={() => setTaskView(view)}
            className={`flex items-center gap-2 px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                taskView === view
                    ? 'bg-white text-indigo-600 shadow-sm'
                    : 'text-slate-600 hover:bg-slate-200'
            }`}
            title={`Switch to ${label} view`}
        >
            {icon}
            <span>{label}</span>
        </button>
    );

    return (
        <div className="space-y-8">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <div className="flex justify-between items-start mb-4">
                    <div className="flex-1 min-w-0">
                        <h2 className="text-3xl font-bold text-slate-800 break-words">{tender.title}</h2>
                        <p className="text-slate-500 mt-1">{tender.client}</p>
                    </div>
                     <button
                        onClick={() => onEditTender(tender)}
                        disabled={isReadOnly}
                        className="ml-4 flex-shrink-0 flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed"
                    >
                        <PencilIcon className="h-4 w-4" />
                        <span>Edit</span>
                    </button>
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 text-slate-600 flex-wrap">
                    <div className="flex items-center space-x-2">
                        <CalendarIcon className="h-5 w-5 text-indigo-500" />
                        <span>Issue Date: {formatDate(tender.startDate)}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <CalendarIcon className="h-5 w-5 text-indigo-500" />
                        <span>Due Date: {formatDate(tender.endDate)}</span>
                    </div>
                     {totalWorkDuration > 0 && (
                        <div className="flex items-center space-x-2">
                            <ClockIcon className="h-5 w-5 text-indigo-500" />
                            <span>Total Work Duration: {totalWorkDuration} days</span>
                        </div>
                    )}
                </div>
            </div>
            
            {isTenderCompleted && (
                <div className="bg-green-100 border-l-4 border-green-500 text-green-800 p-4 rounded-r-lg" role="alert">
                    <div className="flex">
                        <div className="py-1"><CheckBadgeIcon className="h-6 w-6 text-green-500 mr-3" /></div>
                        <div>
                            <p className="font-bold">Tender Completed</p>
                            <p className="text-sm">
                                Completed on {formatDate(tender.completionDate!)}.
                                Total duration: {calculateDurationInDays(tender.startDate, tender.completionDate!)} days.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold text-slate-700">Remarks / Notes</h3>
                    {!isEditingRemarks && !isReadOnly && (
                        <button
                            onClick={() => setIsEditingRemarks(true)}
                            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            <PencilIcon className="h-4 w-4" />
                            <span>Edit</span>
                        </button>
                    )}
                </div>
                {isEditingRemarks ? (
                    <form onSubmit={(e) => { e.preventDefault(); handleSaveRemarks(); }}>
                        <textarea
                            value={remarksText}
                            onChange={(e) => setRemarksText(e.target.value)}
                            rows={6}
                            className="block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            placeholder="Add any notes or remarks for this tender..."
                            aria-label="Tender remarks"
                        />
                        <div className="flex justify-end gap-2 mt-4">
                            <button
                                type="button"
                                onClick={handleCancelRemarks}
                                className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                                Save Remarks
                            </button>
                        </div>
                    </form>
                ) : (
                    <div className="text-slate-600 whitespace-pre-wrap min-h-[5rem]">
                        {tender.remarks ? (
                            <p>{tender.remarks}</p>
                        ) : (
                            <p className="text-slate-400 italic">No remarks have been added for this tender yet.</p>
                        )}
                    </div>
                )}
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <h3 className="text-xl font-semibold text-slate-700 mb-4">Project Timeline</h3>
                <TimelineChart tender={tender} />
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold text-slate-700">Documents & Links</h3>
                    {!isAddingAttachment && !isReadOnly && (
                         <button
                            onClick={() => setIsAddingAttachment(true)}
                            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            Add Attachment
                        </button>
                    )}
                </div>
                 {isAddingAttachment && (
                    <form onSubmit={handleAddAttachmentSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 p-4 border rounded-lg bg-slate-50">
                        <div className="col-span-1 md:col-span-2 text-lg font-medium text-slate-600">Add New Attachment</div>
                        <div className="col-span-1 md:col-span-2">
                            <label className="block text-sm font-medium text-slate-700 mb-2">Attachment Type</label>
                            <div className="flex gap-4">
                                <label className="flex items-center gap-2">
                                    <input type="radio" name="type" value={AttachmentType.Link} checked={newAttachmentData.type === AttachmentType.Link} onChange={handleAttachmentFormChange} className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-slate-300" />
                                    Link
                                </label>
                                <label className="flex items-center gap-2">
                                    <input type="radio" name="type" value={AttachmentType.File} checked={newAttachmentData.type === AttachmentType.File} onChange={handleAttachmentFormChange} className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-slate-300" />
                                    File
                                </label>
                            </div>
                        </div>

                        {newAttachmentData.type === AttachmentType.Link ? (
                            <>
                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium text-slate-700">Link Title</label>
                                    <input type="text" name="name" id="name" value={newAttachmentData.name} onChange={handleAttachmentFormChange} required className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                                </div>
                                <div>
                                    <label htmlFor="url" className="block text-sm font-medium text-slate-700">URL</label>
                                    <input type="url" name="url" id="url" value={newAttachmentData.url} onChange={handleAttachmentFormChange} required placeholder="https://example.com" className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                                </div>
                            </>
                        ) : (
                             <div className="col-span-1 md:col-span-2">
                                <label htmlFor="file" className="block text-sm font-medium text-slate-700">File</label>
                                <input type="file" name="file" id="file" onChange={handleAttachmentFileChange} required className="mt-1 block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"/>
                            </div>
                        )}
                        <div className="col-span-1 md:col-span-2 flex justify-end gap-2">
                             <button type="button" onClick={() => setIsAddingAttachment(false)} className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                                Cancel
                            </button>
                            <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                                Save Attachment
                            </button>
                        </div>
                    </form>
                )}
                <AttachmentList attachments={tender.attachments || []} tenderId={tender.id} onDeleteAttachment={onDeleteAttachment} />
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold text-slate-700">Required Vehicles</h3>
                    {!isAddingVehicle && !isReadOnly && (
                         <button
                            onClick={() => setIsAddingVehicle(true)}
                            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            Add Vehicle
                        </button>
                    )}
                </div>
                {isAddingVehicle && (
                    <form onSubmit={handleAddVehicleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 p-4 border rounded-lg bg-slate-50">
                        <div className="col-span-1 md:col-span-4 text-lg font-medium text-slate-600">Add New Vehicle</div>
                        <div>
                            <label htmlFor="make" className="block text-sm font-medium text-slate-700">Make</label>
                            <input type="text" name="make" id="make" value={newVehicleData.make} onChange={handleVehicleFormChange} required className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                        </div>
                         <div>
                            <label htmlFor="model" className="block text-sm font-medium text-slate-700">Model</label>
                            <input type="text" name="model" id="model" value={newVehicleData.model} onChange={handleVehicleFormChange} required className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                        </div>
                        <div>
                            <label htmlFor="modelYear" className="block text-sm font-medium text-slate-700">Model Year</label>
                            <input type="number" name="modelYear" id="modelYear" value={newVehicleData.modelYear} onChange={handleVehicleFormChange} required className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                        </div>
                        <div>
                            <label htmlFor="qty" className="block text-sm font-medium text-slate-700">Quantity</label>
                            <input type="number" name="qty" id="qty" value={newVehicleData.qty} onChange={handleVehicleFormChange} required min="1" className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                        </div>
                        <div>
                            <label htmlFor="vehicleTypeId" className="block text-sm font-medium text-slate-700">Vehicle Type</label>
                            <select name="vehicleTypeId" id="vehicleTypeId" value={newVehicleData.vehicleTypeId} onChange={handleVehicleFormChange} required className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-slate-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md">
                                <option value="" disabled>Select a type</option>
                                {vehicleTypes.map(type => <option key={type.id} value={type.id}>{type.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="driverOption" className="block text-sm font-medium text-slate-700">Driver Option</label>
                            <select name="driverOption" id="driverOption" value={newVehicleData.driverOption} onChange={handleVehicleFormChange} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-slate-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md">
                                {Object.values(DriverOption).map(opt => <option key={opt} value={opt}>{opt}</option>)}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="leasePeriod" className="block text-sm font-medium text-slate-700">Lease Period (months)</label>
                            <input type="number" name="leasePeriod" id="leasePeriod" value={newVehicleData.leasePeriod} onChange={handleVehicleFormChange} min="1" placeholder="e.g., 24" className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                        </div>

                        <div className="col-span-1 md:col-span-4 flex justify-end gap-2 mt-2">
                             <button type="button" onClick={() => setIsAddingVehicle(false)} className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                                Cancel
                            </button>
                            <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                                Save Vehicle
                            </button>
                        </div>
                    </form>
                )}
                <VehicleList vehicles={tender.vehicles || []} tenderId={tender.id} onDeleteVehicle={onDeleteVehicle} vehicleTypes={vehicleTypes} />
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-4">
                     <h3 className="text-xl font-semibold text-slate-700">Sub-Tasks</h3>
                     <div className="flex items-center gap-4 flex-wrap">
                        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
                           <ViewSwitcherButton view="list" label="List" icon={<Bars3Icon className="h-5 w-5" />} />
                           <ViewSwitcherButton view="kanban" label="Board" icon={<ViewColumnsIcon className="h-5 w-5" />} />
                           <ViewSwitcherButton view="calendar" label="Calendar" icon={<CalendarDaysIcon className="h-5 w-5" />} />
                        </div>
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
                                Clear
                            </button>
                        )}
                     </div>
                      {!isAddingTask && !isReadOnly && (
                         <button
                            onClick={() => setIsAddingTask(true)}
                            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            Add Task
                        </button>
                    )}
                </div>
                 {isAddingTask && (
                    <form onSubmit={handleAddTaskSubmit} className="space-y-4 mb-6 p-4 border rounded-lg bg-slate-50">
                        <h4 className="text-lg font-medium text-slate-600">Add New Task</h4>
                        <div>
                            <label htmlFor="title" className="block text-sm font-medium text-slate-700">Title</label>
                            <input type="text" name="title" id="title" value={newTaskData.title} onChange={handleTaskFormChange} required className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                        </div>
                        <div>
                            <label htmlFor="description" className="block text-sm font-medium text-slate-700">Description</label>
                            <textarea name="description" id="description" value={newTaskData.description} onChange={handleTaskFormChange} rows={3} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label htmlFor="dueDate" className="block text-sm font-medium text-slate-700">Due Date</label>
                                <input type="date" name="dueDate" id="dueDate" value={newTaskData.dueDate} onChange={handleTaskFormChange} required className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                            </div>
                            <div>
                                <label htmlFor="assignedTo" className="block text-sm font-medium text-slate-700">Assign To</label>
                                <select name="assignedTo" id="assignedTo" value={newTaskData.assignedTo} onChange={handleTaskFormChange} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-slate-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md">
                                    <option value="">Unassigned</option>
                                    {activeEmployees.map(emp => <option key={emp.id} value={emp.id}>{emp.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label htmlFor="assignedDate" className="block text-sm font-medium text-slate-700">Assigned Date</label>
                                <input
                                    type="date"
                                    name="assignedDate"
                                    id="assignedDate"
                                    value={newTaskData.assignedDate}
                                    onChange={handleTaskFormChange}
                                    disabled={!newTaskData.assignedTo}
                                    className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:bg-slate-100 disabled:cursor-not-allowed"
                                />
                            </div>
                        </div>
                        <div className="flex justify-end gap-2">
                             <button type="button" onClick={() => setIsAddingTask(false)} className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                                Cancel
                            </button>
                            <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                                Save Task
                            </button>
                        </div>
                    </form>
                )}

                {taskView === 'list' && (
                     <TaskList
                        tasks={filteredTasks}
                        tenderId={tender.id}
                        employees={employees}
                        userRole={userRole}
                        onAssignTask={onAssignTask}
                        onAiAssignTask={onAiAssignTask}
                        onUpdateTaskStatus={onUpdateTaskStatus}
                        onUpdateTaskDetails={onUpdateTaskDetails}
                        onDeleteTask={onDeleteTask}
                        isTenderCompleted={isTenderCompleted}
                    />
                )}
                {taskView === 'kanban' && (
                    <KanbanBoard
                        tasks={filteredTasks}
                        employees={employees}
                        onUpdateTaskStatus={(taskId, newStatus) => onUpdateTaskStatus(tender.id, taskId, newStatus)}
                    />
                )}
                {taskView === 'calendar' && (
                    <CalendarView tasks={filteredTasks} employees={employees} />
                )}
            </div>
        </div>
    );
};

export default TenderDetails;