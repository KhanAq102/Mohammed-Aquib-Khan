import React, { useState } from 'react';
import { Tender } from '../types';
import { ChevronRightIcon } from './icons/ChevronRightIcon';
import { PlusIcon } from './icons/PlusIcon';
import { TrashIcon } from './icons/TrashIcon';
import { CheckBadgeIcon } from './icons/CheckBadgeIcon';
import { ClipboardDocumentIcon } from './icons/ClipboardDocumentIcon';

interface TenderListProps {
    tenders: Tender[];
    selectedTenderId: string | null;
    onSelectTender: (id: string) => void;
    onAddTender: () => void;
    onDeleteTender: (id: string) => void;
    onDuplicateTender: (id: string) => void;
}

const TenderList: React.FC<TenderListProps> = ({ tenders, selectedTenderId, onSelectTender, onAddTender, onDeleteTender, onDuplicateTender }) => {
    const [searchQuery, setSearchQuery] = useState('');

    const filteredTenders = tenders.filter(tender =>
        tender.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="p-4">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-slate-700">Tenders</h2>
                <button
                    onClick={onAddTender}
                    title="Add New Tender"
                    className="flex items-center justify-center h-8 w-8 text-indigo-600 bg-indigo-100 rounded-lg hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                >
                    <PlusIcon className="h-5 w-5" />
                </button>
            </div>
             <div className="mb-4">
                <input
                    type="search"
                    placeholder="Search tenders..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-slate-100 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
            </div>
            <ul className="space-y-2">
                {filteredTenders.map((tender) => {
                    const isSelected = tender.id === selectedTenderId;
                    return (
                        <li key={tender.id} className="group relative">
                            <button
                                onClick={() => onSelectTender(tender.id)}
                                className={`w-full text-left p-3 rounded-lg transition-all duration-200 flex justify-between items-center ${
                                    isSelected
                                        ? 'bg-indigo-600 text-white shadow-md'
                                        : 'bg-slate-100 hover:bg-indigo-100 text-slate-800'
                                }`}
                            >
                                <div className="pr-16">
                                    <div className="font-semibold truncate flex items-center gap-2">
                                        {tender.completionDate && <span title="Completed"><CheckBadgeIcon className={`h-5 w-5 flex-shrink-0 ${isSelected ? 'text-white' : 'text-green-500'}`} /></span>}
                                        <span className="truncate">{tender.title}</span>
                                    </div>
                                    <p className={`text-sm ${isSelected ? 'text-indigo-200' : 'text-slate-500'} truncate`}>{tender.client}</p>
                                </div>
                                {isSelected && <ChevronRightIcon className="h-5 w-5 flex-shrink-0" />}
                            </button>
                             <div className={`absolute top-1/2 -translate-y-1/2 right-3 flex items-center gap-2 transition-opacity ${isSelected ? 'opacity-0' : 'opacity-0 group-hover:opacity-100'}`}>
                                <button
                                    onClick={(e) => { e.stopPropagation(); onDuplicateTender(tender.id); }}
                                    title="Duplicate Tender"
                                    className="p-1.5 rounded-full bg-slate-200 hover:bg-indigo-100 text-slate-500 hover:text-indigo-600"
                                >
                                    <ClipboardDocumentIcon className="h-4 w-4" />
                                </button>
                                <button
                                    onClick={(e) => { e.stopPropagation(); onDeleteTender(tender.id); }}
                                    title="Delete Tender"
                                    className="p-1.5 rounded-full bg-slate-200 hover:bg-red-100 text-slate-500 hover:text-red-600"
                                >
                                    <TrashIcon className="h-4 w-4" />
                                </button>
                            </div>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
};

export default TenderList;