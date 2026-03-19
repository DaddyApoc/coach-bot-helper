import fs from "fs";

const logsPath = "/data/admin-logs.json";

function ensureFile() {
  if (!fs.existsSync(logsPath)) {
    fs.writeFileSync(logsPath, JSON.stringify([]));
  }
}

export function logAdjustment(coachId, amount, reason) {
  ensureFile();
  const logs = JSON.parse(fs.readFileSync(logsPath, "utf8"));
  
  logs.push({
    coachId,
    amount,
    reason,
    type: "earnings_adjustment",
    timestamp: new Date().toISOString()
  });
  
  fs.writeFileSync(logsPath, JSON.stringify(logs, null, 2));
}

export function logStrike(coachId, reason) {
  ensureFile();
  const logs = JSON.parse(fs.readFileSync(logsPath, "utf8"));
  
  logs.push({
    coachId,
    reason,
    type: "strike",
    timestamp: new Date().toISOString()
  });
  
  fs.writeFileSync(logsPath, JSON.stringify(logs, null, 2));
}

export function logSuspension(coachId, reason) {
  ensureFile();
  const logs = JSON.parse(fs.readFileSync(logsPath, "utf8"));
  
  logs.push({
    coachId,
    reason,
    type: "suspension",
    timestamp: new Date().toISOString()
  });
  
  fs.writeFileSync(logsPath, JSON.stringify(logs, null, 2));
}

export function getAdminLogs(coachId) {
  ensureFile();
  const logs = JSON.parse(fs.readFileSync(logsPath, "utf8"));
  return coachId ? logs.filter(l => l.coachId === coachId) : logs;
}
