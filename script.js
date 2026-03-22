let scoutingPoints = 80;
let currentTab = "overall";
let selectedProspectId = null;

const userPickNumber = 8;
let draftStarted = false;
let userHasPicked = false;
let currentDraftPick = 1;
let draftLog = [];
let userDraftResults = [];

function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}

function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function numberToGrade(v) {
  if (v <= 7) return "F";
  if (v <= 12) return "F+";
  if (v <= 18) return "D-";
  if (v <= 24) return "D";
  if (v <= 30) return "D+";
  if (v <= 37) return "C-";
  if (v <= 44) return "C";
  if (v <= 51) return "C+";
  if (v <= 58) return "B-";
  if (v <= 66) return "B";
  if (v <= 74) return "B+";
  if (v <= 82) return "A-";
  if (v <= 90) return "A";
  return "A+";
}

function gradeToNumber(g) {
  const map = {
    "F": 5, "F+": 10,
    "D-": 16, "D": 22, "D+": 28,
    "C-": 34, "C": 41, "C+": 48,
    "B-": 55, "B": 62, "B+": 70,
    "A-": 78, "A": 86, "A+": 95
  };
  return map[g] || 50;
}

function moveEstimateTowardTruth(currentGrade, trueValue, strength) {
  const currentNumber = gradeToNumber(currentGrade);
  const diff = trueValue - currentNumber;
  const adjustment = Math.round(diff * strength);
  const noise = Math.floor(Math.random() * 7) - 3;
  return numberToGrade(clamp(currentNumber + adjustment + noise, 1, 99));
}

function getInitialTrait() {
  return randomItem([
    "High Upside",
    "Raw Prospect",
    "Safe Pick",
    "Athletic",
    "Unpolished",
    "Limited Ceiling"
  ]);
}

function getHiddenTrait() {
  return randomItem([
    "Elite Work Ethic",
    "Inconsistent",
    "High Motor",
    "Low Motor",
    "Boom or Bust",
    "NBA Ready"
  ]);
}

function getTrueProfileTag(potential, volatility) {
  if (potential >= 86 && volatility >= 13) return "Star Upside";
  if (potential >= 82) return "High Ceiling";
  if (volatility >= 15) return "Volatile";
  if (potential <= 72) return "Lower Ceiling";
  return "Balanced Profile";
}

function offset() {
  return Math.floor(Math.random() * 19) - 9;
}

function createProspect(id, name, position, age, archetype, trueRatings, truePotential, volatility) {
  return {
    id,
    name,
    position,
    age,
    archetype,
    trueRatings,
    truePotential,
    volatility,
    visibleGrades: {
      scoring2: numberToGrade(clamp(trueRatings.scoring2 + offset(), 1, 99)),
      scoring3: numberToGrade(clamp(trueRatings.scoring3 + offset(), 1, 99)),
      passing: numberToGrade(clamp(trueRatings.passing + offset(), 1, 99)),
      perimeterDefense: numberToGrade(clamp(trueRatings.perimeterDefense + offset(), 1, 99))
    },
    confidence: Math.floor(Math.random() * 25) + 40,
    traits: [getInitialTrait(), getTrueProfileTag(truePotential, volatility)],
    hiddenTrait: getHiddenTrait(),
    visitUsed: false,
    workoutUsed: false,
    target: false,
    drafted: false,
    draftedBy: null,
    draftedAt: null
  };
}

const prospects = [
  createProspect(1, "Jalen Cross", "SG", 19, "Sharpshooter", { scoring2: 71, scoring3: 91, passing: 46, perimeterDefense: 39 }, 88, 17),
  createProspect(2, "Malik Boone", "PF", 20, "Rim Protector", { scoring2: 52, scoring3: 18, passing: 37, perimeterDefense: 74 }, 74, 8),
  createProspect(3, "Trevor Hale", "PG", 21, "Floor General", { scoring2: 64, scoring3: 57, passing: 88, perimeterDefense: 45 }, 79, 6),
  createProspect(4, "Darius Vaughn", "SF", 19, "Two-Way Wing", { scoring2: 68, scoring3: 61, passing: 42, perimeterDefense: 81 }, 86, 14),
  createProspect(5, "Elijah Price", "C", 20, "Interior Finisher", { scoring2: 75, scoring3: 8, passing: 29, perimeterDefense: 49 }, 73, 9),
  createProspect(6, "Marcus Cole", "SF", 19, "Slasher", { scoring2: 79, scoring3: 51, passing: 44, perimeterDefense: 63 }, 84, 13),
  createProspect(7, "Andre Bishop", "PG", 20, "Playmaker", { scoring2: 58, scoring3: 67, passing: 82, perimeterDefense: 56 }, 81, 10),
  createProspect(8, "Noah Mercer", "PF", 21, "Stretch Forward", { scoring2: 61, scoring3: 76, passing: 41, perimeterDefense: 54 }, 76, 7),
  createProspect(9, "Kris Dalton", "C", 19, "Rim Runner", { scoring2: 72, scoring3: 12, passing: 28, perimeterDefense: 71 }, 80, 11),
  createProspect(10, "Tyrese Kent", "SG", 22, "3-and-D Wing", { scoring2: 59, scoring3: 79, passing: 36, perimeterDefense: 77 }, 72, 5),
  createProspect(11, "Caleb Shaw", "SF", 20, "Athletic Wing", { scoring2: 74, scoring3: 58, passing: 40, perimeterDefense: 69 }, 82, 12),
  createProspect(12, "Jordan Pike", "PG", 19, "Combo Guard", { scoring2: 66, scoring3: 72, passing: 69, perimeterDefense: 48 }, 85, 15),
  createProspect(13, "Isaiah Rowan", "PF", 21, "Rebounder", { scoring2: 63, scoring3: 21, passing: 34, perimeterDefense: 66 }, 70, 6),
  createProspect(14, "Mason Reed", "SG", 20, "Microwave Scorer", { scoring2: 78, scoring3: 83, passing: 38, perimeterDefense: 35 }, 77, 16),
  createProspect(15, "Luke Bennett", "SF", 22, "Glue Wing", { scoring2: 57, scoring3: 64, passing: 51, perimeterDefense: 73 }, 71, 4)
];

function estimatedOverallScore(prospect) {
  const g = prospect.visibleGrades;
  const score =
    gradeToNumber(g.scoring2) * 0.27 +
    gradeToNumber(g.scoring3) * 0.22 +
    gradeToNumber(g.passing) * 0.21 +
    gradeToNumber(g.perimeterDefense) * 0.25 +
    prospect.confidence * 0.05;

  return score + 15;
}

function trueTalentScore(prospect) {
  const r = prospect.trueRatings;
  return (
    r.scoring2 * 0.27 +
    r.scoring3 * 0.22 +
    r.passing * 0.21 +
    r.perimeterDefense * 0.25 +
    prospect.truePotential * 0.05
  );
}

function teamScore(prospect) {
  let score = estimatedOverallScore(prospect);
  const needs = { PG: 3, SG: 1, SF: 4, PF: 2, C: 0 };

  score += needs[prospect.position] || 0;
  if (prospect.target) score += 7;
  if (prospect.age <= 19) score += 1.5;

  return score;
}

function getProjectedRange(score) {
  if (score >= 87) return "Top 3";
  if (score >= 82) return "Top 5";
  if (score >= 75) return "Lottery";
  if (score >= 68) return "Mid 1st";
  if (score >= 60) return "Late 1st";
  if (score >= 50) return "2nd Round";
  return "Undrafted Watch";
}

function getOverallBoard(includeDrafted = false) {
  const filtered = includeDrafted ? prospects : prospects.filter((p) => !p.drafted);
  return [...filtered].sort((a, b) => estimatedOverallScore(b) - estimatedOverallScore(a));
}

function getTeamBoard(includeDrafted = false) {
  const filtered = includeDrafted ? prospects : prospects.filter((p) => !p.drafted);
  return [...filtered].sort((a, b) => teamScore(b) - teamScore(a));
}

function getProspect(id) {
  return prospects.find((p) => p.id === id);
}

function renderOverallBoard() {
  const view = document.getElementById("overallView");
  const board = getOverallBoard();

  view.innerHTML = `<h2>Overall Board</h2>`;

  board.forEach((p, index) => {
    view.innerHTML += `
      <div class="board-row" onclick="openDetail(${p.id})">
        <div>${index + 1}</div>
        <div>${p.name}</div>
        <div>${p.position}</div>
        <div>${p.age}</div>
        <div>${p.archetype}</div>
        <div>${getProjectedRange(estimatedOverallScore(p))}</div>
      </div>
    `;
  });
}

function renderTeamBoard() {
  const view = document.getElementById("teamView");
  const board = getTeamBoard();

  view.innerHTML = `<h2>Team Board</h2>`;

  board.forEach((p, index) => {
    const finalColumn = p.target
      ? `<span class="target-pill">Target</span>`
      : getProjectedRange(teamScore(p));

    view.innerHTML += `
      <div class="board-row" onclick="openDetail(${p.id})">
        <div>${index + 1}</div>
        <div>${p.name}</div>
        <div>${p.position}</div>
        <div>${p.age}</div>
        <div>${p.archetype}</div>
        <div>${finalColumn}</div>
      </div>
    `;
  });
}

function renderDetailView() {
  const view = document.getElementById("detailView");

  if (selectedProspectId === null) {
    view.innerHTML = `<h2>Prospect Detail</h2><div class="panel"><p>Select a prospect from a board.</p></div>`;
    return;
  }

  const p = getProspect(selectedProspectId);

  if (!p || p.drafted) {
    view.innerHTML = `<h2>Prospect Detail</h2><div class="panel"><p>This prospect is no longer available.</p></div>`;
    return;
  }

  view.innerHTML = `
    <h2>Prospect Detail</h2>
    <div class="detail-card">
      <h2>${p.name}</h2>
      <p>${p.position} | Age ${p.age}</p>
      <p>${p.archetype}</p>
      <p><strong>Confidence:</strong> ${p.confidence}%</p>
      <p><strong>Traits:</strong> ${p.traits.join(", ")}</p>
      <p><strong>Overall Range:</strong> ${getProjectedRange(estimatedOverallScore(p))}</p>

      <div class="grade-grid">
        <div class="grade-box">
          <div class="grade-label">2PT</div>
          <div class="grade-value">${p.visibleGrades.scoring2}</div>
        </div>
        <div class="grade-box">
          <div class="grade-label">3PT</div>
          <div class="grade-value">${p.visibleGrades.scoring3}</div>
        </div>
        <div class="grade-box">
          <div class="grade-label">Passing</div>
          <div class="grade-value">${p.visibleGrades.passing}</div>
        </div>
        <div class="grade-box">
          <div class="grade-label">Perimeter Defense</div>
          <div class="grade-value">${p.visibleGrades.perimeterDefense}</div>
        </div>
      </div>

      <div class="button-row">
        <button onclick="scoutVisit()" ${p.visitUsed || scoutingPoints < 3 ? "disabled" : ""}>Scout Visit (-3)</button>
        <button onclick="privateWorkout()" ${p.workoutUsed || scoutingPoints < 8 ? "disabled" : ""}>Private Workout (-8)</button>
        <button onclick="toggleTarget()">${p.target ? "Remove Target" : "Add Target"}</button>
        <button class="secondary-button" onclick="previousTeamProspect()">Previous</button>
        <button class="secondary-button" onclick="nextTeamProspect()">Next</button>
      </div>
    </div>
  `;
}

function updateVisibleGrades(prospect, strength) {
  prospect.visibleGrades.scoring2 = moveEstimateTowardTruth(
    prospect.visibleGrades.scoring2,
    prospect.trueRatings.scoring2,
    strength
  );
  prospect.visibleGrades.scoring3 = moveEstimateTowardTruth(
    prospect.visibleGrades.scoring3,
    prospect.trueRatings.scoring3,
    strength
  );
  prospect.visibleGrades.passing = moveEstimateTowardTruth(
    prospect.visibleGrades.passing,
    prospect.trueRatings.passing,
    strength
  );
  prospect.visibleGrades.perimeterDefense = moveEstimateTowardTruth(
    prospect.visibleGrades.perimeterDefense,
    prospect.trueRatings.perimeterDefense,
    strength
  );
}

function scoutVisit() {
  const p = getProspect(selectedProspectId);
  if (!p || p.visitUsed || p.drafted || scoutingPoints < 3) return;

  scoutingPoints -= 3;
  p.visitUsed = true;
  p.confidence = clamp(p.confidence + Math.floor(Math.random() * 7) + 8, 0, 95);

  updateVisibleGrades(p, 0.28);

  if (Math.random() < 0.6 && !p.traits.includes(p.hiddenTrait)) {
    p.traits.push(p.hiddenTrait);
  }

  renderAll();
}

function privateWorkout() {
  const p = getProspect(selectedProspectId);
  if (!p || p.workoutUsed || p.drafted || scoutingPoints < 8) return;

  scoutingPoints -= 8;
  p.workoutUsed = true;
  p.confidence = clamp(p.confidence + Math.floor(Math.random() * 11) + 15, 0, 99);

  updateVisibleGrades(p, 0.55);

  if (!p.traits.includes(p.hiddenTrait)) {
    p.traits.push(p.hiddenTrait);
  }

  renderAll();
}

function toggleTarget() {
  const p = getProspect(selectedProspectId);
  if (!p || p.drafted) return;

  p.target = !p.target;
  renderAll();
}

function nextTeamProspect() {
  if (selectedProspectId === null) return;

  const board = getTeamBoard();
  const index = board.findIndex((p) => p.id === selectedProspectId);
  if (index === -1 || board.length === 0) return;

  selectedProspectId = board[(index + 1) % board.length].id;
  renderAll();
}

function previousTeamProspect() {
  if (selectedProspectId === null) return;

  const board = getTeamBoard();
  const index = board.findIndex((p) => p.id === selectedProspectId);
  if (index === -1 || board.length === 0) return;

  selectedProspectId = board[(index - 1 + board.length) % board.length].id;
  renderAll();
}

function getBestAvailableForAi() {
  const available = prospects.filter((p) => !p.drafted);
  if (available.length === 0) return null;

  const sorted = [...available].sort((a, b) => {
    const aScore = estimatedOverallScore(a) + (a.truePotential * 0.08) + (Math.random() * 5);
    const bScore = estimatedOverallScore(b) + (b.truePotential * 0.08) + (Math.random() * 5);
    return bScore - aScore;
  });

  return sorted[0];
}

function aiTeamName(pickNumber) {
  const teams = [
    "Seattle Sound", "Las Vegas Silver", "Austin Cosmos", "San Diego Waves",
    "Baltimore Union", "Louisville Flight", "Pittsburgh Steel"
  ];
  return teams[(pickNumber - 1) % teams.length];
}

function advanceToUserPick() {
  if (draftStarted) return;

  draftStarted = true;

  while (currentDraftPick < userPickNumber) {
    const aiPick = getBestAvailableForAi();
    if (!aiPick) break;

    aiPick.drafted = true;
    aiPick.draftedBy = aiTeamName(currentDraftPick);
    aiPick.draftedAt = currentDraftPick;

    draftLog.push({
      pickNumber: currentDraftPick,
      team: aiPick.draftedBy,
      playerName: aiPick.name
    });

    currentDraftPick += 1;
  }

  if (selectedProspectId !== null) {
    const selected = getProspect(selectedProspectId);
    if (selected && selected.drafted) {
      selectedProspectId = null;
    }
  }

  renderAll();
}

function evaluateUserPick(prospect, actualPickNumber) {
  const availableBeforePick = prospects
    .filter((p) => !p.drafted || p.id === prospect.id)
    .sort((a, b) => trueTalentScore(b) - trueTalentScore(a));

  const trueRank = availableBeforePick.findIndex((p) => p.id === prospect.id) + 1;
  const valueDelta = actualPickNumber - trueRank;

  let outcome = "Value Pick";
  let className = "outcome-value";

  if (valueDelta >= 4) {
    outcome = "Steal";
    className = "outcome-steal";
  } else if (valueDelta <= -3) {
    outcome = "Reach";
    className = "outcome-reach";
  }

  return {
    outcome,
    className,
    trueRank
  };
}

function makeUserPick() {
  if (!draftStarted || userHasPicked || currentDraftPick !== userPickNumber || selectedProspectId === null) {
    return;
  }

  const p = getProspect(selectedProspectId);
  if (!p || p.drafted) return;

  const evaluation = evaluateUserPick(p, currentDraftPick);

  p.drafted = true;
  p.draftedBy = "Your Team";
  p.draftedAt = currentDraftPick;

  draftLog.push({
    pickNumber: currentDraftPick,
    team: "Your Team",
    playerName: p.name
  });

  userDraftResults.push({
    pickNumber: currentDraftPick,
    playerName: p.name,
    position: p.position,
    archetype: p.archetype,
    outcome: evaluation.outcome,
    className: evaluation.className,
    trueRank: evaluation.trueRank,
    hiddenTrait: p.hiddenTrait,
    potential: p.truePotential
  });

  userHasPicked = true;
  currentDraftPick += 1;
  renderAll();
}

function renderDraftView() {
  const view = document.getElementById("draftView");
  const availableBoard = getTeamBoard();
  const selected = selectedProspectId !== null ? getProspect(selectedProspectId) : null;

  let availableHtml = "";
  availableBoard.slice(0, 8).forEach((p, index) => {
    availableHtml += `
      <div class="board-row" onclick="openDetail(${p.id})">
        <div>${index + 1}</div>
        <div>${p.name}</div>
        <div>${p.position}</div>
        <div>${p.age}</div>
        <div>${p.archetype}</div>
        <div>${p.target ? `<span class="target-pill">Target</span>` : getProjectedRange(teamScore(p))}</div>
      </div>
    `;
  });

  let logHtml = "";
  if (draftLog.length === 0) {
    logHtml = `<p class="empty-state">No picks have been made yet.</p>`;
  } else {
    draftLog.forEach((entry) => {
      logHtml += `
        <div class="pick-log-item">
          <div class="pick-number">Pick ${entry.pickNumber}</div>
          <div>${entry.team} selected ${entry.playerName}</div>
        </div>
      `;
    });
  }

  let myPickHtml = "";
  if (userDraftResults.length === 0) {
    myPickHtml = `<p class="empty-state">You have not made a selection yet.</p>`;
  } else {
    userDraftResults.forEach((entry) => {
      myPickHtml += `
        <div class="my-pick-item">
          <div class="pick-number">Pick ${entry.pickNumber}: ${entry.playerName}</div>
          <div>${entry.position} | ${entry.archetype}</div>
          <div class="${entry.className}">${entry.outcome}</div>
          <div class="small-text">Hidden trait: ${entry.hiddenTrait}</div>
          <div class="small-text">True talent rank at selection: ${entry.trueRank}</div>
          <div class="small-text">Potential: ${entry.potential}</div>
        </div>
      `;
    });
  }

  view.innerHTML = `
    <h2>Draft Day</h2>
    <div class="draft-layout">
      <div>
        <div class="panel">
          <h2>Draft Controls</h2>
          <p><strong>Current Pick:</strong> ${currentDraftPick}</p>
          <p><strong>Status:</strong> ${
            !draftStarted
              ? "Draft not started"
              : userHasPicked
                ? "Your pick has been made"
                : currentDraftPick === userPickNumber
                  ? "You are on the clock"
                  : "Draft in progress"
          }</p>

          <div class="button-row draft-actions">
            <button onclick="advanceToUserPick()" ${draftStarted ? "disabled" : ""}>
              Sim to Pick ${userPickNumber}
            </button>
            <button onclick="makeUserPick()" ${
              !draftStarted || userHasPicked || currentDraftPick !== userPickNumber || !selected || selected.drafted
                ? "disabled"
                : ""
            }>
              Draft Selected Prospect
            </button>
          </div>

          <div class="small-text" style="margin-top: 10px;">
            Open a prospect in Detail first, then return here to draft him.
          </div>
        </div>

        <div class="panel">
          <h2>Best Available</h2>
          ${availableHtml || `<p class="empty-state">No available prospects remain.</p>`}
        </div>
      </div>

      <div>
        <div class="panel">
          <h2>Pick Log</h2>
          ${logHtml}
        </div>

        <div class="panel">
          <h2>Your Draft Results</h2>
          ${myPickHtml}
        </div>
      </div>
    </div>
  `;
}

function openDetail(id) {
  selectedProspectId = id;
  switchTab("detail");
}

function updateActiveTab() {
  document.getElementById("tab-overall").classList.remove("active");
  document.getElementById("tab-team").classList.remove("active");
  document.getElementById("tab-detail").classList.remove("active");
  document.getElementById("tab-draft").classList.remove("active");

  document.getElementById(`tab-${currentTab}`).classList.add("active");
}

function switchTab(tab) {
  currentTab = tab;

  document.getElementById("overallView").style.display = "none";
  document.getElementById("teamView").style.display = "none";
  document.getElementById("detailView").style.display = "none";
  document.getElementById("draftView").style.display = "none";

  if (tab === "overall") document.getElementById("overallView").style.display = "block";
  if (tab === "team") document.getElementById("teamView").style.display = "block";
  if (tab === "detail") document.getElementById("detailView").style.display = "block";
  if (tab === "draft") document.getElementById("draftView").style.display = "block";

  updateActiveTab();
  renderAll();
}

function renderAll() {
  document.getElementById("points").textContent = scoutingPoints;
  document.getElementById("userPickNumber").textContent = userPickNumber;
  renderOverallBoard();
  renderTeamBoard();
  renderDetailView();
  renderDraftView();
}

switchTab("overall");