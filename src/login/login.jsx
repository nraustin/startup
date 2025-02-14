import React from 'react';

export function Login() {
  return (
    <main className="main-home">
      <div className="login-container">
        <h4>Can you time the market?</h4>
        
        <div className="username-container">
          <label htmlFor="username"></label>
          <input type="text" id="username" placeholder="Username" required />
        </div>
        
        <div className="password-container">
          <label htmlFor="password"></label>
          <input type="password" id="password" placeholder="Password" required />
        </div>
        
        <div className="login-form-button-container">
          <button type="button" className="login-form-button">Login</button>
          <button type="button" className="login-form-button">Sign up</button>
        </div>
      </div>
    </main>
  );
}
