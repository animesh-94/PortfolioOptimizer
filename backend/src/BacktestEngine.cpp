#include "BacktestEngine.h"
#include "PortfolioMetrics.h"
#include <cmath>
#include <algorithm>

BacktestResult BacktestEngine::run(
    const std::vector<std::vector<double>>& returns,
    const std::vector<double>& weights
) {
    BacktestResult result;

    int T = returns.size();
    if (T == 0) return result;

    result.equityCurve.resize(T);
    result.drawdown.resize(T);

    double equity = 1.0;
    double peak = 1.0;

    for (int t = 0; t < T; t++) {
        double r =
            PortfolioMetrics::portfolioReturn(
                weights,
                returns[t]
            );

        equity *= (1.0 + r);
        peak = std::max(peak, equity);

        result.equityCurve[t] = equity;
        result.drawdown[t] = (equity - peak) / peak;
    }

    // ---- Metrics ----
    double years = T / 252.0;
    result.cagr = std::pow(equity, 1.0 / years) - 1.0;

    result.maxDrawdown =
        *std::min_element(
            result.drawdown.begin(),
            result.drawdown.end()
        );

    return result;
}
