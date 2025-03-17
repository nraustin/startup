import React from 'react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export function Portfolio({ username, portfolioValue  }) {
  const [stockSymbol, setStockSymbol] = useState('');
  const [symbolSuggestions, setSymbolSuggestions] = useState([]);
  const navigate = useNavigate()

  React.useEffect(() => {
    localStorage.setItem('portfolioValue', portfolioValue);
  }, [portfolioValue]);

  async function fetchStockSuggestions(query) {
    if (!query.trim()) {
      setSymbolSuggestions([]);
      return;
    }
    try {
      const response = await fetch(`/api/stocks?query=${query}`);
      const data = await response.json();
      setSymbolSuggestions(data);
    } catch (err) {
      console.err("Error fetching stock suggestions:", err);
      setSymbolSuggestions([]);
    }
  }

  function handleInputChange(e) {
    const value = e.target.value;
    setStockSymbol(value);
    fetchStockSuggestions(value); 
  }

  function handleStockSelect(symbol) {
    setStockSymbol(symbol);
    setSymbolSuggestions([]);
  }

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
          <div className='stockquery-field'>
            <input type="text" 
                  id="stock-symbol" 
                  placeholder="NVDA" 
                  value={stockSymbol}
                  onChange={handleInputChange}/>
            <button type="submit" 
                    className="stockquery-button"
                    onClick={handleStockSearch}>Search</button>
          </div>
          {symbolSuggestions.length > 0 && (
          <ul className="stock-suggestions">
            {symbolSuggestions.map(stock => (
              <li key={stock.ticker} onClick={() => handleStockSelect(stock.ticker)}>
                {stock.ticker}-{stock.name}
              </li>
            ))}
          </ul>
        )}
        </div> 
      </div>
    </main>
  );
}
