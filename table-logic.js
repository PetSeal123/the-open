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

    const rankedPlayers = getPlayerRanks(players);
    renderGameLeaderboard(rankedPlayers);
  } catch (err) {
    console.error('Failed to fetch leaderboard:', err);
  }
}

function getPlayerRanks(players) {
  const validPlayers = players
    .filter(p => typeof p.TotalScore === 'number')
    .sort((a, b) => a.TotalScore - b.TotalScore);

  const ranked = [];
  let currentRank = 1;

  for (let i = 0; i < validPlayers.length; i++) {
    const player = validPlayers[i];
    if (i > 0 && player.TotalScore !== validPlayers[i - 1].TotalScore) {
      currentRank = i + 1;
    }

    ranked.push({
      Name: player.Name,
      TotalScore: player.TotalScore,
      TotalThrough: player.TotalThrough,
      customRank: currentRank
    });
  }

  console.log(ranked)

  return ranked;
}

function renderGameLeaderboard(rankedPlayers) {
  const gameResults = [];

  for (const [friend, picks] of Object.entries(friendPicks)) {
    const pickDetails = picks.map(name => {
      const player = rankedPlayers.find(p => p.Name === name);
      return {
        name,
        rank: player?.customRank ?? null
      };
    });

    const hasCut = pickDetails.some(p => p.rank === null);
    const totalScore = hasCut ? Infinity : pickDetails.reduce((sum, p) => sum + p.rank, 0);

    gameResults.push({
      friend,
      totalScore,
      picks: pickDetails,
      eliminated: hasCut
    });
  }

  // Sort with eliminated friends at the bottom
  gameResults.sort((a, b) => a.totalScore - b.totalScore);

  // Game leaderboard table
  const gameTable = `
    <table>
      <thead><tr><th>Friend</th><th>Total Rank</th><th>Status</th></tr></thead>
      <tbody>
        ${gameResults.map(r => `
          <tr class="${r.eliminated ? 'eliminated' : ''}">
            <td>${r.friend}</td>
            <td>${r.eliminated ? '—' : r.totalScore}</td>
            <td>${r.eliminated ? '❌ Eliminated (CUT player)' : '✅ Active'}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
  document.getElementById('game-leaderboard').innerHTML = gameTable;

  // Friend picks table
  const picksHTML = gameResults.map(r => `
    <div class="friend-block ${r.eliminated ? 'eliminated' : ''}">
      <h3>${r.friend}</h3>
      <table>
        <thead><tr><th>Golfer</th><th>Rank</th></tr></thead>
        <tbody>
          ${r.picks.map(p => `
            <tr>
              <td>${p.name}</td>
              <td>${p.rank !== null ? p.rank : 'CUT'}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `).join('');
  document.getElementById('friend-picks').innerHTML = picksHTML;
}

fetchLeaderboard();
setInterval(fetchLeaderboard, 60 * 1000);
