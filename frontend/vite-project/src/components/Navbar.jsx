import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Percent } from 'lucide-react';
import { usePortfolio } from '../context/PortfolioContext';

export default function Navbar({ onLaunchTerminal }) {
    const { riskFreeRate, setRiskFreeRate } = usePortfolio(); //
    const [time, setTime] = useState(new Date());
    const navigate = useNavigate();

    // System Clock for Terminal Aesthetic
    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-950/80 backdrop-blur-xl border-b border-white/5 px-8 py-4 flex items-center justify-between h-16">

            {/* BRANDING: FrontierLab with Animated Pulse */}
            <div
                className="flex items-center gap-2 cursor-pointer"
                onClick={() => navigate('/')}
            >
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse shadow-[0_0_10px_#3b82f6]" />
                <span className="text-white font-bold tracking-tighter text-lg uppercase">
                    Frontier<span className="text-blue-500">Lab</span>
                </span>
            </div>

            {/* CENTER: Global Risk-Free Rate Control */}
            <div className="hidden md:flex items-center gap-6 bg-slate-900/40 border border-slate-800 rounded-full px-5 py-1.5 transition-all hover:border-slate-700">
                <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                    <Percent size={14} className="text-blue-500" />
                    <span>Risk Free Rate</span>
                </div>
                <div className="flex items-center gap-3">
                    <input
                        type="range" min="0" max="10" step="0.1"
                        value={riskFreeRate}
                        onChange={(e) => setRiskFreeRate(parseFloat(e.target.value))}
                        className="w-24 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500 hover:accent-blue-400"
                    />
                    <span className="text-xs font-mono text-white w-10 text-right">{riskFreeRate.toFixed(1)}%</span>
                </div>
            </div>

            {/* RIGHT SIDE: System Time & Main Action */}
            <div className="flex items-center gap-6">
                {/* Real-time Clock */}
                <span className="hidden lg:block text-[10px] font-mono text-slate-500 uppercase tracking-[0.2em]">
                    {time.toLocaleTimeString()}
                </span>

                <button
                    onClick={onLaunchTerminal}
                    className="bg-blue-600 text-white hover:bg-blue-500 px-5 py-2 rounded-full font-bold text-[10px] uppercase tracking-widest transition-all shadow-lg shadow-blue-900/20"
                >
                    Launch Terminal
                </button>
            </div>
        </nav>
    );
}