#include "OptimizerUtils.h"
#include <numeric>

namespace OptimizerUtils {

    void applyConstraints(
        std::vector<double>& w,
        double maxWeight
    ) {
        // 1. Long-only
        for (double& wi : w)
            if (wi < 0.0) wi = 0.0;

        // 2. Max weight cap
        for (double& wi : w)
            if (wi > maxWeight) wi = maxWeight;

        // 3. Renormalize
        double sum = std::accumulate(w.begin(), w.end(), 0.0);

        if (sum > 0.0) {
            for (double& wi : w)
                wi /= sum;
        }
    }
}
