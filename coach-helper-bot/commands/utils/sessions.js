import fs from "fs";

const sessionsPath = "data/sessions.json";

function ensureFile() {
  if (!fs.existsSync("data")) fs.mkdirSync("data", { recursive: true });
  if (!fs.existsSync(sessionsPath)) {
    fs.writeFileSync(sessionsPath, JSON.stringify([]));
  }
}

export function createSession(studentId, coachId, price) {
  ensureFile();
  const sessions = JSON.parse(fs.readFileSync(sessionsPath, "utf8"));
  
  const session = {
    id: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    studentId,
    coachId,
    price,
    status: "pending",
    createdAt: new Date().toISOString(),
    confirmedAt: null,
    completedAt: null
  };
  
  sessions.push(session);
  fs.writeFileSync(sessionsPath, JSON.stringify(sessions, null, 2));
  
  return session;
}

export function getSession(sessionId) {
  ensureFile();
  const sessions = JSON.parse(fs.readFileSync(sessionsPath, "utf8"));
  return sessions.find(s => s.id === sessionId);
}

export function updateSessionStatus(sessionId, status) {
  ensureFile();
  const sessions = JSON.parse(fs.readFileSync(sessionsPath, "utf8"));
  
  const session = sessions.find(s => s.id === sessionId);
  if (!session) return false;
  
  session.status = status;
  if (status === "confirmed") session.confirmedAt = new Date().toISOString();
  if (status === "completed") session.completedAt = new Date().toISOString();
  
  fs.writeFileSync(sessionsPath, JSON.stringify(sessions, null, 2));
  return true;
}

export function getUserSessions(userId, role = "student") {
  ensureFile();
  const sessions = JSON.parse(fs.readFileSync(sessionsPath, "utf8"));
  
  if (role === "student") {
    return sessions.filter(s => s.studentId === userId);
  } else if (role === "coach") {
    return sessions.filter(s => s.coachId === userId);
  }
  
  return [];
}
