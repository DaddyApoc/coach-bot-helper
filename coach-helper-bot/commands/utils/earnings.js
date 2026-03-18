import fs from "fs";
import path from "path";

const filePath = path.join(process.cwd(), "data", "earnings.json");

function loadEarnings() {
  if (!fs.existsSync(filePath)) return {};
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function saveEarnings(data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

export function getEarnings(coachId) {
  const earnings = loadEarnings();

  if (!earnings[coachId]) {
    earnings[coachId] = {
      totalEarned: 0,
      pendingPayout: 0,
      history: [],
    };
    saveEarnings(earnings);
  }

  return earnings[coachId];
}

export function addEarnings(coachId, amount, sessionId) {
  const earnings = loadEarnings();

  if (!earnings[coachId]) {
    earnings[coachId] = {
      totalEarned: 0,
      pendingPayout: 0,
      history: [],
    };
  }

  earnings[coachId].totalEarned += amount;
  earnings[coachId].pendingPayout += amount;

  earnings[coachId].history.push({
    type: "session_completed",
    amount,
    sessionId,
    date: Date.now(),
  });

  saveEarnings(earnings);
}

export function payoutCoach(coachId, amount) {
  const earnings = loadEarnings();

  if (!earnings[coachId] || earnings[coachId].pendingPayout < amount) {
    return false;
  }

  earnings[coachId].pendingPayout -= amount;

  earnings[coachId].history.push({
    type: "payout",
    amount,
    date: Date.now(),
  });

  saveEarnings(earnings);
  return true;
}
