#include <iostream>
#include "Statistics.h"

int main() {

    std::string filePath = "data/prices.csv";
    auto prices = Statistics::readCSV(filePath);

    if (prices.empty()) {
        std::cout << "CSV read failed\n";
        return 1;
    }

    auto returns = Statistics::computeReturns(prices);

    std::cout << "Return rows: " << returns.size() << std::endl;
    std::cout << "Return cols: " << returns[0].size() << std::endl;

    std::cout << "First return row: ";
    for (double x : returns[0]) {
        std::cout << x << " ";
    }
    std::cout << std::endl;


    return 0;
}
