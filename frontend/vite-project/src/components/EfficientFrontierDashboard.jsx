import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Scatter,
    ResponsiveContainer, Tooltip, AreaChart, Area
} from "recharts";
import { useEffect, useState, useMemo } from "react";
import { Layers, PieChart as PieIcon, Sliders, Activity, PlayCircle, Keyboard } from "lucide-react";

// --- CUSTOM IMPORTS ---
import RiskFreeRateControl from "./RiskFreeRateControl.jsx";
import AssetAllocationPie from "./AssetAllocationPie.jsx";
import ScenarioAnalysis from "./ScenarioAnalysis.jsx";
import VaRCard from "./VaRCard.jsx";
import AnimatedNumber from "./AnimatedNumber.jsx";     // <--- NEW
import useKeyboardShortcuts from "../hooks/useKeyboardShortcuts.js"; // <--- NEW

// --- HELPERS ---

// 1. Monte Carlo Generator
const generateMonteCarlo = (count, maxRisk, maxReturn) => {
    const points = [];
    for (let i = 0; i < count; i++) {
        const risk = 4 + Math.random() * (maxRisk - 4);
        const maxReturnAtRisk = 2 + Math.log(risk - 3) * 4.5;
        const returns = 2 + Math.random() * (maxReturnAtRisk - 2);

        points.push({
            risk: risk,
            return: returns,
            isSimulation: true
        });
    }
    return points;
};

// 2. Mock Backtest Data
const backtestData = [
    { month: 'Jan', portfolio: 10000, sp500: 10000 },
    { month: 'Feb', portfolio: 10350, sp500: 10100 },
    { month: 'Mar', portfolio: 10100, sp500: 9800 },
    { month: 'Apr', portfolio: 10600, sp500: 10400 },
    { month: 'May', portfolio: 10950, sp500: 10600 },
    { month: 'Jun', portfolio: 11400, sp500: 10800 },
    { month: 'Jul', portfolio: 11300, sp500: 11100 },
    { month: 'Aug', portfolio: 11800, sp500: 11300 },
    { month: 'Sep', portfolio: 11600, sp500: 11000 },
    { month: 'Oct', portfolio: 12100, sp500: 11400 },
    { month: 'Nov', portfolio: 12800, sp500: 12100 },
    { month: 'Dec', portfolio: 13200, sp500: 12400 },
];

// 3. Custom Tooltip
const StockTickerTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
        if (payload[0].payload.isSimulation) return null;
        if (payload[0].dataKey === 'portfolio') return null; // Skip backtest for now

        const data = payload[0].payload;
        const returnVal = payload.find(p => p.dataKey === 'return')?.value;
        const riskVal = data.risk;

        return (
            <div className="bg-slate-900 border border-slate-700 rounded-md shadow-xl px-3 py-1.5 whitespace-nowrap z-50 pointer-events-none">
                <div className="flex items-center gap-4 text-xs font-medium font-mono leading-tight">
                    <div className="flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400"></div>
                        <span className="text-slate-500">Ret:</span>
                        <span className="text-emerald-300">{returnVal?.toFixed(2)}%</span>
                    </div>
                    <div className="h-3 w-px bg-slate-800"></div>
                    <div className="flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-rose-400"></div>
                        <span className="text-slate-500">Risk:</span>
                        <span className="text-rose-300">{riskVal?.toFixed(2)}%</span>
                    </div>
                </div>
            </div>
        );
    }
    return null;
};

// --- MAIN COMPONENT ---
export default function EfficientFrontierDashboard() {
    // Data States
    const [efData, setEF] = useState([]);
    const [tangency, setTangency] = useState(null);
    const [monteCarloData, setMonteCarloData] = useState([]);

    // View States
    const [viewMode, setViewMode] = useState('frontier'); // 'frontier' | 'backtest'
    const [isSimulating, setIsSimulating] = useState(false);
    const [selectedPoint, setSelectedPoint] = useState(null);

    // Controls
    const [riskFreeRate, setRiskFreeRate] = useState(2.0);
    const [riskTolerance, setRiskTolerance] = useState(50);

    // --- HOTKEYS HOOK ---
    useKeyboardShortcuts({
        'm': () => handleRunSimulation(),
        'b': () => setViewMode(prev => prev === 'backtest' ? 'frontier' : 'backtest'),
    });

    // Initial Data Load
    useEffect(() => {
        const sampleEF = Array.from({ length: 100 }, (_, i) => ({
            risk: 4 + (i * 0.3),
            return: 6 + Math.log(i + 1) * 3.5
        }));
        setEF(sampleEF);
        setTangency({ risk: 14, return: 13.5 });
        setSelectedPoint(sampleEF[50]);
    }, []);

    // --- HANDLERS ---
    const handleRunSimulation = () => {
        if (monteCarloData.length > 0) {
            setMonteCarloData([]);
            return;
        }
        setIsSimulating(true);
        setTimeout(() => {
            const simulation = generateMonteCarlo(1000, 35, 25);
            setMonteCarloData(simulation);
            setIsSimulating(false);
        }, 500);
    };

    const handleSliderChange = (e) => {
        const val = parseInt(e.target.value);
        setRiskTolerance(val);
        if (efData.length > 0) {
            const index = Math.floor((val / 100) * (efData.length - 1));
            setSelectedPoint(efData[index]);
        }
    };

    // --- MEMOIZED CALCULATIONS ---
    const dynamicCML = useMemo(() => {
        if (!tangency) return [];
        const slope = (tangency.return - riskFreeRate) / tangency.risk;
        return [
            { risk: 0, return: riskFreeRate },
            { risk: tangency.risk * 1.5, return: riskFreeRate + (slope * (tangency.risk * 1.5)) }
        ];
    }, [tangency, riskFreeRate]);

    const holdings = useMemo(() => {
        if (!selectedPoint) return [];
        const r = selectedPoint.risk;
        const bond = Math.max(0, 80 - (r * 2.5));
        const safeTech = Math.max(0, 60 - Math.abs(15 - r) * 2);
        const growth = Math.max(0, (r * 3) - 20);
        const total = bond + safeTech + growth;
        return [
            { name: "US Treasuries", pct: (bond / total) * 100, fill: "#3b82f6" },
            { name: "Apple Inc.", pct: (safeTech / total) * 100 * 0.6, fill: "#10b981" },
            { name: "Google", pct: (safeTech / total) * 100 * 0.4, fill: "#f59e0b" },
            { name: "Tesla", pct: (growth / total) * 100, fill: "#6366f1" },
        ].sort((a, b) => b.pct - a.pct);
    }, [selectedPoint]);

    const currentSharpe = useMemo(() => {
        if (!selectedPoint) return 0;
        return (selectedPoint.return - riskFreeRate) / selectedPoint.risk;
    }, [selectedPoint, riskFreeRate]);

    return (
        <div className="min-h-screen bg-slate-950 text-slate-300 font-sans p-6 md:p-12">
            <div className="max-w-7xl mx-auto space-y-8">

                {/* --- HEADER --- */}
                <header className="flex flex-col md:flex-row justify-between items-end border-b border-slate-900 pb-6">
                    <div>
                        <h1 className="text-3xl font-light text-white tracking-tight">
                            Portfolio <span className="font-bold text-blue-500">Navigator</span>
                        </h1>
                        <div className="flex items-center gap-4 mt-4">
                            <div className="flex gap-6">
                                <button onClick={() => setViewMode('frontier')} className={`pb-2 text-sm font-medium transition-colors border-b-2 ${viewMode === 'frontier' ? 'border-blue-500 text-white' : 'border-transparent text-slate-500 hover:text-slate-300'}`}>Efficient Frontier</button>
                                <button onClick={() => setViewMode('backtest')} className={`pb-2 text-sm font-medium transition-colors border-b-2 ${viewMode === 'backtest' ? 'border-blue-500 text-white' : 'border-transparent text-slate-500 hover:text-slate-300'}`}>Historical Performance</button>
                            </div>

                            {/* Hotkeys Hint */}
                            <div className="hidden md:flex items-center gap-2 text-[10px] text-slate-600 font-mono border border-slate-800 px-2 py-1 rounded">
                                <Keyboard size={10} />
                                <span>HOTKEYS: [M] SIMULATE • [B] BACKTEST</span>
                            </div>
                        </div>
                    </div>

                    {/* Monte Carlo Button */}
                    <div className="mb-2 md:mb-0">
                        <button
                            onClick={handleRunSimulation}
                            disabled={isSimulating || viewMode === 'backtest'}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                                monteCarloData.length > 0
                                    ? "bg-rose-500/10 text-rose-400 border border-rose-500/50 hover:bg-rose-500/20"
                                    : "bg-slate-800 text-white hover:bg-slate-700 border border-slate-700"
                            } ${viewMode === 'backtest' ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            {isSimulating ? <Activity className="animate-spin" size={16} /> : <PlayCircle size={16} />}
                            {isSimulating ? "Running..." : monteCarloData.length > 0 ? "Clear Simulation" : "Run Monte Carlo"}
                        </button>
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                    {/* --- LEFT COLUMN --- */}
                    <div className="lg:col-span-8 space-y-6">
                        <div className="h-[500px] w-full relative group rounded-lg overflow-hidden border border-slate-900 bg-slate-900/20">
                            {viewMode === 'frontier' ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart margin={{ top: 20, right: 20, left: -10, bottom: 20 }}>
                                        <defs>
                                            <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                                                <stop offset="0%" stopColor="#3b82f6" stopOpacity={1} />
                                                <stop offset="100%" stopColor="#06b6d4" stopOpacity={1} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="1 1" stroke="#1e293b" opacity={0.5} />
                                        <XAxis type="number" dataKey="risk" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={{ stroke: '#1e293b' }} tickLine={false} domain={['auto', 'auto']} />
                                        <YAxis type="number" dataKey="return" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={{ stroke: '#1e293b' }} tickLine={false} domain={['auto', 'auto']} />
                                        <Tooltip content={<StockTickerTooltip />} cursor={{ stroke: '#94a3b8', strokeWidth: 1, strokeDasharray: '2 2', opacity: 0.5 }} wrapperStyle={{ outline: 'none' }} isAnimationActive={false} />

                                        {/* Layers */}
                                        {monteCarloData.length > 0 && <Scatter data={monteCarloData} fill="#475569" opacity={0.4} shape="circle" legendType="none" />}
                                        <Line data={dynamicCML} type="linear" dataKey="return" stroke="#10b981" strokeWidth={1} strokeDasharray="3 3" dot={false} opacity={0.8} />
                                        <Line data={efData} type="monotone" dataKey="return" stroke="url(#lineGradient)" strokeWidth={2} dot={false} activeDot={{ r: 4, fill: "white", stroke: "#3b82f6", strokeWidth: 2 }} />
                                        {tangency && <Scatter data={[tangency]} fill="#10b981" stroke="#fff" strokeWidth={2} shape="diamond" />}
                                        {selectedPoint && <Scatter data={[selectedPoint]} fill="#fff" stroke="#3b82f6" strokeWidth={3} />}
                                    </LineChart>
                                </ResponsiveContainer>
                            ) : (
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={backtestData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                                        <XAxis dataKey="month" tick={{fill: '#64748b'}} />
                                        <YAxis tick={{fill: '#64748b'}} />
                                        <Tooltip contentStyle={{backgroundColor: '#0f172a', borderColor: '#334155'}} />
                                        <Area type="monotone" dataKey="portfolio" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.1} />
                                    </AreaChart>
                                </ResponsiveContainer>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700/50 backdrop-blur-sm">
                                <div className="flex justify-between items-center mb-4">
                                    <div className="flex items-center gap-2">
                                        <div className="p-1.5 bg-blue-500/10 rounded-lg text-blue-400"><Sliders size={16} /></div>
                                        <h3 className="text-sm font-semibold text-slate-200">Risk Tolerance</h3>
                                    </div>
                                    <span className="text-2xl font-mono text-white tracking-tight">
                                        <AnimatedNumber value={riskTolerance} format={v => v.toFixed(0)} />%
                                    </span>
                                </div>
                                <input type="range" min="0" max="100" value={riskTolerance} onChange={handleSliderChange} className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500 hover:accent-blue-400" />
                            </div>
                            <RiskFreeRateControl value={riskFreeRate} onChange={setRiskFreeRate} />
                        </div>
                    </div>

                    {/* --- RIGHT COLUMN --- */}
                    <div className="lg:col-span-4 space-y-6">
                        <div className="grid grid-cols-2 gap-3">
                            <MetricBox label="Sharpe Ratio" value={currentSharpe.toFixed(2)} color="text-white" bg="bg-blue-900/20" border="border-blue-900/50" />
                            <MetricBox label="Exp. Return" value={selectedPoint ? `${selectedPoint.return.toFixed(2)}%` : "-"} color="text-emerald-400" />
                            <MetricBox label="Volatility" value={selectedPoint ? `${selectedPoint.risk.toFixed(2)}%` : "-"} color="text-rose-400" />
                            <MetricBox label="Risk Free Rate" value={`${riskFreeRate.toFixed(2)}%`} color="text-slate-400" />
                        </div>
                        <div className="bg-slate-900/30 rounded-xl border border-slate-700/50 p-4">
                            <div className="flex items-center gap-2 mb-4 border-b border-slate-800 pb-2">
                                <PieIcon size={16} className="text-slate-500" />
                                <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wide">Target Allocation</h3>
                            </div>
                            <AssetAllocationPie data={holdings} />
                        </div>
                    </div>
                </div>

                {/* --- BOTTOM SECTION --- */}
                <div className="border-t border-slate-900 pt-8">
                    <h2 className="text-xl font-light text-white mb-6 flex items-center gap-2">
                        <Activity className="text-rose-500" /> Risk Intelligence
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <VaRCard risk={selectedPoint ? selectedPoint.risk : 0} portfolioReturn={selectedPoint ? selectedPoint.return : 0} />
                        <ScenarioAnalysis selectedRisk={selectedPoint ? selectedPoint.risk : 10} />
                    </div>
                </div>
            </div>
        </div>
    );
}

// UI Helper with Animation
function MetricBox({ label, value, color, bg = "bg-slate-900/30", border = "border-slate-800" }) {
    const numValue = parseFloat(value);
    const suffix = value.toString().includes('%') ? '%' : '';
    const isNumber = !isNaN(numValue);

    return (
        <div className={`${bg} p-4 rounded-xl border ${border} transition-all hover:bg-slate-800/50`}>
            <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1 font-semibold">{label}</div>
            <div className={`text-2xl font-mono font-medium tracking-tighter ${color}`}>
                {isNumber ? (
                    <>
                        <AnimatedNumber value={numValue} />
                        {suffix}
                    </>
                ) : (
                    value
                )}
            </div>
        </div>
    );
}