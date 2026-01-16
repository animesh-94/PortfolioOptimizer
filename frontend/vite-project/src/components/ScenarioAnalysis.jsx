import React from 'react';
import { AlertTriangle, ArrowRight } from 'lucide-react';
import AnimatedNumber from './AnimatedNumber';
import MonteCarloChart from './MonteCarloChart'; // <--- NEW IMPORT

export default function ScenarioAnalysis({ customScenarios, baselineReturn = 0 }) {

    // Default mock if no data provided
    const scenarios = customScenarios || [];

    // If strictly no scenarios loaded yet, show loading state
    if (scenarios.length === 0) return (
        <div className="bg-slate-900/50 rounded-xl border border-slate-700/50 p-6 flex items-center justify-center text-slate-500 text-sm h-full">
            Waiting for Risk Engine Data...
        </div>
    );

    return (
        <div className="flex flex-col gap-6">

            {/* 1. STRESS TEST CARD */}
            <div className="bg-slate-900/50 rounded-xl border border-slate-700/50 p-6 backdrop-blur-sm">
                <div className="flex items-center gap-2 mb-6">
                    <div className="p-2 bg-rose-500/10 rounded-lg text-rose-400">
                        <AlertTriangle size={20} />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-white">Stress Test Comparison</h3>
                        <p className="text-xs text-slate-500">Projected impact relative to current baseline</p>
                    </div>
                </div>

                <div className="space-y-4">
                    {scenarios.map((item, i) => {
                        // Safe access to baselineReturn
                        const safeBaseline = Number(baselineReturn) || 0;
                        const safeImpact = Number(item.impact) || 0;

                        const delta = safeImpact - safeBaseline;

                        return (
                            <div key={i} className="group p-3 rounded-lg bg-slate-950/30 border border-slate-800/50 hover:border-rose-500/30 transition-colors">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-sm font-medium text-slate-300">{item.name}</span>
                                    <span className={`text-xs font-mono px-1.5 py-0.5 rounded ${delta < 0 ? 'bg-rose-500/10 text-rose-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
                                        {delta > 0 ? "+" : ""}{delta.toFixed(2)}%
                                    </span>
                                </div>

                                <div className="flex items-center gap-3 text-xs font-mono">
                                    <div className="flex flex-col">
                                        <span className="text-slate-500 text-[10px] uppercase">Baseline</span>
                                        <span className="text-slate-300">{safeBaseline.toFixed(2)}%</span>
                                    </div>
                                    <ArrowRight size={12} className="text-slate-600" />
                                    <div className="flex flex-col">
                                        <span className="text-slate-500 text-[10px] uppercase">Stressed</span>
                                        <span className={`font-bold ${safeImpact < 0 ? 'text-rose-400' : 'text-slate-200'}`}>
                                            <AnimatedNumber value={safeImpact} />%
                                        </span>
                                    </div>
                                </div>

                                {/* Visual Delta Bar */}
                                <div className="mt-2 h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full ${delta < 0 ? 'bg-rose-500' : 'bg-emerald-500'}`}
                                        style={{ width: `${Math.min(Math.abs(delta || 0) * 2, 100)}%` }}
                                    />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* 2. MONTE CARLO CHART INTEGRATION */}
            <MonteCarloChart numSimulations={1000} horizon={252}/>

        </div>
    );
}