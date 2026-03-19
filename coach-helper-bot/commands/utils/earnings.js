import fs from "fs";

const earningsPath = "data/earnings.json";
const transactionsPath = "data/transactions.json";

function ensureFiles() {
  if (!fs.existsSync("data")) fs.mkdirSync("data", { recursive: true });
  if (!fs.existsSync(earningsPath)) {
    fs.writeFileSync(earningsPath, JSON.stringify({}));
  }
  if (!fs.existsSync(transactionsPath)) {
    fs.writeFileSync(transactionsPath, JSON.stringify([]));
  }
}

export function getEarnings(coachId) {
  ensureFiles();
  const data = JSON.parse(fs.readFileSync(earningsPath, "utf8"));
  return data[coachId] || { 
    totalEarned: 0, 
    pendingPayout: 0, 
    history: [] 
  };
}

export function addEarnings(coachId, amount, type) {
  ensureFiles();
  const data = JSON.parse(fs.readFileSync(earningsPath, "utf8"));
  
  if (!data[coachId]) {
    data[coachId] = { totalEarned: 0, pendingPayout: 0, history: [] };
  }
  
  data[coachId].pendingPayout += amount;
  data[coachId].totalEarned += amount;
  data[coachId].history.push({
    type,
    amount,
    date: new Date().toISOString()
  });
  
  fs.writeFileSync(earningsPath, JSON.stringify(data, null, 2));
}

export function deductEarnings(coachId, amount) {
  ensureFiles();
  const data = JSON.parse(fs.readFileSync(earningsPath, "utf8"));
  
  if (!data[coachId] || data[coachId].pendingPayout < amount) {
    return false;
  }
  
  data[coachId].pendingPayout -= amount;
  data[coachId].history.push({
    type: "deduction",
    amount: -amount,
    date: new Date().toISOString()
  });
  
  fs.writeFileSync(earningsPath, JSON.stringify(data, null, 2));
  return true;
}

export function payoutCoach(coachId, amount) {
  ensureFiles();
  const data = JSON.parse(fs.readFileSync(earningsPath, "utf8"));
  
  if (!data[coachId] || data[coachId].pendingPayout < amount) {
    return false;
  }
  
  data[coachId].pendingPayout -= amount;
  data[coachId].history.push({
    type: "payout",
    amount: -amount,
    date: new Date().toISOString()
  });
  
  fs.writeFileSync(earningsPath, JSON.stringify(data, null, 2));
  return true;
}

export function getTransactions(coachId) {
  ensureFiles();
  const transactions = JSON.parse(fs.readFileSync(transactionsPath, "utf8"));
  return coachId ? transactions.filter(t => t.coachId === coachId) : transactions;
}
