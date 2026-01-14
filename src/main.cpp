#include <iostream>
#include "Statistics.h"

int main() {

    std::string filePath = "data/prices.csv";
    auto prices = Statistics::readCSV(filePath);

    if (prices.empty()) {
        std::cout << "CSV read failed\n";
        return 1;
    }

    std::cout << "Rows (days): " << prices.size() << std::endl;
    std::cout << "Columns (assets): " << prices[0].size() << std::endl;

    std::cout << "First row values: ";
    for (double v : prices[0]) {
        std::cout << v << " ";
    }
    std::cout << std::endl;

    return 0;
}
