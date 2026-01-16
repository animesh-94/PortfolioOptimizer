import React, { createContext, useContext, useState } from 'react';

const PortfolioContext = createContext();

export const PortfolioProvider = ({ children }) => {
    // Default 2.0% Risk Free Rate
    const [riskFreeRate, setRiskFreeRate] = useState(2.0);

    return (
        <PortfolioContext.Provider value={{ riskFreeRate, setRiskFreeRate }}>
            {children}
        </PortfolioContext.Provider>
    );
};

export const usePortfolio = () => useContext(PortfolioContext);