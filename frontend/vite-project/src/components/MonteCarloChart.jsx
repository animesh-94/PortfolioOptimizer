import React, { useState, useEffect } from 'react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { Activity, AlertCircle } from 'lucide-react';
import { portfolioApi } from '../services/api';

export default function MonteCarloChart({ numSimulations = 1000 }) {
    // We keep processed data for bands AND raw paths for the background cloud
    const [chartData, setChartData] = useState([]);
    const [rawPaths, setRawPaths] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        let mounted = true;
        setLoading(true);

        const runSimulation = async () => {
            try {
                // Fetch simulation data from backend
                const result = await portfolioApi.runMonteCarlo(numSimulations);

                if (mounted) {
                    // 1. Process Percentiles for the main chart axes/bands
                    const processed = processPercentiles(result);
                    setChartData(processed);

                    // 2. Store raw paths for the "spaghetti" background
                    // Check if result.paths exists, otherwise fallback to empty
                    setRawPaths(result.paths || []);

                    setLoading(false);
                }
            } catch (err) {
                if (mounted) {
                    console.error("Monte Carlo Failed:", err);
                    setError("Failed to generate simulation paths.");
                    setLoading(false);
                }
            }
        };

        runSimulation();

        return () => { mounted = false; };
    }, [numSimulations]);

    // Helper: Calculate p05, p50, p95 for the main trend lines
    const processPercentiles = (rawData) => {
        if (!rawData || !rawData.paths || rawData.paths.length === 0) return [];

        const timeSteps = rawData.time_steps || Array.from({ length: rawData.paths[0].length }, (_, i) => `M${i}`);
        const paths = rawData.paths;

        return timeSteps.map((label, tIndex) => {
            // Get all values for this specific time step
            const valuesAtT = paths.map(path => path[tIndex]);
            valuesAtT.sort((a, b) => a - b);

            return {
                name: label,
                p05: valuesAtT[Math.floor(valuesAtT.length * 0.05)], // Worst 5%
                p50: valuesAtT[Math.floor(valuesAtT.length * 0.50)], // Median
                p95: valuesAtT[Math.floor(valuesAtT.length * 0.95)], // Best 5%
            };
        });
    };

    if (loading) {
        return (
            <div className="h-[350px] w-full bg-slate-900/20 border border-slate-800 rounded-lg flex flex-col items-center justify-center text-slate-500">
                <Activity className="animate-spin mb-3 text-blue-500" size={32} />
                <span className="text-xs font-mono uppercase tracking-widest">Running {numSimulations} Simulations...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="h-[350px] w-full flex flex-col items-center justify-center text-rose-400 bg-rose-900/10 border border-rose-900/30 rounded-lg">
                <AlertCircle className="mb-2" size={24} />
                <span className="text-sm">{error}</span>
            </div>
        );
    }

    return (
        <div className="w-full bg-slate-900/20 border border-slate-800 rounded-xl p-4">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="text-sm font-bold text-slate-300 flex items-center gap-2">
                        <Activity size={16} className="text-blue-500" />
                        Monte Carlo Projection
                    </h3>
                    <p className="text-[10px] text-slate-500 font-mono mt-1">
                        12-Month Horizon • 90% Confidence Interval
                    </p>
                </div>
            </div>

            <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.4} vertical={false} />

                        <XAxis
                            dataKey="name"
                            tick={{ fill: '#64748b', fontSize: 10 }}
                            axisLine={false}
                            tickLine={false}
                            minTickGap={30}
                        />
                        <YAxis
                            domain={['auto', 'auto']}
                            tick={{ fill: '#64748b', fontSize: 10 }}
                            axisLine={false}
                            tickLine={false}
                            tickFormatter={(val) => `$${(val/1000).toFixed(0)}k`}
                        />
                        <Tooltip
                            contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', fontSize: '12px' }}
                            formatter={(val) => `$${val.toFixed(2)}`}
                            labelStyle={{ color: '#94a3b8' }}
                        />

                        {/* ---- 1. SIMULATION CLOUD (Background) ---- */}
                        {/* We slice to 100 paths to keep performance high while giving the 'cloud' effect */}
                        {rawPaths.slice(0, 100).map((path, i) => (
                            <Line
                                key={i}
                                data={path.map((v, t) => ({ name: chartData[t]?.name, v }))}
                                dataKey="v"
                                dot={false}
                                stroke="#3b82f6"
                                strokeOpacity={0.05} // Very transparent for cloud effect
                                strokeWidth={1}
                                isAnimationActive={false} // Disable animation for background lines for performance
                            />
                        ))}

                        {/* ---- 2. PERCENTILE BANDS (Foreground) ---- */}
                        <Line type="monotone" dataKey="p95" stroke="#10b981" strokeWidth={2} strokeDasharray="4 4" dot={false} name="Best Case (95%)" />
                        <Line type="monotone" dataKey="p50" stroke="#f59e0b" strokeWidth={2} dot={false} name="Median" />
                        <Line type="monotone" dataKey="p05" stroke="#ef4444" strokeWidth={2} strokeDasharray="4 4" dot={false} name="Worst Case (5%)" />

                    </LineChart>
                </ResponsiveContainer>
            </div>

            {/* Legend */}
            <div className="flex justify-center gap-4 mt-2 text-[10px] text-slate-500 font-mono">
                <span className="flex items-center gap-1"><div className="w-2 h-0.5 bg-emerald-500"></div> 95th %</span>
                <span className="flex items-center gap-1"><div className="w-2 h-0.5 bg-amber-500"></div> Median</span>
                <span className="flex items-center gap-1"><div className="w-2 h-0.5 bg-rose-500"></div> 5th %</span>
            </div>
        </div>
    );
}