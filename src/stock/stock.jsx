import React from 'react';

import { BetPlaced } from './betPlaced';
import { BetOptions } from './betOptions';
import { useState, useEffect } from 'react';
import { Chatroom } from './chatroom';
import { StockChart } from './stockChart';

export function Stock({ userName, portfolioValue, setPortfolioValue}) {
  const [bet, setBet] = useState(localStorage.getItem('bet') || '');
  const [stockPrice, setStockPrice] = useState(parseFloat(localStorage.getItem('stockPrice')) || 100);
  const [higherBetValue, setHigherBetValue] = useState(parseFloat(localStorage.getItem('higherBetValue')) || 250);
  const [lowerBetValue, setLowerBetValue] = useState(parseFloat(localStorage.getItem('lowerBetValue')) || 250);
  const [stockSymbol, setStockSymbol] = useState(localStorage.getItem('selectedStock') || 'NVDA');
  const [betEntryPrice, setBetEntryPrice] = useState(parseFloat(localStorage.getItem('initialBetAmount')) || 250);

  const MIN_PRICE = 90;
  const MAX_PRICE = 110;
  const BET_CHG_PERCENT = .1;
  const MIN_BET_VALUE = 50;

  useEffect(() => {
    const interval = setInterval(() =>{
      setStockPrice((prevPrice) => {
        let chg = Math.random() < .5 ? -1 : 1;
        let newPrice = prevPrice+ chg;

        if (newPrice < MIN_PRICE || newPrice > MAX_PRICE){
          return prevPrice;
        }

        setHigherBetValue((prev) => {
          const newVal = Math.max(prev * (chg === 1 ? (1 + BET_CHG_PERCENT) : (1 - BET_CHG_PERCENT)), MIN_BET_VALUE);
          localStorage.setItem('higherBetValue', newVal);
          return newVal;
        });

        setLowerBetValue((prev) => {
          const newVal = Math.max(prev * (chg === -1 ? (1 + BET_CHG_PERCENT) : (1 - BET_CHG_PERCENT)), MIN_BET_VALUE);
          localStorage.setItem('lowerBetValue', newVal);
          return newVal;
        });

        localStorage.setItem('stockPrice', newPrice);
        return newPrice;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  function placeBet(betType) {
    setBet(betType);
    localStorage.setItem('bet', betType)

    const betValue = betType === "higher" ? higherBetValue : lowerBetValue;
    setBetEntryPrice(betValue);
    localStorage.setItem('initialBetAmount', betValue);
  }

  function closeBet() {
    const currentBetValue = bet === "higher" ? higherBetValue : lowerBetValue;
    console.log(currentBetValue);
    const entryBetPrice = parseFloat(localStorage.getItem('initialBetAmount')) || currentBetValue;

    const profit = currentBetValue - entryBetPrice;

    setPortfolioValue((prev) => {
      const newPortfolioValue = prev + profit;
      localStorage.setItem('portfolioValue', newPortfolioValue);
      return newPortfolioValue;
    });

    setBet('');
    setBetEntryPrice(null);
    localStorage.removeItem('bet');
    localStorage.removeItem('betEntryPrice');
  }

  return (
    <main>
      <table width="100%">
        <tbody>
          <tr className="stockchart-and-bet-container">
            <td className="stockchart-container">
              <h2>Mock {stockSymbol} stock live price: ${stockPrice.toFixed(2)} USD</h2>
              <StockChart stockSymbol={stockSymbol}/>
            </td>
            {!bet && <BetOptions placeBet={placeBet} higherBetValue={higherBetValue} lowerBetValue={lowerBetValue}/>}
            {bet && <BetPlaced betType={bet} betAmount={bet === "higher" ? higherBetValue : lowerBetValue} closeBet={closeBet}/>}
          </tr>
        </tbody>
      </table>
      <Chatroom userName={userName} />
    </main>
  );
}
