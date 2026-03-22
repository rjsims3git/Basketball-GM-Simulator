let scoutingPoints = 25;

const prospects = [
  {
    id: 1,
    name: "Jalen Cross",
    position: "SG",
    age: 19,
    archetype: "Sharpshooter",
    grades: {
      scoring2: "B-",
      scoring3: "A-",
      passing: "C+",
      perimeterDefense: "C"
    },
    confidence: 52,
    traits: ["High Upside"],
    scouted: false
  },
  {
    id: 2,
    name: "Malik Boone",
    position: "PF",
    age: 20,
    archetype: "Rim Protector",
    grades: {
      scoring2: "C+",
      scoring3: "D",
      passing: "C",
      perimeterDefense: "B"
    },
    confidence: 47,
    traits: ["Raw Prospect"],
    scouted: false
  },
  {
    id: 3,
    name: "Trevor Hale",
    position: "PG",
    age: 21,
    archetype: "Floor General",
    grades: {
      scoring2: "B",
      scoring3: "B-",
      passing: "A",
      perimeterDefense: "C+"
    },
    confidence: 61,
    traits: ["Safe Pick"],
    scouted: false
  },
  {
    id: 4,
    name: "Darius Vaughn",
    position: "SF",
    age: 19,
    archetype: "Two-Way Wing",
    grades: {
      scoring2: "B+",
      scoring3: "C+",
      passing: "C",
      perimeterDefense: "B+"
    },
    confidence: 43,
    traits: ["Athletic"],
    scouted: false
  },
  {
    id: 5,
    name: "Elijah Price",
    position: "C",
    age: 20,
    archetype: "Interior Finisher",
    grades: {
      scoring2: "B",
      scoring3: "D-",
      passing: "C-",
      perimeterDefense: "C"
    },
    confidence: 55,
    traits: ["Strong Motor"],
    scouted: false
  }
];

const scoutingPointsEl = document.getElementById("scoutingPoints");
const prospectListEl = document.getElementById("prospectList");

function renderProspects() {
  prospectListEl.innerHTML = "";

  prospects.forEach((prospect) => {
    const card = document.createElement("div");
    card.className = "prospect-card";

    card.innerHTML = `
      <div class="prospect-header">
        <div class="prospect-name">${prospect.name}</div>
        <div>${prospect.position} | Age ${prospect.age}</div>
      </div>

      <div class="prospect-meta">${prospect.archetype}</div>

      <div class="grade-row">
        <div class="grade-badge">2PT: ${prospect.grades.scoring2}</div>
        <div class="grade-badge">3PT: ${prospect.grades.scoring3}</div>
        <div class="grade-badge">Passing: ${prospect.grades.passing}</div>
        <div class="grade-badge">Perimeter D: ${prospect.grades.perimeterDefense}</div>
      </div>

      <div class="traits">Traits: ${prospect.traits.join(", ")}</div>
      <div class="confidence">Confidence: ${prospect.confidence}%</div>

      <button onclick="scoutProspect(${prospect.id})" ${prospect.scouted || scoutingPoints < 4 ? "disabled" : ""}>
        Scout Visit (-4)
      </button>
    `;

    prospectListEl.appendChild(card);
  });

  scoutingPointsEl.textContent = scoutingPoints;
}

function scoutProspect(id) {
  const prospect = prospects.find((p) => p.id === id);

  if (!prospect || prospect.scouted || scoutingPoints < 4) {
    return;
  }

  scoutingPoints -= 4;
  prospect.scouted = true;

  const confidenceBoost = Math.floor(Math.random() * 11) + 8;
  prospect.confidence = Math.min(95, prospect.confidence + confidenceBoost);

  const possibleTraits = [
    "Good Worker",
    "Inconsistent",
    "High Motor",
    "Questionable Focus",
    "Polished",
    "Raw Tools"
  ];

  const randomTrait = possibleTraits[Math.floor(Math.random() * possibleTraits.length)];

  if (!prospect.traits.includes(randomTrait)) {
    prospect.traits.push(randomTrait);
  }

  renderProspects();
}

renderProspects();