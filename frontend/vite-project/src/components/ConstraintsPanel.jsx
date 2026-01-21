import React from 'react';
import { Lock, Unlock, PieChart, Layers, ShieldCheck } from 'lucide-react';
import AnimatedNumber from './AnimatedNumber';

export default function ConstraintsPanel({ constraints, onChange }) {

    const update = (key, value) => {
        onChange({ ...constraints, [key]: value });
    };

    return (
        <div className="bg-slate-900/40 rounded-2xl border border-slate-800 p-6 flex flex-col h-full overflow-hidden">

            {/* Header: Fixed height to prevent vertical leakage */}
            <div className="flex items-center gap-3 border-b border-slate-800/50 pb-4 mb-6 shrink-0">
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                    <Layers size={16} className="text-blue-400" />
                </div>
                <h3 className="text-[10px] font-bold text-white uppercase tracking-[0.2em]">Optimizer Constraints</h3>
            </div>

            {/* Controls Container: Uses a single column to prevent horizontal grid leakage */}
            <div className="flex-1 space-y-8 overflow-y-auto custom-scrollbar pr-1">

                {/* 1. Long-Only Toggle */}
                <div className="flex items-center justify-between bg-black/20 p-4 rounded-xl border border-slate-800/50 hover:border-emerald-500/30 transition-all group">
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                            <ShieldCheck size={14} className={constraints.longOnly ? "text-emerald-500" : "text-slate-600"} />
                            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Long-Only Mode</span>
                        </div>
                        <span className="text-[9px] text-slate-500 font-mono uppercase">Short selling restricted</span>
                    </div>

                    <button
                        onClick={() => update('longOnly', !constraints.longOnly)}
                        className={`relative w-10 h-5 rounded-full transition-all duration-300 border ${
                            constraints.longOnly
                                ? 'bg-emerald-500/20 border-emerald-500/50'
                                : 'bg-slate-800 border-slate-700'
                        }`}
                    >
                        <span
                            className={`absolute left-0.5 top-0.5 w-3.5 h-3.5 rounded-full transition-transform duration-300 ${
                                constraints.longOnly
                                    ? 'translate-x-5 bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]'
                                    : 'translate-x-0 bg-slate-500'
                            }`}
                        />
                    </button>
                </div>

                {/* 2. Max Asset Weight Slider */}
                <div className="space-y-4 px-1">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            {constraints.maxWeight < 100 ? <Lock size={12} className="text-amber-500" /> : <Unlock size={12} className="text-slate-600" />}
                            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Max Asset Weight</span>
                        </div>
                        <div className="bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded">
                             <span className="text-xs font-mono font-bold text-amber-400">
                                <AnimatedNumber value={constraints.maxWeight} />%
                            </span>
                        </div>
                    </div>

                    <div className="relative pt-2 pb-6">
                        <input
                            type="range" min="10" max="100" step="5"
                            value={constraints.maxWeight}
                            onChange={(e) => update('maxWeight', parseInt(e.target.value))}
                            className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500 hover:accent-amber-400 transition-all"
                        />
                        <div className="absolute top-9 left-0 right-0 flex justify-between text-[8px] text-slate-600 font-mono uppercase tracking-tighter">
                            <span>Diversified (10%)</span>
                            <span>Unconstrained (100%)</span>
                        </div>
                    </div>
                </div>

                {/* 3. Placeholder: Mimics BitCrypto "UI Element" style */}
                <div className="pt-6 border-t border-slate-800/50 opacity-30">
                    <div className="flex justify-between items-center mb-3">
                        <div className="flex items-center gap-2">
                            <PieChart size={12} className="text-slate-500" />
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Sector Caps</span>
                        </div>
                        <span className="text-[8px] font-bold bg-slate-800 px-1.5 py-0.5 rounded text-slate-600 border border-slate-700">LOCKED</span>
                    </div>
                    <div className="h-1 w-full bg-slate-800 rounded-full" />
                </div>
            </div>
        </div>
    );
}