import React from 'react';

import { MessageDialog } from './messageDialog';

export function Unauthenticated(props) {
  const [userName, setUserName] = React.useState(props.userName);
  const [password, setPassword] = React.useState('');
  const [displayError, setDisplayError] = React.useState(null);

  async function loginUser() {
    localStorage.setItem('userName', userName);
    props.onLogin(userName);
  }

  async function createUser() {
    localStorage.setItem('userName', userName);
    props.onLogin(userName);
  }

  return (
    <main className="main-home">
      <div className="login-container">
        <h4>Can you time the market?</h4>
        
        <div className="username-container">
          <label htmlFor="username"></label>
          <input type="text" 
                 id="username" 
                 placeholder="Username"
                 value={userName}
                 required
                 onChange={(e) => setUserName(e.target.value)} />
        </div>
        
        <div className="password-container">
          <label htmlFor="password"></label>
          <input type="password" 
                 id="password" 
                 placeholder="Password" 
                 required
                 onChange={(e) => setPassword(e.target.value)} />
        </div>
        
        <div className="login-form-button-container">
          <button type="button" 
                  className="login-form-button" 
                  onClick={() => loginUser()}
                  disabled={!userName || !password}>
                    Login
            </button>
          <button type="button" 
                  className="login-form-button" 
                  onClick={() => createUser()}
                  disabled={!userName || !password}>
                    Sign up
            </button>
        </div>
        <MessageDialog message={displayError} onHide={() => setDisplayError(null)} />
      </div>
    </main>
  );
}