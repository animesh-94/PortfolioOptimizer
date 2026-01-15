import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

export default function AssetAllocationPie({ data }) {
    // Colors for the slices (Institutional Palette)
    const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#6366f1', '#ef4444'];

    if (!data || data.length === 0) {
        return <div className="h-[250px] flex items-center justify-center text-slate-500">No Allocation Data</div>;
    }

    return (
        <div className="h-[300px] w-full relative">
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="pct"
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="rgba(0,0,0,0.2)" />
                        ))}
                    </Pie>
                    <Tooltip
                        contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px', color: '#fff' }}
                        itemStyle={{ color: '#cbd5e1' }}
                        formatter={(value) => `${value.toFixed(1)}%`}
                    />
                    <Legend
                        verticalAlign="bottom"
                        height={36}
                        iconType="circle"
                        formatter={(value) => <span className="text-slate-400 text-xs ml-1">{value}</span>}
                    />
                </PieChart>
            </ResponsiveContainer>

            {/* Center Label Overlay */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-[60%] text-center pointer-events-none">
                <span className="text-xs text-slate-500 font-medium uppercase tracking-wider">Total</span>
                <div className="text-xl font-bold text-white">100%</div>
            </div>
        </div>
    );
}