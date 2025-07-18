const apiKey = 'a35ccc1e4bad48b294234c217fb80bde';
const tournamentId = '642';

const friendPicks = {
  "Sticky": ["Rory McIlroy", "Shane Lowry", "Tommy Fleetwood"],
  "Moz": ["Scottie Scheffler", "Tommy Fleetwood", "Robert MacIntyre"],
  "Parks": ["Scottie Scheffler", "Collin Morikawa", "Ludvig Aberg"],
  "Pet Seal": ["Scottie Scheffler", "Marco Penge", "Xander Schauffele"],
  "Gabin": ["Tommy Fleetwood", "Viktor Hovland", "Tyrrell Hatton"],
  "Stoney": ["Jon Rahm", "Tommy Fleetwood", "Adam Scott"],
  "AliMac": ["Scottie Scheffler", "Rory McIlroy", "Jon Rahm"]
};

async function fetchLeaderboard() {
  const url = `https://api.sportsdata.io/golf/v2/json/Leaderboard/${tournamentId}?key=${apiKey}`;
  try {
    const res = await fetch(url);
    const data = await res.json();
    const players = data.Players || [];

    renderGameLeaderboard(players);
  } catch (err) {
    console.error('Failed to fetch leaderboard:', err);
  }
}

function renderGameLeaderboard(players) {
  const gameResults = [];

  for (const [friend, picks] of Object.entries(friendPicks)) {
    const pickDetails = picks.map(name => {
      const player = players.find(p => p.Name === name);
      return {
        name,
        rank: player && player.TotalScore !== null ? parseInt(player.Rank) : 999
      };
    });

    const totalScore = pickDetails.reduce((sum, p) => sum + p.rank, 0);

    gameResults.push({
      friend,
      totalScore,
      picks: pickDetails
    });
  }

  // Sort by total score ascending
  gameResults.sort((a, b) => a.totalScore - b.totalScore);

  // Game leaderboard table
  const gameTable = `
    <table>
      <thead><tr><th>Friend</th><th>Total Rank</th></tr></thead>
      <tbody>
        ${gameResults.map(r => `
          <tr>
            <td>${r.friend}</td>
            <td>${r.totalScore}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
  document.getElementById('game-leaderboard').innerHTML = gameTable;

  // Friend picks table
  const picksHTML = gameResults.map(r => `
    <h3>${r.friend}</h3>
    <table>
      <thead><tr><th>Golfer</th><th>Rank</th></tr></thead>
      <tbody>
        ${r.picks.map(p => `
          <tr>
            <td>${p.name}</td>
            <td>${p.rank !== 999 ? p.rank : 'N/A'}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `).join('');
  document.getElementById('friend-picks').innerHTML = picksHTML;
}

fetchLeaderboard();
setInterval(fetchLeaderboard, 60 * 1000);
