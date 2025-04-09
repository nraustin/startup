import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles.css';

import { BrowserRouter, NavLink, Route, Routes, useNavigate } from 'react-router-dom';
import { Login } from './login/login';
import { AuthState } from './login/authState';
import { Portfolio } from './portfolio/portfolio';
import { Stock } from './stock/stock';
import { Leaderboard } from './leaderboard/leaderboard';
import { LogoutButton } from './login/logout';

export default function App() {
  const [userName, setUserName] = React.useState(localStorage.getItem('userName') || '');
  const currentAuthState = userName ? AuthState.Authenticated : AuthState.Unauthenticated;
  const [authState, setAuthState] = React.useState(currentAuthState);  
  const [portfolioValue, setPortfolioValue] = React.useState(parseFloat(localStorage.getItem(`portfolio_${userName}`)) || 1000)

    React.useEffect(() => {
        async function fetchPortfolio() {
            if (!userName) return;
            try {
                const response = await fetch(`/api/portfolio/${userName}`);
                if (!response.ok) throw new Error("Failed to fetch portfolio");
                const data = await response.json();
                setPortfolioValue(data.portfolioValue);
            } catch (err) {
                console.error("Error fetching portfolio value:", err);
            }
        }
        fetchPortfolio();
    }, [userName]);

  return (
    <BrowserRouter>
    <div className='app-container'>
        <header> 
            <nav className="navbar">
                <ul className="nav-links">
                    <h3 className="app-header-title">Wall Street Casino</h3>
                    <li><NavLink to="">Home</NavLink></li>
                    {authState === AuthState.Authenticated && (<li><NavLink to="portfolio">Portfolio</NavLink></li>)}
                    {authState === AuthState.Authenticated && (<li><NavLink to="stock">Stock Room</NavLink></li>)}
                    {authState === AuthState.Authenticated && (<li><NavLink to="leaderboard">Leaderboard</ NavLink></li>)}
                    {authState === AuthState.Authenticated && 
                        (<li><LogoutButton onAuthChange={(userName, authState) => {
                            setAuthState(authState);
                            setUserName(userName);
                        }} /></li>)}     
                </ul>
            </nav>
        </header> 

        <Routes>
            <Route path='/' 
                   element=
                   {<Login 
                        userName={userName}
                        portfolioValue={portfolioValue}
                        authState={authState}
                        onAuthChange={(userName, authState) => {
                            setAuthState(authState);
                            setUserName(userName);
                        }} /> } exact />
            <Route path='/portfolio' element={<Portfolio username={userName} portfolioValue={portfolioValue}/>} />
            <Route path='/stock' element={<Stock userName={userName} portfolioValue={portfolioValue} setPortfolioValue={setPortfolioValue}/>} />
            <Route path='/leaderboard' element={<Leaderboard />} />
            <Route path='*' element={<NotFound />} />
        </Routes>

        <footer>
            <span className="text-reset">Nick Austin</span>
            <br />
            <a href="https://github.com/nraustin/startup">
                <img src="github.png" alt="Github" className="github-logo"/>
            </a>
        </footer>
    </div>
 
    </BrowserRouter>
  );
}

function NotFound() {
    return <main className="container-fluid bg-secondary text-center">404: Return to sender. Address unknown.</main>;
  }