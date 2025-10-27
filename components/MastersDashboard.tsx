import React, { useState } from 'react';
import { VehicleTypeMaster } from '../types';
import { PencilIcon } from './icons/PencilIcon';
import { TrashIcon } from './icons/TrashIcon';

interface MastersDashboardProps {
    vehicleTypes: VehicleTypeMaster[];
    onAddVehicleType: (name: string) => void;
    onUpdateVehicleType: (vehicleType: VehicleTypeMaster) => void;
    onDeleteVehicleType: (id: string) => void;
}

const MastersDashboard: React.FC<MastersDashboardProps> = ({ vehicleTypes, onAddVehicleType, onUpdateVehicleType, onDeleteVehicleType }) => {
    const [isAdding, setIsAdding] = useState(false);
    const [newItemName, setNewItemName] = useState('');
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editName, setEditName] = useState('');

    const handleAddSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newItemName.trim()) return;
        onAddVehicleType(newItemName.trim());
        setNewItemName('');
        setIsAdding(false);
    };
    
    const handleEditClick = (item: VehicleTypeMaster) => {
        setEditingId(item.id);
        setEditName(item.name);
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setEditName('');
    };

    const handleSaveEdit = (id: string) => {
        if (!editName.trim()) return;
        onUpdateVehicleType({ id, name: editName.trim() });
        handleCancelEdit();
    };

    return (
        <div className="p-4 sm:p-6 lg:p-8 space-y-8">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-slate-700">Vehicle Type Management</h2>
                    {!isAdding && (
                        <button
                            onClick={() => setIsAdding(true)}
                            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            Add Vehicle Type
                        </button>
                    )}
                </div>

                {isAdding && (
                    <form onSubmit={handleAddSubmit} className="flex gap-4 mb-6 p-4 border rounded-lg bg-slate-50 items-end">
                        <div className="flex-grow">
                            <label htmlFor="name" className="block text-sm font-medium text-slate-700">Type Name</label>
                            <input type="text" name="name" id="name" value={newItemName} onChange={(e) => setNewItemName(e.target.value)} required className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                        </div>
                        <div className="flex justify-end gap-2">
                            <button type="button" onClick={() => setIsAdding(false)} className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                                Cancel
                            </button>
                            <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                                Save
                            </button>
                        </div>
                    </form>
                )}

                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Name</th>
                                <th scope="col" className="relative px-6 py-3">
                                    <span className="sr-only">Actions</span>
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-200">
                            {vehicleTypes.map((item) => (
                                <tr key={item.id}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {editingId === item.id ? (
                                            <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} className="w-full px-2 py-1 border border-slate-300 rounded-md"/>
                                        ) : (
                                            <div className="text-sm font-medium text-slate-900">{item.name}</div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        {editingId === item.id ? (
                                            <div className="flex items-center justify-end gap-4">
                                                <button onClick={handleCancelEdit} className="text-slate-600 hover:text-slate-900">Cancel</button>
                                                <button onClick={() => handleSaveEdit(item.id)} className="text-indigo-600 hover:text-indigo-900">Save</button>
                                            </div>
                                        ) : (
                                            <div className="flex items-center justify-end gap-4">
                                                <button onClick={() => handleEditClick(item)} className="text-indigo-600 hover:text-indigo-900" title="Edit">
                                                    <PencilIcon className="h-5 w-5" />
                                                </button>
                                                <button onClick={() => onDeleteVehicleType(item.id)} className="text-red-600 hover:text-red-900" title="Delete">
                                                    <TrashIcon className="h-5 w-5" />
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {vehicleTypes.length === 0 && (
                        <div className="text-center py-10">
                            <p className="text-slate-500">No vehicle types found. Add one to get started.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MastersDashboard;