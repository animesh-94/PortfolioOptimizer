#include "Statistics.h"
#include "Optimizer.h"
#include <iostream>
#include <vector>
#include <fstream>
#include <cmath>

void exportFrontierToJSON(
    const std::string& filename,
    const std::vector<std::pair<double, double>>& frontier
) {
    std::ofstream file(filename);
    file << "{\n  \"efficient_frontier\": [\n";

    for (size_t i = 0; i < frontier.size(); i++) {
        file << "    { \"risk\": " << frontier[i].first
             << ", \"return\": " << frontier[i].second << " }";

        if (i + 1 < frontier.size()) file << ",";
        file << "\n";
    }

    file << "  ]\n}\n";
    file.close();
}

double portfolioVariance(
    const std::vector<double>& w,
    const std::vector<std::vector<double>>& cov) {

    double var = 0.0;
    int N = w.size();

    for (int i = 0; i < N; i++) {
        for (int j = 0; j < N; j++) {
            var += w[i] * cov[i][j] * w[j];
        }
    }
    return var;
}

int main() {

    auto prices = Statistics::readCSV("data/prices.csv");
    auto returns = Statistics::computeReturns(prices);
    std::cout << "\nRETURNS MATRIX:\n";
    for (const auto& row : returns) {
        for (double v : row) {
            std::cout << v << " ";
        }
        std::cout << std::endl;
    }

    auto meanReturns = Statistics::computeReturnsMean(returns);
    std::cout << "\nMEAN RETURNS:\n";
    for (double m : meanReturns) {
        std::cout << m << " ";
    }
    std::cout << std::endl;

    auto cov = Statistics::computeCovariance(returns, meanReturns);
    std::cout << "\nCOVARIANCE MATRIX:\n";
    for (const auto& row : cov) {
        for (double v : row) {
            std::cout << v << " ";
        }
        std::cout << std::endl;
    }


    auto weights = Optimizer::minimizeVariance(cov);

    double sum = 0.0;
    for (double w : weights) sum += w;
    std::cout << "Sum of weights: " << sum << std::endl;

    int N = weights.size();
    std::vector<double> equalWeights(N, 1.0 / N);

    std::cout << "Equal weight variance: "
              << portfolioVariance(equalWeights, cov) << std::endl;

    std::cout << "Optimized variance: "
              << portfolioVariance(weights, cov) << std::endl;

    std::cout << "\nOptimal Portfolio Weights\n";
    for (int i = 0; i < weights.size(); i++) {
        std::cout << "Asset " << i << ": " << weights[i] << std::endl;
    }

    Optimizer optimizer;

    auto frontier =
        optimizer.computeEfficientFrontier(meanReturns, cov, 20);

    exportFrontierToJSON("efficient_frontier.json", frontier);



    std::cout << "\nEFFICIENT FRONTIER:\n";
    for (auto& p : frontier) {
        std::cout << "Risk: " << p.first
                  << "  Return: " << p.second << "\n";
    }


    return 0;
}
