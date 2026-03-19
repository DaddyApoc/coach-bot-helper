import fs from "fs";
import path from "path";

const filePath = path.join(process.cwd(), "data", "admin.json");

function loadAdmin() {
  if (!fs.existsSync(filePath)) return { refunds: [], adjustments: [], transactions: [] };
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function saveAdmin(data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

export function logRefund(userId, amount, reason) {
  const admin = loadAdmin();

  admin.refunds.push({
    userId,
    amount,
    reason,
    date: Date.now(),
  });

  saveAdmin(admin);
}

export function logAdjustment(userId, amount, reason) {
  const admin = loadAdmin();

  admin.adjustments.push({
    userId,
    amount,
    reason,
    date: Date.now(),
  });

  saveAdmin(admin);
}

export function logTransaction(type, data) {
  const admin = loadAdmin();

  admin.transactions.push({
    type,
    data,
    date: Date.now(),
  });

  saveAdmin(admin);
}

export function flagUser(userId, reason, scoreDelta = 10) {
  const admin = loadAdmin();

  if (!admin.fraudFlags[userId]) {
    admin.fraudFlags[userId] = {
      score: 0,
      reasons: [],
    };
  }

  admin.fraudFlags[userId].score += scoreDelta;
  admin.fraudFlags[userId].reasons.push({
    reason,
    date: Date.now(),
  });

  saveAdmin(admin);
}
