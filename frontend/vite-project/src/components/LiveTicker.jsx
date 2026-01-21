import React, { useState, useEffect } from 'react';
import { Globe, Activity, TrendingUp, TrendingDown } from 'lucide-react';
import { useCryptoSocket } from '../hooks/useCryptoSocket';

export default function LiveTicker() {
    const btc = useCryptoSocket('btcusdt');
    const eth = useCryptoSocket('ethusdt');
    const [dxy, setDxy] = useState({ price: 104.22, change: +0.12 });

    // Simulate DXY polling (since there is no free Fiat WebSocket)
    useEffect(() => {
        const pollDXY = () => {
            // In production, replace with: fetch('https://api.twelvedata.com/price?symbol=DXY...')
            setDxy(prev => ({
                ...prev,
                price: (prev.price + (Math.random() * 0.02 - 0.01)).toFixed(2)
            }));
        };
        const interval = setInterval(pollDXY, 60000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="flex items-center gap-6 px-4 py-2 bg-slate-900/90 border border-slate-800 rounded-xl shadow-2xl backdrop-blur-md overflow-hidden border-white/5">

            <div className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.2em] text-blue-400 shrink-0">
                <div className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 bg-blue-400"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                </div>
                <span className="hidden sm:inline">Market_Live</span>
            </div>

            <div className="h-4 w-px bg-slate-800 shrink-0"></div>

            <div className="flex items-center gap-8 px-2 overflow-hidden">
                <PriceBlock label="BTC/USD" data={btc} color="emerald" />
                <PriceBlock label="ETH/USD" data={eth} color="blue" />

                {/* DXY Index */}
                <div className="hidden md:flex flex-col min-w-[90px]">
                    <span className="text-[8px] text-slate-500 uppercase font-mono flex items-center gap-1">
                        <Globe size={10} className="text-amber-500" /> DXY Index
                    </span>
                    <span className="text-xs font-mono font-bold text-amber-400 tabular-nums">
                        {dxy.price} <span className="text-[9px] text-emerald-500">+{dxy.change}%</span>
                    </span>
                </div>
            </div>

            <div className="ml-auto hidden xl:flex items-center gap-4 border-l border-slate-800 pl-6">
                <div className="flex flex-col items-end">
                    <span className="text-[8px] font-mono text-slate-600 uppercase">Engine_Lag</span>
                    <span className="text-[10px] font-mono text-blue-500 font-bold tracking-tighter">0.8ms</span>
                </div>
                <Activity size={14} className="text-blue-500" />
            </div>
        </div>
    );
}

// Sub-component for individual price blocks with flash effects
function PriceBlock({ label, data, color }) {
    const isUp = data.trend === 'up';
    const isDown = data.trend === 'down';

    return (
        <div className="flex flex-col min-w-[95px] transition-colors duration-300">
            <span className="text-[8px] text-slate-500 uppercase font-mono flex items-center gap-1">
                {isUp ? <TrendingUp size={10} className="text-emerald-500" /> :
                    isDown ? <TrendingDown size={10} className="text-rose-500" /> :
                        <Activity size={10} className={`text-${color}-500`} />}
                {label}
            </span>
            <span className={`text-xs font-mono font-bold tabular-nums transition-colors duration-200 ${
                isUp ? 'text-emerald-400' : isDown ? 'text-rose-400' : `text-${color}-400`
            }`}>
                {data.price ? `$${data.price.toLocaleString()}` : '---.--'}
            </span>
        </div>
    );
}