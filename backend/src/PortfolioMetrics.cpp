#include "PortfolioMetrics.h"
#include <cmath>

double PortfolioMetrics::portfolioReturn(
    const std::vector<double>& w,
    const std::vector<double>& mu
) {
    double r = 0.0;
    for (int i = 0; i < w.size(); i++)
        r += w[i] * mu[i];
    return r;
}

double PortfolioMetrics::portfolioVariance(
    const std::vector<double>& w,
    const std::vector<std::vector<double>>& cov
) {
    double var = 0.0;
    int n = w.size();

    for (int i = 0; i < n; i++)
        for (int j = 0; j < n; j++)
            var += w[i] * cov[i][j] * w[j];

    return var;
}

double PortfolioMetrics::portfolioRisk(double variance) {
    return std::sqrt(std::max(variance, 0.0));
}

double PortfolioMetrics::sharpeRatio(
    double expectedReturn,
    double risk,
    double rf
) {
    if (risk == 0.0) return 0.0;
    return (expectedReturn - rf) / risk;
}

std::vector<double> PortfolioMetrics::portfolioReturnSeries(
    const std::vector<std::vector<double>>& returns,
    const std::vector<double>& weights
) {
    std::vector<double> portfolioReturns;

    for (const auto& row : returns) {
        double r = 0.0;
        for (int i = 0; i < weights.size(); i++)
            r += weights[i] * row[i];

        portfolioReturns.push_back(r);
    }

    return portfolioReturns;
}

