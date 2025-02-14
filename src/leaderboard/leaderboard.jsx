import React from 'react';

export function Leaderboard() {
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
             <tr>
                 <td>1</td>
                 <td>$23900</td>
                 <td>Charlie</td>
             </tr>
             <tr>
                 <td>2</td>
                 <td>$13003</td>
                 <td>Kate</td>
             </tr>
             <tr>
                 <td>3</td>
                 <td>$8710</td>
                 <td>Jack</td>
             </tr>
             <tr>
                 <td>4</td>
                 <td>$2000</td>
                 <td>Michaelangelo</td>
             </tr>
             <tr>
                 <td>5</td>
                 <td>$1000</td>
                 <td>Demo</td>
             </tr>
             <tr>
                 <td>6</td>
                 <td>$7</td>
                 <td>Leonardo</td>
             </tr>
         </tbody>
        </table>
     </main>
    );
}