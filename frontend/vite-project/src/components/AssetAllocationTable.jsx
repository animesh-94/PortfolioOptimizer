import React from 'react';

// Institutional-grade colors corresponding to typical asset classes
const ASSET_COLORS = [
    '#3b82f6', // Blue (Large Cap / Core)
    '#10b981', // Emerald (Bonds / Safe)
    '#f59e0b', // Amber (Commodities / Gold)
    '#6366f1', // Indigo (Intl / Tech)
    '#ef4444', // Red (High Risk / Crypto)
    '#8b5cf6', // Violet
    '#ec4899', // Pink
];

export default function AssetAllocationTable({ weights }) {
    if (!weights || weights.length === 0) {
        return <div className="text-center text-slate-500 text-sm py-4">No portfolio selected</div>;
    }

    // Sort weights descending
    const sortedWeights = [...weights].sort((a, b) => b.weight - a.weight);

    return (
        <div className="overflow-hidden rounded-lg border border-slate-800 bg-slate-900/40">
            <table className="w-full text-sm text-left">
                <thead className="text-xs uppercase bg-slate-900/80 text-slate-500 font-medium">
                <tr>
                    <th className="px-4 py-3">Asset Index</th>
                    <th className="px-4 py-3 text-right">Allocation</th>
                    <th className="px-4 py-3 w-32">Exposure</th>
                </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                {sortedWeights.map((item, idx) => {
                    const color = ASSET_COLORS[idx % ASSET_COLORS.length];
                    const pct = (item.weight * 100).toFixed(2);

                    return (
                        <tr key={idx} className="hover:bg-slate-800/30 transition-colors">
                            <td className="px-4 py-2 font-mono text-slate-300">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                                    Asset {item.asset}
                                </div>
                            </td>
                            <td className="px-4 py-2 text-right font-mono font-bold text-white">
                                {pct}%
                            </td>
                            <td className="px-4 py-2">
                                {/* Bar Visualization */}
                                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                                    <div
                                        className="h-full rounded-full"
                                        style={{ width: `${pct}%`, backgroundColor: color }}
                                    />
                                </div>
                            </td>
                        </tr>
                    );
                })}
                </tbody>
            </table>
        </div>
    );
}