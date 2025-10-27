import React, { useState } from 'react';
import { Employee, EmployeeStatus } from '../types';
import { PencilIcon } from './icons/PencilIcon';
import { TrashIcon } from './icons/TrashIcon'; // Placeholder, not used for delete yet

interface TeamDashboardProps {
    employees: Employee[];
    onAddEmployee: (employeeData: Omit<Employee, 'id' | 'avatar' | 'status'>) => void;
    onUpdateEmployee: (employee: Employee) => void;
}

const TeamDashboard: React.FC<TeamDashboardProps> = ({ employees, onAddEmployee, onUpdateEmployee }) => {
    const [isAddingEmployee, setIsAddingEmployee] = useState(false);
    const [newEmployeeData, setNewEmployeeData] = useState({ name: '', employeeCode: '', jobTitle: '' });
    const [editingEmployeeId, setEditingEmployeeId] = useState<string | null>(null);
    const [editFormData, setEditFormData] = useState({ name: '', employeeCode: '', jobTitle: '' });

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setNewEmployeeData(prev => ({ ...prev, [name]: value }));
    };
    
    const handleEditFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setEditFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleAddEmployeeSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newEmployeeData.name || !newEmployeeData.employeeCode || !newEmployeeData.jobTitle) return;
        
        onAddEmployee({
            name: newEmployeeData.name,
            employeeCode: newEmployeeData.employeeCode,
            jobTitle: newEmployeeData.jobTitle,
        });

        setNewEmployeeData({ name: '', employeeCode: '', jobTitle: '' });
        setIsAddingEmployee(false);
    };
    
    const handleEditClick = (employee: Employee) => {
        setEditingEmployeeId(employee.id);
        setEditFormData({ name: employee.name, employeeCode: employee.employeeCode, jobTitle: employee.jobTitle });
    };

    const handleCancelEdit = () => {
        setEditingEmployeeId(null);
    };

    const handleSaveEdit = (employee: Employee) => {
        if (!editFormData.name || !editFormData.employeeCode || !editFormData.jobTitle) return;
        const updatedEmployee = {
            ...employee,
            name: editFormData.name,
            employeeCode: editFormData.employeeCode,
            jobTitle: editFormData.jobTitle,
        };
        onUpdateEmployee(updatedEmployee);
        setEditingEmployeeId(null);
    };

    const handleToggleStatus = (employee: Employee) => {
        const newStatus = employee.status === EmployeeStatus.Active ? EmployeeStatus.Inactive : EmployeeStatus.Active;
        onUpdateEmployee({ ...employee, status: newStatus });
    };

    const statusBadgeClasses = {
        [EmployeeStatus.Active]: 'bg-green-100 text-green-800',
        [EmployeeStatus.Inactive]: 'bg-slate-200 text-slate-800',
    };

    return (
        <div className="p-4 sm:p-6 lg:p-8 space-y-8">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-slate-700">Team Management</h2>
                    {!isAddingEmployee && (
                        <button
                            onClick={() => setIsAddingEmployee(true)}
                            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            Add Employee
                        </button>
                    )}
                </div>

                {isAddingEmployee && (
                    <form onSubmit={handleAddEmployeeSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 p-4 border rounded-lg bg-slate-50">
                        <div className="col-span-1 md:col-span-3 text-lg font-medium text-slate-600">Add New Employee</div>
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-slate-700">Full Name</label>
                            <input type="text" name="name" id="name" value={newEmployeeData.name} onChange={handleFormChange} required className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                        </div>
                        <div>
                            <label htmlFor="employeeCode" className="block text-sm font-medium text-slate-700">Employee Code</label>
                            <input type="text" name="employeeCode" id="employeeCode" value={newEmployeeData.employeeCode} onChange={handleFormChange} required className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                        </div>
                        <div>
                            <label htmlFor="jobTitle" className="block text-sm font-medium text-slate-700">Job Title</label>
                            <input type="text" name="jobTitle" id="jobTitle" value={newEmployeeData.jobTitle} onChange={handleFormChange} required className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                        </div>
                        <div className="col-span-1 md:col-span-3 flex justify-end gap-2">
                            <button type="button" onClick={() => setIsAddingEmployee(false)} className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                                Cancel
                            </button>
                            <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                                Save Employee
                            </button>
                        </div>
                    </form>
                )}

                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Employee</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Employee Code</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Job Title</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                                <th scope="col" className="relative px-6 py-3">
                                    <span className="sr-only">Actions</span>
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-200">
                            {employees.map((employee) => (
                                <tr key={employee.id}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0 h-10 w-10">
                                                <img className="h-10 w-10 rounded-full" src={employee.avatar} alt={employee.name} />
                                            </div>
                                            <div className="ml-4">
                                                {editingEmployeeId === employee.id ? (
                                                     <input type="text" name="name" value={editFormData.name} onChange={handleEditFormChange} className="w-full px-2 py-1 border border-slate-300 rounded-md"/>
                                                ) : (
                                                    <div className="text-sm font-medium text-slate-900">{employee.name}</div>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                                         {editingEmployeeId === employee.id ? (
                                            <input type="text" name="employeeCode" value={editFormData.employeeCode} onChange={handleEditFormChange} className="w-full px-2 py-1 border border-slate-300 rounded-md"/>
                                        ) : (
                                            employee.employeeCode
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                                         {editingEmployeeId === employee.id ? (
                                            <input type="text" name="jobTitle" value={editFormData.jobTitle} onChange={handleEditFormChange} className="w-full px-2 py-1 border border-slate-300 rounded-md"/>
                                        ) : (
                                            employee.jobTitle
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusBadgeClasses[employee.status]}`}>
                                            {employee.status.charAt(0).toUpperCase() + employee.status.slice(1)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        {editingEmployeeId === employee.id ? (
                                            <div className="flex items-center gap-2">
                                                <button onClick={handleCancelEdit} className="text-slate-600 hover:text-slate-900">Cancel</button>
                                                <button onClick={() => handleSaveEdit(employee)} className="text-indigo-600 hover:text-indigo-900">Save</button>
                                            </div>
                                        ) : (
                                            <div className="flex items-center justify-end gap-4">
                                                 <button onClick={() => handleToggleStatus(employee)} className="text-slate-500 hover:text-slate-800" title={`Set to ${employee.status === EmployeeStatus.Active ? 'Inactive' : 'Active'}`}>{employee.status === EmployeeStatus.Active ? 'Deactivate' : 'Activate'}</button>
                                                <button onClick={() => handleEditClick(employee)} className="text-indigo-600 hover:text-indigo-900" title="Edit Employee">
                                                    <PencilIcon className="h-5 w-5" />
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default TeamDashboard;