#pragma once
#include <vector>

namespace OptimizerUtils {

    void applyConstraints(
        std::vector<double>& w,
        double maxWeight = 0.3
    );

}
