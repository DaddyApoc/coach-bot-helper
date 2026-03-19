const fs = require("fs");
const path = require("path");

const filePath = path.join(process.cwd(), "data", "wallets.json");

// Load all wallets
function loadWallets() {
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
function saveWallets(data) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error("Error saving wallets:", err);
  }
}

// Get a single user's wallet
function getWallet(userId) {
  const wallets = loadWallets();
  return wallets[userId] || { balance: 0, history: [] };
}

// Add money to a wallet
function addToWallet(userId, amount, source = "system") {
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
function deductFromWallet(userId, amount, reason = "system") {
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

module.exports = {
  loadWallets,
  saveWallets,
  getWallet,
  addToWallet,
  deductFromWallet
};
