import React from 'react';
import { ArrowRight, Play, Lock } from 'lucide-react';
// Import your Dashboard
import EfficientFrontierDashboard from './EfficientFrontierDashboard.jsx';

export default function HeroSection({ isAuthenticated, onOpenLogin, onLaunchTerminal }) {
    return (
        <section className="relative pt-32 pb-20 overflow-hidden">
            {/* Background Gradients */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-blue-600/20 rounded-full blur-[120px] -z-10" />

            <div className="max-w-7xl mx-auto px-6 text-center">
                {/* Badge */}
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-900/20 border border-blue-500/30 text-blue-400 text-xs font-mono mb-8 animate-fade-in-up">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                    </span>
                    SYSTEM ONLINE: MARKET DATA LIVE
                </div>

                {/* Headlines */}
                <h1 className="text-5xl md:text-7xl font-semibold text-white tracking-tight mb-6 leading-tight">
                    {/*Institutional-Grade <br />*/}
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-400 to-emerald-400">
                        Portfolio Analytics
                    </span>
                </h1>

                <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
                    Democratizing Modern Portfolio Theory. Visualize risk, optimize asset allocation, and stress-test your strategy against historical volatility.
                </p>

                {/* Buttons */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
                    <button
                        onClick={onLaunchTerminal}
                        className="h-12 px-8 rounded-full bg-white text-slate-950 font-semibold hover:bg-slate-200 transition-colors flex items-center gap-2 shadow-[0_0_20px_rgba(255,255,255,0.3)]"
                    >
                        {isAuthenticated ? "Go to Dashboard" : "Start Optimizing Now"} <ArrowRight size={18} />
                    </button>
                    <button className="h-12 px-8 rounded-full bg-slate-800 text-white font-medium hover:bg-slate-700 transition-colors border border-slate-700 flex items-center gap-2">
                        <Play size={16} className="text-slate-400" /> Watch Demo
                    </button>
                </div>

                {/* --- THE APP FRAME (The Logic Switch) --- */}
                <div className="relative mx-auto max-w-6xl transition-all duration-1000" id="terminal-view">

                    {/* 1. LOCKED OVERLAY (Shows if NOT authenticated) */}
                    {!isAuthenticated && (
                        <div className="absolute inset-0 z-10 backdrop-blur-sm bg-slate-950/60 rounded-xl flex flex-col items-center justify-center border border-white/10 transition-all duration-500">
                            <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-4 shadow-xl border border-white/10">
                                <Lock className="text-blue-400" size={32} />
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-2">Terminal Locked</h3>
                            <p className="text-slate-400 mb-6">Authentication required to access live computation engine.</p>
                            <button onClick={onOpenLogin} className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-lg shadow-lg">
                                Login to Access
                            </button>
                        </div>
                    )}

                    {/* 2. THE ACTUAL DASHBOARD (Always rendered, just blurred/covered if locked) */}
                    <div className={`rounded-xl bg-slate-900/50 backdrop-blur-sm border border-slate-700/50 p-2 shadow-2xl ring-1 ring-white/10 ${!isAuthenticated ? 'opacity-40 pointer-events-none' : ''}`}>
                        <div className="flex items-center gap-2 px-4 py-2 border-b border-white/5 bg-slate-900/80 rounded-t-lg">
                            <div className="flex gap-1.5"><div className="w-3 h-3 rounded-full bg-rose-500/50" /><div className="w-3 h-3 rounded-full bg-amber-500/50" /><div className="w-3 h-3 rounded-full bg-emerald-500/50" /></div>
                            <div className="ml-4 px-3 py-1 bg-slate-950 rounded text-[10px] text-slate-500 font-mono flex items-center gap-2"><Lock size={8} /> frontier-lab.app/dashboard</div>
                        </div>

                        {/* THE CHART COMPONENT */}
                        <EfficientFrontierDashboard />
                    </div>
                </div>
            </div>
        </section>
    );
}