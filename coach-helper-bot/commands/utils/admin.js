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
