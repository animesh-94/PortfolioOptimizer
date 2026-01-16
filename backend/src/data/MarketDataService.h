#pragma once
#include "DataProvider.h"
#include "CSVProvider.h"
#include <memory>

class MarketDataService {
private:
    std::unique_ptr<DataProvider> provider;

public:
    MarketDataService() {
        // Default provider (can be swapped later)
        provider = std::make_unique<CSVProvider>();
    }

    std::vector<std::vector<double>>
    loadPrices(const std::vector<std::string>& symbols) {
        return provider->getPrices(symbols);
    }
};
