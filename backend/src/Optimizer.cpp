#include "Optimizer.h"
#include <bits/stdc++.h>
#include <cmath>
#include <algorithm>
#include <stdexcept>

#include "OptimizerUtils.h"
#include "PortfolioMetrics.h"

static double dot(const std::vector<double>& a,
                  const std::vector<double>& b) {
    double s = 0.0;
    for (int i = 0; i < a.size(); i++)
        s += a[i] * b[i];
    return s;
}

static std::vector<double>
matVec(const std::vector<std::vector<double>>& A,
       const std::vector<double>& x) {
    std::vector<double> r(A.size(), 0.0);
    for (int i = 0; i < A.size(); i++)
        for (int j = 0; j < x.size(); j++)
            r[i] += A[i][j] * x[j];
    return r;
}

static std::vector<std::vector<double>>
invert(std::vector<std::vector<double>> A) {
    int n = A.size();
    std::vector<std::vector<double>> I(n,
        std::vector<double>(n, 0.0));
    for (int i = 0; i < n; i++) I[i][i] = 1.0;

    for (int i = 0; i < n; i++) {
        double p = A[i][i];
        if (std::abs(p) < 1e-12)
            throw std::runtime_error("Singular matrix");

        for (int j = 0; j < n; j++) {
            A[i][j] /= p;
            I[i][j] /= p;
        }

        for (int k = 0; k < n; k++) {
            if (k == i) continue;
            double f = A[k][i];
            for (int j = 0; j < n; j++) {
                A[k][j] -= f * A[i][j];
                I[k][j] -= f * I[i][j];
            }
        }
    }
    return I;
}

std::vector<double>
Optimizer::minimizeVariance(
    const std::vector<std::vector<double>>& cov,
    int maxIter,
    double lr) {

    int N = cov.size();
    std::vector<double> w(N, 1.0 / N);

    for (int it = 0; it < maxIter; it++) {
        std::vector<double> grad(N, 0.0);
        for (int i = 0; i < N; i++)
            for (int j = 0; j < N; j++)
                grad[i] += 2 * cov[i][j] * w[j];

        for (int i = 0; i < N; i++)
            w[i] -= lr * grad[i];

        double s = 0;
        for (double x : w) s += x;
        for (double& x : w) x /= s;

        OptimizerUtils::applyConstraints(w, 0.3);
    }
    return w;
}

std::vector<std::pair<double, double>>
Optimizer::computeEfficientFrontier(
    const std::vector<double>& mu,
    const std::vector<std::vector<double>>& cov,
    int points) {

    int n = mu.size();
    auto SInv = invert(cov);
    std::vector<double> ones(n, 1.0);

    double A = dot(ones, matVec(SInv, ones));
    double B = dot(ones, matVec(SInv, mu));
    double C = dot(mu, matVec(SInv, mu));
    double D = A * C - B * B;

    double rmin = *std::min_element(mu.begin(), mu.end());
    double rmax = *std::max_element(mu.begin(), mu.end());

    std::vector<std::pair<double, double>> ef;

    for (int i = 0; i < points; i++) {
        double r = rmin + i * (rmax - rmin) / (points - 1);
        double a = (C - B * r) / D;
        double b = (A * r - B) / D;

        std::vector<double> w(n);
        for (int j = 0; j < n; j++)
            w[j] = a * matVec(SInv, ones)[j]
                 + b * matVec(SInv, mu)[j];

        double var = dot(w, matVec(cov, w));
        ef.push_back({ std::sqrt(var), r });
    }

    return ef;
}

TangencyPortfolio
Optimizer::computeTangencyPortfolio(
    const std::vector<double>& mu,
    const std::vector<std::vector<double>>& cov,
    double rf) {

    int n = mu.size();
    auto SInv = invert(cov);

    std::vector<double> excess(n);
    for (int i = 0; i < n; i++)
        excess[i] = mu[i] - rf;

    auto temp = matVec(SInv, excess);
    double denom = 0;
    for (double v : temp) denom += v;

    TangencyPortfolio tp;
    tp.weights.resize(n);
    for (int i = 0; i < n; i++)
        tp.weights[i] = temp[i] / denom;

    OptimizerUtils::applyConstraints(tp.weights, 0.3);


    tp.expectedReturn = dot(tp.weights, mu);
    tp.risk = std::sqrt(dot(tp.weights, matVec(cov, tp.weights)));

    return tp;
}

std::vector<CMLPoint>
Optimizer::computeCapitalMarketLine(
    double rf,
    double marketReturn,
    double marketRisk,
    int points
) {
    std::vector<CMLPoint> cml;

    double slope = (marketReturn - rf) / marketRisk;

    for (int i = 0; i < points; i++) {
        double risk = marketRisk * i / (points - 1);
        double ret  = rf + slope * risk;

        cml.push_back({ risk, ret });
    }

    return cml;
}

PortfolioResult Optimizer::computeRiskParityPortfolio(
    const std::vector<double>& mu,
    const std::vector<std::vector<double>>& cov,
    int maxIter,
    double tol
) {
    int N = mu.size();
    std::vector<double> w(N, 1.0 / N);

    for (int iter = 0; iter < maxIter; iter++) {

        std::vector<double> sigmaW(N, 0.0);
        for (int i = 0; i < N; i++)
            for (int j = 0; j < N; j++)
                sigmaW[i] += cov[i][j] * w[j];

        double portVar = 0.0;
        for (int i = 0; i < N; i++)
            portVar += w[i] * sigmaW[i];

        double targetRC = portVar / N;
        bool converged = true;

        for (int i = 0; i < N; i++) {
            double rc = w[i] * sigmaW[i];
            if (rc <= 1e-10) rc = 1e-10;

            double adjustment = targetRC / rc;
            double newWi = w[i] * adjustment;

            double alpha = 0.3; // damping
            if (std::abs(newWi - w[i]) > tol)
                converged = false;

            w[i] = (1 - alpha) * w[i] + alpha * newWi;
        }

        // Normalize weights
        double sumW = std::accumulate(w.begin(), w.end(), 0.0);
        for (double& wi : w) wi /= sumW;

        if (converged) break;
    }

    double ret =
        PortfolioMetrics::portfolioReturn(w, mu);

    double risk =
        PortfolioMetrics::portfolioRisk(
            PortfolioMetrics::portfolioVariance(w, cov));

    return { w, ret, risk };
}
