cmake_minimum_required(VERSION 3.16)
project(PortfolioOptimizer)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

add_executable(PortfolioOptimizer
        backend/src/main.cpp
        backend/src/Statistics.cpp
        backend/src/Optimizer.cpp
        backend/src/PortfolioExporter.cpp
        backend/src/PortfolioExporter.h
        backend/src/PortfolioMetrics.cpp
        backend/src/PortfolioMetrics.h
        backend/src/OptimizerUtils.cpp
        backend/src/OptimizerUtils.h
        backend/src/RiskMetrics.cpp
        backend/src/RiskMetrics.h
)

