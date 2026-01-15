#ifndef STATISTICS_H
#define STATISTICS_H

#include <vector>
#include <string>

class Statistics {
public:
    static std::vector<std::vector<double>>
    readCSV(const std::string& filePath);

    static std::vector<std::vector<double>>
    computeReturns(const std::vector<std::vector<double>>& prices);

    static std::vector<double>
    computeReturnsMean(const std::vector<std::vector<double>>& returns);

    static std::vector<std::vector<double>>
    computeCovariance(const std::vector<std::vector<double>>& returns,
                      const std::vector<double>& means);
};

#endif
