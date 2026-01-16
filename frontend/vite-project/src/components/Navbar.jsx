import React from 'react';
import { usePortfolio } from '../context/PortfolioContext'; // Import hook
import { TrendingUp, Percent } from 'lucide-react';

export default function Navbar({ isAuthenticated, onOpenLogin, onLaunchTerminal }) {
    const { riskFreeRate, setRiskFreeRate } = usePortfolio(); // Use Global State

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-950/80 backdrop-blur-md border-b border-white/5 h-16 flex items-center justify-between px-6">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.location.href = '/'}>
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                    <TrendingUp className="text-white" size={20} />
                </div>
                <span className="text-lg font-bold text-white tracking-tight">Frontier<span className="text-blue-500">Lab</span></span>
            </div>

            {/* NEW: Global Risk-Free Rate Control (Only show if authenticated) */}
            {isAuthenticated && (
                <div className="hidden md:flex items-center gap-4 bg-slate-900/50 border border-slate-800 rounded-full px-4 py-1.5">
                    <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
                        <Percent size={14} className="text-emerald-500" />
                        <span>RISK FREE RATE</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <input
                            type="range" min="0" max="10" step="0.1"
                            value={riskFreeRate}
                            onChange={(e) => setRiskFreeRate(parseFloat(e.target.value))}
                            className="w-24 h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                        />
                        <span className="text-sm font-mono text-white w-12 text-right">{riskFreeRate.toFixed(1)}%</span>
                    </div>
                </div>
            )}

            <div className="flex items-center gap-4">
                {!isAuthenticated && (
                    <button onClick={onOpenLogin} className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
                        Sign In
                    </button>
                )}
                <button
                    onClick={onLaunchTerminal}
                    className={`h-9 px-4 rounded-lg font-medium text-sm transition-all ${
                        isAuthenticated
                            ? "bg-slate-800 text-white hover:bg-slate-700 border border-slate-700"
                            : "bg-white text-slate-950 hover:bg-slate-200"
                    }`}
                >
                    {isAuthenticated ? "Dashboard" : "Launch Terminal"}
                </button>
            </div>
        </nav>
    );
}