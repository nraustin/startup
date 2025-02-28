import React from 'react';

import { AuthState } from './authState';
import { Authenticated } from './authenticated';
import { Unauthenticated } from './unauthenticated';

export function Login({ userName, portfolioValue, authState, onAuthChange}) {

  return (
    <>
      {authState === AuthState.Authenticated && (
        <Authenticated userName={userName} portfolioValue={portfolioValue} />
      )}
      {authState === AuthState.Unauthenticated && (
        <Unauthenticated userName={userName} onLogin={(loginUserName) => {onAuthChange(loginUserName, AuthState.Authenticated)}}/>
      )}
    </>
  );
}
