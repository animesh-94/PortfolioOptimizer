import React from 'react';
import LandingPage from './components/LandingPage.jsx';
import {PortfolioProvider} from "./context/PortfolioContext.jsx";

function App() {
    return (
        <PortfolioProvider>
            <div>
                <LandingPage/>
            </div>
        </PortfolioProvider>
    );
}

export default App;