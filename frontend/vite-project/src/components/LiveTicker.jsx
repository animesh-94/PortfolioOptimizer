import React from 'react';
import { Wifi, WifiOff, TrendingUp, Activity } from 'lucide-react';
import AnimatedNumber from './AnimatedNumber';
import usePortfolioSocket from '../hooks/usePortfolioSocket';

export default function LiveTicker() {
    // Connects to backend, falls back to simulation if offline
    const { status, metrics } = usePortfolioSocket('ws://localhost:8080/realtime');

    const isConnected = status === 'connected';
    // If disconnected, we still show data (Simulation Mode), but indicator is yellow/grey
    const indicatorColor = isConnected ? 'text-emerald-400' : 'text-amber-500';
    const isPositive = metrics.pnl >= 0;

    return (
        <div className="flex items-center gap-4 px-4 py-2 bg-slate-900/80 border border-slate-800 rounded-lg shadow-lg backdrop-blur-sm transition-all animate-in fade-in slide-in-from-top-2">

            {/* Connection Status */}
            <div className={`flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider ${indicatorColor}`}>
                {isConnected ? <Wifi size={14} /> : <WifiOff size={14} />}
                {isConnected ? 'Live Feed' : 'Simulated'}
            </div>

            <div className="h-4 w-px bg-slate-800"></div>

            {/* Metric 1: Portfolio Value */}
            <div className="flex flex-col min-w-[100px]">
                <span className="text-[9px] text-slate-500 uppercase font-mono">Net Liquidation</span>
                <span className={`text-sm font-mono font-bold flex gap-1 ${isPositive ? 'text-blue-400' : 'text-rose-400'}`}>
                    $<AnimatedNumber value={metrics.value} format={v => Math.floor(v).toLocaleString()} />
                </span>
            </div>

            {/* Metric 2: Sharpe */}
            <div className="hidden md:flex flex-col min-w-[60px]">
                <span className="text-[9px] text-slate-500 uppercase font-mono flex items-center gap-1">
                    <TrendingUp size={10} /> Sharpe
                </span>
                <span className="text-sm font-mono text-white">
                    <AnimatedNumber value={metrics.sharpe} />
                </span>
            </div>

            {/* Metric 3: Risk */}
            <div className="hidden md:flex flex-col min-w-[60px]">
                <span className="text-[9px] text-slate-500 uppercase font-mono flex items-center gap-1">
                    <Activity size={10} /> Volatility
                </span>
                <span className="text-sm font-mono text-rose-300">
                    <AnimatedNumber value={metrics.risk} />%
                </span>
            </div>
        </div>
    );
}