#include "Statistics.h"
#include <fstream>
#include <sstream>
#include <iostream>

std::vector<std::vector<double>>
Statistics::readCSV(const std::string& filePath) {
    std::ifstream file(filePath);
    std::vector<std::vector<double>> prices;

    if (!file.is_open()) {
        std::cerr << "Error opening CSV file\n";
        return {};
    }

    std::string line;

    // skip header
    if (!std::getline(file, line)) {
        return {};
    }

    while (std::getline(file, line)) {
        std::stringstream ss(line);
        std::string token;
        std::vector<double> row;

        bool skipFirst = true;
        while (std::getline(ss, token, ',')) {
            if (skipFirst) {
                skipFirst = false;
                continue;
            }
            row.push_back(std::stod(token));
        }

        if (!row.empty())
            prices.push_back(row);
    }

    return prices;
}

std::vector<std::vector<double>>
Statistics::computeReturns(const std::vector<std::vector<double>>& prices) {
    if (prices.size() < 2) return {};

    int T = prices.size();
    int N = prices[0].size();

    std::vector<std::vector<double>> returns(T - 1,
        std::vector<double>(N));

    for (int t = 1; t < T; t++) {
        for (int i = 0; i < N; i++) {
            returns[t - 1][i] =
                (prices[t][i] - prices[t - 1][i]) / prices[t - 1][i];
        }
    }

    return returns;
}

std::vector<double>
Statistics::computeReturnsMean(
    const std::vector<std::vector<double>>& returns) {

    if (returns.empty() || returns[0].empty()) return {};

    int T = returns.size();
    int N = returns[0].size();

    std::vector<double> means(N, 0.0);

    for (int i = 0; i < N; i++) {
        for (int t = 0; t < T; t++)
            means[i] += returns[t][i];
        means[i] /= T;
    }

    return means;
}

std::vector<std::vector<double>>
Statistics::computeCovariance(
    const std::vector<std::vector<double>>& returns,
    const std::vector<double>& means) {

    if (returns.size() < 2 || returns[0].empty()) return {};

    int T = returns.size();
    int N = returns[0].size();

    std::vector<std::vector<double>> cov(N,
        std::vector<double>(N, 0.0));

    for (int i = 0; i < N; i++) {
        for (int j = 0; j < N; j++) {
            for (int t = 0; t < T; t++) {
                cov[i][j] +=
                    (returns[t][i] - means[i]) *
                    (returns[t][j] - means[j]);
            }
            cov[i][j] /= (T - 1);
        }
    }

    return cov;
}
