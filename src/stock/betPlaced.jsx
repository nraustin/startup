import React from 'react';

export function BetPlaced (props) {
    return (
        <td className="bet-placed-container">
            <h5>You bet NVDA {props.betType}.</h5>
            <p>
            Current bet value: <strong>${props.betAmount.toFixed(2)} USD</strong>
            </p>
            <div className="bet-button-container">
                <button type="button" 
                        className="close-bet-button"
                        onClick={props.closeBet}>
                            Close bet
                    </button>
            </div>
        </td>
    );
}