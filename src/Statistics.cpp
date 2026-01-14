//
// Created by ANIMESH on 14-01-2026.
//

#include "Statistics.h"
#include <fstream>
#include <iostream>
#include <sstream>
using namespace std;

std::vector<std::vector<double> > Statistics::readCSV(const std::string &filePath) {
    std::ifstream file(filePath);
    std::vector<std::vector<double>> prices;

    if (!file.is_open()) {
        std::cerr << "Error opening CSV file" << std::endl;
        return prices;
    }

    std:: string line;

    if (!std::getline(file,line)) {
        std::cerr << "Error reading CSV file" << std::endl;
        return prices;
    }

    while (std::getline(file, line)) {
        std::stringstream ss(line);
        std::string token;
        std::vector<double> row;

        bool isFirstColumn = true;

        while (std::getline(ss, token, ',')) {
            if (isFirstColumn) {
                isFirstColumn = false;
                continue;
            }

            try {
                row.push_back(std::stol(token));
            }
            catch (...) {
                std::cerr << "Error reading numeric value in CSV file" << std::endl;
                return std::vector<std::vector<double>>();
            }
        }

        if (!row.empty()) {
            prices.push_back(row);
        }
    }

    file.close();
    return prices;
}
