#pragma once
#include <vector>

struct StressResult {
    double stressedReturn;
    double stressedRisk;
};

class RiskMetrics {
public:
    // Parametric (Gaussian) VaR
    static double parametricVaR(
        double portfolioMean,
        double portfolioStd,
        double confidenceLevel
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
