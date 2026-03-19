import fs from "fs";

const earningsPath = "/data/earnings.json";
const transactionsPath = "/data/transactions.json";

function ensureFiles() {
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
  return data[coachId] || { pending: 0, total: 0, pendingPayout: 0 };
}

export function addEarnings(coachId, amount, type) {
  ensureFiles();
  const data = JSON.parse(fs.readFileSync(earningsPath, "utf8"));
  
  if (!data[coachId]) {
    data[coachId] = { pending: 0, total: 0, pendingPayout: 0 };
  }
  
  data[coachId].pending += amount;
  data[coachId].pendingPayout += amount;
  data[coachId].total += amount;
  
  fs.writeFileSync(earningsPath, JSON.stringify(data, null, 2));
  
  const transactions = JSON.parse(fs.readFileSync(transactionsPath, "utf8"));
  transactions.push({
    coachId,
    amount,
    type,
    timestamp: new Date().toISOString()
  });
  fs.writeFileSync(transactionsPath, JSON.stringify(transactions, null, 2));
}

export function payoutCoach(coachId, amount) {
  ensureFiles();
  const data = JSON.parse(fs.readFileSync(earningsPath, "utf8"));
  
  if (!data[coachId] || data[coachId].pendingPayout < amount) {
    return false;
  }
  
  data[coachId].pendingPayout -= amount;
  fs.writeFileSync(earningsPath, JSON.stringify(data, null, 2));
  
  const transactions = JSON.parse(fs.readFileSync(transactionsPath, "utf8"));
  transactions.push({
    coachId,
    amount: -amount,
    type: "payout",
    timestamp: new Date().toISOString()
  });
  fs.writeFileSync(transactionsPath, JSON.stringify(transactions, null, 2));
  
  return true;
}

export function getTransactions(coachId) {
  ensureFiles();
  const transactions = JSON.parse(fs.readFileSync(transactionsPath, "utf8"));
  return coachId ? transactions.filter(t => t.coachId === coachId) : transactions;
}
