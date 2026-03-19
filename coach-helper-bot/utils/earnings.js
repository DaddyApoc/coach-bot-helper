import fs from "fs";
import path from "path";

const filePath = path.join(process.cwd(), "data", "earnings.json");

// Load all earnings
export function loadEarnings() {
  try {
    if (!fs.existsSync(filePath)) return {};
    const raw = fs.readFileSync(filePath, "utf8");
    return JSON.parse(raw);
  } catch (err) {
    console.error("Error loading earnings:", err);
    return {};
  }
}

// Save all earnings
export function saveEarnings(data) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error("Error saving earnings:", err);
  }
}

// Get earnings for a specific coach
export function getEarnings(coachId) {
  const earnings = loadEarnings();
  return earnings[coachId] || {
    totalEarned: 0,
    pendingPayout: 0,
    payoutHistory: []
  };
}

// Add earnings to a coach
export function addEarnings(coachId, amount) {
  const earnings = loadEarnings();

  if (!earnings[coachId]) {
    earnings[coachId] = {
      totalEarned: 0,
      pendingPayout: 0,
      payoutHistory: []
    };
  }

  earnings[coachId].totalEarned += amount;
  earnings[coachId].pendingPayout += amount;

  saveEarnings(earnings);
  return earnings[coachId];
}

// Mark payout as completed
export function payoutCoach(coachId, amount) {
  const earnings = loadEarnings();

  if (!earnings[coachId]) return null;

  earnings[coachId].pendingPayout -= amount;

  earnings[coachId].payoutHistory.push({
    amount,
    date: new Date().toISOString()
  });

  saveEarnings(earnings);
  return earnings[coachId];
}
