
import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Tender, TaskStatus } from '../types';

interface TimelineChartProps {
    tender: Tender;
}

const TimelineChart: React.FC<TimelineChartProps> = ({ tender }) => {
    const data = useMemo(() => {
        const tenderStart = tender.startDate.getTime();
        const tenderEnd = tender.endDate.getTime();
        const totalDuration = tenderEnd - tenderStart;

        return tender.tasks.map(task => {
            const taskStart = tenderStart; // for simplicity, assuming tasks can start anytime after tender starts
            const taskEnd = task.dueDate.getTime();
            
            const preDuration = 0; // for this gantt-like chart, start from 0
            const taskDuration = taskEnd - taskStart;
            
            const colorMap = {
                [TaskStatus.Done]: '#22c55e', // green-500
                [TaskStatus.InProgress]: '#3b82f6', // blue-500
                [TaskStatus.Todo]: '#a8a29e', // stone-400
            };

            return {
                name: task.title,
                duration: [preDuration, taskDuration > 0 ? taskDuration : 0],
                fill: colorMap[task.status]
            };
        });
    }, [tender]);

    const tenderDurationDays = (tender.endDate.getTime() - tender.startDate.getTime()) / (1000 * 3600 * 24);

    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            const task = tender.tasks.find(t => t.title === data.name);
            if (!task) return null;

            const durationDays = (task.dueDate.getTime() - tender.startDate.getTime()) / (1000 * 3600 * 24);

            return (
                <div className="bg-white p-3 rounded-lg shadow-lg border border-slate-200">
                    <p className="font-bold text-slate-800">{`${data.name}`}</p>
                    <p className="text-sm text-slate-600">{`Due: ${task.dueDate.toLocaleDateString()}`}</p>
                    <p className="text-sm text-slate-600">{`Duration from start: ${Math.round(durationDays)} days`}</p>
                </div>
            );
        }
        return null;
    };
    

    return (
        <div style={{ width: '100%', height: tender.tasks.length * 50 + 50 }}>
            <ResponsiveContainer>
                <BarChart
                    data={data}
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
                    barCategoryGap="35%"
                >
                    <XAxis type="number" domain={[0, 'dataMax']} hide />
                    <YAxis dataKey="name" type="category" width={150} tick={{ fill: '#475569', fontSize: 12 }} />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(241, 245, 249, 0.5)' }} />
                    <Bar dataKey="duration" stackId="a" radius={[4, 4, 4, 4]} >
                        {data.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default TimelineChart;
