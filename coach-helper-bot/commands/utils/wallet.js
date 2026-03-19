import fs from "fs";

const walletPath = "data/wallets.json";

function ensureFile() {
  if (!fs.existsSync("data")) fs.mkdirSync("data", { recursive: true });
  if (!fs.existsSync(walletPath)) {
    fs.writeFileSync(walletPath, JSON.stringify({}));
  }
}

export function getWallet(userId) {
  ensureFile();
  const data = JSON.parse(fs.readFileSync(walletPath, "utf8"));
  return data[userId] || { balance: 0 };
}

export function addToWallet(userId, amount) {
  ensureFile();
  const data = JSON.parse(fs.readFileSync(walletPath, "utf8"));
  
  if (!data[userId]) {
    data[userId] = { balance: 0 };
  }
  
  data[userId].balance += amount;
  fs.writeFileSync(walletPath, JSON.stringify(data, null, 2));
}

export function deductFromWallet(userId, amount) {
  ensureFile();
  const data = JSON.parse(fs.readFileSync(walletPath, "utf8"));
  
  if (!data[userId] || data[userId].balance < amount) {
    return false;
  }
  
  data[userId].balance -= amount;
  fs.writeFileSync(walletPath, JSON.stringify(data, null, 2));
  return true;
}
