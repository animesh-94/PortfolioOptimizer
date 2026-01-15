#include "Statistics.h"
#include "Optimizer.h"
#include "PortfolioExporter.h"
#include "PortfolioMetrics.h"

#include <iostream>

#include "RiskMetrics.h"

int main() {

    auto prices =
        Statistics::readCSV("../backend/data/prices.csv");
    if (prices.empty()) return 1;

    auto returns = Statistics::computeReturns(prices);
    auto mu = Statistics::computeReturnsMean(returns);
    auto cov = Statistics::computeCovariance(returns, mu);
    if (cov.empty()) return 1;

    Optimizer opt;

    /* ---- Efficient Frontier ---- */
    auto ef = opt.computeEfficientFrontier(mu, cov, 30);

    /* ---- Tangency Portfolio ---- */
    double rf = 0.001;
    auto tp = opt.computeTangencyPortfolio(mu, cov, rf);

    std::cout << "\nTangency Portfolio:\n";
    std::cout << "Return: " << tp.expectedReturn << "\n";
    std::cout << "Risk: " << tp.risk << "\n";

    // Risk Parity Portfolio
    auto rp = opt.computeRiskParityPortfolio(mu, cov);

    std::cout << "\nRisk Parity Portfolio:\n";
    std::cout << "Return: " << rp.expectedReturn << "\n";
    std::cout << "Risk: " << rp.risk << "\n";


    /* ---- Capital Market Line ---- */
    auto cml = opt.computeCapitalMarketLine(
        rf,
        tp.expectedReturn,
        tp.risk,
        30
    );

    /* ---- Equal Weight Portfolio ---- */
    int n = mu.size();
    std::vector<double> equalWeights(n, 1.0 / n);

    double eqReturn =
        PortfolioMetrics::portfolioReturn(equalWeights, mu);
    double eqRisk =
        PortfolioMetrics::portfolioRisk(
            PortfolioMetrics::portfolioVariance(equalWeights, cov));
    double eqSharpe =
        PortfolioMetrics::sharpeRatio(eqReturn, eqRisk, rf);

    double tanSharpe =
        PortfolioMetrics::sharpeRatio(
            tp.expectedReturn,
            tp.risk,
            rf
        );

    std::cout << "\nSHARPE RATIOS\n";
    std::cout << "Equal Weight: " << eqSharpe << "\n";
    std::cout << "Tangency:     " << tanSharpe << "\n";

    auto portReturns =
    PortfolioMetrics::portfolioReturnSeries(
        returns,
        tp.weights
    );

    double var95_hist =
        RiskMetrics::historicalVaR(portReturns, 0.95);

    //market crash
    auto crash =
    RiskMetrics::marketCrash(
        tp.weights, mu, cov, 0.30);

    auto assetShock =
        RiskMetrics::singleAssetShock(
            tp.weights, mu, cov, 0, 0.50);

    auto volSpike =
        RiskMetrics::volatilitySpike(
            tp.weights, mu, cov, 2.0);

    std::cout << "Stress Test Results\n";
    std::cout << "Market Crash Return: " << crash.stressedReturn << "\n";
    std::cout << "Single Asset Shock Return: " << assetShock.stressedReturn << "\n";
    std::cout << "Volatility Spike Risk: " << volSpike.stressedRisk << "\n";


    /* ---- Export ---- */
    exportPortfolioDataToJSON(
        "../frontend/vite-project/public/portfolio_data.json",
        ef,
        cml,
        tp
    );

    return 0;
}
