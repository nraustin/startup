import React from 'react';
import { useState } from 'react';

export function Portfolio({username}) {
  const [stockSymbol, setStockSymbol] = useState('');
  
  function handleStockSearch() {
    console.log(`Searching for ${stockSymbol}`);
  }

  return (
    <main className="main-portfolio">
      <div className="portfolio-container">
        <h2 className="portfolio-welcome-msg">Hi, {username}.</h2>
        <p>
          Portfolio value: <strong>$<span id="portfolio-value">1000</span> USD</strong>
        </p>
      </div>

      <div className="stockquery-container">
        <label htmlFor="stock-symbol">Find a stock</label>
        <div className="stockquery">
          <input type="text" 
                 id="stock-symbol" 
                 placeholder="NVDA" 
                 value={stockSymbol}
                 onChange={(e) => setStockSymbol(e.target.value)}/>
          <button type="submit" 
                  className="stockquery-button"
                  onClick={handleStockSearch}>Search</button>
        </div>
      </div>
    </main>
  );
}
