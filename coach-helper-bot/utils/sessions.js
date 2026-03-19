import fs from "fs";
import path from "path";

const filePath = path.join(process.cwd(), "data", "sessions.json");

// Load all sessions
export function loadSessions() {
  try {
    if (!fs.existsSync(filePath)) return {};
    const raw = fs.readFileSync(filePath, "utf8");
    return JSON.parse(raw);
  } catch (err) {
    console.error("Error loading sessions:", err);
    return {};
  }
}

// Save all sessions
export function saveSessions(data) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error("Error saving sessions:", err);
  }
}

// Create a new session
export function createSession(sessionId, sessionData) {
  const sessions = loadSessions();
  sessions[sessionId] = sessionData;
  saveSessions(sessions);
  return sessions[sessionId];
}

// Get a single session
export function getSession(sessionId) {
  const sessions = loadSessions();
  return sessions[sessionId] || null;
}

// Update an existing session
export function saveSession(sessionId, sessionData) {
  const sessions = loadSessions();
  sessions[sessionId] = sessionData;
  saveSessions(sessions);
}

// Get all sessions for a specific user
export function getUserSessions(userId) {
  const sessions = loadSessions();
  return Object.values(sessions).filter(
    s => s.studentId === userId || s.coachId === userId
  );
}
