import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Tender, Task, TaskStatus } from '../types';

type AllTasksItem = Task & {
    tenderId: string;
    tenderTitle: string;
};

interface AllTasksTimelineChartProps {
    tasks: AllTasksItem[];
    tenders: Tender[];
}

const AllTasksTimelineChart: React.FC<AllTasksTimelineChartProps> = ({ tasks, tenders }) => {
    const chartData = useMemo(() => {
        if (tasks.length === 0 || tenders.length === 0) {
            return { data: [], yAxisData: [], minDate: new Date(), maxDate: new Date() };
        }

        const tenderMap = new Map(tenders.map(t => [t.id, t]));

        const allDates = tasks.flatMap(task => {
            const tender = tenderMap.get(task.tenderId);
            return [
                (task.assignedDate || tender?.startDate)?.getTime(),
                task.dueDate.getTime()
            ];
        }).filter((t): t is number => t !== undefined);

        if (allDates.length === 0) {
            return { data: [], yAxisData: [], minDate: new Date(), maxDate: new Date() };
        }

        const minDateTime = Math.min(...allDates);
        const maxDateTime = Math.max(...allDates);

        const colorMap = {
            [TaskStatus.Done]: '#22c55e',
            [TaskStatus.InProgress]: '#3b82f6',
            [TaskStatus.Todo]: '#a8a29e',
        };
        
        const tasksByTender = tasks.reduce((acc, task) => {
            if (!acc[task.tenderTitle]) {
                acc[task.tenderTitle] = [];
            }
            acc[task.tenderTitle].push(task);
            return acc;
        }, {} as Record<string, AllTasksItem[]>);
        
        const data = Object.entries(tasksByTender).map(([tenderTitle, tenderTasks]) => {
            const taskDurations: { [key: string]: (number | string)[] } = {};
            
            tenderTasks.forEach((task, index) => {
                const tender = tenderMap.get(task.tenderId);
                const taskStart = task.assignedDate || tender?.startDate;
                if (!taskStart) return;

                const offset = taskStart.getTime() - minDateTime;
                const duration = task.dueDate.getTime() - taskStart.getTime();

                taskDurations[`task_${index}`] = [offset > 0 ? offset : 0, duration > 0 ? duration : 0, colorMap[task.status], task.title];
            });

            return {
                name: tenderTitle,
                ...taskDurations,
            };
        });

        return { data, yAxisData: Object.keys(tasksByTender), minDate: new Date(minDateTime), maxDate: new Date(maxDateTime) };

    }, [tasks, tenders]);

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            const taskTitle = payload[0]?.payload[payload[0].dataKey][3];
            return (
                 <div className="bg-white p-3 rounded-lg shadow-lg border border-slate-200">
                    <p className="font-bold text-slate-800">{label}</p>
                    <p className="text-sm text-slate-600">{taskTitle}</p>
                </div>
            );
        }
        return null;
    };

    const formatDateTick = (tickItem: number) => {
        const date = new Date(chartData.minDate.getTime() + tickItem);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    if (tasks.length === 0) {
        return <div className="text-center py-10"><p className="text-slate-500">No tasks to display in the timeline.</p></div>
    }

    return (
        <div style={{ width: '100%', height: chartData.yAxisData.length * 80 + 50 }}>
            <ResponsiveContainer>
                <BarChart
                    data={chartData.data}
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 100, bottom: 20 }}
                    barCategoryGap="40%"
                >
                    <XAxis type="number" domain={[0, 'dataMax']} tickFormatter={formatDateTick} />
                    <YAxis dataKey="name" type="category" width={150} tick={{ fill: '#475569', fontSize: 12 }} />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(241, 245, 249, 0.5)' }} />
                    {chartData.data[0] && Object.keys(chartData.data[0])
                        .filter(key => key.startsWith('task_'))
                        .map((key, index) => (
                            <Bar key={key} dataKey={key} stackId="a" radius={4}>
                               {chartData.data.map((entry, cellIndex) => (
                                   <Cell key={`cell-${cellIndex}`} fill={entry[key] ? entry[key][2] as string : 'transparent'} />
                               ))}
                            </Bar>
                        ))}
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default AllTasksTimelineChart;