#pragma once
#include <vector>
#include <mutex>

class DataCache {
public:
    static DataCache& instance();

    void loadIfNeeded();

    const std::vector<std::vector<double>>& prices() const;
    const std::vector<std::vector<double>>& returns() const;
    const std::vector<double>& mean() const;
    const std::vector<std::vector<double>>& cov() const;

private:
    DataCache() = default;

    bool loaded = false;
    std::mutex mtx;

    std::vector<std::vector<double>> prices_;
    std::vector<std::vector<double>> returns_;
    std::vector<double> mean_;
    std::vector<std::vector<double>> cov_;
};
