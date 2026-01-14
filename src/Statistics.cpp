#include "Statistics.h"
#include <fstream>
#include <iostream>
#include <sstream>

using namespace std;

vector<vector<double>> Statistics::readCSV(const string& filePath) {
    ifstream file(filePath);
    vector<vector<double>> prices;

    if (!file.is_open()) {
        cerr << "Error opening CSV file" << endl;
        return prices;
    }

    string line;

    // Skip header
    if (!getline(file, line)) {
        cerr << "Error reading CSV file" << endl;
        return prices;
    }

    while (getline(file, line)) {
        stringstream ss(line);
        string token;
        vector<double> row;

        bool isFirstColumn = true;

        while (getline(ss, token, ',')) {
            if (isFirstColumn) {
                isFirstColumn = false;
                continue;
            }

            try {
                row.push_back(stod(token));   // ✅ FIXED
            } catch (...) {
                cerr << "Error reading numeric value in CSV file" << endl;
                return {};
            }
        }

        if (!row.empty()) {
            prices.push_back(row);
        }
    }

    return prices;
}

vector<vector<double>>
Statistics::computeReturns(const vector<vector<double>>& prices) {

    if (prices.size() < 2) return {};

    int n = prices.size();
    int m = prices[0].size();

    vector<vector<double>> returns(n - 1, vector<double>(m));

    for (int i = 1; i < n; i++) {
        for (int j = 0; j < m; j++) {
            if (prices[i - 1][j] == 0.0) {
                returns[i - 1][j] = 0.0;
            } else {
                returns[i - 1][j] =
                    (prices[i][j] - prices[i - 1][j]) / prices[i - 1][j];
            }
        }
    }

    return returns;
}
