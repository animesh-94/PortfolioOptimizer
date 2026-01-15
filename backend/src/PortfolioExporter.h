#pragma once
#include <vector>
#include <utility>
#include <string>
#include "Optimizer.h"

void exportPortfolioDataToJSON(
    const std::string& filename,
    const std::vector<std::pair<double,double>>& ef,
    const std::vector<CMLPoint>& cml,
    const TangencyPortfolio& tp
);
