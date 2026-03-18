import fs from "fs";
import path from "path";

const filePath = path.join(process.cwd(), "data", "sessions.json");

function loadSessions() {
  if (!fs.existsSync(filePath)) return {};
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function saveSessions(data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

export function createSession(studentId, coachId, price) {
  const sessions = loadSessions();

  const id = `session_${Date.now()}`;

  sessions[id] = {
    id,
    studentId,
    coachId,
    price,
    status: "pending",
    createdAt: Date.now(),
  };

  saveSessions(sessions);
  return sessions[id];
}

export function getSession(id) {
  const sessions = loadSessions();
  return sessions[id] || null;
}

export function updateSession(id, updates) {
  const sessions = loadSessions();
  if (!sessions[id]) return null;

  sessions[id] = { ...sessions[id], ...updates };
  saveSessions(sessions);

  return sessions[id];
}
