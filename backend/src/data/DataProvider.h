#pragma once
#include <vector>
#include <string>

class DataProvider {
public:
    virtual std::vector<std::vector<double>>
    getPrices(const std::vector<std::string>& symbols) = 0;

    virtual ~DataProvider() = default;
};
