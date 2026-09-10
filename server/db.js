import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.resolve(__dirname, 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const SESSIONS_FILE = path.join(DATA_DIR, 'sessions.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Atomic file write helper to prevent data corruption
function safeWriteJson(filePath, data) {
  const tempPath = `${filePath}.tmp.${Date.now()}`;
  fs.writeFileSync(tempPath, JSON.stringify(data, null, 2), 'utf8');
  fs.renameSync(tempPath, filePath);
}

function loadJson(filePath, defaultValue) {
  try {
    if (!fs.existsSync(filePath)) {
      return defaultValue;
    }
    const raw = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(raw);
  } catch (error) {
    console.error(`Error reading ${filePath}:`, error.message);
    return defaultValue;
  }
}

// In-Memory Failed Login Attempts Rate Limit Store
// Maps IP address -> { attempts: number, firstAttemptAt: number }
const failedLoginAttempts = new Map();
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const MAX_FAILED_ATTEMPTS = 5;

// Initialize & Seed Database
function initDb() {
  let users = loadJson(USERS_FILE, []);
  
  // Check if default demo user exists
  const demoEmail = 'krishna.sai@heatguard.ai';
  const existingDemo = users.find(u => u.email.toLowerCase() === demoEmail);
  
  if (!existingDemo) {
    const demoPasswordHash = bcrypt.hashSync('DemoPass2026!', 10);
    const demoUser = {
      id: 'usr_sih_demo_01',
      name: 'Sri Krishna Sai',
      email: demoEmail,
      phone: '+91 98480 22338',
      location: 'Vijayawada',
      userCategory: 'Outdoor Worker',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
      onboarded: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      passwordHash: demoPasswordHash,
      notificationPreferences: {
        heatwaveWarnings: true,
        extremeAlerts: true,
        thermalStressAlerts: true,
        dailySummary: true,
        peakHourReminders: true
      },
      emergencyContacts: [
        { name: 'Dr. R. V. Sharma (Family Physician)', phone: '+91 866 244 5500', relation: 'Physician' },
        { name: 'Ananya Sai (Spouse)', phone: '+91 98481 99002', relation: 'Family' }
      ],
      resetToken: null,
      resetTokenExpires: null
    };
    users.push(demoUser);
    safeWriteJson(USERS_FILE, users);
    console.log('[HeatGuard DB] Seeded default demo user:', demoEmail);
  }
}

initDb();

export const db = {
  // --- USERS ---
  findUserByEmail(email) {
    if (!email) return null;
    const users = loadJson(USERS_FILE, []);
    return users.find(u => u.email.toLowerCase() === email.trim().toLowerCase()) || null;
  },

  findUserById(id) {
    if (!id) return null;
    const users = loadJson(USERS_FILE, []);
    return users.find(u => u.id === id) || null;
  },

  createUser(userData) {
    const users = loadJson(USERS_FILE, []);
    const newUser = {
      id: `usr_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`,
      email: userData.email.trim().toLowerCase(),
      name: userData.name.trim(),
      phone: userData.phone.trim(),
      location: userData.location || 'Vijayawada',
      userCategory: userData.userCategory || 'General Public',
      onboarded: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      passwordHash: userData.passwordHash,
      notificationPreferences: {
        heatwaveWarnings: true,
        extremeAlerts: true,
        thermalStressAlerts: true,
        dailySummary: true,
        peakHourReminders: true
      },
      emergencyContacts: [
        { name: 'Primary Emergency Contact', phone: '+91 99999 00000', relation: 'Family' }
      ],
      resetToken: null,
      resetTokenExpires: null
    };
    users.push(newUser);
    safeWriteJson(USERS_FILE, users);
    return newUser;
  },

  updateUser(id, updates) {
    const users = loadJson(USERS_FILE, []);
    const index = users.findIndex(u => u.id === id);
    if (index === -1) return null;

    const updatedUser = {
      ...users[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    users[index] = updatedUser;
    safeWriteJson(USERS_FILE, users);
    return updatedUser;
  },

  // --- SESSIONS ---
  createSession(userId) {
    const sessions = loadJson(SESSIONS_FILE, []);
    const sessionId = `sess_${crypto.randomBytes(32).toString('hex')}`;
    const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000; // 7 days TTL

    const session = {
      sessionId,
      userId,
      createdAt: new Date().toISOString(),
      expiresAt
    };

    sessions.push(session);
    safeWriteJson(SESSIONS_FILE, sessions);
    return session;
  },

  findSession(sessionId) {
    if (!sessionId) return null;
    const sessions = loadJson(SESSIONS_FILE, []);
    const session = sessions.find(s => s.sessionId === sessionId);
    if (!session) return null;

    if (Date.now() > session.expiresAt) {
      this.deleteSession(sessionId);
      return null;
    }
    return session;
  },

  deleteSession(sessionId) {
    let sessions = loadJson(SESSIONS_FILE, []);
    sessions = sessions.filter(s => s.sessionId !== sessionId);
    safeWriteJson(SESSIONS_FILE, sessions);
  },

  // --- PASSWORD RESET ---
  setResetToken(userId) {
    const token = crypto.randomBytes(32).toString('hex');
    const expires = Date.now() + 60 * 60 * 1000; // 1 hour token
    this.updateUser(userId, { resetToken: token, resetTokenExpires: expires });
    return token;
  },

  findUserByResetToken(token) {
    if (!token) return null;
    const users = loadJson(USERS_FILE, []);
    const user = users.find(u => u.resetToken === token);
    if (!user) return null;
    if (!user.resetTokenExpires || Date.now() > user.resetTokenExpires) return null;
    return user;
  },

  // --- RATE LIMITING ---
  checkRateLimit(ip) {
    const now = Date.now();
    const record = failedLoginAttempts.get(ip);
    if (!record) return { allowed: true };

    if (now - record.firstAttemptAt > RATE_LIMIT_WINDOW_MS) {
      failedLoginAttempts.delete(ip);
      return { allowed: true };
    }

    if (record.attempts >= MAX_FAILED_ATTEMPTS) {
      const remainingSeconds = Math.ceil((RATE_LIMIT_WINDOW_MS - (now - record.firstAttemptAt)) / 1000);
      return { allowed: false, remainingSeconds };
    }

    return { allowed: true };
  },

  recordFailedLogin(ip) {
    const now = Date.now();
    const record = failedLoginAttempts.get(ip);
    if (!record || (now - record.firstAttemptAt > RATE_LIMIT_WINDOW_MS)) {
      failedLoginAttempts.set(ip, { attempts: 1, firstAttemptAt: now });
    } else {
      record.attempts += 1;
    }
  },

  clearFailedLogins(ip) {
    failedLoginAttempts.delete(ip);
  },

  // Sanitize user before returning to frontend (remove sensitive hash & tokens)
  sanitizeUser(user) {
    if (!user) return null;
    const { passwordHash, resetToken, resetTokenExpires, ...safeUser } = user;
    return safeUser;
  }
};
