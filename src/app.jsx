import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles.css';

import { BrowserRouter, NavLink, Route, Routes } from 'react-router-dom';
import { Login } from './login/login';
import { AuthState } from './login/authState';
import { Portfolio } from './portfolio/portfolio';
import { Stock } from './stock/stock';
import { Leaderboard } from './leaderboard/leaderboard';

export default function App() {
  const [userName, setUserName] = React.useState(localStorage.getItem('userName') || '');
  const currentAuthState = userName ? AuthState.Authenticated : AuthState.Unauthenticated;
  const [authState, setAuthState] = React.useState(currentAuthState);  

  return (
    <BrowserRouter>
    <div>
        <header> 
            <nav className="navbar">
                <ul className="nav-links">
                    <h3 className="app-header-title">Wall Street Casino</h3>
                    <li><NavLink to="">Home</NavLink></li>
                    {authState === AuthState.Authenticated && (<li><NavLink to="portfolio">Portfolio</NavLink></li>)}
                    {authState === AuthState.Authenticated && (<li><NavLink to="stock">View Stock</NavLink></li>)}
                    {authState === AuthState.Authenticated && (<li><NavLink to="leaderboard">Leaderboard</ NavLink></li>)}     
                </ul>
            </nav>
        </header> 

        <Routes>
            <Route path='/' 
                   element=
                   {<Login 
                        userName={userName}
                        authState={authState}
                        onAuthChange={(userName, authState) => {
                            setAuthState(authState);
                            setUserName(userName);
                        }} /> } exact />
            <Route path='/portfolio' element={<Portfolio username={userName}/>} />
            <Route path='/stock' element={<Stock />} />
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