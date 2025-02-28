import React from 'react';

export function BetOptions (props) {
    return (
        <td className="bet-options-container">
            <div className="bet-button-container">
                <button type="button" 
                    className="bet-button"
                    onClick={() => props.placeBet("higher")}>
                        Bet higher
                </button> 
                <strong>${props.higherBetValue.toFixed(2)} USD</strong>
            </div>
            <div className='bet-button-container'>
                <button type="button" 
                    className="bet-button"
                    onClick={() => props.placeBet("lower")}>
                        Bet lower
                </button> 
                <strong>${props.lowerBetValue.toFixed(2)} USD</strong>
            </div>
        </td>
    );
}