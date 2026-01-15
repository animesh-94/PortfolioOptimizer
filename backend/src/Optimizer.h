#ifndef PORTFOLIOOPTIMIZER_OPTIMIZER_H
#define PORTFOLIOOPTIMIZER_OPTIMIZER_H

#include <vector>

class Optimizer {
public:
    static std::vector<double>
    minimizeVariance(
        const std::vector<std::vector<double>>& cov,
        int maxIterations = 1000,
        double learningRate = 0.01
    );

    std::vector<std::pair<double, double>>
    computeEfficientFrontier(
    const std::vector<double>& meanReturns,
    const std::vector<std::vector<double>>& covariance,
    int points = 50
);
};

#endif
