const API_BASE = "/api";

const postData = async (endpoint, payload = {}) => {
    try {
        const response = await fetch(`${API_BASE}${endpoint}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) throw new Error(`API Error: ${response.statusText}`);
        return await response.json();
    } catch (error) {
        console.error(`Failed to fetch ${endpoint}:`, error);
        throw error;
    }
};

export const portfolioApi = {

    // Updated to accept constraints
    getEfficientFrontier: async (points = 60, constraints = {}) => {
        return postData('/efficientFrontier', {
            points,
            constraints // e.g., { long_only: true, max_weight: 0.2 }
        });
    },

    getTangencyPortfolio: async (riskFreeRate, constraints = {}) => {
        return postData('/tangency', {
            risk_free_rate: riskFreeRate,
            constraints
        });
    },

    getVaR: async (confidence = 0.95) => {
        return postData('/var', { confidence });
    },

    getStressTest: async () => {
        return postData('/stress', {
            market_crash: 0.30,
            asset_index: 0,
            asset_shock: 0.50,
            vol_multiplier: 2.0
        });
    },

    runMonteCarlo: async (simulations = 1000) => {
        return postData('/montecarlo', { simulations });
    },

    getBacktest: async (weights, range = '1Y') => {
        return postData('/backtest', { weights, range });
    }
};