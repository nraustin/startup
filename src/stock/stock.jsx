import React from 'react';

import { BetPlaced } from './betPlaced';
import { BetOptions } from './betOptions';
import { useState, useEffect } from 'react';
import { Chatroom } from './chatroom';
import { StockChart } from './stockChart';
import { blackScholes, TTE } from './blackScholes';
import { chatNotifier } from './chatNotifier';

export function Stock({ userName, portfolioValue, setPortfolioValue}) {
  // Bet values are calculated dynamically and equally for all users based on live data and are transient; persistent storage for bet values is therefore not necessary
  const [bet, setBet] = useState(localStorage.getItem('bet') || '');
  const [stockPrice, setStockPrice] = useState(parseFloat(localStorage.getItem('stockPrice')) || 100);
  const [higherBetValue, setHigherBetValue] = useState(parseFloat(localStorage.getItem('higherBetValue')) || 250);
  const [lowerBetValue, setLowerBetValue] = useState(parseFloat(localStorage.getItem('lowerBetValue')) || 250);
  const [stockSymbol, setStockSymbol] = useState(localStorage.getItem('selectedStock') || 'NVDA');
  const [betEntryPrice, setBetEntryPrice] = useState(parseFloat(localStorage.getItem('initialBetAmount')) || 250);

  const [openPrice, setOpenPrice] = useState(null);

  useEffect(() => {
    async function fetchOpenPrice() {
      const res = await fetch(`/api/market-open/${stockSymbol}`);
      const data = await res.json();
      setOpenPrice(data.openPrice);
    }
    fetchOpenPrice();
  }, [stockSymbol]);

  useEffect(() => {
    setBet('');
    setBetEntryPrice(null);
    localStorage.removeItem('bet');
    localStorage.removeItem('initialBetAmount');
  }, [userName]);

  useEffect(() => {
    if (!openPrice) return;
    const riskFreeRate = 0.01;
    const volatility = 0.2;
    const timeToExpiration = TTE();
    const callStrike = openPrice+3;
    const putStrike = openPrice-3;
    const call = blackScholes(stockPrice, callStrike, timeToExpiration, riskFreeRate, volatility).call;
    const put = blackScholes(stockPrice, putStrike, timeToExpiration, riskFreeRate, volatility).put;

    setHigherBetValue(call);
    setLowerBetValue(put);
  }, [stockPrice, openPrice]);

  async function updatePortfolio(newPortfolioValue) {
    await fetch(`/api/update-portfolio`, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({portfolioValue: newPortfolioValue}),
    });
  }

  function placeBet(betType) {
    setBet(betType);
    localStorage.setItem('bet', betType)

    const betValue = betType === "higher" ? higherBetValue : lowerBetValue;
    setBetEntryPrice(betValue);
    localStorage.setItem('initialBetAmount', betValue);

    chatNotifier.sendMessage(userName, {text: `placed a ${betType.toUpperCase()} bet`, betType, timestamp: new Date().toLocaleTimeString()});
  }

  function closeBet() {
    const currentBetValue = bet === "higher" ? higherBetValue : lowerBetValue;
    const entryBetPrice = parseFloat(localStorage.getItem('initialBetAmount')) || currentBetValue;

    const profit = currentBetValue - entryBetPrice;

    setPortfolioValue((prev) => {
      const newPortfolioValue = prev + profit;
      updatePortfolio(newPortfolioValue)
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
              <StockChart stockSymbol={stockSymbol} onPriceUpdate={setStockPrice}/>
            </td>
            {!bet && <BetOptions placeBet={placeBet} higherBetValue={higherBetValue} lowerBetValue={lowerBetValue}/>}
            {bet && <BetPlaced betType={bet} betAmount={bet === "higher" ? higherBetValue : lowerBetValue} closeBet={closeBet}/>}
          </tr>
        </tbody>
      </table>
      <Chatroom userName={userName} stockSymbol={stockSymbol} />
    </main>
  );
}
