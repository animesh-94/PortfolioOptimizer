#include "Optimizer.h"

#include <algorithm>
#include <cmath>
#include <vector>
#include <stdexcept>

static double dot(const std::vector<double>& a,
                  const std::vector<double>& b) {
    double sum = 0.0;
    for (int i = 0; i < a.size(); i++)
        sum += a[i] * b[i];
    return sum;
}

static std::vector<double>
matVecMul(const std::vector<std::vector<double>>& A,
          const std::vector<double>& x) {
    int n = A.size();
    int m = x.size();
    std::vector<double> result(n, 0.0);

    for (int i = 0; i < n; i++)
        for (int j = 0; j < m; j++)
            result[i] += A[i][j] * x[j];

    return result;
}

static std::vector<double>
vecAdd(const std::vector<double>& a,
       const std::vector<double>& b) {
    std::vector<double> res(a.size());
    for (int i = 0; i < a.size(); i++)
        res[i] = a[i] + b[i];
    return res;
}

static std::vector<double>
vecScale(const std::vector<double>& a, double s) {
    std::vector<double> res(a.size());
    for (int i = 0; i < a.size(); i++)
        res[i] = a[i] * s;
    return res;
}


std::vector<double>
Optimizer::minimizeVariance(
    const std::vector<std::vector<double>>& cov,
    int maxIterations,
    double learningRate) {

    int N = cov.size();

    std::vector<double> w(N, 1.0 / N);

    for (int iter = 0; iter < maxIterations; iter++) {

        // Compute gradient = 2 * Σ * w
        std::vector<double> grad(N, 0.0);

        for (int i = 0; i < N; i++) {
            for (int j = 0; j < N; j++) {
                grad[i] += 2.0 * cov[i][j] * w[j];
            }
        }

        //  Gradient step
        for (int i = 0; i < N; i++) {
            w[i] -= learningRate * grad[i];
        }

        //  Normalize weights (sum to 1)
        double sum = 0.0;
        for (double wi : w) sum += wi;

        for (double& wi : w) {
            wi /= sum;
        }
    }

    return w;
}

static std::vector<std::vector<double>>
invertMatrix(std::vector<std::vector<double>> A) {
    int n = A.size();
    std::vector<std::vector<double>> I(n, std::vector<double>(n, 0.0));

    for (int i = 0; i < n; i++)
        I[i][i] = 1.0;

    for (int i = 0; i < n; i++) {
        double pivot = A[i][i];
        if (pivot == 0.0) {
            throw std::runtime_error("Matrix not invertible");
        }

        for (int j = 0; j < n; j++) {
            A[i][j] /= pivot;
            I[i][j] /= pivot;
        }

        for (int k = 0; k < n; k++) {
            if (k == i) continue;
            double factor = A[k][i];
            for (int j = 0; j < n; j++) {
                A[k][j] -= factor * A[i][j];
                I[k][j] -= factor * I[i][j];
            }
        }
    }

    return I;
}


std::vector<std::pair<double, double>>
Optimizer::computeEfficientFrontier(
    const std::vector<double>& mu,
    const std::vector<std::vector<double>>& cov,
    int points
) {
    int n = mu.size();

    auto SigmaInv = invertMatrix(cov);

    std::vector<double> ones(n, 1.0);

    double A = dot(ones, matVecMul(SigmaInv, ones));
    double B = dot(ones, matVecMul(SigmaInv, mu));
    double C = dot(mu,   matVecMul(SigmaInv, mu));
    double D = A * C - B * B;

    double minR = *std::min_element(mu.begin(), mu.end());
    double maxR = *std::max_element(mu.begin(), mu.end());

    std::vector<std::pair<double, double>> frontier;

    for (int i = 0; i < points; i++) {
        double r = minR + i * (maxR - minR) / (points - 1);

        double alpha = (C - B * r) / D;
        double beta  = (A * r - B) / D;

        auto w = matVecMul(
            SigmaInv,
            vecAdd(vecScale(ones, alpha),
                   vecScale(mu, beta))
        );

        double variance = dot(w, matVecMul(cov, w));
        frontier.push_back({ std::sqrt(variance), r });
    }

    return frontier;
}


