#include "RiskMetrics.h"
#include "PortfolioMetrics.h"
#include <vector>
#include <bits/stdc++.h>

StressResult RiskMetrics::marketCrash(
    const std::vector<double>& weights,
    const std::vector<double>& mu,
    const std::vector<std::vector<double>>& cov,
    double crashPct
) {
    std::vector<double> shockedMu = mu;
    for (double& m : shockedMu)
        m *= (1.0 - crashPct);

    double ret =
        PortfolioMetrics::portfolioReturn(weights, shockedMu);

    double risk =
        PortfolioMetrics::portfolioRisk(
            PortfolioMetrics::portfolioVariance(weights, cov));

    return { ret, risk };
}

StressResult RiskMetrics::singleAssetShock(
    const std::vector<double>& weights,
    const std::vector<double>& mu,
    const std::vector<std::vector<double>>& cov,
    int assetIndex,
    double shockPct
) {
    std::vector<double> shockedMu = mu;
    shockedMu[assetIndex] *= (1.0 - shockPct);

    double ret =
        PortfolioMetrics::portfolioReturn(weights, shockedMu);

    double risk =
        PortfolioMetrics::portfolioRisk(
            PortfolioMetrics::portfolioVariance(weights, cov));

    return { ret, risk };
}

StressResult RiskMetrics::volatilitySpike(
    const std::vector<double>& weights,
    const std::vector<double>& mu,
    const std::vector<std::vector<double>>& cov,
    double spikeFactor
) {
    std::vector<std::vector<double>> shockedCov = cov;
    for (auto& row : shockedCov)
        for (double& x : row)
            x *= spikeFactor;

    double ret =
        PortfolioMetrics::portfolioReturn(weights, mu);

    double risk =
        PortfolioMetrics::portfolioRisk(
            PortfolioMetrics::portfolioVariance(weights, shockedCov));

    return { ret, risk };
}

double RiskMetrics::historicalVaR(
    const std::vector<double>& portfolioReturns,
    double confidence
) {
    if (portfolioReturns.empty())
        return 0.0;

    std::vector<double> sorted = portfolioReturns;
    std::sort(sorted.begin(), sorted.end());

    int index = static_cast<int>(
        (1.0 - confidence) * sorted.size()
    );

    index = std::max(0, std::min(index, (int)sorted.size() - 1));

    // VaR is reported as a positive loss
    return -sorted[index];
}
