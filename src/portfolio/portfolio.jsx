import React from 'react';

export function Portfolio() {
  return (
    <main className="main-portfolio">
      <div className="portfolio-container">
        <h2 className="portfolio-welcome-msg">Hi, Demo.</h2>
        <p>
          Portfolio value: <strong>$<span id="portfolio-value">1000</span> USD</strong>
        </p>
      </div>

      <div className="stockquery-container">
        <label htmlFor="stock-symbol">Find a stock</label>
        <div className="stockquery">
          <input type="text" id="stock-symbol" placeholder="NVDA" />
          <button type="submit" className="stockquery-button">Search</button>
        </div>
      </div>
    </main>
  );
}
