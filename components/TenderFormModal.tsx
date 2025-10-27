import React, { useState, useEffect } from 'react';
import { Tender } from '../types';

export type TenderFormData = Pick<Tender, 'title' | 'client' | 'startDate' | 'endDate'>;

interface TenderFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (tenderData: TenderFormData) => void;
    tenderToEdit?: Tender | null;
}

const TenderFormModal: React.FC<TenderFormModalProps> = ({ isOpen, onClose, onSubmit, tenderToEdit }) => {
    const [formData, setFormData] = useState({
        title: '',
        client: '',
        startDate: '',
        endDate: '',
    });

    useEffect(() => {
        if (tenderToEdit) {
            setFormData({
                title: tenderToEdit.title,
                client: tenderToEdit.client,
                startDate: tenderToEdit.startDate.toISOString().split('T')[0],
                endDate: tenderToEdit.endDate.toISOString().split('T')[0],
            });
        } else {
            setFormData({ title: '', client: '', startDate: '', endDate: '' });
        }
    }, [tenderToEdit, isOpen]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({
            title: formData.title,
            client: formData.client,
            startDate: new Date(formData.startDate + 'T00:00:00'),
            endDate: new Date(formData.endDate + 'T23:59:59'),
        });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg" onClick={e => e.stopPropagation()}>
                <h2 className="text-2xl font-bold text-slate-800 mb-6">
                    {tenderToEdit ? 'Edit Tender' : 'Add New Tender'}
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="title" className="block text-sm font-medium text-slate-700">Tender Title</label>
                        <input type="text" name="title" id="title" value={formData.title} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                    </div>
                    <div>
                        <label htmlFor="client" className="block text-sm font-medium text-slate-700">Client</label>
                        <input type="text" name="client" id="client" value={formData.client} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="startDate" className="block text-sm font-medium text-slate-700">Issue Date</label>
                            <input type="date" name="startDate" id="startDate" value={formData.startDate} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                        </div>
                        <div>
                            <label htmlFor="endDate" className="block text-sm font-medium text-slate-700">Due Date</label>
                            <input type="date" name="endDate" id="endDate" value={formData.endDate} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                        </div>
                    </div>
                    <div className="flex justify-end gap-2 pt-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                            Cancel
                        </button>
                        <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                            {tenderToEdit ? 'Save Changes' : 'Create Tender'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default TenderFormModal;
