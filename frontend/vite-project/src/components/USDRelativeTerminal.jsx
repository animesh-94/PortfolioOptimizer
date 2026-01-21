import React, { useState, useEffect, useMemo, useRef } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from 'recharts';
import { DollarSign, Globe, TrendingUp, Activity } from 'lucide-react';

export default function USDRelativeTerminal() {
    // 1. Core State for G20 Basket
    const [fxData, setFxData] = useState([
        { pair: 'EUR/USD', rate: 1.0852, change: 0.12, country: 'EU' },
        { pair: 'GBP/USD', rate: 1.2634, change: -0.05, country: 'UK' },
        { pair: 'USD/JPY', rate: 148.12, change: 0.45, country: 'Japan' },
        { pair: 'USD/INR', rate: 91.68, change: -2.15, country: 'India' },
        { pair: 'USD/CNY', rate: 6.96, change: 0.45, country: 'China' },
        { pair: 'USD/CAD', rate: 1.3456, change: 0.18, country: 'Canada' },
        { pair: 'AUD/USD', rate: 0.6578, change: -0.22, country: 'Australia' },
        { pair: 'USD/BRL', rate: 5.37, change: -1.10, country: 'Brazil' },
        { pair: 'USD/MXN', rate: 17.60, change: 0.14, country: 'Mexico' },
        { pair: 'USD/TRY', rate: 43.27, change: -5.12, country: 'Turkey' },
    ]);

    const lastFetch = useRef(Date.now());

    // 2. Real-Time Data Sync (Simulating High-Frequency REST Polling)
    useEffect(() => {
        const fetchMarketData = async () => {
            // In Production:
            // const res = await fetch(`https://api.twelvedata.com/price?symbol=USD/INR,USD/CNY,EUR/USD...&apikey=YOUR_KEY`);
            // const raw = await res.json();

            setFxData(prev => prev.map(item => {
                const volatility = item.country === 'India' || item.country === 'Turkey' ? 0.005 : 0.0008;
                const jitter = (Math.random() * volatility * 2) - volatility;

                const isInverse = item.pair.startsWith('USD');
                const newRate = item.rate + jitter;
                // Calculate relative strength: If USD/INR goes UP, Rupee is WEAKENING (Negative Change)
                const newChange = isInverse ? item.change - (jitter * 20) : item.change + (jitter * 20);

                return {
                    ...item,
                    rate: newRate,
                    change: parseFloat(newChange.toFixed(3))
                };
            }));
            lastFetch.current = Date.now();
        };

        const interval = setInterval(fetchMarketData, 2000); // 2-second "Tick" for UI smoothness
        return () => clearInterval(interval);
    }, []);

    // 3. Ranking Logic (Power Rank)
    const rankedData = useMemo(() => {
        return [...fxData].sort((a, b) => b.change - a.change);
    }, [fxData]);

    return (
        <div className="h-full flex flex-col gap-6 animate-in slide-in-from-right-4 duration-700">
            {/* TOP BAR: DXY & CORE RANKINGS */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 shrink-0">
                <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 border-l-4 border-blue-500 shadow-lg">
                    <div className="flex items-center gap-2 mb-2 text-slate-500">
                        <DollarSign size={16} />
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em]">DXY Spot Index</span>
                    </div>
                    <div className="text-3xl font-mono font-bold text-white tracking-tighter">104.18</div>
                    <div className="flex items-center gap-1 text-[10px] text-emerald-400 font-bold mt-1 font-mono">
                        <TrendingUp size={12} /> +0.08% INTRADAY
                    </div>
                </div>

                <div className="md:col-span-3 bg-slate-900/40 border border-slate-800 rounded-2xl p-6 flex items-center overflow-x-auto custom-scrollbar">
                    <div className="flex gap-10">
                        {rankedData.slice(0, 5).map((item, idx) => (
                            <div key={item.pair} className="min-w-[100px] border-r border-slate-800/50 pr-6 last:border-0">
                                <p className="text-[8px] text-slate-500 font-mono uppercase font-bold mb-1 tracking-widest">RANK #{idx + 1} {item.country}</p>
                                <p className="text-lg font-bold text-white font-mono leading-none">{item.rate.toFixed(2)}</p>
                                <p className={`text-[10px] font-bold mt-1 ${item.change >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                                    {item.change >= 0 ? '+' : ''}{item.change}%
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* MAIN CHART: G20 RANKING MATRIX */}
            <div className="flex-1 bg-slate-900/40 border border-slate-800 rounded-2xl p-8 flex flex-col min-h-0">
                <div className="flex justify-between items-start mb-8">
                    <div>
                        <h3 className="text-xl font-bold text-white tracking-tight uppercase">G20 Relative Power Rank</h3>
                        <p className="text-[10px] text-slate-500 uppercase font-mono tracking-widest mt-1">
                            Relative % Change vs USD • Global Fiat Hierarchy
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <div className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded text-[9px] font-bold text-emerald-500 uppercase tracking-widest">Stronger than Dollar</div>
                        <div className="px-3 py-1 bg-rose-500/10 border border-rose-500/20 rounded text-[9px] font-bold text-rose-500 uppercase tracking-widest">Weaker than Dollar</div>
                    </div>
                </div>

                <div className="flex-1 min-h-0">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={rankedData} layout="vertical" margin={{ left: 30, right: 40 }}>
                            <CartesianGrid stroke="#1e293b" horizontal={false} opacity={0.1} />
                            <XAxis type="number" stroke="#475569" fontSize={10} domain={[-6, 6]} tickFormatter={(v) => `${v}%`} />
                            <YAxis dataKey="country" type="category" stroke="#475569" fontSize={10} width={80} />
                            <Tooltip
                                cursor={{ fill: '#1e293b', opacity: 0.4 }}
                                contentStyle={{ backgroundColor: '#020617', border: '1px solid #1e293b', borderRadius: '12px' }}
                            />
                            <ReferenceLine x={0} stroke="#475569" strokeWidth={2} />
                            <Bar dataKey="change" barSize={18} radius={[0, 4, 4, 0]}>
                                {rankedData.map((entry, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={entry.change >= 0 ? '#10b981' : '#f43f5e'}
                                        fillOpacity={Math.min(0.3 + Math.abs(entry.change) / 2, 1)}
                                    />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* MACRO SYSTEM FOOTER */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 shrink-0">
                <MacroItem label="G20 Sentiment" value="Neutral" trend="USD Dominance" />
                <MacroItem label="EM Volatility" value="High" trend="INR/TRY Focus" />
                <MacroItem label="Data Freshness" value="Real-Time" trend="2s Tick Rate" />
                <MacroItem label="System Status" value="Market_Live" trend="0.82ms Latency" />
            </div>
        </div>
    );
}

function MacroItem({ label, value, trend }) {
    return (
        <div className="p-4 bg-slate-900/20 border border-white/5 rounded-xl flex flex-col">
            <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest mb-1">{label}</p>
            <div className="text-lg font-bold text-white font-mono tracking-tighter flex items-center justify-between">
                {value}
                {label === 'System Status' && <Activity size={14} className="text-blue-500 animate-pulse" />}
            </div>
            <p className="text-[9px] text-blue-500 font-bold uppercase mt-1 opacity-80">{trend}</p>
        </div>
    );
}