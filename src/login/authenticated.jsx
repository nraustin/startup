import React from 'react';
import { useNavigate } from 'react-router-dom';

import { Portfolio } from '../portfolio/portfolio';

export function Authenticated(props) {
    const navigate = useNavigate();

    return (
        <>  
            <Portfolio username={props.userName} portfolioValue={props.portfolioValue} />
        </>
    )
}