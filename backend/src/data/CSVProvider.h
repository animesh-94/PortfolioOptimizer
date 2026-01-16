#pragma once
#include "DataProvider.h"

class CSVProvider : public DataProvider {
public:
    std::vector<std::vector<double>>
    getPrices(const std::vector<std::string>& symbols) override;
};
