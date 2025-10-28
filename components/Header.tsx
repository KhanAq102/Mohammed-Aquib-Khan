import React from 'react';
import { ChartBarIcon } from './icons/ChartBarIcon';
import { UsersIcon } from './icons/UsersIcon';
import { BriefcaseIcon } from './icons/BriefcaseIcon';
import { CogIcon } from './icons/CogIcon';
import { ListBulletIcon } from './icons/ListBulletIcon';
import { UserRole } from '../types';
import { ShieldCheckIcon } from './icons/ShieldCheckIcon';
import { UserCircleIcon } from './icons/UserCircleIcon';


interface HeaderProps {
    currentView: 'tenders' | 'performance' | 'team' | 'masters' | 'all-tasks';
    setCurrentView: (view: 'tenders' | 'performance' | 'team' | 'masters' | 'all-tasks') => void;
    userRole: UserRole;
    setUserRole: (role: UserRole) => void;
}

const Header: React.FC<HeaderProps> = ({ currentView, setCurrentView, userRole, setUserRole }) => {
    const navButtonClasses = (view: 'tenders' | 'performance' | 'team' | 'masters' | 'all-tasks') =>
        `flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
            currentView === view
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-600 hover:bg-slate-200'
        }`;

    const roleButtonClasses = (role: UserRole) => 
        `flex items-center gap-2 px-3 py-1.5 text-xs font-bold rounded-md transition-colors ${
            userRole === role
                ? 'bg-white text-indigo-600 shadow-sm'
                : 'text-slate-500 hover:bg-slate-200'
        }`;

    return (
        <header className="bg-white border-b border-slate-200 p-4 shadow-sm z-10 flex justify-between items-center">
            <h1 className="text-2xl font-bold text-slate-800">
                TenderFlow <span className="text-indigo-600">AI</span>
            </h1>
            <nav className="flex items-center gap-2 p-1 bg-slate-100 rounded-lg">
                <button onClick={() => setCurrentView('tenders')} className={navButtonClasses('tenders')}>
                    <BriefcaseIcon className="h-5 w-5" />
                    <span>Tenders</span>
                </button>
                <button onClick={() => setCurrentView('all-tasks')} className={navButtonClasses('all-tasks')}>
                    <ListBulletIcon className="h-5 w-5" />
                    <span>All Tasks</span>
                </button>
                 <button onClick={() => setCurrentView('team')} className={navButtonClasses('team')}>
                    <UsersIcon className="h-5 w-5" />
                    <span>Team</span>
                </button>
                <button onClick={() => setCurrentView('performance')} className={navButtonClasses('performance')}>
                    <ChartBarIcon className="h-5 w-5" />
                    <span>Performance</span>
                </button>
                 <button onClick={() => setCurrentView('masters')} className={navButtonClasses('masters')}>
                    <CogIcon className="h-5 w-5" />
                    <span>Masters</span>
                </button>
            </nav>
            <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-lg">
                <button onClick={() => setUserRole('admin')} className={roleButtonClasses('admin')} title="Switch to Admin View">
                    <ShieldCheckIcon className="h-5 w-5"/>
                    ADMIN
                </button>
                 <button onClick={() => setUserRole('user')} className={roleButtonClasses('user')} title="Switch to User View">
                    <UserCircleIcon className="h-5 w-5"/>
                    USER
                </button>
            </div>
        </header>
    );
};

export default Header;