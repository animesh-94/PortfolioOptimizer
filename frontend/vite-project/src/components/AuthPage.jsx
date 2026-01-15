import React, { useState } from 'react';
import { Activity, ArrowRight, ShieldCheck, Lock, Mail, Key, UserPlus, LogIn } from 'lucide-react';

export default function AuthPage({ onLogin, onClose }) {
    const [isLogin, setIsLogin] = useState(true); // Toggle between Login/Signup
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        setIsLoading(true);

        // SIMULATION: In real app, call your C++ Backend here
        setTimeout(() => {
            setIsLoading(false);
            onLogin(); // Trigger the success callback in LandingPage
        }, 1500);
    };

    return (
        <div className="fixed inset-0 z-50 flex bg-slate-950 text-slate-300 font-sans animate-in fade-in duration-300">

            {/* --- LEFT SIDE: BRANDING & VISUALS --- */}
            <div className="hidden lg:flex w-1/2 bg-slate-900/50 relative overflow-hidden items-center justify-center border-r border-white/5">
                {/* Background Effects */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-blue-600/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-emerald-600/5 rounded-full blur-[100px]" />

                <div className="relative z-10 max-w-lg px-12">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-900/20 border border-blue-500/30 text-blue-400 text-xs font-mono mb-6">
                        <Activity size={12} /> SYSTEM SECURE
                    </div>
                    <h1 className="text-5xl font-bold text-white mb-6 tracking-tight">
                        Institutional <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">
                            Access Portal
                        </span>
                    </h1>
                    <p className="text-lg text-slate-400 leading-relaxed mb-8">
                        Join 10,000+ analysts using FrontierLab to optimize asset allocation with institutional-grade Monte Carlo simulations.
                    </p>

                    {/* Feature List */}
                    <div className="space-y-4">
                        {[
                            "Real-time Efficient Frontier Calculation",
                            "99% Confidence VaR Stress Testing",
                            "C++ Powered Low-Latency Engine"
                        ].map((item, i) => (
                            <div key={i} className="flex items-center gap-3 text-slate-300">
                                <div className="p-1 bg-emerald-500/10 rounded-full text-emerald-400">
                                    <ShieldCheck size={14} />
                                </div>
                                {item}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* --- RIGHT SIDE: AUTH FORM --- */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 relative">
                {/* Close Button */}
                <button onClick={onClose} className="absolute top-8 right-8 text-slate-500 hover:text-white transition-colors">
                    Back to Site
                </button>

                <div className="w-full max-w-md space-y-8">
                    <div className="text-center lg:text-left">
                        <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mb-6 mx-auto lg:mx-0 shadow-lg shadow-blue-900/20">
                            <Lock className="text-white" size={24} />
                        </div>
                        <h2 className="text-3xl font-bold text-white tracking-tight">
                            {isLogin ? "Initialize Session" : "Request Access"}
                        </h2>
                        <p className="text-slate-400 mt-2">
                            {isLogin ? "Enter your credentials to access the terminal." : "Create a new workspace ID."}
                        </p>
                    </div>

                    {/* FORM */}
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Email Access Key</label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-3.5 text-slate-500 group-focus-within:text-blue-400 transition-colors" size={18} />
                                <input
                                    type="email"
                                    required
                                    placeholder="trader@frontierlab.app"
                                    className="w-full bg-slate-900 border border-slate-800 rounded-xl py-3 pl-12 pr-4 text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Passcode</label>
                            <div className="relative group">
                                <Key className="absolute left-4 top-3.5 text-slate-500 group-focus-within:text-blue-400 transition-colors" size={18} />
                                <input
                                    type="password"
                                    required
                                    placeholder="••••••••"
                                    className="w-full bg-slate-900 border border-slate-800 rounded-xl py-3 pl-12 pr-4 text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                                />
                            </div>
                        </div>

                        {/* Sign Up Extra Field */}
                        {!isLogin && (
                            <div className="space-y-1 animate-in slide-in-from-top-2 fade-in">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Confirm Passcode</label>
                                <div className="relative group">
                                    <Key className="absolute left-4 top-3.5 text-slate-500 group-focus-within:text-blue-400 transition-colors" size={18} />
                                    <input
                                        type="password"
                                        required
                                        placeholder="••••••••"
                                        className="w-full bg-slate-900 border border-slate-800 rounded-xl py-3 pl-12 pr-4 text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                                    />
                                </div>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3.5 rounded-xl transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_30px_rgba(37,99,235,0.5)] flex items-center justify-center gap-2 mt-2"
                        >
                            {isLoading ? (
                                <Activity className="animate-spin" size={20} />
                            ) : (
                                <>
                                    {isLogin ? "Launch Terminal" : "Create Account"} <ArrowRight size={18} />
                                </>
                            )}
                        </button>
                    </form>

                    {/* Toggle Login/Signup */}
                    <div className="pt-6 border-t border-slate-800/50 text-center">
                        <p className="text-slate-500 text-sm">
                            {isLogin ? "New to FrontierLab?" : "Already have a workspace?"}{" "}
                            <button
                                onClick={() => setIsLogin(!isLogin)}
                                className="text-blue-400 hover:text-blue-300 font-semibold transition-colors ml-1"
                            >
                                {isLogin ? "Request Access" : "Sign In"}
                            </button>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}