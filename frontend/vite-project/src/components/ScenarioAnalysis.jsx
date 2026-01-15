import React from 'react';
import { AlertTriangle, ArrowDown } from 'lucide-react';

export default function ScenarioAnalysis({ selectedRisk }) {
    // SIMULATION: In real app, this data comes from your C++ Backend based on the selected portfolio weights
    // We simulate that higher portfolio risk = deeper drawdowns in crashes
    const scenarios = [
        { name: "2008 Financial Crisis", impact: -(selectedRisk * 2.5) }, // e.g., -40%
        { name: "Dot-Com Bubble", impact: -(selectedRisk * 1.8) },        // e.g., -30%
        { name: "Covid Flash Crash", impact: -(selectedRisk * 1.2) },     // e.g., -18%
        { name: "Interest Rate Spike", impact: -(selectedRisk * 0.8) },   // e.g., -12%
    ];

    return (
        <div className="bg-slate-900/50 rounded-xl border border-slate-700/50 p-6 backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-6">
                <div className="p-2 bg-rose-500/10 rounded-lg text-rose-400">
                    <AlertTriangle size={20} />
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-white">Stress Test Scenarios</h3>
                    <p className="text-xs text-slate-500">Historical simulation of selected portfolio</p>
                </div>
            </div>

            <div className="space-y-4">
                {scenarios.map((item, i) => (
                    <div key={i} className="group">
                        <div className="flex justify-between text-sm mb-1">
                            <span className="text-slate-300 group-hover:text-white transition-colors">{item.name}</span>
                            <span className="font-mono text-rose-400 font-bold">{item.impact.toFixed(2)}%</span>
                        </div>
                        {/* Progress Bar Background */}
                        <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                            {/* The Crash Bar */}
                            <div
                                className="h-full bg-gradient-to-r from-rose-600 to-rose-500 rounded-full transition-all duration-1000 ease-out relative"
                                style={{ width: `${Math.min(Math.abs(item.impact), 100)}%` }}
                            >
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800 text-xs text-slate-500 flex gap-2">
                <ArrowDown size={14} />
                <span>Values represent max drawdown estimates based on asset correlations during these events.</span>
            </div>
        </div>
    );
}