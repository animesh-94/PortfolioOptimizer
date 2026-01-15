import React from 'react';
import { Percent, TrendingUp } from 'lucide-react';

export default function RiskFreeRateControl({ value, onChange }) {
    return (
        <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700/50 backdrop-blur-sm">
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-emerald-500/10 rounded-lg text-emerald-400">
                        <Percent size={16} />
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold text-slate-200">Risk-Free Rate ($R_f$)</h3>
                        <p className="text-xs text-slate-500">Benchmark (e.g., 10Y Treasury)</p>
                    </div>
                </div>
                <div className="text-right">
                    <span className="text-2xl font-mono text-white tracking-tight">{value.toFixed(2)}%</span>
                </div>
            </div>

            <div className="space-y-4">
                <input
                    type="range"
                    min="0"
                    max="10"
                    step="0.1"
                    value={value}
                    onChange={(e) => onChange(parseFloat(e.target.value))}
                    className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500 hover:accent-emerald-400"
                />

                <div className="flex justify-between text-xs text-slate-500 font-mono">
                    <span>0%</span>
                    <span>5%</span>
                    <span>10%</span>
                </div>

                <div className="flex gap-2 justify-end">
                    {[2.0, 4.5, 5.25].map((rate) => (
                        <button
                            key={rate}
                            onClick={() => onChange(rate)}
                            className="px-2 py-1 text-xs border border-slate-700 rounded hover:bg-slate-800 transition-colors text-slate-400"
                        >
                            {rate}%
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}