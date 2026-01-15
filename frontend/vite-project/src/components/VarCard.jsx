import React from 'react';
import { ShieldAlert, Info } from 'lucide-react';

export default function VaRCard({ risk, portfolioReturn }) {
    // SIMULATION: Calculate VaR (Gaussian)
    // VaR 95% = μ - 1.65 * σ
    // VaR 99% = μ - 2.33 * σ
    const var95 = (portfolioReturn / 12) - (1.65 * (risk / Math.sqrt(12)));
    const var99 = (portfolioReturn / 12) - (2.33 * (risk / Math.sqrt(12)));

    // Ensure we show negative numbers for losses
    const var95Display = Math.min(0, var95).toFixed(2);
    const var99Display = Math.min(0, var99).toFixed(2);

    return (
        <div className="bg-slate-900/50 rounded-xl border border-slate-700/50 p-6 backdrop-blur-sm flex flex-col justify-between">
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-amber-500/10 rounded-lg text-amber-400">
                        <ShieldAlert size={20} />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-white">Value at Risk (VaR)</h3>
                        <p className="text-xs text-slate-500">Projected Monthly Loss</p>
                    </div>
                </div>
                <div className="group relative">
                    <Info size={16} className="text-slate-600 cursor-help" />
                    <div className="absolute right-0 w-48 p-2 bg-black border border-slate-800 text-slate-400 text-[10px] rounded shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                        Maximum expected loss over 1 month at specific confidence levels.
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                {/* 95% Confidence */}
                <div className="bg-slate-950/50 p-3 rounded-lg border border-slate-800">
                    <div className="text-xs text-slate-500 mb-1">95% Confidence</div>
                    <div className="text-2xl font-mono text-white font-bold">{var95Display}%</div>
                    <div className="text-[10px] text-slate-600 mt-1">1 in 20 months</div>
                </div>

                {/* 99% Confidence */}
                <div className="bg-slate-950/50 p-3 rounded-lg border border-slate-800 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-8 h-8 bg-rose-500/10 rounded-bl-xl"></div>
                    <div className="text-xs text-rose-400/80 mb-1">99% Confidence</div>
                    <div className="text-2xl font-mono text-rose-500 font-bold">{var99Display}%</div>
                    <div className="text-[10px] text-slate-600 mt-1">1 in 100 months</div>
                </div>
            </div>
        </div>
    );
}