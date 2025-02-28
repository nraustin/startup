import React from 'react';

import { BetPlaced } from './betPlaced';
import { BetOptions } from './betOptions';
import { useState, useEffect } from 'react';

export function Stock({portfolioValue, setPortfolioValue}) {
  const [bet, setBet] = useState(localStorage.getItem('bet') || '');
  const [stockPrice, setStockPrice] = useState(parseFloat(localStorage.getItem('stockPrice')) || 100);
  const [higherBetValue, setHigherBetValue] = useState(parseFloat(localStorage.getItem('higherBetValue')) || 250);
  const [lowerBetValue, setLowerBetValue] = useState(parseFloat(localStorage.getItem('lowerBetValue')) || 250);

  const MIN_PRICE = 90;
  const MAX_PRICE = 110;
  const BET_CHG_PERCENT = .1;

  useEffect(() => {
    const interval = setInterval(() =>{
      setStockPrice((prevPrice) => {
        let chg = Math.random() < .5 ? -1 : 1;
        let newPrice = prevPrice+  chg;

        if (newPrice < MIN_PRICE || newPrice > MAX_PRICE){
          return prevPrice;
        }

        if (chg === 1) {
          setHigherBetValue((prev) => prev*(1 + BET_CHG_PERCENT));
          setLowerBetValue((prev) => prev*(1 - BET_CHG_PERCENT));
        } 
        else {
          setHigherBetValue((prev) => prev*(1 - BET_CHG_PERCENT));
          setLowerBetValue((prev) => prev*(1 + BET_CHG_PERCENT));
        }
          localStorage.setItem('stockPrice', newPrice);
          return newPrice;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  function placeBet(betType) {
    setBet(betType);
    localStorage.setItem('bet', betType)
  }

  function closeBet() {
    const betValue = bet === "higher" ? higherBetValue : lowerBetValue;
    setPortfolioValue((prev) => {
      const newPortfolioValue = prev + (betValue - 250);
      localStorage.setItem('portfolioValue', newPortfolioValue)
      return newPortfolioValue;
    });
    setBet('');
    localStorage.removeItem('bet')
  }

  return (
    <main>
      <table width="100%">
        <tbody>
          <tr className="stockchart-and-bet-container">
            <td className="stockchart-container">
              <h2>NVDA Mock live price: ${stockPrice.toFixed(2)} USD</h2>
              <img src="stockchart_placeholder260.png" className="stock-img" alt="NVDA" />
            </td>
            {!bet && <BetOptions placeBet={placeBet} higherBetValue={higherBetValue} lowerBetValue={lowerBetValue}/>}
            {bet && <BetPlaced betType={bet} betAmount={bet === "higher" ? higherBetValue : lowerBetValue} closeBet={closeBet}/>}
          </tr>
        </tbody>
      </table>

      <table width="100%">
        <tbody>
          <tr className="chatbox-container">
            <td className="chatbox">
              <p><strong>Jack:</strong> Bet NVDA High</p>
              <p><strong>Kate:</strong> Where is the ceiling here?</p>
              <p><strong>Jack:</strong> I feed on volatility...</p>
              <p><strong>Charlie:</strong> Bet NVDA Low</p>
              <p><strong>Jack:</strong> You couldn't lose your money faster even if you lit it on fire!</p>
            </td>
          </tr>
        </tbody>
      </table>

      <table width="100%">
        <tbody>
          <tr className="chatbox-send-msg-container">
            <td className="chatbox-send-msg">
              <p><strong>Demo</strong></p>
              <input type="text" placeholder="send a message (websocket)" />
              <button type="button" className="send-msg-button">Send</button>
            </td>
          </tr>
        </tbody>
      </table>
    </main>
  );
}
