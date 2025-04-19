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
  playerList.innerHTML = ''; // Clear existing player list

  players.forEach((player, index) => {
    const li = document.createElement('li');

    const nameSpan = document.createElement('span');
    nameSpan.textContent = player.name;
    nameSpan.className = 'player-name';

    // Create W: L: T stats
    const statsSpan = document.createElement('span');
    statsSpan.className = 'player-stats';
    statsSpan.innerHTML = `
      <span style="color: green;">W:${player.wins || 0}</span> 
      <span style="color: red;">L:${player.losses || 0}</span> 
      <span style="color: black;">T:${player.ties || 0}</span>
    `;

    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'x';
    deleteBtn.classList.add("delete-button");
    deleteBtn.addEventListener('click', () => {
      if (confirm(`Delete player "${player.name}"?`)) {
        const updated = getPlayers().filter((_, i) => i !== index);
        savePlayers(updated);
        renderPlayers();
        showMatchHistory();
      }
    });

    li.append(nameSpan, statsSpan, deleteBtn);
    playerList.appendChild(li);
  });
}
renderPlayers();


addPlayerBtn.addEventListener('click', () => {
  const name = prompt("Enter player name:");
  if (!name) return;
  const players = getPlayers();
  players.push({
    name,
    wins: 0,
    losses: 0,
    ties: 0
  });
  savePlayers(players);
  renderPlayers();
  showMatchHistory();
});

function showMatchHistory() {
  const players = getPlayers(); // assumes you have a getPlayers() function
  if (players.length === 0) {
    matchHistoryBtn.classList.add("hidden");
  } else {
    matchHistoryBtn.classList.remove("hidden");
  }
}

showMatchHistory();

matchHistoryBtn.addEventListener('click', () => {
  const matchHistory = JSON.parse(localStorage.getItem('matchHistory') || '[]');
  const container = matchHistoryModal.querySelector('.modal-content');

  container.innerHTML = `
    <h3>Match History</h3>
    <ul id="history-list" class="match-history" style=""></ul>
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

// === Finish Match Logic with Modal ===
const endMatchBtn = document.getElementById('end-match-btn');
const endMatchModal = document.getElementById('end-match-modal');
const endMatchConfirmBtn = document.querySelector('.end-match-confirm');
const endMatchCancelBtn = document.querySelector('.end-match-cancel');

// Show confirmation modal
endMatchBtn.addEventListener('click', () => {
  endMatchModal.classList.remove('hidden');
});

// Cancel button inside modal
endMatchCancelBtn.addEventListener('click', () => {
  endMatchModal.classList.add('hidden');
});

// Confirm "End Match" from modal
endMatchConfirmBtn.addEventListener('click', () => {
  finalizeMatch();
  endMatchModal.classList.add('hidden'); // closes the modal
});

// Finalize match logic (moved here)
function finalizeMatch() {
  const isTie = scores.left === scores.right;
  const leftName = selectedPlayers.left;
  const rightName = selectedPlayers.right;
  const leftScore = scores.left;
  const rightScore = scores.right;

  const players = getPlayers();
  let winner = null;
  let loser = null;

  if (!isTie) {
    const winnerSide = leftScore > rightScore ? 'left' : 'right';
    winner = selectedPlayers[winnerSide];
    loser = selectedPlayers[winnerSide === 'left' ? 'right' : 'left'];

    const winnerIndex = players.findIndex(player => player.name === winner);
    if (winnerIndex >= 0) players[winnerIndex].wins += 1;

    const loserIndex = players.findIndex(player => player.name === loser);
    if (loserIndex >= 0) players[loserIndex].losses += 1;
  } else {
    const leftIndex = players.findIndex(player => player.name === leftName);
    if (leftIndex >= 0) players[leftIndex].ties += 1;

    const rightIndex = players.findIndex(player => player.name === rightName);
    if (rightIndex >= 0) players[rightIndex].ties += 1;
  }

  savePlayers(players);

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

  scores.left = 0;
  scores.right = 0;
  updateScoreDisplay();
  renderPlayers();
}


// EXPORT and IMPORT 
function exportData() {
  const data = {
    exportedAt: new Date().toLocaleString(),
    players: JSON.parse(localStorage.getItem("players") || "[]"),
    matchHistory: JSON.parse(localStorage.getItem("matchHistory") || "[]")
  };

  const json = JSON.stringify(data, null, 2); // formatted with indentation
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = `4d-badminton-export-${Date.now()}.json`;
  a.click();

  URL.revokeObjectURL(url);
}

document.getElementById('import-file').addEventListener('change', function (event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (e) {
    try {
      const data = JSON.parse(e.target.result);

      // Check for required keys
      if (!data.players || !data.matchHistory) {
        showTemporaryMessage("Invalid file format: missing required keys.", "error");
        return;
      }

      // Clear previous data first to ensure a full overwrite
      localStorage.removeItem("players");
      localStorage.removeItem("matchHistory");

      // Or: localStorage.clear(); // if you want to wipe *everything*

      // Save imported data
      localStorage.setItem("players", JSON.stringify(data.players));
      localStorage.setItem("matchHistory", JSON.stringify(data.matchHistory));

      showTemporaryMessage("Import successful!", "success");

      renderPlayers?.();
      showMatchHistory?.(); // Optional: if it needs to become visible
    } catch (err) {
      showTemporaryMessage("Failed to import data: " + err.message, "error");
    }
  };
  reader.readAsText(file);
});

// Function to show temporary message
function showTemporaryMessage(message, type) {
  const messageContainer = document.createElement("div");
  messageContainer.textContent = message;
  messageContainer.classList.add("import-message", type);

  // Append the message to the body (or a specific container)
  document.body.appendChild(messageContainer);

  // Remove the message after 3 seconds
  setTimeout(() => {
    messageContainer.remove();
  }, 3000);
}
