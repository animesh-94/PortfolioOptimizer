#pragma once
#include <vector>

struct StressResult {
    double stressedReturn;
    double stressedRisk;
};

struct MonteCarloResult {
    std::vector<std::vector<double>> paths;
    std::vector<double> p5;
    std::vector<double> p50;
    std::vector<double> p95;
};

class RiskMetrics {
public:
    // Parametric (Gaussian) VaR
    static double parametricVaR(
        double portfolioMean,
        double portfolioStd,
        double confidenceLevel
    );

    //Monte Carlo Simulation
    static MonteCarloResult monteCarloSimulation(
        const std::vector<double>& weights,
        const std::vector<double>& mu,
        const std::vector<std::vector<double>>& cov,
        int numSimulations,
        int horizon
    );

    static std::vector<std::vector<double>>
    monteCarloPortfolioPaths(
        double mu_p,
        double sigma_p,
        int numSim,
        int horizon
    );


    // Historical VaR
    static double historicalVaR(
        const std::vector<double>& portfolioReturns,
        double confidenceLevel
    );

    static StressResult marketCrash(
        const std::vector<double>& weights,
        const std::vector<double>& mu,
        const std::vector<std::vector<double>>& cov,
        double crashPct
    );

    static StressResult singleAssetShock(
        const std::vector<double>& weights,
        const std::vector<double>& mu,
        const std::vector<std::vector<double>>& cov,
        int assetIndex,
        double shockPct
    );

    static StressResult volatilitySpike(
        const std::vector<double>& weights,
        const std::vector<double>& mu,
        const std::vector<std::vector<double>>& cov,
        double spikeFactor
    );
};
