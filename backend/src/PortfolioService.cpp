#include "PortfolioService.h"
#include "Statistics.h"
#include "Optimizer.h"
#include "RiskMetrics.h"
#include "PortfolioExporter.h"

nlohmann::json computePortfolioFromCSV() {
    auto prices = Statistics::readCSV("../backend/data/prices.csv");
    auto returns = Statistics::computeReturns(prices);
    auto mu = Statistics::computeReturnsMean(returns);
    auto cov = Statistics::computeCovariance(returns, mu);

    Optimizer opt;
    auto tp = opt.computeTangencyPortfolio(mu, cov, 0.001);

    nlohmann::json j;
    j["return"] = tp.expectedReturn;
    j["risk"] = tp.risk;
    j["weights"] = tp.weights;

    return j;
}
