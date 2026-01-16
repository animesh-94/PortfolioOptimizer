import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Scatter,
    ResponsiveContainer, Tooltip
} from "recharts";
import { useEffect, useState, useMemo, useCallback } from "react";
import {
    PieChart as PieIcon, Sliders, Activity, Table2,
    LayoutDashboard, History, TrendingUp
} from "lucide-react";

// --- CUSTOM IMPORTS ---
import AssetAllocationPie from "./AssetAllocationPie";
import AssetAllocationTable from "./AssetAllocationTable";
import MonteCarloChart from "./MonteCarloChart";
import ScenarioAnalysis from "./ScenarioAnalysis";
import VaRCard from "./VaRCard";
import BacktestChart from "./BacktestChart";
import AnimatedNumber from "./AnimatedNumber";
import RiskFreeRateControl from "./RiskFreeRateControl";
import ConstraintsPanel from "./ConstraintsPanel";
import LiveTicker from "./LiveTicker.jsx"; // <--- NEW IMPORT

// --- SERVICES & CONTEXT ---
import { portfolioApi } from "../services/api";
import useKeyboardShortcuts from "../hooks/useKeyboardShortcuts";
import { usePortfolio } from "../context/PortfolioContext";

export default function EfficientFrontierDashboard() {
    const { riskFreeRate } = usePortfolio();

    // --- DATA STATE ---
    const [efData, setEF] = useState([]);
    const [tangency, setTangency] = useState(null);
    const [scenarioData, setScenarioData] = useState(null);
    const [varData, setVarData] = useState(null);
    const [simulationData, setSimulationData] = useState(null);

    // --- VIEW STATE ---
    const [activeTab, setActiveTab] = useState('optimizer');
    const [isLoading, setIsLoading] = useState(true);
    const [selectedPoint, setSelectedPoint] = useState(null);
    const [riskTolerance, setRiskTolerance] = useState(50);

    // --- CONSTRAINTS ---
    const [constraints, setConstraints] = useState({
        longOnly: true,
        maxWeight: 100
    });

    // --- API FETCHING ---
    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            const rfDecimal = riskFreeRate / 100;
            const backendConstraints = {
                long_only: constraints.longOnly,
                max_weight: constraints.maxWeight / 100.0
            };

            const [efRes, tangencyRes, varRes, stressRes] = await Promise.all([
                portfolioApi.getEfficientFrontier(60, backendConstraints),
                portfolioApi.getTangencyPortfolio(rfDecimal, backendConstraints),
                portfolioApi.getVaR(0.95),
                portfolioApi.getStressTest()
            ]);

            setEF(efRes.efficient_frontier || []);
            setTangency(tangencyRes);
            setVarData(varRes);

            setScenarioData([
                { name: "Market Crash (-30%)", impact: (stressRes.market_crash_return * 100) },
                { name: "Top Asset Shock (-50%)", impact: (stressRes.single_asset_shock_return * 100) },
                { name: "Volatility Spike (2x)", impact: -(stressRes.volatility_spike_risk * 100) }
            ]);

            if (tangencyRes) {
                const tPoint = {
                    risk: tangencyRes.risk * 100,
                    return: tangencyRes.expected_return * 100,
                    weights: tangencyRes.weights
                };
                setSelectedPoint(tPoint);
            }
        } catch (err) {
            console.error("Dashboard fetch error:", err);
        } finally {
            setIsLoading(false);
        }
    }, [riskFreeRate, constraints]);

    useEffect(() => { fetchData(); }, [fetchData]);

    useEffect(() => {
        if (activeTab === 'risk' && !simulationData) {
            portfolioApi.runMonteCarlo(1000).then(setSimulationData).catch(console.error);
        }
    }, [activeTab]);

    const handleSliderChange = (e) => {
        const val = parseInt(e.target.value);
        setRiskTolerance(val);
        if (efData.length > 0) {
            const index = Math.floor((val / 100) * (efData.length - 1));
            const pt = efData[index];
            setSelectedPoint({
                risk: pt.risk_pct,
                return: pt.return_pct,
                weights: pt.weights || (tangency ? tangency.weights : [])
            });
        }
    };

    const dynamicCML = useMemo(() => {
        if (!tangency) return [];
        const tRisk = tangency.risk * 100;
        const tRet = tangency.expected_return * 100;
        const slope = (tRet - riskFreeRate) / tRisk;
        return [
            { risk_pct: 0, return_pct: riskFreeRate },
            { risk_pct: tRisk * 1.5, return_pct: riskFreeRate + (slope * (tRisk * 1.5)) }
        ];
    }, [tangency, riskFreeRate]);

    useKeyboardShortcuts({
        '1': () => setActiveTab('optimizer'),
        '2': () => setActiveTab('risk'),
        '3': () => setActiveTab('backtest')
    });

    return (
        <div className="min-h-screen bg-slate-950 text-slate-300 font-sans p-6 md:p-12">

            <style>{`
                .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #334155; border-radius: 20px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background-color: #475569; }
            `}</style>

            <div className="max-w-7xl mx-auto space-y-6">

                {/* --- HEADER --- */}
                <header className="flex flex-col md:flex-row justify-between items-end border-b border-slate-900 pb-6 gap-4">
                    <div>
                        <h1 className="text-3xl font-light text-white tracking-tight">
                            Portfolio <span className="font-bold text-blue-500">Navigator</span>
                        </h1>
                        <p className="text-xs text-slate-500 mt-2 font-mono">
                            INSTITUTIONAL ANALYTICS ENGINE • V1.0.4
                        </p>
                    </div>

                    {/* CONTROLS AREA */}
                    <div className="flex flex-col items-end gap-3">

                        {/* NEW: LIVE TICKER */}
                        <LiveTicker />

                        {/* TAB NAVIGATION */}
                        <div className="flex bg-slate-900/50 p-1 rounded-lg border border-slate-800">
                            <TabButton
                                active={activeTab === 'optimizer'}
                                onClick={() => setActiveTab('optimizer')}
                                icon={<LayoutDashboard size={16} />}
                                label="Construct"
                            />
                            <TabButton
                                active={activeTab === 'risk'}
                                onClick={() => setActiveTab('risk')}
                                icon={<Activity size={16} />}
                                label="Risk Lab"
                            />
                            <TabButton
                                active={activeTab === 'backtest'}
                                onClick={() => setActiveTab('backtest')}
                                icon={<History size={16} />}
                                label="Backtest"
                            />
                        </div>
                    </div>
                </header>

                {/* --- TAB 1: OPTIMIZER --- */}
                {activeTab === 'optimizer' && (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in duration-300">
                        <div className="lg:col-span-8 space-y-6">
                            <div className="h-[520px] w-full bg-slate-900/20 rounded-lg border border-slate-900 relative">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart margin={{ top: 20, right: 20, left: -10, bottom: 20 }}>
                                        <CartesianGrid strokeDasharray="1 1" stroke="#1e293b" opacity={0.5} />
                                        <XAxis type="number" dataKey="risk_pct" tick={{ fill: '#64748b', fontSize: 10 }} domain={['auto', 'auto']} label={{ value: 'Risk (Vol %)', position: 'insideBottom', offset: -5, fill: '#475569' }} />
                                        <YAxis type="number" dataKey="return_pct" tick={{ fill: '#64748b', fontSize: 10 }} domain={['auto', 'auto']} label={{ value: 'Return (%)', angle: -90, position: 'insideLeft', fill: '#475569' }} />
                                        <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b' }} />
                                        <Line data={dynamicCML} type="linear" dataKey="return_pct" stroke="#10b981" strokeDasharray="3 3" dot={false} strokeWidth={1} name="Capital Market Line" />
                                        <Line data={efData} type="monotone" dataKey="return_pct" stroke="#3b82f6" strokeWidth={2} dot={false} name="Efficient Frontier" />
                                        {tangency && <Scatter data={[{ x: tangency.risk*100, y: tangency.expected_return*100 }]} fill="#10b981" name="Tangency Portfolio" />}
                                        {selectedPoint && <Scatter data={[{ x: selectedPoint.risk, y: selectedPoint.return }]} fill="#fff" stroke="#3b82f6" strokeWidth={2} name="Selected" />}
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700/50">
                                    <div className="flex justify-between mb-4">
                                        <div className="flex items-center gap-2">
                                            <Sliders size={16} className="text-blue-400" />
                                            <span className="text-sm font-semibold text-slate-200">Risk Tolerance</span>
                                        </div>
                                        <span className="font-mono text-white">{riskTolerance}%</span>
                                    </div>
                                    <input type="range" min="0" max="100" value={riskTolerance} onChange={handleSliderChange} className="w-full h-1.5 bg-slate-800 rounded-lg accent-blue-500 cursor-pointer" />
                                </div>
                                <RiskFreeRateControl value={riskFreeRate} onChange={() => {}} />
                            </div>

                            <ConstraintsPanel constraints={constraints} onChange={setConstraints} />
                        </div>

                        <div className="lg:col-span-4 flex flex-col gap-4 h-[auto] min-h-[640px]">
                            <div className="grid grid-cols-2 gap-3 shrink-0">
                                <MetricBox label="Sharpe Ratio" value={tangency ? tangency.sharpe_ratio.toFixed(2) : 0} color="text-white" />
                                <MetricBox label="Exp. Return" value={selectedPoint ? selectedPoint.return.toFixed(2) : 0} isPercent color="text-emerald-400" />
                                <MetricBox label="Risk (Vol)" value={selectedPoint ? selectedPoint.risk.toFixed(2) : 0} isPercent color="text-rose-400" />
                                <MetricBox label="Risk Free Rate" value={riskFreeRate.toFixed(2)} isPercent color="text-slate-400" />
                            </div>

                            <div className="bg-slate-900/30 rounded-xl border border-slate-700/50 p-4 flex flex-col flex-1 min-h-0">
                                <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-2 shrink-0">
                                    <div className="flex items-center gap-2">
                                        <Table2 size={16} className="text-slate-500" />
                                        <h3 className="text-sm font-bold text-slate-300">ALLOCATION</h3>
                                    </div>
                                </div>
                                <div className="overflow-y-auto pr-2 flex-1 custom-scrollbar">
                                    <AssetAllocationTable weights={selectedPoint ? selectedPoint.weights : []} />
                                    <div className="mt-6 pt-6 border-t border-slate-800">
                                        <AssetAllocationPie data={selectedPoint ? selectedPoint.weights : []} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* --- TAB 2: RISK LAB --- */}
                {activeTab === 'risk' && (
                    <div className="animate-in slide-in-from-right-4 duration-300 space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <VaRCard risk={varData ? varData.historical_var : 0} portfolioReturn={0} />
                            <ScenarioAnalysis
                                customScenarios={scenarioData}
                                baselineReturn={selectedPoint ? selectedPoint.return : 0}
                            />
                        </div>
                        <div className="bg-slate-900/20 border border-slate-900 rounded-xl p-6">
                            <h3 className="text-lg font-light text-white mb-4 flex items-center gap-2">
                                <TrendingUp size={18} className="text-blue-500" /> Monte Carlo Projection
                            </h3>
                            {simulationData ? (
                                <MonteCarloChart data={simulationData} />
                            ) : (
                                <div className="h-[400px] flex items-center justify-center text-slate-500">
                                    <Activity className="animate-spin mr-2" /> Generating 1,000 simulations...
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* --- TAB 3: BACKTEST --- */}
                {activeTab === 'backtest' && (
                    <div className="animate-in slide-in-from-right-4 duration-300">
                        <BacktestChart weights={selectedPoint ? selectedPoint.weights : []} />
                    </div>
                )}
            </div>
        </div>
    );
}

// --- HELPERS ---

function TabButton({ active, onClick, icon, label }) {
    return (
        <button
            onClick={onClick}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                active
                    ? "bg-slate-800 text-white shadow-sm border border-slate-700"
                    : "text-slate-500 hover:text-slate-300 hover:bg-slate-800/50"
            }`}
        >
            {icon} {label}
        </button>
    );
}

function MetricBox({ label, value, color, bg = "bg-slate-900/30", border = "border-slate-800", isPercent = false }) {
    const numValue = parseFloat(value) || 0;
    return (
        <div className={`${bg} p-4 rounded-xl border ${border} transition-all hover:bg-slate-800/50`}>
            <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1 font-semibold">{label}</div>
            <div className={`text-2xl font-mono font-medium tracking-tighter ${color}`}>
                <AnimatedNumber value={numValue} />{isPercent ? '%' : ''}
            </div>
        </div>
    );
}