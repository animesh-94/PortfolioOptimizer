#include "PortfolioExporter.h"
#include <fstream>
#include <iostream>

void exportPortfolioDataToJSON(
    const std::string& filename,
    const std::vector<std::pair<double,double>>& ef,
    const std::vector<CMLPoint>& cml,
    const TangencyPortfolio& tp
) {
    std::ofstream file(filename);

    if (!file.is_open()) {
        std::cerr << "Failed to write portfolio JSON\n";
        return;
    }

    file << "{\n";

    /* ---------- Efficient Frontier ---------- */
    file << "  \"efficient_frontier\": [\n";
    for (size_t i = 0; i < ef.size(); i++) {
        file << "    { \"risk\": " << ef[i].first
             << ", \"return\": " << ef[i].second << " }";
        if (i + 1 < ef.size()) file << ",";
        file << "\n";
    }
    file << "  ],\n";

    /* ---------- CML ---------- */
    file << "  \"cml\": [\n";
    for (size_t i = 0; i < cml.size(); i++) {
        file << "    { \"risk\": " << cml[i].risk
             << ", \"return\": " << cml[i].expectedReturn << " }";
        if (i + 1 < cml.size()) file << ",";
        file << "\n";
    }
    file << "  ],\n";

    /* ---------- Tangency Portfolio ---------- */
    file << "  \"tangency\": {\n";
    file << "    \"risk\": " << tp.risk << ",\n";
    file << "    \"return\": " << tp.expectedReturn << ",\n";
    file << "    \"weights\": [";

    for (size_t i = 0; i < tp.weights.size(); i++) {
        file << tp.weights[i];
        if (i + 1 < tp.weights.size()) file << ", ";
    }

    file << "]\n  }\n";

    file << "}\n";

    std::cout << "Portfolio JSON written successfully\n";
}
