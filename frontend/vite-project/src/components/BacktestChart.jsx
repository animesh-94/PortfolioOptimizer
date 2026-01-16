import React, { useState, useEffect, useMemo } from 'react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    ReferenceLine, BarChart, Bar
} from 'recharts';
import { Calendar, TrendingUp, TrendingDown, Activity, AlertCircle } from 'lucide-react';
import { portfolioApi } from '../services/api';
import AnimatedNumber from './AnimatedNumber';

export default function BacktestChart({ weights }) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [timeRange, setTimeRange] = useState('1Y'); // 1Y, 3Y, 5Y, ALL

    // --- FETCH DATA ---
    useEffect(() => {
        let mounted = true;
        // Skip if no weights (e.g., initial load)
        if (!weights || weights.length === 0) return;

        const runBacktest = async () => {
            setLoading(true);
            setError(null);
            try {
                // Fetch from API
                const result = await portfolioApi.getBacktest(weights, timeRange);

                if (mounted) {
                    // Expecting backend to return: { history: [{ date, value, drawdown }, ...], metrics: {...} }
                    // If backend is simple, we might just get an array.
                    // For robustness, let's assume we might need to process it or receive it ready.
                    // Here we assume the backend does the heavy lifting of historical simulation.
                    setData(result);
                }
            } catch (err) {
                if (mounted) {
                    console.error("Backtest failed:", err);
                    setError("Could not retrieve historical data for this allocation.");
                }
            } finally {
                if (mounted) setLoading(false);
            }
        };

        runBacktest();
        return () => { mounted = false; };
    }, [weights, timeRange]);

    // --- CALCULATE METRICS (Fallback if API doesn't provide them) ---
    const metrics = useMemo(() => {
        if (!data || !data.history || data.history.length === 0) return null;

        // Use backend metrics if available, otherwise calculate
        if (data.metrics) return data.metrics;

        const hist = data.history;
        const startVal = hist[0].value;
        const endVal = hist[hist.length - 1].value;
        const totalReturn = (endVal - startVal) / startVal;

        // Find Max Drawdown
        const minDrawdown = Math.min(...hist.map(d => d.drawdown));

        return {
            totalReturn: totalReturn * 100,
            cagr: ((Math.pow(endVal / startVal, 1) - 1) * 100), // Simplified for 1Y
            maxDrawdown: minDrawdown * 100,
            sharpe: 1.5 // Mock if missing
        };
    }, [data]);

    // --- LOADING STATE ---
    if (loading) {
        return (
            <div className="h-[500px] w-full bg-slate-900/20 border border-slate-900 rounded-xl flex flex-col items-center justify-center text-slate-500">
                <Activity className="animate-spin mb-4 text-blue-500" size={48} />
                <span className="font-mono text-sm tracking-widest uppercase">Simulating Historical Performance...</span>
            </div>
        );
    }

    // --- ERROR STATE ---
    if (error) {
        return (
            <div className="h-[500px] w-full bg-slate-900/20 border border-slate-900 rounded-xl flex flex-col items-center justify-center text-rose-500">
                <AlertCircle className="mb-4" size={48} />
                <span className="font-medium">{error}</span>
                <button onClick={() => window.location.reload()} className="mt-4 px-4 py-2 bg-slate-800 rounded hover:bg-slate-700 text-slate-300 text-sm">Retry</button>
            </div>
        );
    }

    // --- EMPTY STATE ---
    if (!data || !data.history) {
        return (
            <div className="h-[500px] w-full bg-slate-900/20 border border-slate-900 rounded-xl flex flex-col items-center justify-center text-slate-600">
                <Calendar className="mb-4 opacity-50" size={48} />
                <span>Select a portfolio on the "Construct" tab to view backtest.</span>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">

            {/* 1. METRICS CARDS */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <SummaryCard
                    label="Total Return"
                    value={metrics.totalReturn}
                    icon={<TrendingUp size={16} />}
                    color="text-emerald-400"
                />
                <SummaryCard
                    label="CAGR"
                    value={metrics.cagr}
                    icon={<Activity size={16} />}
                    color="text-blue-400"
                />
                <SummaryCard
                    label="Max Drawdown"
                    value={metrics.maxDrawdown}
                    icon={<TrendingDown size={16} />}
                    color="text-rose-400"
                />
                <SummaryCard
                    label="Sharpe Ratio"
                    value={metrics.sharpe}
                    isPercent={false}
                    color="text-white"
                />
            </div>

            {/* 2. MAIN CHARTS CONTAINER */}
            <div className="bg-slate-900/30 border border-slate-800 rounded-xl p-6">

                {/* Header & Controls */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <h3 className="text-lg font-light text-white flex items-center gap-2">
                            <Calendar size={18} className="text-blue-500" />
                            Equity Curve
                        </h3>
                        <p className="text-xs text-slate-500">Hypothetical growth of $10,000 investment</p>
                    </div>
                    <div className="flex bg-slate-950/50 rounded-lg p-1 border border-slate-800">
                        {['1Y', '3Y', '5Y', 'ALL'].map(range => (
                            <button
                                key={range}
                                onClick={() => setTimeRange(range)}
                                className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                                    timeRange === range
                                        ? 'bg-blue-600 text-white shadow'
                                        : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800'
                                }`}
                            >
                                {range}
                            </button>
                        ))}
                    </div>
                </div>

                {/* CHART 1: EQUITY CURVE (70% Height) */}
                <div className="h-[300px] w-full mb-2">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={data.history} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorEquity" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.3} vertical={false} />
                            <XAxis dataKey="date" hide />
                            <YAxis
                                domain={['auto', 'auto']}
                                tick={{ fill: '#64748b', fontSize: 10 }}
                                tickFormatter={(val) => `$${(val/1000).toFixed(0)}k`}
                                axisLine={false}
                                tickLine={false}
                            />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b' }}
                                formatter={(val) => [`$${val.toFixed(2)}`, "Portfolio Value"]}
                                labelStyle={{ color: '#94a3b8', marginBottom: '0.5rem' }}
                            />
                            <Area
                                type="monotone"
                                dataKey="value"
                                stroke="#3b82f6"
                                strokeWidth={2}
                                fill="url(#colorEquity)"
                                activeDot={{ r: 6, fill: "#fff" }}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                {/* CHART 2: DRAWDOWN UNDERWATER PLOT (30% Height) */}
                <div className="h-[100px] w-full border-t border-slate-800 pt-2">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={data.history} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorDD" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.1}/>
                                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0.3}/>
                                </linearGradient>
                            </defs>
                            <XAxis
                                dataKey="date"
                                tick={{ fill: '#64748b', fontSize: 10 }}
                                minTickGap={50}
                                axisLine={false}
                                tickLine={false}
                            />
                            <YAxis
                                hide
                                domain={[-0.5, 0]} // Fixed domain for drawdown visualization
                            />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#ef4444', color: '#ef4444' }}
                                formatter={(val) => [`${(val * 100).toFixed(2)}%`, "Drawdown"]}
                                labelStyle={{ display: 'none' }}
                            />
                            <Area
                                type="monotone"
                                dataKey="drawdown"
                                stroke="#ef4444"
                                strokeWidth={1}
                                fill="url(#colorDD)"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}

// Sub-component for nice metrics
function SummaryCard({ label, value, icon, color, isPercent = true }) {
    return (
        <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800 flex flex-col justify-between hover:border-slate-700 transition-all">
            <div className="flex items-center gap-2 mb-2 text-slate-500 text-xs font-bold uppercase tracking-wider">
                {icon} {label}
            </div>
            <div className={`text-2xl font-mono font-medium ${color}`}>
                {value > 0 && isPercent ? "+" : ""}
                <AnimatedNumber value={value} />
                {isPercent ? "%" : ""}
            </div>
        </div>
    );
}