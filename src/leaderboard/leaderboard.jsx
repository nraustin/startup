import React from 'react';
import { useState, useEffect } from 'react';

export function Leaderboard() {
    const [users, setUsers] = useState([]);

    async function fetchLeaderboard() {
        const response = await fetch('/api/leaderboard');
        const data = await response.json();
        setUsers(data);
    }

    useEffect(() => {
        fetchLeaderboard();
        const interval = setInterval(fetchLeaderboard, 2000);
        return () => clearInterval(interval);
    }, []);

    return (
        <main class="main-leaderboard">
        <h2 class="leaderboard-title">Leaderboard</h2>
        <table class="table-leaderboard">
         <thead>
             <tr>
                 <th>Rank</th>
                 <th>Value</th>
                 <th>User</th>
             </tr>
         </thead>
         <tbody>
             {users.map((users, i) => (
                <tr key={users.username}>
                    <td>{i+1}</td>
                    <td>{users.username}</td>
                    <td>${users.portfolioValue.toFixed(2)}</td>
                </tr>
             ))}
         </tbody>
        </table>
     </main>
    );
}