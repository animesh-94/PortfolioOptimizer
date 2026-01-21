import React, { useState, useEffect, useMemo } from 'react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { Calendar, TrendingUp, TrendingDown, Activity, AlertCircle } from 'lucide-react';

// Replace this with your actual API service or direct fetch
const API_URL = "https://d1l8649jpdxmxv.cloudfront.net/api/backtest";

export default function BacktestChart({ weights }) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [timeRange, setTimeRange] = useState('ALL');

    useEffect(() => {
        // If weights haven't been calculated in the Construct tab yet, don't fetch
        if (!weights || weights.length === 0) return;

        const runBacktest = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await fetch(API_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ weights, range: timeRange })
                });

                if (!response.ok) throw new Error(`Server Error: ${response.status}`);

                const result = await response.json();

                // --- DATA TRANSFORMATION ---
                // We map the C++ arrays (equity_curve, drawdown) into Recharts objects
                const formattedHistory = result.equity_curve.map((val, i) => ({
                    date: `Day ${i}`,
                    value: val * 10000, // Normalize to $10,000 initial capital
                    drawdown: (result.drawdown[i] * 100).toFixed(2) // Convert to percentage
                }));

                setData({
                    history: formattedHistory,
                    metrics: {
                        totalReturn: (result.equity_curve[result.equity_curve.length - 1] - 1) * 100,
                        cagr: result.cagr * 100,
                        maxDrawdown: result.max_drawdown * 100,
                        sharpe: result.cagr / Math.abs(result.max_drawdown || 1) // Basic Sharpe estimate
                    }
                });
            } catch (err) {
                console.error("Backtest fetch error:", err);
                setError("Failed to connect to Quant Engine.");
            } finally {
                setLoading(false);
            }
        };

        runBacktest();
    }, [weights, timeRange]);

    // --- RENDER HELPERS ---
    if (loading) return (
        <div className="h-[450px] flex flex-col items-center justify-center bg-slate-900/20 border border-slate-800 rounded-xl">
            <Activity className="animate-spin text-blue-500 mb-4" size={48} />
            <span className="text-slate-400 font-mono tracking-widest">RUNNING SIMULATION...</span>
        </div>
    );

    if (error) return (
        <div className="h-[450px] flex flex-col items-center justify-center text-rose-500 border border-slate-800 rounded-xl">
            <AlertCircle size={48} className="mb-4" />
            <p>{error}</p>
            <button onClick={() => window.location.reload()} className="mt-4 text-xs text-slate-400 underline">Retry Connection</button>
        </div>
    );

    if (!data || !data.history) return (
        <div className="h-[450px] flex flex-col items-center justify-center text-slate-500 border border-dashed border-slate-800 rounded-xl">
            <Calendar className="mb-4 opacity-20" size={48} />
            <p>Select weights in the "Construct" tab to view backtest.</p>
        </div>
    );

    return (
        <div className="space-y-6">
            {/* 1. METRICS CARDS */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <SummaryCard label="Total Return" value={data.metrics.totalReturn} color="text-emerald-400" />
                <SummaryCard label="CAGR" value={data.metrics.cagr} color="text-blue-400" />
                <SummaryCard label="Max Drawdown" value={data.metrics.maxDrawdown} color="text-rose-400" />
                <SummaryCard label="Sharpe Ratio" value={data.metrics.sharpe} isPercent={false} color="text-white" />
            </div>

            {/* 2. EQUITY CURVE CHART */}
            <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-6">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-white font-light">Historical Growth ($10k Investment)</h3>
                    <div className="flex bg-slate-950 rounded-lg p-1 border border-slate-800">
                        {['1Y', '3Y', '5Y', 'ALL'].map(r => (
                            <button
                                key={r}
                                onClick={() => setTimeRange(r)}
                                className={`px-3 py-1 text-[10px] rounded ${timeRange === r ? 'bg-blue-600 text-white' : 'text-slate-500'}`}
                            >
                                {r}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={data.history}>
                            <defs>
                                <linearGradient id="colorEquity" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                            <XAxis dataKey="date" hide />
                            <YAxis
                                tick={{fill: '#64748b', fontSize: 10}}
                                tickFormatter={(val) => `$${(val/1000).toFixed(0)}k`}
                                axisLine={false}
                            />
                            <Tooltip
                                contentStyle={{backgroundColor: '#0f172a', borderColor: '#1e293b'}}
                                itemStyle={{color: '#3b82f6'}}
                            />
                            <Area
                                type="monotone"
                                dataKey="value"
                                stroke="#3b82f6"
                                strokeWidth={2}
                                fill="url(#colorEquity)"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                {/* 3. MINI DRAWDOWN CHART */}
                <div className="h-[80px] w-full border-t border-slate-800 mt-4 pt-2">
                    <p className="text-[10px] text-slate-600 font-mono mb-1 uppercase">Drawdown %</p>
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={data.history}>
                            <YAxis hide domain={['auto', 0]} />
                            <Tooltip
                                contentStyle={{backgroundColor: '#0f172a', borderColor: '#ef4444'}}
                                itemStyle={{color: '#ef4444'}}
                            />
                            <Area type="monotone" dataKey="drawdown" stroke="#ef4444" fill="#ef4444" fillOpacity={0.2} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}

function SummaryCard({ label, value, color, isPercent = true }) {
    return (
        <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-1">{label}</p>
            <p className={`text-xl font-mono ${color}`}>
                {value >= 0 && isPercent ? "+" : ""}{value.toFixed(2)}{isPercent ? "%" : ""}
            </p>
        </div>
    );
}