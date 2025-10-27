import React, { useState, useMemo } from 'react';
import { Tender, Employee, PerformanceStats, TaskStatus } from '../types';
import { isTaskCompletedOnTime, calculateDurationInDays } from '../utils/dateUtils';

interface PerformanceDashboardProps {
    tenders: Tender[];
    employees: Employee[];
}

const PerformanceDashboard: React.FC<PerformanceDashboardProps> = ({ tenders, employees }) => {
    const [startDate, setStartDate] = useState<string>('');
    const [endDate, setEndDate] = useState<string>('');

    const performanceData: PerformanceStats[] = useMemo(() => {
        const start = startDate ? new Date(startDate + 'T00:00:00') : null;
        const end = endDate ? new Date(endDate + 'T23:59:59') : null;

        const completedTasks = tenders
            .flatMap(t => t.tasks)
            .filter(task => {
                if (task.status !== TaskStatus.Done || !task.completionDate) return false;
                if (start && task.completionDate < start) return false;
                if (end && task.completionDate > end) return false;
                return true;
            });

        const statsByEmployee = employees.map(employee => {
            const employeeTasks = completedTasks.filter(task => task.assignedTo === employee.id);
            const totalCompleted = employeeTasks.length;

            if (totalCompleted === 0) {
                return {
                    employee,
                    totalCompleted: 0,
                    completedOnTime: 0,
                    completedLate: 0,
                    onTimeRate: 0,
                    totalTimeAssigned: 0,
                    totalTimeTaken: 0,
                };
            }

            const onTime = employeeTasks.filter(isTaskCompletedOnTime).length;
            const late = totalCompleted - onTime;
            const rate = (onTime / totalCompleted) * 100;
            
            const totalTimeAssigned = employeeTasks.reduce((sum, task) => {
                if (task.assignedDate) {
                    return sum + (calculateDurationInDays(task.assignedDate, task.dueDate) || 0);
                }
                return sum;
            }, 0);

            const totalTimeTaken = employeeTasks.reduce((sum, task) => {
                if (task.assignedDate && task.completionDate) {
                    return sum + (calculateDurationInDays(task.assignedDate, task.completionDate) || 0);
                }
                return sum;
            }, 0);

            return {
                employee,
                totalCompleted,
                completedOnTime: onTime,
                completedLate: late,
                onTimeRate: parseFloat(rate.toFixed(1)),
                totalTimeAssigned,
                totalTimeTaken,
            };
        });

        return statsByEmployee.sort((a, b) => {
            if (b.onTimeRate !== a.onTimeRate) {
                return b.onTimeRate - a.onTimeRate;
            }
             if (b.totalCompleted !== a.totalCompleted) {
                return b.totalCompleted - a.totalCompleted;
            }
            return a.employee.name.localeCompare(b.employee.name);
        });
    }, [tenders, employees, startDate, endDate]);
    
    const overallStats = useMemo(() => {
        const totalTasks = performanceData.reduce((sum, item) => sum + item.totalCompleted, 0);
        const totalOnTime = performanceData.reduce((sum, item) => sum + item.completedOnTime, 0);
        const overallRate = totalTasks > 0 ? (totalOnTime / totalTasks) * 100 : 0;
        const totalAssigned = performanceData.reduce((sum, item) => sum + item.totalTimeAssigned, 0);
        const totalTaken = performanceData.reduce((sum, item) => sum + item.totalTimeTaken, 0);

        return {
            totalCompleted: totalTasks,
            overallOnTimeRate: parseFloat(overallRate.toFixed(1)),
            totalTimeAssigned: totalAssigned,
            totalTimeTaken: totalTaken,
        };
    }, [performanceData]);
    
    const handleClearFilters = () => {
        setStartDate('');
        setEndDate('');
    }

    return (
        <div className="p-4 sm:p-6 lg:p-8 space-y-8">
             <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <h2 className="text-xl font-semibold text-slate-700 mb-4">Performance Filters</h2>
                 <div className="flex flex-wrap items-end gap-4">
                    <div>
                        <label htmlFor="startDate" className="block text-sm font-medium text-slate-700 mb-1">Start Date</label>
                        <input
                            type="date"
                            id="startDate"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                    </div>
                     <div>
                        <label htmlFor="endDate" className="block text-sm font-medium text-slate-700 mb-1">End Date</label>
                        <input
                            type="date"
                            id="endDate"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                    </div>
                    <button
                        onClick={handleClearFilters}
                        className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                        Clear Filters
                    </button>
                 </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                 <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                     <h3 className="text-base font-medium text-slate-500">Total Tasks Completed</h3>
                     <p className="mt-1 text-4xl font-semibold text-slate-800">{overallStats.totalCompleted}</p>
                 </div>
                 <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                     <h3 className="text-base font-medium text-slate-500">Overall On-Time Rate</h3>
                     <p className="mt-1 text-4xl font-semibold text-indigo-600">{overallStats.overallOnTimeRate}%</p>
                 </div>
                 <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <h3 className="text-base font-medium text-slate-500">Total Time Assigned</h3>
                    <p className="mt-1 text-4xl font-semibold text-slate-800">{overallStats.totalTimeAssigned} <span className="text-2xl font-normal text-slate-500">days</span></p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <h3 className="text-base font-medium text-slate-500">Total Time Taken</h3>
                    <p className="mt-1 text-4xl font-semibold text-slate-800">{overallStats.totalTimeTaken} <span className="text-2xl font-normal text-slate-500">days</span></p>
                </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <h3 className="text-xl font-semibold text-slate-700 mb-4">Employee Breakdown</h3>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Employee</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Total Completed</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Time Assigned</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Time Taken</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">On Time</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Late</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">On-Time Rate</th>
                            </tr>
                        </thead>
                         <tbody className="bg-white divide-y divide-slate-200">
                            {performanceData.map(({ employee, totalCompleted, completedOnTime, completedLate, onTimeRate, totalTimeAssigned, totalTimeTaken }) => (
                                <tr key={employee.id}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0 h-10 w-10">
                                                <img className="h-10 w-10 rounded-full" src={employee.avatar} alt={employee.name} />
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-slate-900">{employee.name}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{totalCompleted}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{totalTimeAssigned} days</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{totalTimeTaken} days</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium">{completedOnTime}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 font-medium">{completedLate}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                                         <div className="flex items-center gap-2">
                                            <div className="w-24 bg-slate-200 rounded-full h-2.5">
                                                <div className="bg-indigo-600 h-2.5 rounded-full" style={{ width: `${onTimeRate}%` }}></div>
                                            </div>
                                            <span className="font-medium text-slate-700 w-12 text-right">{onTimeRate}%</span>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                     {performanceData.length === 0 && (
                        <div className="text-center py-10">
                            <p className="text-slate-500">No performance data available for the selected period.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PerformanceDashboard;