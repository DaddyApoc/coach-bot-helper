import fs from "fs";
import path from "path";

// Path to sessions.json inside /data
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

// Get a single session by ID
export function getSession(sessionId) {
  const sessions = loadSessions();
  return sessions[sessionId] || null;
}

// Save/update a single session
export function saveSession(sessionId, sessionData) {
  const sessions = loadSessions();
  sessions[sessionId] = sessionData;
  saveSessions(sessions);
}
