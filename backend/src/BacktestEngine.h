#ifndef BACKTEST_ENGINE_H
#define BACKTEST_ENGINE_H

#include <vector>

struct BacktestResult {
    std::vector<double> equityCurve;
    std::vector<double> drawdown;
    double cagr;
    double maxDrawdown;
};

class BacktestEngine {
public:
    static BacktestResult run(
        const std::vector<std::vector<double>>& returns,
        const std::vector<double>& weights
    );
};

#endif
