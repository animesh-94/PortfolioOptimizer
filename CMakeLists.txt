cmake_minimum_required(VERSION 3.16)
project(PortfolioOptimizer)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

add_executable(PortfolioOptimizer
        src/main.cpp
        src/Matrix.cpp
        src/Statistics.cpp
        src/Optimizer.cpp
)

