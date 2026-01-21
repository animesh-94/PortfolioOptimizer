import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { PortfolioProvider } from "./context/PortfolioContext.jsx";

// All components are imported from the same folder
import Navbar from './components/Navbar.jsx';
import NewLandingPage from './components/NewLandingPage.jsx';
import EfficientFrontierDashboard from './components/EfficientFrontierDashboard.jsx';

function App() {
    return (
        <PortfolioProvider>
            <Router>
                <div className="min-h-screen bg-[#020617]">
                    {/* Persistent Navbar for both views */}
                    <Navbar />

                    <Routes>
                        {/* Route 1: The Fancy Landing Page */}
                        <Route path="/" element={<NewLandingPage />} />

                        {/* Route 2: The User Dashboard (Portfolio Terminal) */}
                        <Route path="/dashboard" element={
                            <div className="pt-24 pb-12 px-6 max-w-7xl mx-auto">
                                <header className="mb-8">
                                    <h1 className="text-3xl font-bold text-white tracking-tight">Quant Terminal</h1>
                                    <p className="text-slate-500 font-mono text-xs mt-1 uppercase tracking-widest">
                                        Active Node: AWS-EC2-Stockholm • C++ Eigen v3.4
                                    </p>
                                </header>

                                <div className="rounded-3xl border border-slate-800 bg-slate-900/40 backdrop-blur-md p-2 shadow-2xl">
                                    <EfficientFrontierDashboard />
                                </div>
                            </div>
                        } />
                    </Routes>
                </div>
            </Router>
        </PortfolioProvider>
    );
}

export default App;