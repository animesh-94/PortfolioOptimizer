import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowRight, Cpu, BarChart3, ShieldAlert, Globe, Activity,
    Play, Mail, Linkedin, Github, ChevronRight, Terminal, Menu, X, Percent
} from 'lucide-react';
import { usePortfolio } from '../context/PortfolioContext';

export default function NewLandingPage() {
    const [time, setTime] = useState(new Date());
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const { riskFreeRate, setRiskFreeRate } = usePortfolio();
    const navigate = useNavigate();

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const scrollToSection = (id) => {
        setIsMobileMenuOpen(false);
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };

    const animations = useMemo(() => ({
        fadeInUp: {
            hidden: { opacity: 0, y: 30 },
            visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
        },
        staggerContainer: {
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { staggerChildren: 0.2 } }
        }
    }), []);

    return (
        <div className="min-h-screen bg-slate-950 font-sans text-slate-400 selection:bg-blue-500/30 overflow-x-hidden">

            {/* NAVIGATION MODULE */}
            <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-950/80 backdrop-blur-xl border-b border-white/5 px-8 py-4 flex items-center justify-between h-16">
                <div className="flex items-center gap-2 cursor-pointer shrink-0 z-50" onClick={() => navigate('/')}>
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse shadow-[0_0_10px_#3b82f6]" />
                    <span className="text-white font-bold tracking-tighter text-lg uppercase">Frontier<span className="text-blue-500">Lab</span></span>
                </div>

                <div className="hidden xl:flex items-center gap-8">
                    <NavLink label="Home" onClick={() => navigate('/')} />
                    <NavLink label="About" onClick={() => scrollToSection('about')} />
                    {/*<NavLink label="Testimonials" onClick={() => scrollToSection('testimonials')} />*/}
                    <NavLink label="Contact" onClick={() => scrollToSection('contact')} />
                </div>

                <div className="flex items-center gap-6">
                    {/*<div className="hidden md:flex items-center gap-4 bg-slate-900/40 border border-slate-800 rounded-full px-4 py-1.5 transition-all hover:border-slate-700">*/}
                    {/*    <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">*/}
                    {/*        <Percent size={12} className="text-blue-500" />*/}
                    {/*        <span>RF Rate</span>*/}
                    {/*    </div>*/}
                    {/*    <input*/}
                    {/*        type="range" min="0" max="10" step="0.1"*/}
                    {/*        value={riskFreeRate}*/}
                    {/*        onChange={(e) => setRiskFreeRate(parseFloat(e.target.value))}*/}
                    {/*        className="w-20 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"*/}
                    {/*    />*/}
                    {/*    <span className="text-xs font-mono text-white w-8 text-right font-bold">{riskFreeRate.toFixed(1)}%</span>*/}
                    {/*</div>*/}

                    <div className="flex items-center gap-6">
                        {/*<span className="hidden lg:block text-[10px] font-mono text-slate-500 uppercase tracking-[0.2em]">{time.toLocaleTimeString()}</span>*/}
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="bg-blue-600 text-white hover:bg-blue-500 px-5 py-2 rounded-full font-bold text-[10px] uppercase tracking-widest transition-all shadow-lg shadow-blue-900/20 whitespace-nowrap active:scale-95"
                        >
                            Launch Terminal
                        </button>
                        <button className="xl:hidden text-white" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
                        </button>
                    </div>
                </div>

                <AnimatePresence>
                    {isMobileMenuOpen && (
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="fixed inset-0 bg-slate-950 flex flex-col items-center justify-center gap-8 z-40 xl:hidden"
                        >
                            <NavLink label="Home" onClick={() => navigate('/')} large />
                            <NavLink label="About" onClick={() => scrollToSection('about')} large />
                            <NavLink label="Testimonials" onClick={() => scrollToSection('testimonials')} large />
                            <NavLink label="Contact" onClick={() => scrollToSection('contact')} large />
                        </motion.div>
                    )}
                </AnimatePresence>
            </nav>

            {/* HERO SECTION */}
            <section id="home" className="relative pt-48 pb-32 px-6">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] -z-10" />
                <div className="max-w-7xl mx-auto text-center">
                    <motion.div initial="hidden" animate="visible" variants={animations.staggerContainer}>
                        <motion.h1 variants={animations.fadeInUp} className="text-6xl md:text-8xl font-bold text-white tracking-tighter mb-8 leading-tight">
                            Quantum Performance. <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600">Financial Precision.</span>
                        </motion.h1>
                        <motion.p variants={animations.fadeInUp} className="text-lg text-slate-400 max-w-2xl mx-auto mb-10 font-light leading-relaxed">
                            A high-performance portfolio terminal built with a C++ Eigen backend. Visualize the Efficient Frontier and stress-test assets with sub-millisecond execution.
                        </motion.p>
                        <motion.div variants={animations.fadeInUp} className="flex justify-center gap-4">
                            <button onClick={() => navigate('/dashboard')} className="h-14 px-10 rounded-full bg-blue-600 text-white font-bold flex items-center gap-2 hover:bg-blue-500 transition-all shadow-xl shadow-blue-500/20">
                                Open Terminal <ArrowRight size={20} />
                            </button>
                        </motion.div>
                    </motion.div>
                </div>
            </section>

            {/* ABOUT SECTION (ZIG-ZAG) */}
            <section id="about" className="py-32 px-6 relative bg-slate-950">
                <div className="max-w-7xl mx-auto space-y-40">
                    <ZigZagCard
                        image="https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&q=80&w=1000"
                        icon={<Cpu className="text-blue-500" />}
                        title="Eigen Matrix Core"
                        subtitle="Backend: C++ / Eigen 3.4"
                        desc="The heart of the project. We utilize high-performance linear algebra kernels to handle complex matrix decompositions. This allows the terminal to plot the Efficient Frontier for hundreds of assets in under 1ms."
                        metric="0.85ms"
                        label="Engine Latency"
                        reversed={false}
                    />
                    <ZigZagCard
                        image="https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=1000"
                        icon={<BarChart3 className="text-emerald-500" />}
                        title="Historical Backtesting"
                        subtitle="5-Year Strategy Validation"
                        desc="Don't just optimize—validate. Our engine runs historical simulations across a 5-year lookback period, visualizing drawdowns and cumulative returns to stress-test your strategy against real market volatility."
                        metric="99.7%"
                        label="Sim. Accuracy"
                        reversed={true}
                    />
                    <ZigZagCard
                        image="https://images.unsplash.com/photo-1642790106117-e829e14a795f?auto=format&fit=crop&q=80&w=1000"
                        icon={<ShieldAlert className="text-rose-500" />}
                        title="Advanced Risk Metrics"
                        subtitle="Real-time VaR & Sharpe"
                        desc="We compute Value at Risk (95% confidence) and Sharpe Ratios on every recalculation. This gives you an institutional view of risk-adjusted returns and potential tail-risk exposure."
                        metric="Live"
                        label="Computation"
                        reversed={false}
                    />
                    <ZigZagCard
                        image="https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&q=80&w=1000"
                        icon={<Globe className="text-amber-500" />}
                        title="Edge Deployment"
                        subtitle="AWS CloudFront Infrastructure"
                        desc="Deployed across the global AWS edge network. By utilizing Stockholm-based S3 and CloudFront, we ensure that your quantitative analysis is delivered with low latency and enterprise-grade HTTPS security."
                        metric="Global"
                        label="Accessibility"
                        reversed={true}
                    />
                </div>
            </section>

            {/*/!* TESTIMONIALS SECTION (Updated background color to match) *!/*/}
            {/*<section id="testimonials" className="py-32 bg-slate-950 border-t border-white/5">*/}
            {/*    <div className="max-w-7xl mx-auto px-6 text-center">*/}
            {/*        <h2 className="text-3xl font-bold text-white uppercase tracking-widest mb-16">Trusted by Quants</h2>*/}
            {/*        <div className="grid md:grid-cols-3 gap-8">*/}
            {/*            {[1, 2, 3].map((i) => (*/}
            {/*                <div key={i} className="p-8 rounded-2xl bg-slate-900/40 border border-slate-800 text-left hover:border-blue-500/30 transition-all duration-500">*/}
            {/*                    <p className="text-slate-400 italic mb-6">"The C++ backend performance is unmatched. Plotting frontiers in real-time has changed our workflow."</p>*/}
            {/*                    <div className="flex items-center gap-3">*/}
            {/*                        <div className="w-10 h-10 rounded-full bg-blue-600/20 border border-blue-500/50" />*/}
            {/*                        <div>*/}
            {/*                            <div className="text-white font-bold text-xs">Portfolio Manager {i}</div>*/}
            {/*                            <div className="text-blue-500 text-[10px] font-mono uppercase tracking-wider">Global Hedge Fund</div>*/}
            {/*                        </div>*/}
            {/*                    </div>*/}
            {/*                </div>*/}
            {/*            ))}*/}
            {/*        </div>*/}
            {/*    </div>*/}
            {/*</section>*/}

            {/* CONDENSED FOOTER SECTION */}
            <footer id="contact" className="bg-slate-950 border-t border-white/5 pt-16 pb-8">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
                        <div className="col-span-1 md:col-span-2">
                            <div className="flex items-center gap-2 mb-4">
                                <div className="w-2 h-2 bg-blue-500 rounded-full" />
                                <span className="text-white font-bold text-lg tracking-tighter uppercase">FrontierLab</span>
                            </div>
                            <p className="text-slate-500 text-sm max-w-sm leading-relaxed font-light">
                                High-performance quantitative terminal bridging C++ kernels and modern financial visualization.
                            </p>
                        </div>
                        <div>
                            <h4 className="text-white font-bold text-[10px] uppercase tracking-widest mb-4">Platform</h4>
                            <ul className="space-y-2 text-xs text-slate-500">
                                <li className="hover:text-blue-400 cursor-pointer transition-colors" onClick={() => navigate('/dashboard')}>Terminal</li>
                                <li className="hover:text-blue-400 cursor-pointer transition-colors">Documentation</li>
                                <li className="hover:text-blue-400 cursor-pointer transition-colors">Eigen API</li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-white font-bold text-[10px] uppercase tracking-widest mb-4">Connect</h4>
                            <div className="flex gap-3">
                                <SocialBtn icon={<Github size={16} />} />
                                <SocialBtn icon={<Linkedin size={16} />} />
                                <SocialBtn icon={<Mail size={16} />} />
                            </div>
                        </div>
                    </div>
                    <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] font-mono text-slate-600">
                        <span>© 2026 FRONTIERLAB ANALYTICS. STOCKHOLM, SE.</span>
                        <div className="flex gap-6 uppercase tracking-widest">
                            <span className="hover:text-white cursor-pointer transition-colors">Privacy</span>
                            <span className="hover:text-white cursor-pointer transition-colors">Terms</span>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}

function NavLink({ label, onClick, large }) {
    return (
        <button
            onClick={onClick}
            className={`font-bold text-slate-500 hover:text-white uppercase tracking-[0.2em] transition-all hover:scale-105 ${large ? "text-xl" : "text-[10px]"}`}
        >
            {label}
        </button>
    );
}

function ZigZagCard({ image, icon, title, subtitle, desc, metric, label, reversed }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className={`flex flex-col ${reversed ? 'md:flex-row-reverse' : 'md:flex-row'} items-center gap-12 md:gap-24`}
        >
            <div className="flex-1 w-full">
                <div className="relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-700" />
                    <div className="relative aspect-video rounded-2xl overflow-hidden border border-white/10 bg-slate-900 shadow-2xl">
                        <img src={image} alt={title} className="w-full h-full object-cover group-hover:scale-105 transition duration-700" />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 to-transparent" />
                    </div>
                </div>
            </div>
            <div className="flex-1 space-y-6 text-left">
                <div className="w-12 h-12 rounded-xl bg-slate-900 border border-white/5 flex items-center justify-center">
                    {icon}
                </div>
                <div className="space-y-2">
                    <p className="text-[10px] font-mono text-blue-500 uppercase tracking-[0.3em] font-bold">{subtitle}</p>
                    <h3 className="text-3xl md:text-4xl font-bold text-white tracking-tight">{title}</h3>
                </div>
                <p className="text-slate-500 text-lg leading-relaxed font-light">{desc}</p>
                <div className="flex items-end gap-3 pt-4">
                    <span className="text-4xl font-bold text-white tracking-tighter">{metric}</span>
                    <span className="text-[10px] text-slate-600 uppercase tracking-widest font-mono pb-2">{label}</span>
                </div>
            </div>
        </motion.div>
    );
}

function SocialBtn({ icon }) {
    return (
        <button className="w-9 h-9 rounded-xl bg-slate-900 border border-white/5 flex items-center justify-center text-slate-500 hover:text-white hover:bg-blue-600 transition-all">
            {icon}
        </button>
    );
}