#ifndef OPTIMIZER_H
#define OPTIMIZER_H

#include <vector>
#include <utility>

struct TangencyPortfolio {
    double expectedReturn;
    double risk;
    std::vector<double> weights;
};

struct CMLPoint {
    double risk;
    double expectedReturn;
};

struct PortfolioResult {
    std::vector<double> weights;
    double expectedReturn;
    double risk;
};


class Optimizer {
public:
    static std::vector<double>
    minimizeVariance(const std::vector<std::vector<double>>& cov,
                     int maxIter = 1000,
                     double lr = 0.01);

    std::vector<std::pair<double, double>>
    computeEfficientFrontier(
        const std::vector<double>& mu,
        const std::vector<std::vector<double>>& cov,
        int points);

    TangencyPortfolio
    computeTangencyPortfolio(
        const std::vector<double>& mu,
        const std::vector<std::vector<double>>& cov,
        double rf);

    std::vector<CMLPoint>
    computeCapitalMarketLine(
        double rf,
        double marketReturn,
        double marketRisk,
        int points
    );

    PortfolioResult computeRiskParityPortfolio(
        const std::vector<double>& mu,
        const std::vector<std::vector<double>>& cov,
        int maxIter = 500,
        double tol = 1e-8
    );
};

#endif
