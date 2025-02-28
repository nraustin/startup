import React from 'react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export function Portfolio({ username, portfolioValue  }) {
  const [stockSymbol, setStockSymbol] = useState('');
  const navigate = useNavigate()

  React.useEffect(() => {
    localStorage.setItem('portfolioValue', portfolioValue);
  }, [portfolioValue]);

  function handleStockSearch() {
    if (stockSymbol.trim()) {
      localStorage.setItem('selectedStock', stockSymbol.toUpperCase());
      navigate('/stock');
    }
  }

  return (
    <main className="main-portfolio">
      <div className="portfolio-container">
        <h2 className="portfolio-welcome-msg">Hi, {username}.</h2>
        <p>
          Portfolio value: <strong>${portfolioValue.toFixed(2)} USD</strong>
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
