cmake_minimum_required(VERSION 3.16)
project(PortfolioOptimizer)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

add_executable(PortfolioOptimizer
        backend/src/main.cpp
        backend/src/Matrix.cpp
        backend/src/Statistics.cpp
        backend/src/Optimizer.cpp
)

