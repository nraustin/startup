import React from 'react';

export function Stock() {
  return (
    <main>
      <table width="100%">
        <tbody>
          <tr className="stockchart-and-bet-container">
            <td className="stockchart-container">
              <h2>NVDA (websocket through Polygon.io)</h2>
              <img src="stockchart_placeholder260.png" className="stock-img" alt="NVDA" />
            </td>
            <td className="bet-options-container">
              <div className="bet-button-container">
                <button type="button" className="bet-button">Bet higher</button> $250 USD
                <button type="button" className="bet-button">Bet lower</button> $250 USD
              </div>
            </td>
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
