// === Tab Switching Logic with Active Button Styling ===
const navButtons = document.querySelectorAll('.bottom-nav button');
const views = document.querySelectorAll('.view');

navButtons.forEach(button => {
  button.addEventListener('click', () => {
    const targetView = button.getAttribute('data-target');

    // Remove 'active' class from all buttons
    navButtons.forEach(btn => btn.classList.remove('active'));
    // Add 'active' class to the clicked button
    button.classList.add('active');

    // Remove 'active' class from all views
    views.forEach(view => view.classList.remove('active'));

    // Add 'active' class to the target view
    const targetElement = document.getElementById(targetView);
    if (targetElement) {
      targetElement.classList.add('active');
    } else {
      console.error(`Target view ${targetView} not found.`);
    }
  });
});

// === Player Management ===
const playerList = document.getElementById('player-list');
const addPlayerBtn = document.getElementById('add-player');
const matchHistoryBtn = document.getElementById('match-history-btn');
const matchHistoryModal = document.getElementById('match-history-modal');
const closeHistoryBtn = document.getElementById('close-history');

const getPlayers = () => JSON.parse(localStorage.getItem('players') || '[]');
const savePlayers = (players) => localStorage.setItem('players', JSON.stringify(players));

function renderPlayers() {
  const players = getPlayers();
  playerList.innerHTML = '';

  players.forEach((player, index) => {
    const li = document.createElement('li');

    const nameSpan = document.createElement('span');
    nameSpan.textContent = player.name;
    nameSpan.className = 'player-name';

    const winSpan = document.createElement('span');
    winSpan.textContent = `Wins: ${player.wins || 0}`;

    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = '🗑️';
    deleteBtn.addEventListener('click', () => {
      if (confirm(`Delete player "${player.name}"?`)) {
        const updated = getPlayers().filter((_, i) => i !== index);
        savePlayers(updated);
        renderPlayers();
      }
    });

    li.append(nameSpan, winSpan, deleteBtn);
    playerList.appendChild(li);
  });
}

addPlayerBtn.addEventListener('click', () => {
  const name = prompt("Enter player name:");
  if (!name) return;
  const players = getPlayers();
  players.push({ name, wins: 0 });
  savePlayers(players);
  renderPlayers();
});

matchHistoryBtn.addEventListener('click', () => {
  const matchHistory = JSON.parse(localStorage.getItem('matchHistory') || '[]');
  const container = matchHistoryModal.querySelector('.modal-content');

  container.innerHTML = `
    <h3>Match History</h3>
    <ul id="history-list" style="max-height: 300px; overflow-y: auto; padding: 0; list-style: none; margin-bottom: 1em;"></ul>
    <button id="close-history">Close</button>
  `;

  const list = container.querySelector('#history-list');

  matchHistory
    .slice()
    .reverse()
    .forEach(match => {
      const li = document.createElement('li');

      const winnerColor = match.isTie ? 'black' : 'green';
      const loserColor = match.isTie ? 'black' : 'red';

      li.innerHTML = `
      <div class="player-name player-name-left" style="color:${winnerColor};">${match.winner}</div>
      <div class="vs">vs</div>
      <div class="player-name player-name-right" style="color:${loserColor};">${match.loser}</div>

      <div class="score player-name-left" style="color:${winnerColor};">${match.winnerScore}</div>
      <div class="vs"></div>
      <div class="score player-name-right" style="color:${loserColor};">${match.loserScore}</div>
    `;
      list.appendChild(li);
    });

  container.querySelector('#close-history').addEventListener('click', () => {
    matchHistoryModal.classList.add('hidden');
  });

  matchHistoryModal.classList.remove('hidden');
});

renderPlayers();

// === Game Score Logic ===
let scores = { left: 0, right: 0 };

const updateScoreDisplay = () => {
  document.getElementById('score-left').textContent = scores.left;
  document.getElementById('score-right').textContent = scores.right;
};

document.querySelectorAll('.plus, .minus').forEach(btn => {
  btn.addEventListener('click', () => {
    const side = btn.getAttribute('data-side');
    if (btn.classList.contains('plus')) {
      scores[side]++;
    } else {
      scores[side] = Math.max(0, scores[side] - 1);
    }
    updateScoreDisplay();
  });
});

updateScoreDisplay();

// === Game Player Selection ===
let selectedPlayers = { left: 'Player 1', right: 'Player 2' };

const updatePlayerLabels = () => {
  document.querySelector('[data-side="left"]').textContent = selectedPlayers.left;
  document.querySelector('[data-side="right"]').textContent = selectedPlayers.right;
};

const popup = document.getElementById('player-select-popup');
const popupContent = popup.querySelector('.popup-content');

document.querySelectorAll('.player-name-label').forEach(label => {
  label.addEventListener('click', () => {
    const side = label.getAttribute('data-side');
    const allPlayers = getPlayers().map(p => p.name);
    const otherSide = side === 'left' ? 'right' : 'left';
    const availablePlayers = allPlayers.filter(name => name !== selectedPlayers[otherSide]);

    if (availablePlayers.length === 0) {
      alert("No available players to choose from.");
      return;
    }

    popupContent.innerHTML = `<h4>Select player (${side})</h4><ul>` +
      availablePlayers.map(name => `<li data-name="${name}">${name}</li>`).join('') +
      `</ul>`;

    popup.classList.remove('hidden');

    popup.querySelectorAll('li').forEach(item => {
      item.addEventListener('click', () => {
        selectedPlayers[side] = item.dataset.name;
        updatePlayerLabels();
        popup.classList.add('hidden');
      });
    });
  });
});

popup.addEventListener('click', (e) => {
  if (e.target === popup) {
    popup.classList.add('hidden');
  }
});

updatePlayerLabels();

// === Cancel Match Modal ===
const cancelMatchBtn = document.getElementById('cancel-match-btn');
const cancelModal = document.getElementById('cancel-modal');
const cancelGameBtn = cancelModal.querySelector('.cancel-btn');
const continueGameBtn = cancelModal.querySelector('.continue-btn');

// Show the cancel modal when clicked
cancelMatchBtn.addEventListener('click', () => {
  cancelModal.classList.remove('hidden');
});

// Reset scores when canceling the match
cancelGameBtn.addEventListener('click', () => {
  scores.left = 0;
  scores.right = 0;
  updateScoreDisplay();
  cancelModal.classList.add('hidden');
});

// Close the modal and continue the game
continueGameBtn.addEventListener('click', () => {
  cancelModal.classList.add('hidden');
});

// === Finish Match Logic ===
const endMatchBtn = document.getElementById('end-match-btn');

endMatchBtn.addEventListener('click', () => {
  const isTie = scores.left === scores.right;
  const leftName = selectedPlayers.left;
  const rightName = selectedPlayers.right;
  const leftScore = scores.left;
  const rightScore = scores.right;

  let winner = null;
  let loser = null;
  let winnerScore = null;
  let loserScore = null;

  if (!isTie) {
    const winnerSide = leftScore > rightScore ? 'left' : 'right';
    winner = selectedPlayers[winnerSide];
    loser = selectedPlayers[winnerSide === 'left' ? 'right' : 'left'];
    winnerScore = scores[winnerSide];
    loserScore = scores[winnerSide === 'left' ? 'right' : 'left'];

    // Update player wins
    const players = getPlayers();
    const playerIndex = players.findIndex(player => player.name === winner);
    if (playerIndex >= 0) {
      players[playerIndex].wins = (players[playerIndex].wins || 0) + 1;
      savePlayers(players);
    }
  }

  // Log the match
  const matchHistory = JSON.parse(localStorage.getItem('matchHistory') || '[]');
  matchHistory.push({
    isTie,
    winner: isTie ? leftName : winner,
    loser: isTie ? rightName : loser,
    winnerScore: leftScore,
    loserScore: rightScore,
    date: new Date().toLocaleString()
  });
  localStorage.setItem('matchHistory', JSON.stringify(matchHistory));

  // Display match result
  if (isTie) {
    alert(`${leftName} and ${rightName} tied with ${leftScore} points.`);
  } else {
    alert(`${winner} wins with ${winnerScore} points vs ${loser} with ${loserScore} points.`);
  }

  // Reset for new match
  scores.left = 0;
  scores.right = 0;
  updateScoreDisplay();
});
