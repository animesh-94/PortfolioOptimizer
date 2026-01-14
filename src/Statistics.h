#ifndef PORTFOLIOOPTIMIZER_STATISTICS_H
#define PORTFOLIOOPTIMIZER_STATISTICS_H

#include <string>
#include <vector>

class Statistics {
public:
    static std::vector<std::vector<double>>
    readCSV(const std::string& filePath);

    static std::vector<std::vector<double>>
    computeReturns(const std::vector<std::vector<double>>& prices);
};

#endif // PORTFOLIOOPTIMIZER_STATISTICS_H
