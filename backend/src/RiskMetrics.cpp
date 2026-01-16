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

MonteCarloResult RiskMetrics::monteCarloSimulation(
    const std::vector<double>& weights,
    const std::vector<double>& mu,
    const std::vector<std::vector<double>>& cov,
    int numSimulations,
    int horizon
) {
    MonteCarloResult result;
    result.paths.resize(numSimulations, std::vector<double>(horizon));

    // ---- Portfolio mean ----
    double mu_p = 0.0;
    for (size_t i = 0; i < weights.size(); i++) {
        mu_p += weights[i] * mu[i];
    }

    // ---- Portfolio variance ----
    double var_p = 0.0;
    for (size_t i = 0; i < weights.size(); i++) {
        for (size_t j = 0; j < weights.size(); j++) {
            var_p += weights[i] * weights[j] * cov[i][j];
        }
    }
    double sigma_p = std::sqrt(var_p);

    std::mt19937 gen(42); // deterministic
    std::normal_distribution<double> dist(mu_p, sigma_p);

    // ---- Simulate paths ----
    for (int s = 0; s < numSimulations; s++) {
        double value = 1.0;
        for (int t = 0; t < horizon; t++) {
            double r = dist(gen);
            value *= (1.0 + r);
            result.paths[s][t] = value;
        }
    }

    // ---- Percentiles ----
    result.p5.resize(horizon);
    result.p50.resize(horizon);
    result.p95.resize(horizon);

    for (int t = 0; t < horizon; t++) {
        std::vector<double> slice;
        slice.reserve(numSimulations);

        for (int s = 0; s < numSimulations; s++) {
            slice.push_back(result.paths[s][t]);
        }

        std::sort(slice.begin(), slice.end());

        result.p5[t]  = slice[(int)(0.05 * numSimulations)];
        result.p50[t] = slice[(int)(0.50 * numSimulations)];
        result.p95[t] = slice[(int)(0.95 * numSimulations)];
    }

    return result;
}

std::vector<std::vector<double>>
RiskMetrics::monteCarloPortfolioPaths(
    double mu_p,
    double sigma_p,
    int numSim,
    int horizon
) {
    std::mt19937 rng(std::random_device{}());
    std::normal_distribution<double> dist(mu_p, sigma_p);

    std::vector<std::vector<double>> paths(numSim,
        std::vector<double>(horizon, 1.0));

    for (int i = 0; i < numSim; i++) {
        double value = 1.0;
        for (int t = 0; t < horizon; t++) {
            double ret = dist(rng);
            value *= (1.0 + ret);
            paths[i][t] = value;
        }
    }
    return paths;
}
