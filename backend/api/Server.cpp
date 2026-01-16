#include "Server.h"
#include "httplib.h"
#include "json.hpp"

#include "../src/Optimizer.h"
#include "../src/PortfolioMetrics.h"
#include "../src/RiskMetrics.h"
#include "../src/DataCache.h"
#include "../src/Statistics.h"
#include "../src/BacktestEngine.h"
#include "../src/data/MarketDataService.h"

#include <iostream>

using json = nlohmann::json;

void Server::start(int port) {

    // ===============================
    // Load data ONCE (IMPORTANT)
    // ===============================
    DataCache::instance().loadIfNeeded();

    httplib::Server svr;

    // ===============================
    // CORS (for frontend)
    // ===============================
    svr.set_pre_routing_handler([](const httplib::Request& req, httplib::Response& res) {
        res.set_header("Access-Control-Allow-Origin", "*");
        res.set_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
        res.set_header("Access-Control-Allow-Headers", "Content-Type");

        if (req.method == "OPTIONS") {
            res.status = 204;
            return httplib::Server::HandlerResponse::Handled;
        }
        return httplib::Server::HandlerResponse::Unhandled;
    });

    // ===============================
    // HEALTH CHECK
    // ===============================
    svr.Get("/health", [](const httplib::Request&, httplib::Response& res) {
        json j;
        j["status"] = "ok";
        j["service"] = "Portfolio Optimizer API";
        res.set_content(j.dump(), "application/json");
    });

    // ===============================
    // POST /api/tangency
    // ===============================
    svr.Post("/api/tangency", [&](const httplib::Request& req, httplib::Response& res) {

        try {
            json body = json::parse(req.body);
            double rf = body.value("risk_free_rate", 0.0);

            auto &mu  = DataCache::instance().mean();
            auto &cov = DataCache::instance().cov();

            Optimizer opt;
            auto tp = opt.computeTangencyPortfolio(mu, cov, rf);

            json response;
            response["expected_return"] = tp.expectedReturn;
            response["risk"] = tp.risk;
            response["sharpe_ratio"] =
                PortfolioMetrics::sharpeRatio(tp.expectedReturn, tp.risk, rf);

            response["weights"] = json::array();
            for (size_t i = 0; i < tp.weights.size(); i++) {
                response["weights"].push_back({
                    {"asset", static_cast<int>(i)},
                    {"weight", tp.weights[i]}
                });
            }

            res.set_content(response.dump(), "application/json");
            res.status = 200;
        }
        catch (const std::exception& e) {
            res.status = 400;
            res.set_content(json{{"error", e.what()}}.dump(), "application/json");
        }
    });

    // ===============================
    // POST /api/efficientFrontier
    // ===============================
    svr.Post("/api/efficientFrontier", [&](const httplib::Request& req, httplib::Response& res) {

        try {
            json body = json::parse(req.body);
            int points = body.value("points", 30);

            auto &mu  = DataCache::instance().mean();
            auto &cov = DataCache::instance().cov();

            Optimizer opt;
            auto frontier = opt.computeEfficientFrontier(mu, cov, points);

            json response;
            response["efficient_frontier"] = json::array();

            for (const auto &pt : frontier) {
                response["efficient_frontier"].push_back({
                    {"risk", pt.first},
                    {"return", pt.second},
                    {"risk_pct", pt.first * 100.0},
                    {"return_pct", pt.second * 100.0}
                });
            }

            res.set_content(response.dump(), "application/json");
            res.status = 200;
        }
        catch (const std::exception& e) {
            res.status = 400;
            res.set_content(json{{"error", e.what()}}.dump(), "application/json");
        }
    });

    // ===============================
    // POST /api/risk-parity
    // ===============================
    svr.Post("/api/risk-parity", [&](const httplib::Request&, httplib::Response& res) {

        try {
            auto &mu  = DataCache::instance().mean();
            auto &cov = DataCache::instance().cov();

            Optimizer opt;
            auto rp = opt.computeRiskParityPortfolio(mu, cov);

            json response;
            response["expected_return"] = rp.expectedReturn;
            response["risk"] = rp.risk;

            response["weights"] = json::array();
            for (size_t i = 0; i < rp.weights.size(); i++) {
                response["weights"].push_back({
                    {"asset", static_cast<int>(i)},
                    {"weight", rp.weights[i]}
                });
            }

            res.set_content(response.dump(), "application/json");
            res.status = 200;
        }
        catch (const std::exception& e) {
            res.status = 400;
            res.set_content(json{{"error", e.what()}}.dump(), "application/json");
        }
    });

    // ===============================
    // POST /api/var
    // ===============================
    svr.Post("/api/var", [&](const httplib::Request& req, httplib::Response& res) {

        try {
            json body = json::parse(req.body);
            double confidence = body.value("confidence", 0.95);

            auto &returns = DataCache::instance().returns();
            auto &mu      = DataCache::instance().mean();
            auto &cov     = DataCache::instance().cov();

            Optimizer opt;
            auto tp = opt.computeTangencyPortfolio(mu, cov, 0.001);

            auto portReturns =
                PortfolioMetrics::portfolioReturnSeries(
                    returns,
                    tp.weights
                );

            double var =
                RiskMetrics::historicalVaR(portReturns, confidence);

            json response;
            response["confidence"] = confidence;
            response["historical_var"] = var;

            res.set_content(response.dump(), "application/json");
            res.status = 200;
        }
        catch (const std::exception& e) {
            res.status = 400;
            res.set_content(json{{"error", e.what()}}.dump(), "application/json");
        }
    });

    // ===============================
    // POST /api/stress
    // ===============================
    svr.Post("/api/stress", [&](const httplib::Request& req, httplib::Response& res) {

        try {
            json body = json::parse(req.body);

            double crash   = body.value("market_crash", 0.30);
            int asset      = body.value("asset_index", 0);
            double shock   = body.value("asset_shock", 0.50);
            double volMult = body.value("vol_multiplier", 2.0);

            auto &mu  = DataCache::instance().mean();
            auto &cov = DataCache::instance().cov();

            Optimizer opt;
            auto tp = opt.computeTangencyPortfolio(mu, cov, 0.001);

            auto crashRes =
                RiskMetrics::marketCrash(tp.weights, mu, cov, crash);

            auto shockRes =
                RiskMetrics::singleAssetShock(
                    tp.weights, mu, cov, asset, shock
                );

            auto volRes =
                RiskMetrics::volatilitySpike(
                    tp.weights, mu, cov, volMult
                );

            json response;
            response["market_crash_return"] = crashRes.stressedReturn;
            response["single_asset_shock_return"] = shockRes.stressedReturn;
            response["volatility_spike_risk"] = volRes.stressedRisk;

            res.set_content(response.dump(), "application/json");
            res.status = 200;
        }
        catch (const std::exception& e) {
            res.status = 400;
            res.set_content(json{{"error", e.what()}}.dump(), "application/json");
        }
    });

    // POST -- /api/montecarlo
    svr.Post("/api/montecarlo",
    [&](const httplib::Request& req, httplib::Response& res) {

        try {
            json body = json::parse(req.body);
            int numSim = body.value("num_simulations", 1000);
            int horizon = body.value("horizon", 252);

            DataCache::instance().loadIfNeeded();
            auto& mu = DataCache::instance().mean();
            auto& cov = DataCache::instance().cov();

            Optimizer opt;
            auto tp = opt.computeTangencyPortfolio(mu, cov, 0.001);

            double mu_p =
                PortfolioMetrics::portfolioReturn(tp.weights, mu);

            double sigma_p =
                PortfolioMetrics::portfolioRisk(
                    PortfolioMetrics::portfolioVariance(tp.weights, cov)
                );

            auto paths =
                RiskMetrics::monteCarloPortfolioPaths(
                    mu_p, sigma_p, numSim, horizon
                );

            // ---- Percentiles ----
            json p5 = json::array();
            json p50 = json::array();
            json p95 = json::array();

            for (int t = 0; t < horizon; t++) {
                std::vector<double> slice;
                for (auto& p : paths)
                    slice.push_back(p[t]);

                std::sort(slice.begin(), slice.end());

                p5.push_back(slice[int(0.05 * numSim)]);
                p50.push_back(slice[int(0.50 * numSim)]);
                p95.push_back(slice[int(0.95 * numSim)]);
            }

            json response;
            response["paths"] = paths;
            response["percentiles"] = {
                {"p5", p5},
                {"p50", p50},
                {"p95", p95}
            };

            res.set_content(response.dump(), "application/json");
            res.status = 200;
        }
        catch (const std::exception& e) {
            res.status = 400;
            res.set_content(json{{"error", e.what()}}.dump(),
                            "application/json");
        }
    });

    //POST Api for backtest
    svr.Post("/api/backtest",
[&](const httplib::Request& req, httplib::Response& res) {
        try {
            DataCache::instance().loadIfNeeded();

            auto returns = DataCache::instance().returns();
            auto &mu = DataCache::instance().mean();
            auto &cov = DataCache::instance().cov();

            Optimizer opt;
            auto tp = opt.computeTangencyPortfolio(mu, cov, 0.001);

            auto bt =
                BacktestEngine::run(
                    returns,
                    tp.weights
                );

            json response;
            response["equity_curve"] = bt.equityCurve;
            response["drawdown"] = bt.drawdown;
            response["cagr"] = bt.cagr;
            response["max_drawdown"] = bt.maxDrawdown;

            res.set_content(response.dump(), "application/json");
            res.status = 200;
        }
        catch (const std::exception& e) {
            res.status = 400;
            res.set_content(
                json{{"error", e.what()}}.dump(),
                "application/json"
            );
        }
    });



    // ===============================
    // START SERVER
    // ===============================
    std::cout << "API running on port " << port << std::endl;
    svr.listen("0.0.0.0", port);
}
