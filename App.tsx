import React, { useState, useMemo, useCallback } from 'react';
import { Tender, Employee, Task, TaskStatus, Vehicle, DriverOption, Attachment, EmployeeStatus, VehicleTypeMaster, UserRole } from './types';
import Header from './components/Header';
import TenderList from './components/TenderList';
import TenderDetails from './components/TenderDetails';
import { suggestAssignee } from './services/geminiService';
import PerformanceDashboard from './components/PerformanceDashboard';
import TeamDashboard from './components/TeamDashboard';
import MastersDashboard from './components/MastersDashboard';
import TenderFormModal, { TenderFormData } from './components/TenderFormModal';
import AllTasksDashboard from './components/AllTasksDashboard';
import { ToastProvider, useToast } from './components/notifications/ToastProvider';

// Mock Data
const MOCK_EMPLOYEES: Employee[] = [
    { id: 'emp-1', name: 'Alice Johnson', avatar: 'https://i.pravatar.cc/150?u=emp-1', employeeCode: 'EC001', jobTitle: 'Legal Counsel', status: EmployeeStatus.Active },
    { id: 'emp-2', name: 'Bob Williams', avatar: 'https://i.pravatar.cc/150?u=emp-2', employeeCode: 'EC002', jobTitle: 'Project Manager', status: EmployeeStatus.Active },
    { id: 'emp-3', name: 'Charlie Brown', avatar: 'https://i.pravatar.cc/150?u=emp-3', employeeCode: 'EC003', jobTitle: 'Lead Engineer', status: EmployeeStatus.Active },
    { id: 'emp-4', name: 'Diana Miller', avatar: 'https://i.pravatar.cc/150?u=emp-4', employeeCode: 'EC004', jobTitle: 'Procurement Specialist', status: EmployeeStatus.Inactive },
    { id: 'emp-5', name: 'Ethan Davis', avatar: 'https://i.pravatar.cc/150?u=emp-5', employeeCode: 'EC005', jobTitle: 'Financial Analyst', status: EmployeeStatus.Active },
];

const MOCK_VEHICLE_TYPES: VehicleTypeMaster[] = [
    { id: 'vt-1', name: 'Car' },
    { id: 'vt-2', name: 'Truck' },
    { id: 'vt-3', name: 'Van' },
    { id: 'vt-4', name: 'Heavy Equipment' },
];


const MOCK_TENDERS: Tender[] = [
    {
        id: 'tnd-1',
        title: 'City Bridge Infrastructure Renewal',
        client: 'Metropolis City Council',
        startDate: new Date('2024-08-01'),
        endDate: new Date('2024-12-15'),
        tasks: [
            { id: 'task-1-1', title: 'Review Legal Framework', description: 'Analyze all relevant local and national laws for bridge construction.', dueDate: new Date('2024-08-20'), status: TaskStatus.Done, assignedTo: 'emp-1', assignedDate: new Date('2024-08-05'), completionDate: new Date('2024-08-18'), assignmentHistory: [{ assignedTo: 'emp-1', assignedDate: new Date('2024-08-05') }] },
            { id: 'task-1-2', title: 'Initial Risk Assessment', description: 'Identify potential risks related to project timeline, budget, and safety.', dueDate: new Date('2024-09-05'), status: TaskStatus.InProgress, assignedTo: 'emp-2', assignedDate: new Date('2024-08-22'), assignmentHistory: [{ assignedTo: 'emp-2', assignedDate: new Date('2024-08-22') }] },
            { id: 'task-1-3', title: 'Draft Technical Specifications', description: 'Prepare detailed engineering specs for materials and construction methods.', dueDate: new Date('2024-09-30'), status: TaskStatus.Todo, assignmentHistory: [] },
            { id: 'task-1-4', title: 'Vendor Market Research', description: 'Identify and vet potential suppliers for steel and concrete.', dueDate: new Date('2024-10-15'), status: TaskStatus.Todo, assignmentHistory: [] },
        ],
        vehicles: [
            { id: 'veh-1', make: 'Caterpillar', model: '320D L', modelYear: 2022, qty: 2, vehicleTypeId: 'vt-4', driverOption: DriverOption.WithManpower, leasePeriod: 36 },
            { id: 'veh-2', make: 'Ford', model: 'F-550', modelYear: 2023, qty: 5, vehicleTypeId: 'vt-2', driverOption: DriverOption.SelfDrive, leasePeriod: 24 },
        ],
        attachments: [],
        remarks: 'Initial assessment is complete. Awaiting the final structural engineering report. There is a potential for budget overrun due to recent fluctuations in steel prices. Procurement team is monitoring the market closely.'
    },
    {
        id: 'tnd-2',
        title: 'Municipal IT System Overhaul',
        client: 'Springfield County',
        startDate: new Date('2024-09-01'),
        endDate: new Date('2025-02-28'),
        tasks: [
            { id: 'task-2-1', title: 'Analyze Existing Infrastructure', description: 'Document current hardware, software, and network configurations.', dueDate: new Date('2024-09-25'), status: TaskStatus.InProgress, assignedTo: 'emp-3', assignedDate: new Date('2024-09-05'), assignmentHistory: [{ assignedTo: 'emp-3', assignedDate: new Date('2024-09-05') }] },
            { id: 'task-2-2', title: 'Develop Budget Proposal', description: 'Create a detailed cost analysis for the new IT system, including hardware, software licenses, and labor.', dueDate: new Date('2024-10-20'), status: TaskStatus.Todo, assignmentHistory: [] },
            { id: 'task-2-3', title: 'Evaluate Supplier Contracts', description: 'Review contracts from potential hardware and software vendors.', dueDate: new Date('2024-11-10'), status: TaskStatus.InProgress, assignedTo: 'emp-1', assignedDate: new Date('2024-10-25'), assignmentHistory: [{ assignedTo: 'emp-4', assignedDate: new Date('2024-10-21') }, { assignedTo: 'emp-1', assignedDate: new Date('2024-10-25') }] },
        ],
        attachments: [],
        remarks: 'The client has requested a phased rollout. Phase 1 will focus on core infrastructure (servers, network). Phase 2 will cover user-facing applications and data migration. A meeting is scheduled for next week to finalize the Phase 1 scope.'
    },
];

const AppContent: React.FC = () => {
    const [tenders, setTenders] = useState<Tender[]>(MOCK_TENDERS);
    const [employees, setEmployees] = useState<Employee[]>(MOCK_EMPLOYEES);
    const [vehicleTypes, setVehicleTypes] = useState<VehicleTypeMaster[]>(MOCK_VEHICLE_TYPES);
    const [selectedTenderId, setSelectedTenderId] = useState<string | null>(MOCK_TENDERS[0]?.id || null);
    const [currentView, setCurrentView] = useState<'tenders' | 'performance' | 'team' | 'masters' | 'all-tasks'>('tenders');
    const [isTenderModalOpen, setIsTenderModalOpen] = useState(false);
    const [editingTender, setEditingTender] = useState<Tender | null>(null);
    const [userRole, setUserRole] = useState<UserRole>('admin');
    const { showToast } = useToast();

    const selectedTender = useMemo(() => {
        return tenders.find(t => t.id === selectedTenderId) || null;
    }, [tenders, selectedTenderId]);

    const handleAddTender = useCallback((tenderData: TenderFormData) => {
        const newTender: Tender = {
            ...tenderData,
            id: `tnd-${Date.now()}`,
            tasks: [],
            vehicles: [],
            attachments: [],
            remarks: '',
        };
        setTenders(prev => [newTender, ...prev]);
        setSelectedTenderId(newTender.id);
        showToast('Tender created successfully!', 'success');
    }, [showToast]);

    const handleUpdateTender = useCallback((tenderData: TenderFormData & { id: string }) => {
        setTenders(prev =>
            prev.map(t =>
                t.id === tenderData.id
                    ? {
                          ...t,
                          title: tenderData.title,
                          client: tenderData.client,
                          startDate: tenderData.startDate,
                          endDate: tenderData.endDate,
                      }
                    : t
            )
        );
        showToast('Tender updated successfully!', 'success');
    }, [showToast]);

    const handleDeleteTender = useCallback((tenderId: string) => {
        if (window.confirm("Are you sure you want to delete this tender and all its associated data? This action cannot be undone.")) {
            setTenders(prev => {
                const newTenders = prev.filter(t => t.id !== tenderId);
                if (selectedTenderId === tenderId) {
                    setSelectedTenderId(newTenders[0]?.id || null);
                }
                return newTenders;
            });
            showToast('Tender deleted successfully.', 'success');
        }
    }, [selectedTenderId, showToast]);

    const handleDuplicateTender = useCallback((tenderId: string) => {
        const originalTender = tenders.find(t => t.id === tenderId);
        if (!originalTender) {
            showToast('Could not find the tender to duplicate.', 'error');
            return;
        }

        const newTender: Tender = {
            id: `tnd-${Date.now()}`,
            title: `Copy of ${originalTender.title}`,
            client: '', // Reset client
            startDate: new Date(), // Reset dates to today
            endDate: new Date(),
            tasks: originalTender.tasks.map(task => ({
                ...task, // Copy title, description, dueDate
                id: `task-${Date.now()}-${Math.random()}`, // New unique ID for the task
                status: TaskStatus.Todo,
                assignedTo: undefined,
                assignedDate: undefined,
                completionDate: undefined,
                assignmentHistory: [],
            })),
            vehicles: [], // Reset vehicles
            attachments: [], // Reset attachments
            remarks: '', // Reset remarks
            completionDate: undefined,
        };

        setTenders(prev => [newTender, ...prev]);
        setSelectedTenderId(newTender.id);
        showToast('Tender duplicated successfully!', 'success');
    }, [tenders, showToast]);
    
    // Modal Handlers
    const handleOpenAddTenderModal = () => {
        setEditingTender(null);
        setIsTenderModalOpen(true);
    };

    const handleOpenEditTenderModal = (tender: Tender) => {
        setEditingTender(tender);
        setIsTenderModalOpen(true);
    };
    
    const handleCloseTenderModal = () => {
        setIsTenderModalOpen(false);
        setEditingTender(null);
    }

    const handleTenderFormSubmit = (tenderData: TenderFormData) => {
        if (editingTender) {
            handleUpdateTender({ ...tenderData, id: editingTender.id });
        } else {
            handleAddTender(tenderData);
        }
        handleCloseTenderModal();
    };

    const handleUpdateTask = useCallback((tenderId: string, updatedTask: Task) => {
        setTenders(prevTenders =>
            prevTenders.map(tender => {
                if (tender.id === tenderId) {
                    return {
                        ...tender,
                        tasks: tender.tasks.map(task =>
                            task.id === updatedTask.id ? updatedTask : task
                        ),
                    };
                }
                return tender;
            })
        );
    }, []);
    
    const handleAddTask = useCallback((tenderId: string, taskData: Omit<Task, 'id' | 'status' | 'completionDate'>) => {
        setTenders(prevTenders =>
            prevTenders.map(tender => {
                if (tender.id === tenderId) {
                     const assignedDate = taskData.assignedTo
                        ? (taskData.assignedDate ? new Date(taskData.assignedDate) : new Date())
                        : undefined;
                    
                    const newTask: Task = {
                        ...taskData,
                        id: `task-${Date.now()}`,
                        status: taskData.assignedTo ? TaskStatus.InProgress : TaskStatus.Todo,
                        assignedDate: assignedDate,
                        assignmentHistory: taskData.assignedTo && assignedDate
                            ? [{ assignedTo: taskData.assignedTo, assignedDate: assignedDate }]
                            : [],
                    };
                    return { ...tender, tasks: [...tender.tasks, newTask] };
                }
                return tender;
            })
        );
        showToast('Task added successfully!', 'success');
    }, [showToast]);

    const handleUpdateTaskDetails = useCallback((tenderId: string, taskId: string, taskData: Pick<Task, 'title' | 'description' | 'dueDate'>) => {
        setTenders(prevTenders =>
            prevTenders.map(tender => {
                if (tender.id === tenderId) {
                    return {
                        ...tender,
                        tasks: tender.tasks.map(task =>
                            task.id === taskId ? { ...task, ...taskData } : task
                        ),
                    };
                }
                return tender;
            })
        );
        showToast('Task details updated.', 'success');
    }, [showToast]);

    const handleDeleteTask = useCallback((tenderId: string, taskId: string) => {
        setTenders(prevTenders =>
            prevTenders.map(tender => {
                if (tender.id === tenderId) {
                    const updatedTasks = tender.tasks.filter(t => t.id !== taskId);
                    return { ...tender, tasks: updatedTasks };
                }
                return tender;
            })
        );
        showToast('Task deleted.', 'success');
    }, [showToast]);

    const handleAssignTask = useCallback((tenderId: string, taskId: string, employeeId: string | undefined) => {
        const tender = tenders.find(t => t.id === tenderId);
        if (!tender) return;

        const task = tender.tasks.find(t => t.id === taskId);
        if (!task) return;

        if (task.assignedTo === employeeId) {
            return;
        }

        const updatedTask: Task = { ...task };

        if (employeeId) {
            const newAssignmentDate = new Date();
            const newHistoryEntry = { assignedTo: employeeId, assignedDate: newAssignmentDate };
            
            updatedTask.assignedTo = employeeId;
            updatedTask.assignedDate = newAssignmentDate;
            updatedTask.assignmentHistory = [...(task.assignmentHistory || []), newHistoryEntry];
            
            if (updatedTask.status === TaskStatus.Todo) {
                updatedTask.status = TaskStatus.InProgress;
            }
        } else {
            updatedTask.assignedTo = undefined;
            updatedTask.assignedDate = undefined;
            updatedTask.status = TaskStatus.Todo;
            updatedTask.completionDate = undefined;
        }

        handleUpdateTask(tenderId, updatedTask);
    }, [tenders, handleUpdateTask]);

    const handleUpdateTaskStatus = useCallback((tenderId: string, taskId: string, newStatus: TaskStatus) => {
        setTenders(prevTenders => prevTenders.map(tender => {
            if (tender.id === tenderId) {
                const updatedTender = { ...tender };
                const taskIndex = updatedTender.tasks.findIndex(t => t.id === taskId);
                if (taskIndex === -1) return tender;

                const updatedTasks = [...updatedTender.tasks];
                const taskToUpdate = { ...updatedTasks[taskIndex] };

                taskToUpdate.status = newStatus;
                taskToUpdate.completionDate = newStatus === TaskStatus.Done ? (taskToUpdate.completionDate || new Date()) : undefined;
                updatedTasks[taskIndex] = taskToUpdate;

                updatedTender.tasks = updatedTasks;
                
                const allTasksDone = updatedTender.tasks.length > 0 && updatedTender.tasks.every(t => t.status === TaskStatus.Done);

                if (allTasksDone) {
                    updatedTender.completionDate = updatedTender.tasks.reduce((latest, currentTask) => {
                        return currentTask.completionDate! > latest ? currentTask.completionDate! : latest;
                    }, new Date(0));
                } else {
                    updatedTender.completionDate = undefined;
                }
                
                return updatedTender;
            }
            return tender;
        }));

        showToast(`Task status updated to "${newStatus.charAt(0).toUpperCase() + newStatus.slice(1)}".`, 'info');
    }, [showToast]);

    const handleAddVehicle = useCallback((tenderId: string, vehicleData: Omit<Vehicle, 'id'>) => {
        setTenders(prevTenders =>
            prevTenders.map(tender => {
                if (tender.id === tenderId) {
                    const newVehicle: Vehicle = {
                        ...vehicleData,
                        id: `veh-${Date.now()}`
                    };
                    const updatedVehicles = [...(tender.vehicles || []), newVehicle];
                    return { ...tender, vehicles: updatedVehicles };
                }
                return tender;
            })
        );
        showToast('Vehicle added successfully!', 'success');
    }, [showToast]);

    const handleDeleteVehicle = useCallback((tenderId: string, vehicleId: string) => {
        setTenders(prevTenders =>
            prevTenders.map(tender => {
                if (tender.id === tenderId) {
                    const updatedVehicles = (tender.vehicles || []).filter(v => v.id !== vehicleId);
                    return { ...tender, vehicles: updatedVehicles };
                }
                return tender;
            })
        );
        showToast('Vehicle removed successfully.', 'success');
    }, [showToast]);
    
    const handleAddAttachment = useCallback((tenderId: string, attachmentData: Omit<Attachment, 'id'>) => {
        setTenders(prevTenders =>
            prevTenders.map(tender => {
                if (tender.id === tenderId) {
                    const newAttachment: Attachment = {
                        ...attachmentData,
                        id: `att-${Date.now()}`
                    };
                    const updatedAttachments = [...(tender.attachments || []), newAttachment];
                    return { ...tender, attachments: updatedAttachments };
                }
                return tender;
            })
        );
        showToast('Attachment added successfully!', 'success');
    }, [showToast]);

    const handleDeleteAttachment = useCallback((tenderId: string, attachmentId: string) => {
        setTenders(prevTenders =>
            prevTenders.map(tender => {
                if (tender.id === tenderId) {
                    const updatedAttachments = (tender.attachments || []).filter(a => a.id !== attachmentId);
                    return { ...tender, attachments: updatedAttachments };
                }
                return tender;
            })
        );
        showToast('Attachment removed successfully.', 'success');
    }, [showToast]);
    
    const handleUpdateTenderRemarks = useCallback((tenderId: string, remarks: string) => {
        setTenders(prevTenders =>
            prevTenders.map(tender =>
                tender.id === tenderId ? { ...tender, remarks } : tender
            )
        );
        showToast('Tender remarks updated.', 'success');
    }, [showToast]);

    const handleAddEmployee = useCallback((employeeData: Omit<Employee, 'id' | 'avatar' | 'status'>) => {
        const newId = `emp-${Date.now()}`;
        const newEmployee: Employee = {
            ...employeeData,
            id: newId,
            avatar: `https://i.pravatar.cc/150?u=${newId}`,
            status: EmployeeStatus.Active,
        };
        setEmployees(prev => [...prev, newEmployee]);
        showToast('Employee added successfully!', 'success');
    }, [showToast]);

    const handleUpdateEmployee = useCallback((updatedEmployee: Employee) => {
        setEmployees(prev => prev.map(emp => emp.id === updatedEmployee.id ? updatedEmployee : emp));
        showToast('Employee details updated.', 'success');
    }, [showToast]);

    const handleAddVehicleType = useCallback((name: string) => {
        const newVehicleType: VehicleTypeMaster = {
            id: `vt-${Date.now()}`,
            name,
        };
        setVehicleTypes(prev => [...prev, newVehicleType]);
        showToast('Vehicle type added successfully!', 'success');
    }, [showToast]);

    const handleUpdateVehicleType = useCallback((updatedVehicleType: VehicleTypeMaster) => {
        setVehicleTypes(prev => prev.map(vt => vt.id === updatedVehicleType.id ? updatedVehicleType : vt));
        showToast('Vehicle type updated successfully!', 'success');
    }, [showToast]);

    const handleDeleteVehicleType = useCallback((vehicleTypeId: string) => {
        if (window.confirm("Are you sure you want to delete this vehicle type? This action cannot be undone.")) {
            setVehicleTypes(prev => prev.filter(vt => vt.id !== vehicleTypeId));
            showToast('Vehicle type deleted.', 'success');
        }
    }, [showToast]);


    const handleAiAssignTask = useCallback(async (tenderId: string, taskId: string): Promise<{ employeeId: string; reason: string; } | null> => {
        const tender = tenders.find(t => t.id === tenderId);
        const task = tender?.tasks.find(t => t.id === taskId);
        const activeEmployees = employees.filter(e => e.status === EmployeeStatus.Active);

        if (task) {
            try {
                const suggestion = await suggestAssignee(task, activeEmployees);
                handleAssignTask(tenderId, taskId, suggestion.employeeId);
                const employeeName = employees.find(e => e.id === suggestion.employeeId)?.name || 'the selected employee';
                showToast(`AI successfully assigned task to ${employeeName}.`, 'success');
                return suggestion;
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : "An unknown AI error occurred.";
                showToast(errorMessage, 'error');
                return null;
            }
        }
        return null;
    }, [tenders, employees, handleAssignTask, showToast]);

    const handleViewTender = useCallback((tenderId: string) => {
        const tenderExists = tenders.some(t => t.id === tenderId);
        if (tenderExists) {
            setSelectedTenderId(tenderId);
            setCurrentView('tenders');
        }
    }, [tenders]);

    const renderView = () => {
        switch (currentView) {
            case 'tenders':
                return (
                    <div className="flex flex-1 overflow-hidden">
                        <aside className="w-1/4 xl:w-1/5 bg-white border-r border-slate-200 overflow-y-auto">
                            <TenderList
                                tenders={tenders}
                                selectedTenderId={selectedTenderId}
                                onSelectTender={setSelectedTenderId}
                                onAddTender={handleOpenAddTenderModal}
                                onDeleteTender={handleDeleteTender}
                                onDuplicateTender={handleDuplicateTender}
                            />
                        </aside>
                        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
                            {selectedTender ? (
                                <TenderDetails
                                    tender={selectedTender}
                                    employees={employees}
                                    vehicleTypes={vehicleTypes}
                                    userRole={userRole}
                                    onAssignTask={handleAssignTask}
                                    onAiAssignTask={handleAiAssignTask}
                                    onUpdateTaskStatus={handleUpdateTaskStatus}
                                    onAddVehicle={handleAddVehicle}
                                    onDeleteVehicle={handleDeleteVehicle}
                                    onAddAttachment={handleAddAttachment}
                                    onDeleteAttachment={handleDeleteAttachment}
                                    onAddTask={handleAddTask}
                                    onUpdateTaskDetails={handleUpdateTaskDetails}
                                    onDeleteTask={handleDeleteTask}
                                    onUpdateTenderRemarks={handleUpdateTenderRemarks}
                                    onEditTender={handleOpenEditTenderModal}
                                />
                            ) : (
                                <div className="flex items-center justify-center h-full">
                                    <p className="text-slate-500 text-lg">Select a tender to view its details.</p>
                                </div>
                            )}
                        </main>
                    </div>
                );
            case 'all-tasks':
                return (
                    <div className="flex-1 overflow-y-auto bg-slate-50">
                        <AllTasksDashboard 
                            tenders={tenders} 
                            employees={employees}
                            onViewTender={handleViewTender}
                            onUpdateTaskStatus={handleUpdateTaskStatus}
                        />
                    </div>
                );
            case 'performance':
                return (
                    <div className="flex-1 overflow-y-auto bg-slate-50">
                        <PerformanceDashboard tenders={tenders} employees={employees} />
                    </div>
                );
            case 'team':
                 return (
                    <div className="flex-1 overflow-y-auto bg-slate-50">
                        <TeamDashboard employees={employees} onAddEmployee={handleAddEmployee} onUpdateEmployee={handleUpdateEmployee} />
                    </div>
                );
            case 'masters':
                return (
                    <div className="flex-1 overflow-y-auto bg-slate-50">
                        <MastersDashboard 
                            vehicleTypes={vehicleTypes}
                            onAddVehicleType={handleAddVehicleType}
                            onUpdateVehicleType={handleUpdateVehicleType}
                            onDeleteVehicleType={handleDeleteVehicleType}
                        />
                    </div>
                );
            default:
                return null;
        }
    }

    return (
        <div className="flex flex-col h-screen font-sans">
            <Header currentView={currentView} setCurrentView={setCurrentView} userRole={userRole} setUserRole={setUserRole} />
            {renderView()}
            <TenderFormModal
                isOpen={isTenderModalOpen}
                onClose={handleCloseTenderModal}
                onSubmit={handleTenderFormSubmit}
                tenderToEdit={editingTender}
            />
        </div>
    );
};


const App: React.FC = () => {
    return (
        <ToastProvider>
            <AppContent />
        </ToastProvider>
    );
};

export default App;