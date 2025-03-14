import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthState } from './authState';

export function LogoutButton({ onAuthChange }) {
    const navigate = useNavigate();

    function logout() {
        fetch(`/api/auth/logout`, {
          method: 'delete',
        })
          .catch(() => {
            // Logout failed. Assuming offline
          })
          .finally(() => {
            localStorage.removeItem('userName');
            onAuthChange('', AuthState.Unauthenticated)
            navigate('/'); 
          });
      }

    return (
        <button type="submit" className="logout-button" onClick={logout}>Logout</button>
    );
}