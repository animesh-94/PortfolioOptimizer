#include "DataCache.h"
#include "Statistics.h"

DataCache& DataCache::instance() {
    static DataCache cache;
    return cache;
}

void DataCache::loadIfNeeded() {
    std::lock_guard<std::mutex> lock(mtx);

    if (loaded) return;

    prices_ = Statistics::readCSV("../backend/data/prices.csv");
    returns_ = Statistics::computeReturns(prices_);
    mean_ = Statistics::computeReturnsMean(returns_);
    cov_ = Statistics::computeCovariance(returns_, mean_);

    loaded = true;
}

const std::vector<std::vector<double>>& DataCache::prices() const { return prices_; }
const std::vector<std::vector<double>>& DataCache::returns() const { return returns_; }
const std::vector<double>& DataCache::mean() const { return mean_; }
const std::vector<std::vector<double>>& DataCache::cov() const { return cov_; }
