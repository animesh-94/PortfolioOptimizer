cmake_minimum_required(VERSION 3.16)
project(PortfolioOptimizer)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# Define the executable and source files
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
        backend/api/server.cpp
        backend/api/server.h
        backend/external/json.hpp
        backend/external/httplib.h
        backend/src/PortfolioService.cpp
        backend/src/PortfolioService.h
        backend/src/DataCache.cpp
        backend/src/DataCache.h
        backend/src/BacktestEngine.cpp
        backend/src/BacktestEngine.h
        backend/src/data/DataProvider.h
        backend/src/data/CSVProvider.cpp
        backend/src/data/MarketDataService.cpp
        backend/src/data/CSVProvider.h
        backend/src/data/MarketDataService.h
)

# Fix for Windows 10/11 API compatibility
if(WIN32)
    add_compile_definitions(_WIN32_WINNT=0x0A00)
endif()

# Disable memory mapping (optional, but often good for simple builds)
add_compile_definitions(CPPHTTPLIB_NO_MMAP)

include_directories(
        backend/external
        backend/api
)

# --- ADD THIS SECTION AT THE END ---
if(WIN32)
    # Link Windows Sockets (ws2_32) and Crypto (crypt32) libraries
    target_link_libraries(PortfolioOptimizer PRIVATE ws2_32 crypt32)
endif()