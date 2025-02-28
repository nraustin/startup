import React from 'react';
import { useState } from 'react';

export function Leaderboard() {
    const [users, setUsers] = useState([]);

    const fetchLeaderboard = () => {
        const userName = localStorage.getItem('userName'); 
        let usersData = localStorage.getItem('users');
        usersData = JSON.parse(usersData)

        const storedPortfolio = usersData[userName] || 1000;
    
        const placeholderUsers = [
          { username: "Jack", portfolioValue: Math.floor(Math.random()*5000) + 500},
          { username: "Kate", portfolioValue: Math.floor(Math.random()*5000) + 500},
          { username: "Sawyer", portfolioValue: Math.floor(Math.random()*5000) + 500},
        ];
    
        const allUsers = [...placeholderUsers, { username: userName , portfolioValue: storedPortfolio }];
        const sortedUsers = allUsers.sort((a, b) => b.portfolioValue - a.portfolioValue);
    
        setUsers(sortedUsers);
      };

      React.useEffect(() => {
        fetchLeaderboard();
        const interval = setInterval(fetchLeaderboard, 1000);
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
                <tr key={users.userName}>
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