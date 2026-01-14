//
// Created by ANIMESH on 14-01-2026.
//

#ifndef PORTFOLIOOPTIMIZER_STATISTICS_H
#define PORTFOLIOOPTIMIZER_STATISTICS_H
#include <string>
#include <vector>


class Statistics {
public:
    static std::vector<std::vector<double>>
    readCSV(const std::string& filePath);
};

#endif //PORTFOLIOOPTIMIZER_STATISTICS_H