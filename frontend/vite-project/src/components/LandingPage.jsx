import React, { useState } from 'react';
import Navbar from './Navbar.jsx';
import LoginModal from './LoginModal.jsx';
import HeroSection from './HeroSection.jsx';
import { TrendingUp, Layers, ShieldCheck, Globe, Layout } from 'lucide-react';

export default function LandingPage() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Logic: Scroll to dashboard or open login
    const handleLaunchTerminal = () => {
        if (isAuthenticated) {
            document.getElementById('terminal-view')?.scrollIntoView({ behavior: 'smooth' });
        } else {
            setShowLoginModal(true);
        }
    };

    // Logic: Simulate API Login
    const handleLoginSubmit = (e) => {
        e.preventDefault();
        setIsLoading(true);
        setTimeout(() => {
            setIsLoading(false);
            setIsAuthenticated(true);
            setShowLoginModal(false);
            setTimeout(() => {
                document.getElementById('terminal-view')?.scrollIntoView({ behavior: 'smooth' });
            }, 500);
        }, 1500);
    };

    return (
        <div className="min-h-screen bg-slate-950 font-sans text-slate-300 selection:bg-blue-500/30 selection:text-blue-200">

            <Navbar
                isAuthenticated={isAuthenticated}
                onOpenLogin={() => setShowLoginModal(true)}
                onLaunchTerminal={handleLaunchTerminal}
            />

            <HeroSection
                isAuthenticated={isAuthenticated}
                onOpenLogin={() => setShowLoginModal(true)}
                onLaunchTerminal={handleLaunchTerminal}
            />

            {/* Features Section (Static content can stay here or move to own file) */}
            <section id="features" className="py-24 bg-slate-950 border-t border-white/5">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-semibold text-white mb-4">Everything you need to beat the market</h2>
                        <div className="grid md:grid-cols-3 gap-8 mt-12 text-left">
                            <FeatureCard icon={<TrendingUp className="text-blue-400" />} title="Markowitz Optimization" description="Mathematical optimal portfolio for any risk level." />
                            <FeatureCard icon={<Layers className="text-emerald-400" />} title="Monte Carlo Stress Tests" description="Run 5,000+ simulation scenarios in seconds." />
                            <FeatureCard icon={<ShieldCheck className="text-purple-400" />} title="VaR & Sharpe Analysis" description="Instant computation of Value at Risk (95%)." />
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 bg-slate-950 border-t border-white/10">
                <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
                    <span className="text-slate-500 text-sm">© 2024 FrontierLab Analytics.</span>
                    <div className="flex gap-6 text-slate-400">
                        <Globe size={20} className="hover:text-white cursor-pointer" />
                        <Layout size={20} className="hover:text-white cursor-pointer" />
                    </div>
                </div>
            </footer>

            <LoginModal
                isOpen={showLoginModal}
                onClose={() => setShowLoginModal(false)}
                onLogin={handleLoginSubmit}
                isLoading={isLoading}
            />
        </div>
    );
}

// Small helper for the Features section
function FeatureCard({ icon, title, description }) {
    return (
        <div className="p-6 rounded-2xl bg-slate-900/50 border border-white/5 hover:border-blue-500/30 hover:bg-slate-900 transition-all group">
            <div className="w-12 h-12 rounded-lg bg-slate-800 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                {icon}
            </div>
            <h3 className="text-xl font-medium text-white mb-2">{title}</h3>
            <p className="text-slate-400 text-sm leading-relaxed">{description}</p>
        </div>
    );
}