import fs from "fs";
import path from "path";

const filePath = path.join(process.cwd(), "data", "wallets.json");

function loadWallets() {
  if (!fs.existsSync(filePath)) return {};
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function saveWallets(data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

export function getWallet(userId) {
  const wallets = loadWallets();
  if (!wallets[userId]) {
    wallets[userId] = { balance: 0, history: [] };
    saveWallets(wallets);
  }
  return wallets[userId];
}

export function addToWallet(userId, amount, stripeId = null) {
  const wallets = loadWallets();

  if (!wallets[userId]) {
    wallets[userId] = { balance: 0, history: [] };
  }

  wallets[userId].balance += amount;

  wallets[userId].history.push({
    type: "topup",
    amount,
    stripeId,
    date: Date.now(),
  });

  saveWallets(wallets);
}

export function deductFromWallet(userId, amount) {
  const wallets = loadWallets();

  if (!wallets[userId] || wallets[userId].balance < amount) {
    return false;
  }

  wallets[userId].balance -= amount;

  wallets[userId].history.push({
    type: "deduction",
    amount,
    date: Date.now(),
  });

  saveWallets(wallets);
  return true;
}
