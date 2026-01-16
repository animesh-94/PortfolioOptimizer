#include "CSVProvider.h"
#include "../Statistics.h"

std::vector<std::vector<double>>
CSVProvider::getPrices(const std::vector<std::string>& /*symbols*/) {
    // For now, symbols ignored (CSV has fixed assets)
    return Statistics::readCSV("../backend/data/prices.csv");
}
