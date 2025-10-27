import React, { useState } from 'react';
import { Task, Employee } from '../types';
import { ChevronLeftIcon } from './icons/ChevronLeftIcon';
import { ChevronRightIcon } from './icons/ChevronRightIcon';

interface CalendarViewProps {
    tasks: Task[];
    employees: Employee[];
}

const CalendarView: React.FC<CalendarViewProps> = ({ tasks, employees }) => {
    const [currentDate, setCurrentDate] = useState(new Date());

    const goToNextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };

    const goToPrevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const monthName = currentDate.toLocaleString('default', { month: 'long' });
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const blanks = Array.from({ length: firstDayOfMonth });
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    const today = new Date();

    const getTasksForDay = (day: number) => {
        return tasks.filter(task => {
            const dueDate = task.dueDate;
            return dueDate.getFullYear() === year && dueDate.getMonth() === month && dueDate.getDate() === day;
        });
    };

    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    return (
        <div className="pt-4">
            <div className="flex justify-between items-center mb-4">
                <button onClick={goToPrevMonth} className="p-2 rounded-full hover:bg-slate-100">
                    <ChevronLeftIcon className="h-6 w-6 text-slate-600" />
                </button>
                <h3 className="text-lg font-semibold text-slate-700">{monthName} {year}</h3>
                <button onClick={goToNextMonth} className="p-2 rounded-full hover:bg-slate-100">
                    <ChevronRightIcon className="h-6 w-6 text-slate-600" />
                </button>
            </div>
            <div className="grid grid-cols-7 gap-px bg-slate-200 border border-slate-200">
                {daysOfWeek.map(day => (
                    <div key={day} className="text-center py-2 bg-slate-50 text-xs font-medium text-slate-500 uppercase">
                        {day}
                    </div>
                ))}
                {blanks.map((_, index) => <div key={`blank-${index}`} className="bg-slate-50"></div>)}
                {days.map(day => {
                    const isToday = today.getFullYear() === year && today.getMonth() === month && today.getDate() === day;
                    const tasksForDay = getTasksForDay(day);
                    return (
                        <div key={day} className="bg-white p-2 h-36 overflow-y-auto relative">
                            <div className={`flex items-center justify-center h-6 w-6 text-sm rounded-full ${isToday ? 'bg-indigo-600 text-white font-bold' : ''}`}>
                                {day}
                            </div>
                            <div className="mt-1 space-y-1">
                                {tasksForDay.map(task => {
                                     const employee = employees.find(e => e.id === task.assignedTo);
                                    return (
                                        <div 
                                            key={task.id} 
                                            className="bg-indigo-100 text-indigo-800 text-xs rounded p-1 flex items-center gap-1.5"
                                            title={`${task.title} - ${employee ? employee.name : 'Unassigned'}`}
                                        >
                                             {employee && <img src={employee.avatar} alt={employee.name} className="h-4 w-4 rounded-full flex-shrink-0" />}
                                            <span className="truncate">{task.title}</span>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default CalendarView;
