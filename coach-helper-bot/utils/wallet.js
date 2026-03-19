import fs from "fs";
import path from "path";

const filePath = path.join(process.cwd(), "data", "wallets.json");

// Load all wallets
export function loadWallets() {
  try {
    if (!fs.existsSync(filePath)) return {};
    const raw = fs.readFileSync(filePath, "utf8");
    return JSON.parse(raw);
  } catch (err) {
    console.error("Error loading wallets:", err);
    return {};
  }
}

// Save all wallets
export function saveWallets(data) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error("Error saving wallets:", err);
  }
}

// Get a single user's wallet
export function getWallet(userId) {
  const wallets = loadWallets();
  return wallets[userId] || { balance: 0, history: [] };
}

// Add money to a wallet
export function addToWallet(userId, amount, source = "system") {
  const wallets = loadWallets();

  if (!wallets[userId]) {
    wallets[userId] = { balance: 0, history: [] };
  }

  wallets[userId].balance += amount;

  wallets[userId].history.push({
    type: "add",
    amount,
    source,
    date: new Date().toISOString()
  });

  saveWallets(wallets);
  return wallets[userId];
}

// Deduct money from a wallet
export function deductFromWallet(userId, amount, reason = "system") {
  const wallets = loadWallets();

  if (!wallets[userId]) {
    wallets[userId] = { balance: 0, history: [] };
  }

  if (wallets[userId].balance < amount) {
    return false; // insufficient funds
  }

  wallets[userId].balance -= amount;

  wallets[userId].history.push({
    type: "deduct",
    amount,
    reason,
    date: new Date().toISOString()
  });

  saveWallets(wallets);
  return wallets[userId];
}
