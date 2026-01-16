import React from 'react';
import { Lock, Unlock, PieChart, Layers, ShieldCheck } from 'lucide-react';
import AnimatedNumber from './AnimatedNumber';

export default function ConstraintsPanel({ constraints, onChange }) {

    const update = (key, value) => {
        onChange({ ...constraints, [key]: value });
    };

    return (
        <div className="bg-slate-900/50 rounded-xl border border-slate-700/50 p-5 flex flex-col gap-5">

            {/* Header */}
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                <Layers size={18} className="text-slate-500" />
                <h3 className="text-sm font-bold text-slate-300 tracking-wide">OPTIMIZER CONSTRAINTS</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                {/* 1. Long-Only Toggle */}
                <div className="flex items-center justify-between bg-slate-950/30 p-3 rounded-lg border border-slate-800/50">
                    <div className="flex flex-col">
                        <div className="flex items-center gap-2 mb-1">
                            <ShieldCheck size={16} className={constraints.longOnly ? "text-emerald-500" : "text-slate-600"} />
                            <span className="text-sm font-medium text-slate-200">Long-Only Mode</span>
                        </div>
                        <span className="text-[10px] text-slate-500 leading-tight">Restrict short selling (negative weights).</span>
                    </div>

                    <button
                        onClick={() => update('longOnly', !constraints.longOnly)}
                        className={`relative w-12 h-6 rounded-full transition-colors duration-300 ease-in-out border ${
                            constraints.longOnly
                                ? 'bg-emerald-900/20 border-emerald-500/50'
                                : 'bg-slate-800 border-slate-700'
                        }`}
                    >
                        <span
                            className={`absolute left-1 top-1 w-4 h-4 rounded-full shadow-lg transition-transform duration-300 ${
                                constraints.longOnly
                                    ? 'translate-x-6 bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.4)]'
                                    : 'translate-x-0 bg-slate-500'
                            }`}
                        />
                    </button>
                </div>

                {/* 2. Max Asset Weight Slider */}
                <div className="space-y-3">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            {constraints.maxWeight < 100 ? <Lock size={14} className="text-amber-500" /> : <Unlock size={14} className="text-slate-600" />}
                            <span className="text-sm font-medium text-slate-200">Max Asset Allocation</span>
                        </div>
                        <span className={`font-mono font-bold ${constraints.maxWeight < 100 ? 'text-amber-400' : 'text-slate-500'}`}>
                            <AnimatedNumber value={constraints.maxWeight} />%
                        </span>
                    </div>

                    <input
                        type="range" min="10" max="100" step="5"
                        value={constraints.maxWeight}
                        onChange={(e) => update('maxWeight', parseInt(e.target.value))}
                        className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500 hover:accent-amber-400 transition-all"
                    />

                    <div className="flex justify-between text-[10px] text-slate-600 font-mono uppercase">
                        <span>Diversified (10%)</span>
                        <span>Unconstrained (100%)</span>
                    </div>
                </div>
            </div>

            {/* 3. Future Placeholder (Visual Only) */}
            <div className="pt-2 border-t border-slate-800/50 opacity-40 grayscale pointer-events-none">
                <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-2">
                        <PieChart size={14} className="text-slate-500" />
                        <span className="text-sm font-medium text-slate-400">Sector Caps</span>
                    </div>
                    <span className="text-[9px] font-bold bg-slate-800 px-1.5 py-0.5 rounded text-slate-500 border border-slate-700">PRO FEATURE</span>
                </div>
                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full w-3/4 bg-slate-600/30"></div>
                </div>
            </div>
        </div>
    );
}