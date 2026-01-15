#ifndef PORTFOLIO_METRICS_H
#define PORTFOLIO_METRICS_H

#include <vector>

class PortfolioMetrics {
public:
    static double portfolioReturn(
        const std::vector<double>& weights,
        const std::vector<double>& meanReturns
    );

    static double portfolioVariance(
        const std::vector<double>& weights,
        const std::vector<std::vector<double>>& cov
    );

    static double portfolioRisk(double variance);

    static double sharpeRatio(
        double expectedReturn,
        double risk,
        double riskFreeRate
    );

    static std::vector<double> portfolioReturnSeries(
        const std::vector<std::vector<double>>& returns,
        const std::vector<double>& weights
    );

};

#endif
