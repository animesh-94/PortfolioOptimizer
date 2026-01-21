import React, { useState, useEffect, useRef } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Globe } from 'lucide-react';
import { useCryptoSocket } from '../hooks/useCryptoSocket';

export default function CryptoMarketAnalysis({ selectedCoin, onCoinChange }) {
    const liveData = useCryptoSocket(`${selectedCoin}usdt`);

    // 1. Buffer state to store the rolling window of prices
    const [priceBuffer, setPriceBuffer] = useState([]);
    const smoothedPrice = useRef(null);
    const smoothingFactor = 0.2; // Adjust between 0.1 (very smooth) and 0.8 (raw)

    useEffect(() => {
        if (!liveData.price) return;

        const rawPrice = parseFloat(liveData.price);

        // 2. Apply Exponential Moving Average (EMA) for visual smoothness
        if (smoothedPrice.current === null) {
            smoothedPrice.current = rawPrice;
        } else {
            smoothedPrice.current = (rawPrice * smoothingFactor) + (smoothedPrice.current * (1 - smoothingFactor));
        }

        setPriceBuffer(prev => {
            const newPoint = {
                time: Date.now(),
                price: smoothedPrice.current
            };
            // Keep last 40 points for a soothing "moving" effect
            const nextBuffer = [...prev, newPoint];
            return nextBuffer.length > 40 ? nextBuffer.slice(1) : nextBuffer;
        });
    }, [liveData.price]);

    const hotPairs = [
        { ticker: 'BTC/USD', price: '98,421', change: '+2.4%' },
        { ticker: 'ETH/USD', price: '3,211', change: '+1.8%' },
        { ticker: 'SOL/USD', price: '242.10', change: '+5.7%' },
        { ticker: 'AVAX/USD', price: '34.12', change: '-0.5%' },
        { ticker: 'LINK/USD', price: '19.45', change: '+3.1%' },
    ];

    return (
        <div className="h-full grid grid-cols-1 lg:grid-cols-4 gap-6 animate-in fade-in duration-700">
            <div className="lg:col-span-3 bg-slate-900/40 border border-slate-800 rounded-2xl p-6 flex flex-col">
                <div className="flex justify-between items-center mb-6 shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-500/10 rounded-lg border border-blue-500/20">
                            <Globe size={18} className="text-blue-400" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-white uppercase tracking-tight">Market Pulse: {selectedCoin}/USD</h3>
                            <p className="text-[10px] font-mono font-bold text-blue-500 tracking-widest uppercase">
                                Live Feed: <span className={liveData.trend === 'up' ? 'text-emerald-400' : liveData.trend === 'down' ? 'text-rose-400' : 'text-blue-400'}>
                                    ${smoothedPrice.current ? smoothedPrice.current.toLocaleString(undefined, {minimumFractionDigits: 2}) : '---'}
                                </span>
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
                        {['BTC', 'ETH', 'SOL'].map(coin => (
                            <button
                                key={coin}
                                onClick={() => {
                                    setPriceBuffer([]); // Clear buffer on coin change
                                    smoothedPrice.current = null;
                                    onCoinChange(coin);
                                }}
                                className={`px-4 py-1.5 rounded-lg text-[10px] font-bold transition-all ${
                                    selectedCoin === coin ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'
                                }`}
                            >
                                {coin}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex-1 min-h-0">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={priceBuffer}>
                            <defs>
                                <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} opacity={0.2} />
                            <XAxis dataKey="time" hide />
                            <YAxis
                                domain={['auto', 'auto']}
                                stroke="#475569"
                                fontSize={10}
                                tickFormatter={(v) => `$${v.toLocaleString()}`}
                                orientation="right"
                            />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#020617', border: '1px solid #1e293b', borderRadius: '12px' }}
                                labelStyle={{ display: 'none' }}
                            />
                            <Area
                                type="monotone"
                                dataKey="price"
                                stroke="#3b82f6"
                                strokeWidth={2}
                                fillOpacity={1}
                                fill="url(#colorPrice)"
                                isAnimationActive={true}
                                animationDuration={400} // This creates the "soothing" slide effect
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* SIDEBAR PAIRS remains the same */}
            <div className="lg:col-span-1 bg-slate-900/40 border border-slate-800 rounded-2xl p-5 flex flex-col overflow-hidden">
                <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4 border-b border-slate-800 pb-2 shrink-0">Institutional Pairs</h3>
                <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3">
                    {hotPairs.map((pair, i) => (
                        <div key={i} className="p-4 rounded-xl bg-black/20 border border-slate-800/50 hover:border-blue-500/30 transition-all cursor-pointer group">
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-xs font-bold text-white group-hover:text-blue-400">{pair.ticker}</span>
                                <span className={`text-[10px] font-mono font-bold ${pair.change.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>{pair.change}</span>
                            </div>
                            <div className="text-[10px] font-mono text-slate-500">${pair.price}</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}