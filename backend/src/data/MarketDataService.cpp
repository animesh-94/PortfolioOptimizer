// CSVProvider.cpp
#include "DataProvider.h"
#include "../Statistics.h"

class CSVProvider : public DataProvider {
public:
    std::vector<std::vector<double>>
    getPrices(const std::vector<std::string>& symbols) override {
        return Statistics::readCSV("../backend/data/prices.csv");
    }
};
