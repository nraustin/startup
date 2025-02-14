import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles.css';

import { BrowserRouter, NavLink, Route, Routes } from 'react-router-dom';
import { Login } from './login/login';
import { Portfolio } from './portfolio/portfolio';
import { Stock } from './stock/stock';
import { Leaderboard } from './leaderboard/leaderboard';

export default function App() {
  return (
    <BrowserRouter>
    <div>
        {/* <div className="body bg-dark text-light">
        <header className="container-fluid">
            <nav className="navbar fixed-top navbar-dark">
            <div className="navbar-brand">
                Simon<sup>&reg;</sup>
            </div>
            <menu className="navbar-nav">
                <li className="nav-item">
                <NavLink className="nav-link" to="">
                    Login
                </NavLink>
                </li>
                <li className="nav-item">
                <NavLink className="nav-link" to="play">
                    Play
                </NavLink>
                </li>
                <li className="nav-item">
                <NavLink className="nav-link" to="scores">
                    Scores
                </NavLink>
                </li>
                <li className="nav-item">
                <NavLink className="nav-link" to="about">
                    About
                </NavLink>
                </li>
            </menu>
            </nav>
        </header> */}

        <header> 
            <nav className="navbar">
                <ul className="nav-links">
                    <h3 className="app-header-title">Wall Street Casino</h3>
                    <li><NavLink to="">Home</NavLink></li>
                    <li><NavLink to="portfolio">Portfolio</NavLink></li>
                    <li><NavLink to="stock">View Stock</NavLink></li>
                    <li><NavLink to="leaderboard">Leaderboard</ NavLink></li>     
                </ul>
            </nav>
        </header> 

        <Routes>
            <Route path='/' element={<Login />} exact />
            <Route path='/portfolio' element={<Portfolio />} />
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