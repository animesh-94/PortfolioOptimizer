import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Scatter,
    ResponsiveContainer, Tooltip
} from "recharts";
import { useEffect, useState, useMemo, useCallback } from "react";
import {
    Sliders, Activity, Table2, LayoutDashboard, History, TrendingUp,
    Wallet, ArrowLeftRight, User, Settings, Mail, Bell, Search, Menu, Globe, DollarSign
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// --- CUSTOM IMPORTS (Logic preserved) ---
import AssetAllocationPie from "./AssetAllocationPie";
import AssetAllocationTable from "./AssetAllocationTable";
import MonteCarloChart from "./MonteCarloChart";
import ScenarioAnalysis from "./ScenarioAnalysis";
import VaRCard from "./VaRCard";
import BacktestChart from "./BacktestChart";
import AnimatedNumber from "./AnimatedNumber";
import RiskFreeRateControl from "./RiskFreeRateControl";
import ConstraintsPanel from "./ConstraintsPanel";
import LiveTicker from "./LiveTicker";
import USDRelativeTerminal from "./USDRelativeTerminal.jsx";
import CryptoMarketAnalysis from "./CryptoMarketAnalysis.jsx";
import { portfolioApi } from "../services/api";
import useKeyboardShortcuts from "../hooks/useKeyboardShortcuts";
import { usePortfolio } from "../context/PortfolioContext";

export default function EfficientFrontierDashboard() {
    const { riskFreeRate } = usePortfolio();

    // --- CORE LOGIC & STATE (Unchanged) ---
    const [efData, setEF] = useState([]);
    const [tangency, setTangency] = useState(null);
    const [scenarioData, setScenarioData] = useState(null);
    const [varData, setVarData] = useState(null);
    const [simulationData, setSimulationData] = useState(null);
    const [activeTab, setActiveTab] = useState('optimizer');
    const [isLoading, setIsLoading] = useState(true);
    const [selectedPoint, setSelectedPoint] = useState(null);
    const [riskTolerance, setRiskTolerance] = useState(50);
    const [constraints, setConstraints] = useState({ longOnly: true, maxWeight: 100 });
    const [selectedCoin, setSelectedCoin] = useState('BTC'); // NEW: For Crypto Pulse

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            const rfDecimal = riskFreeRate / 100;
            const backendConstraints = { long_only: constraints.longOnly, max_weight: constraints.maxWeight / 100.0 };
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
        } catch (err) { console.error(err); } finally { setIsLoading(false); }
    }, [riskFreeRate, constraints]);

    useEffect(() => { fetchData(); }, [fetchData]);

    useEffect(() => {
        if (selectedPoint || (!tangency && efData.length === 0)) return;
        if (tangency) {
            setSelectedPoint({ risk: tangency.risk * 100, return: tangency.expected_return * 100, weights: tangency.weights });
        } else {
            const mid = efData[Math.floor(efData.length / 2)];
            setSelectedPoint({ risk: mid.risk_pct, return: mid.return_pct, weights: mid.weights || [] });
        }
    }, [tangency, efData, selectedPoint]);

    const handleSliderChange = (e) => {
        const val = parseInt(e.target.value);
        setRiskTolerance(val);
        if (efData.length > 0) {
            const index = Math.floor((val / 100) * (efData.length - 1));
            const pt = efData[index];
            setSelectedPoint({ risk: pt.risk_pct, return: pt.return_pct, weights: pt.weights || (tangency ? tangency.weights : []) });
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

    return (
        <div className="flex h-screen bg-slate-950 text-slate-300 font-sans overflow-hidden">

            {/* --- SIDEBAR NAVIGATION --- */}
            <motion.aside
                initial={{ x: -100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col hidden lg:flex flex-shrink-0"
            >
                <div className="p-6 flex items-center gap-3 border-b border-slate-800/50 flex-shrink-0">
                    <motion.div
                        whileHover={{ rotate: 360 }}
                        transition={{ duration: 0.5 }}
                        className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center"
                    >
                        <Activity className="text-white" size={20} />
                    </motion.div>
                    <span className="text-xl font-bold text-white tracking-tight">Frontier<span className="text-blue-500">Lab</span></span>
                </div>

                <nav className="flex-1 px-4 space-y-1 mt-6 overflow-y-auto">
                    <SidebarItem icon={<LayoutDashboard size={18}/>} label="Efficient Frontier" active={activeTab === 'optimizer'} onClick={() => setActiveTab('optimizer')} />
                    <SidebarItem icon={<TrendingUp size={18}/>} label="Monte Carlo Simulation" active={activeTab === 'risk'} onClick={() => setActiveTab('risk')} />
                    <SidebarItem icon={<History size={18}/>} label="Backtest" active={activeTab === 'backtest'} onClick={() => setActiveTab('backtest')} />
                    <SidebarItem icon={<Globe size={18}/>} label="Market Pulse" active={activeTab === 'market'} onClick={() => setActiveTab('market')} />
                    <SidebarItem icon={<DollarSign size={18}/>} label="USD Relative" active={activeTab === 'fiat'} onClick={() => setActiveTab('fiat')} />


                    {/* --- SYSTEM SECTION (COMING SOON) --- */}
                    <div className="relative mt-8 group">
                        {/* Section Header with Badge */}
                        <div className="flex items-center justify-between px-4 pb-2">
                            <span className="text-[10px] uppercase font-bold text-slate-700 tracking-[0.2em]">System</span>
                            <span className="text-[8px] bg-blue-600/20 text-blue-400 px-1.5 py-0.5 rounded font-mono font-bold border border-blue-500/20 animate-pulse">
            COMING SOON
        </span>
                        </div>

                        {/* Wrapper for Locked Items */}
                        <div className="space-y-1 relative">
                            {/* Soft Blur/Desaturate Overlay */}
                            <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-[1px] z-10 rounded-xl pointer-events-none" />

                            {/* Items rendered with 'disabled' styling */}
                            <div className="opacity-40 grayscale-[0.5] pointer-events-none">
                                <SidebarItem icon={<Wallet size={18}/>} label="Crypto Wallet" />
                                <SidebarItem icon={<User size={18}/>} label="Trader Profile" />
                                <SidebarItem icon={<Mail size={18}/>} label="Mail Box" />
                                <SidebarItem icon={<Settings size={18}/>} label="Settings" />
                            </div>

                            {/* Optional: Hover Tooltip or Tooltip Text */}
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-20">
            <span className="text-[10px] text-blue-400 font-bold bg-slate-900 border border-blue-500/30 px-3 py-1 rounded-full shadow-lg shadow-blue-500/10">
                LOCKED BY ADMIN
            </span>
                            </div>
                        </div>
                    </div>
                </nav>
            </motion.aside>

            {/* --- MAIN CONTENT AREA --- */}
            <main className="flex-1 flex flex-col min-w-0 overflow-hidden">

                {/* --- TOP HEADER BAR --- */}
                <motion.header
                    initial={{ y: -50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="h-16 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-6 flex-shrink-0"
                >

                    <div className="flex items-center gap-4 flex-shrink-0">
                        <LiveTicker />
                        <Bell size={18} className="text-slate-500 cursor-pointer" />
                        <div className="flex items-center gap-3 border-l border-slate-800 pl-4">
                            <div className="text-right hidden sm:block">
                                <p className="text-xs font-bold text-white">Quant Alpha</p>
                                <p className="text-[10px] text-slate-500 uppercase">Institutional</p>
                            </div>
                            <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">QA</div>
                        </div>
                    </div>
                </motion.header>

                {/* --- DASHBOARD STATS --- */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="grid grid-cols-2 md:grid-cols-4 bg-blue-600 p-4 md:p-6 gap-4 shadow-lg shadow-blue-950/20 flex-shrink-0"
                >
                    <TopStat label="Expected Return" value={selectedPoint ? selectedPoint.return.toFixed(2) : '0.00'} isPercent index={0} />
                    <TopStat label="Portfolio Risk" value={selectedPoint ? selectedPoint.risk.toFixed(2) : '0.00'} isPercent index={1} />
                    <TopStat label="Sharpe Ratio" value={tangency ? tangency.sharpe_ratio.toFixed(2) : '0.00'} index={2} />
                    <TopStat label="Risk Free Rate" value={riskFreeRate.toFixed(2)} isPercent index={3} />
                </motion.div>

                {/* --- TAB CONTENT --- */}
                <div className="flex-1 overflow-y-auto p-4 md:p-6">

                    <AnimatePresence mode="wait">
                        {/* OPTIMIZER VIEW */}
                        {activeTab === 'optimizer' && (
                            <motion.div
                                key="optimizer"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                transition={{ duration: 0.3 }}
                                className="space-y-6"
                            >
                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
                                    <div>
                                        <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight uppercase">Overview</h2>
                                        <p className="text-xs text-slate-500 mt-1 uppercase">Statistics, Predictive Analytics Data Visualization</p>
                                    </div>
                                    <div className="flex bg-slate-900 p-1 rounded-md text-[10px] font-bold text-slate-500 border border-slate-800">
                                        <button className="px-3 py-1 bg-blue-600 text-white rounded shadow-sm">ALL</button>
                                        <button className="px-3 py-1 hover:text-slate-300">1M</button>
                                        <button className="px-3 py-1 hover:text-slate-300">6M</button>
                                        <button className="px-3 py-1 hover:text-slate-300">YTD</button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                    {/* CHART PANEL */}
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ duration: 0.5, delay: 0.1 }}
                                        className="lg:col-span-2 bg-slate-900/50 rounded-xl border border-slate-800 p-4 md:p-6"
                                    >
                                        <div className="w-full" style={{ height: '400px' }}>
                                            <ResponsiveContainer width="100%" height="100%">
                                                <LineChart margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
                                                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} opacity={0.5} />
                                                    <XAxis
                                                        type="number"
                                                        dataKey="risk_pct"
                                                        stroke="#64748b"
                                                        tick={{ fill: '#64748b', fontSize: 11 }}
                                                        label={{ value: 'Risk (%)', position: 'insideBottom', offset: -10, fill: '#64748b', fontSize: 11 }}
                                                    />
                                                    <YAxis
                                                        type="number"
                                                        dataKey="return_pct"
                                                        stroke="#64748b"
                                                        tick={{ fill: '#64748b', fontSize: 11 }}
                                                        label={{ value: 'Return (%)', angle: -90, position: 'insideLeft', fill: '#64748b', fontSize: 11 }}
                                                        domain={['auto', 'auto']}
                                                    />
                                                    <Tooltip
                                                        contentStyle={{
                                                            backgroundColor: '#0f172a',
                                                            borderColor: '#1e293b',
                                                            fontSize: '11px',
                                                            borderRadius: '8px'
                                                        }}
                                                    />
                                                    <Line
                                                        data={dynamicCML}
                                                        type="linear"
                                                        dataKey="return_pct"
                                                        stroke="#10b981"
                                                        strokeDasharray="5 5"
                                                        dot={false}
                                                        strokeWidth={2}
                                                        name="CML"
                                                    />
                                                    <Line
                                                        data={efData}
                                                        type="monotone"
                                                        dataKey="return_pct"
                                                        stroke="#3b82f6"
                                                        strokeWidth={3}
                                                        dot={false}
                                                        animationDuration={1500}
                                                        name="Efficient Frontier"
                                                    />
                                                    {tangency && (
                                                        <Scatter
                                                            data={[{ risk_pct: tangency.risk*100, return_pct: tangency.expected_return*100 }]}
                                                            fill="#10b981"
                                                            shape="circle"
                                                            r={6}
                                                        />
                                                    )}
                                                    {selectedPoint && (
                                                        <Scatter
                                                            data={[{ risk_pct: selectedPoint.risk, return_pct: selectedPoint.return }]}
                                                            fill="#fff"
                                                            stroke="#3b82f6"
                                                            strokeWidth={2}
                                                            shape="circle"
                                                            r={6}
                                                        />
                                                    )}
                                                </LineChart>
                                            </ResponsiveContainer>
                                        </div>

                                        {/* CONTROLS */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6 pt-6 border-t border-slate-800 shrink-0">
                                            {/* Left Column: Risk Slider */}
                                            <div className="flex flex-col gap-4">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Risk Tolerance Factor</span>
                                                    <div className="px-2 py-0.5 bg-blue-500/10 border border-blue-500/20 rounded">
                                                        <span className="text-xs font-mono text-blue-400 font-bold">{riskTolerance}%</span>
                                                    </div>
                                                </div>

                                                {/* Slider with fixed height to prevent vertical leakage */}
                                                <div className="py-2">
                                                    <input
                                                        type="range"
                                                        min="0"
                                                        max="100"
                                                        value={riskTolerance}
                                                        onChange={handleSliderChange}
                                                        className="w-full h-1.5 bg-slate-800 rounded-lg accent-blue-600 cursor-pointer appearance-none hover:bg-slate-700 transition-colors"
                                                    />
                                                </div>

                                                <p className="text-[9px] text-slate-600 font-mono uppercase tracking-tighter">
                                                    Adjusting volatility frontier via C++ Eigen v3.4
                                                </p>
                                            </div>

                                            {/* Right Column: Constraints Panel */}
                                            <div className="bg-slate-900/20 rounded-xl border border-white/5 p-4">
                                                <ConstraintsPanel constraints={constraints} onChange={setConstraints} />
                                            </div>
                                        </div>
                                    </motion.div>

                                    {/* ALLOCATION PANEL */}
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ duration: 0.5, delay: 0.2 }}
                                        className="bg-slate-900/50 rounded-xl border border-slate-800 p-4 md:p-6 flex flex-col"
                                        style={{ maxHeight: '600px' }}
                                    >
                                        <h3 className="text-sm font-bold text-white mb-4 uppercase tracking-widest border-b border-slate-800 pb-4 flex-shrink-0">Your Portfolio</h3>
                                        <div className="flex-1 overflow-y-auto pr-2">
                                            <AssetAllocationTable weights={selectedPoint ? selectedPoint.weights : []} />
                                            <div className="mt-6">
                                                <AssetAllocationPie data={selectedPoint ? selectedPoint.weights : []} />
                                            </div>
                                        </div>
                                    </motion.div>
                                </div>
                            </motion.div>
                        )}

                        {/* CRYPTO MARKET PULSE VIEW */}
                        {activeTab === 'market' && (
                            <motion.div key="market" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="h-full">
                                <CryptoMarketAnalysis selectedCoin={selectedCoin} onCoinChange={setSelectedCoin} />
                            </motion.div>
                        )}

                        {/* USD RELATIVE STRENGTH VIEW */}
                        {activeTab === 'fiat' && (
                            <motion.div key="fiat" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="h-full">
                                <USDRelativeTerminal />
                            </motion.div>
                        )}

                        {/* RISK LAB VIEW */}
                        {activeTab === 'risk' && (
                            <motion.div
                                key="risk"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                transition={{ duration: 0.3 }}
                                className="space-y-6"
                            >
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <VaRCard risk={varData ? varData.historical_var : 0} portfolioReturn={0} />
                                    <ScenarioAnalysis customScenarios={scenarioData} baselineReturn={selectedPoint ? selectedPoint.return : 0} />
                                </div>
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 }}
                                    className="bg-slate-900/40 border border-slate-800 rounded-xl p-4 md:p-6"
                                >
                                    <h3 className="text-base md:text-lg font-bold text-white mb-6 uppercase tracking-tight flex items-center gap-2">
                                        <TrendingUp size={20} className="text-blue-500" /> Monte Carlo Simulation
                                    </h3>
                                    {simulationData ? <MonteCarloChart data={simulationData} /> : <div className="h-[400px] flex items-center justify-center text-slate-500 font-mono text-xs">CALCULATING 1,000 SCENARIOS...</div>}
                                </motion.div>
                            </motion.div>
                        )}

                        {/* BACKTEST VIEW */}
                        {activeTab === 'backtest' && (
                            <motion.div
                                key="backtest"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                transition={{ duration: 0.3 }}
                                className="bg-slate-900/40 p-4 md:p-6 rounded-xl border border-slate-800"
                            >
                                <BacktestChart weights={selectedPoint ? selectedPoint.weights : []} />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </main>
        </div>
    );
}

// --- HELPER COMPONENTS ---

function SidebarItem({ icon, label, active, onClick }) {
    return (
        <motion.button
            whileHover={{ x: 4 }}
            whileTap={{ scale: 0.98 }}
            onClick={onClick}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all group ${
                active ? "bg-blue-600 text-white shadow-lg shadow-blue-900/20" : "text-slate-500 hover:bg-slate-800 hover:text-slate-200"
            }`}
        >
            <span className={`flex-shrink-0 ${active ? "text-white" : "text-slate-500 group-hover:text-blue-400"}`}>{icon}</span>
            <span className="text-sm font-medium tracking-tight truncate">{label}</span>
            {active && <motion.div layoutId="activeIndicator" className="ml-auto w-1 h-4 bg-white rounded-full flex-shrink-0" />}
        </motion.button>
    );
}

function TopStat({ label, value, isPercent, index = 0 }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * index }}
            className="flex flex-col min-w-0"
        >
            <span className="text-blue-100 text-[10px] uppercase font-bold tracking-widest mb-1 opacity-80 truncate">{label}</span>
            <div className="text-2xl md:text-3xl font-bold text-white tracking-tighter flex items-baseline gap-1">
                {isPercent && <span className="text-lg text-blue-200 font-light">$</span>}
                <AnimatedNumber value={parseFloat(value)} />
                {isPercent && <span className="text-sm font-light">%</span>}
            </div>
            <motion.div
                initial={{ width: 0 }}
                animate={{ width: "auto" }}
                transition={{ delay: 0.3 + (0.1 * index) }}
                className="flex items-center gap-1.5 text-[10px] text-blue-100 mt-2 bg-blue-500/30 w-fit px-2 py-0.5 rounded-full"
            >
                <TrendingUp size={10} /> <span className="whitespace-nowrap">3.78% Up</span>
            </motion.div>
        </motion.div>
    );
}