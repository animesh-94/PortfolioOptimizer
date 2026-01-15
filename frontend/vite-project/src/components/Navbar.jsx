import React from 'react';
import { Activity, ChevronRight, CheckCircle, User, Lock } from 'lucide-react';

export default function Navbar({ isAuthenticated, onOpenLogin, onLaunchTerminal }) {
    return (
        <nav className="fixed top-0 w-full z-40 border-b border-white/5 bg-slate-950/80 backdrop-blur-xl">
            <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-tr from-blue-600 to-cyan-400 rounded-lg flex items-center justify-center">
                        <Activity className="text-white w-5 h-5" />
                    </div>
                    <span className="text-white font-bold tracking-tight text-lg">
                        Frontier<span className="text-slate-500">Lab</span>
                    </span>
                </div>

                <div className="hidden md:flex items-center gap-8 text-sm font-medium">
                    <a href="#features" className="hover:text-white transition-colors">Capabilities</a>
                    <a href="#demo" className="hover:text-white transition-colors">Live Demo</a>

                    {isAuthenticated ? (
                        <div className="flex items-center gap-3 pl-6 border-l border-white/10">
                            <div className="text-right hidden lg:block">
                                <div className="text-xs text-slate-400">Welcome back</div>
                                <div className="text-white font-bold leading-none">Trader_01</div>
                            </div>
                            <div className="w-9 h-9 bg-blue-900/50 rounded-full flex items-center justify-center border border-blue-500/30 text-blue-400">
                                <User size={18} />
                            </div>
                        </div>
                    ) : (
                        <button
                            onClick={onOpenLogin}
                            className="text-slate-400 hover:text-white transition-colors"
                        >
                            Sign In
                        </button>
                    )}

                    <button
                        onClick={onLaunchTerminal}
                        className={`px-4 py-2 border rounded-full text-white transition-all flex items-center gap-2 group ${
                            isAuthenticated
                                ? "bg-emerald-500/10 border-emerald-500/50 hover:bg-emerald-500/20 text-emerald-400"
                                : "bg-white/5 border-white/10 hover:bg-white/10"
                        }`}
                    >
                        {isAuthenticated ? "Open Terminal" : "Launch Terminal"}
                        {isAuthenticated ? <CheckCircle size={14} /> : <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform"/>}
                    </button>
                </div>
            </div>
        </nav>
    );
}