let scoutingPoints = 80;
let currentTab = "overall";
let selectedProspectId = null;

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

function createProspect(id, name, position, age, archetype, trueRatings, initialOffset) {
  return {
    id,
    name,
    position,
    age,
    archetype,
    trueRatings,
    visibleGrades: {
      scoring2: numberToGrade(clamp(trueRatings.scoring2 + initialOffset(), 1, 99)),
      scoring3: numberToGrade(clamp(trueRatings.scoring3 + initialOffset(), 1, 99)),
      passing: numberToGrade(clamp(trueRatings.passing + initialOffset(), 1, 99)),
      perimeterDefense: numberToGrade(clamp(trueRatings.perimeterDefense + initialOffset(), 1, 99))
    },
    confidence: Math.floor(Math.random() * 25) + 40,
    traits: [getInitialTrait()],
    hiddenTrait: getHiddenTrait(),
    visitUsed: false,
    workoutUsed: false,
    target: false
  };
}

function offset() {
  return Math.floor(Math.random() * 19) - 9;
}

const prospects = [
  createProspect(1, "Jalen Cross", "SG", 19, "Sharpshooter", { scoring2: 71, scoring3: 91, passing: 46, perimeterDefense: 39 }, offset),
  createProspect(2, "Malik Boone", "PF", 20, "Rim Protector", { scoring2: 52, scoring3: 18, passing: 37, perimeterDefense: 74 }, offset),
  createProspect(3, "Trevor Hale", "PG", 21, "Floor General", { scoring2: 64, scoring3: 57, passing: 88, perimeterDefense: 45 }, offset),
  createProspect(4, "Darius Vaughn", "SF", 19, "Two-Way Wing", { scoring2: 68, scoring3: 61, passing: 42, perimeterDefense: 81 }, offset),
  createProspect(5, "Elijah Price", "C", 20, "Interior Finisher", { scoring2: 75, scoring3: 8, passing: 29, perimeterDefense: 49 }, offset),
  createProspect(6, "Marcus Cole", "SF", 19, "Slasher", { scoring2: 79, scoring3: 51, passing: 44, perimeterDefense: 63 }, offset),
  createProspect(7, "Andre Bishop", "PG", 20, "Playmaker", { scoring2: 58, scoring3: 67, passing: 82, perimeterDefense: 56 }, offset),
  createProspect(8, "Noah Mercer", "PF", 21, "Stretch Forward", { scoring2: 61, scoring3: 76, passing: 41, perimeterDefense: 54 }, offset),
  createProspect(9, "Kris Dalton", "C", 19, "Rim Runner", { scoring2: 72, scoring3: 12, passing: 28, perimeterDefense: 71 }, offset),
  createProspect(10, "Tyrese Kent", "SG", 22, "3-and-D Wing", { scoring2: 59, scoring3: 79, passing: 36, perimeterDefense: 77 }, offset),
  createProspect(11, "Caleb Shaw", "SF", 20, "Athletic Wing", { scoring2: 74, scoring3: 58, passing: 40, perimeterDefense: 69 }, offset),
  createProspect(12, "Jordan Pike", "PG", 19, "Combo Guard", { scoring2: 66, scoring3: 72, passing: 69, perimeterDefense: 48 }, offset),
  createProspect(13, "Isaiah Rowan", "PF", 21, "Rebounder", { scoring2: 63, scoring3: 21, passing: 34, perimeterDefense: 66 }, offset),
  createProspect(14, "Mason Reed", "SG", 20, "Microwave Scorer", { scoring2: 78, scoring3: 83, passing: 38, perimeterDefense: 35 }, offset),
  createProspect(15, "Luke Bennett", "SF", 22, "Glue Wing", { scoring2: 57, scoring3: 64, passing: 51, perimeterDefense: 73 }, offset)
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

function getOverallBoard() {
  return [...prospects].sort((a, b) => estimatedOverallScore(b) - estimatedOverallScore(a));
}

function getTeamBoard() {
  return [...prospects].sort((a, b) => teamScore(b) - teamScore(a));
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
    view.innerHTML += `
      <div class="board-row" onclick="openDetail(${p.id})">
        <div>${index + 1}</div>
        <div>${p.name}</div>
        <div>${p.position}</div>
        <div>${p.age}</div>
        <div>${p.archetype}</div>
        <div>${p.target ? "★ Target" : getProjectedRange(teamScore(p))}</div>
      </div>
    `;
  });
}

function renderDetailView() {
  const view = document.getElementById("detailView");

  if (selectedProspectId === null) {
    view.innerHTML = `<h2>Prospect Detail</h2><p>Select a prospect from a board.</p>`;
    return;
  }

  const p = getProspect(selectedProspectId);

  view.innerHTML = `
    <h2>${p.name}</h2>
    <p>${p.position} | Age ${p.age}</p>
    <p>${p.archetype}</p>
    <p><strong>Confidence:</strong> ${p.confidence}%</p>
    <p><strong>Traits:</strong> ${p.traits.join(", ")}</p>
    <p><strong>Overall Range:</strong> ${getProjectedRange(estimatedOverallScore(p))}</p>

    <p><strong>Visible Grades:</strong></p>
    <p>2PT: ${p.visibleGrades.scoring2}</p>
    <p>3PT: ${p.visibleGrades.scoring3}</p>
    <p>Passing: ${p.visibleGrades.passing}</p>
    <p>Perimeter Defense: ${p.visibleGrades.perimeterDefense}</p>

    <button onclick="scoutVisit()" ${p.visitUsed || scoutingPoints < 3 ? "disabled" : ""}>Scout Visit (-3)</button>
    <button onclick="privateWorkout()" ${p.workoutUsed || scoutingPoints < 8 ? "disabled" : ""}>Private Workout (-8)</button>
    <button onclick="toggleTarget()">${p.target ? "Remove Target" : "Add Target"}</button>
    <button onclick="previousTeamProspect()">Previous</button>
    <button onclick="nextTeamProspect()">Next</button>
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
  if (!p || p.visitUsed || scoutingPoints < 3) return;

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
  if (!p || p.workoutUsed || scoutingPoints < 8) return;

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
  if (!p) return;

  p.target = !p.target;
  renderAll();
}

function nextTeamProspect() {
  if (selectedProspectId === null) return;

  const board = getTeamBoard();
  const index = board.findIndex((p) => p.id === selectedProspectId);
  if (index === -1) return;

  selectedProspectId = board[(index + 1) % board.length].id;
  renderAll();
}

function previousTeamProspect() {
  if (selectedProspectId === null) return;

  const board = getTeamBoard();
  const index = board.findIndex((p) => p.id === selectedProspectId);
  if (index === -1) return;

  selectedProspectId = board[(index - 1 + board.length) % board.length].id;
  renderAll();
}

function openDetail(id) {
  selectedProspectId = id;
  switchTab("detail");
}

function updateActiveTab() {
  document.getElementById("tab-overall").classList.remove("active");
  document.getElementById("tab-team").classList.remove("active");
  document.getElementById("tab-detail").classList.remove("active");

  document.getElementById(`tab-${currentTab}`).classList.add("active");
}

function switchTab(tab) {
  currentTab = tab;

  document.getElementById("overallView").style.display = "none";
  document.getElementById("teamView").style.display = "none";
  document.getElementById("detailView").style.display = "none";

  if (tab === "overall") document.getElementById("overallView").style.display = "block";
  if (tab === "team") document.getElementById("teamView").style.display = "block";
  if (tab === "detail") document.getElementById("detailView").style.display = "block";

  updateActiveTab();
  renderAll();
}

function renderAll() {
  document.getElementById("points").textContent = scoutingPoints;
  renderOverallBoard();
  renderTeamBoard();
  renderDetailView();
}

switchTab("overall");