import React from 'react';
import { useNavigate } from 'react-router-dom';

import { Portfolio } from '../portfolio/portfolio';

export function Authenticated(props) {
    const navigate = useNavigate();

    function logout() {
        localStorage.removeItem('username');
        props.onLogout();
        navigate('/login')
    }

    return (
        <div className="authenticated-container"> 
            <Portfolio username={props.username} />
            <button type="submit" className = "logout-button" onClick={logout}>Logout</button>
        </div>
    )
}