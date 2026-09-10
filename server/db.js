import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { fileURLToPath } from 'url';

import os from 'os';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// In serverless environments (Vercel / AWS Lambda), the deployment directory is strictly read-only.
// /tmp is the only writable filesystem location.
const isServerless = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);
const SEED_DATA_DIR = path.resolve(__dirname, 'data');
const DATA_DIR = isServerless ? path.join(os.tmpdir(), 'heatguard_data') : SEED_DATA_DIR;

const USERS_FILE = path.join(DATA_DIR, 'users.json');
const SESSIONS_FILE = path.join(DATA_DIR, 'sessions.json');
const SEARCHES_FILE = path.join(DATA_DIR, 'searches.json');
const SEED_USERS_FILE = path.join(SEED_DATA_DIR, 'users.json');
const SEED_SESSIONS_FILE = path.join(SEED_DATA_DIR, 'sessions.json');
const SEED_SEARCHES_FILE = path.join(SEED_DATA_DIR, 'searches.json');

// In-memory fallback in case filesystem writes fail
let memoryUsers = null;
let memorySessions = null;
let memorySearches = null;

// Ensure data directory exists if possible
try {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
} catch (dirErr) {
  console.warn('[HeatGuard DB] Could not create DATA_DIR, using in-memory mode:', dirErr.message);
}

// Atomic file write helper with safe fallback
function safeWriteJson(filePath, data) {
  if (filePath === USERS_FILE) {
    memoryUsers = data;
  } else if (filePath === SESSIONS_FILE) {
    memorySessions = data;
  } else if (filePath === SEARCHES_FILE) {
    memorySearches = data;
  }

  try {
    const parentDir = path.dirname(filePath);
    if (!fs.existsSync(parentDir)) {
      fs.mkdirSync(parentDir, { recursive: true });
    }
    const tempPath = `${filePath}.tmp.${Date.now()}`;
    fs.writeFileSync(tempPath, JSON.stringify(data, null, 2), 'utf8');
    fs.renameSync(tempPath, filePath);
  } catch (err) {
    console.warn(`[HeatGuard DB] File write failed for ${filePath}, retained in memory:`, err.message);
  }
}

function loadJson(filePath, defaultValue) {
  if (filePath === USERS_FILE && memoryUsers !== null) {
    return memoryUsers;
  }
  if (filePath === SESSIONS_FILE && memorySessions !== null) {
    return memorySessions;
  }
  if (filePath === SEARCHES_FILE && memorySearches !== null) {
    return memorySearches;
  }

  try {
    if (fs.existsSync(filePath)) {
      const raw = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(raw);
    }
    
    // In serverless, if /tmp file does not exist yet, check seed file
    if (isServerless) {
      const seedPath = filePath === USERS_FILE 
        ? SEED_USERS_FILE 
        : filePath === SESSIONS_FILE 
        ? SEED_SESSIONS_FILE 
        : SEED_SEARCHES_FILE;
      if (fs.existsSync(seedPath)) {
        const raw = fs.readFileSync(seedPath, 'utf8');
        const parsed = JSON.parse(raw);
        // Copy seed to /tmp asynchronously/safely
        safeWriteJson(filePath, parsed);
        return parsed;
      }
    }

    return defaultValue;
  } catch (error) {
    console.warn(`[HeatGuard DB] Error reading ${filePath}, using fallback:`, error.message);
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

  // Seed default searches if empty
  let searches = loadJson(SEARCHES_FILE, []);
  if (!searches || searches.length === 0) {
    const seedSearches = [
      {
        id: 'search_vijayawada',
        userId: 'usr_sih_demo_01',
        name: 'Vijayawada',
        city: 'Vijayawada',
        district: 'NTR District',
        state: 'Andhra Pradesh',
        country: 'India',
        lat: 16.5062,
        lng: 80.6480,
        displayName: 'Vijayawada, Andhra Pradesh, India',
        searchedAt: new Date(Date.now() - 1000 * 60 * 25).toISOString()
      },
      {
        id: 'search_guntur',
        userId: 'usr_sih_demo_01',
        name: 'Guntur',
        city: 'Guntur',
        district: 'Guntur',
        state: 'Andhra Pradesh',
        country: 'India',
        lat: 16.3067,
        lng: 80.4365,
        displayName: 'Guntur, Andhra Pradesh, India',
        searchedAt: new Date(Date.now() - 1000 * 60 * 95).toISOString()
      },
      {
        id: 'search_amaravati',
        userId: 'usr_sih_demo_01',
        name: 'Amaravati',
        city: 'Amaravati',
        district: 'Guntur',
        state: 'Andhra Pradesh',
        country: 'India',
        lat: 16.5131,
        lng: 80.5165,
        displayName: 'Amaravati, Andhra Pradesh, India',
        searchedAt: new Date(Date.now() - 1000 * 60 * 240).toISOString()
      }
    ];
    safeWriteJson(SEARCHES_FILE, seedSearches);
    console.log('[HeatGuard DB] Seeded default search history');
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
  },

  // --- SEARCH HISTORY DATABASE ---
  getSearches(userId) {
    const all = loadJson(SEARCHES_FILE, []);
    if (!userId) {
      return all.slice(0, 10);
    }
    const filtered = all.filter(s => s.userId === userId || !s.userId);
    return filtered.slice(0, 15);
  },

  addSearch(userId, location) {
    if (!location || !location.name) return this.getSearches(userId);
    const all = loadJson(SEARCHES_FILE, []);
    
    // Deduplicate by name or close latitude/longitude
    const existingIndex = all.findIndex(
      s => (s.userId === userId || (!userId && !s.userId)) &&
           (s.name?.toLowerCase() === location.name.toLowerCase() ||
            (Math.abs(s.lat - location.lat) < 0.05 && Math.abs(s.lng - location.lng) < 0.05))
    );

    const latVal = typeof location.lat === 'number' ? location.lat : parseFloat(location.lat) || 0;
    const lngVal = typeof location.lng === 'number' ? location.lng : parseFloat(location.lng) || 0;

    const searchEntry = {
      id: location.id || `search_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`,
      userId: userId || null,
      name: location.name,
      city: location.city || location.name,
      district: location.district || location.region || '',
      state: location.state || location.region || '',
      region: location.region || '',
      country: location.country || 'India',
      lat: latVal,
      lng: lngVal,
      latitude: latVal,
      longitude: lngVal,
      displayName: location.displayName || `${location.name}${location.state ? `, ${location.state}` : ''}`,
      searchedAt: new Date().toISOString()
    };

    if (existingIndex !== -1) {
      all.splice(existingIndex, 1);
    }

    all.unshift(searchEntry);

    const trimmed = all.slice(0, 50);
    safeWriteJson(SEARCHES_FILE, trimmed);
    return this.getSearches(userId);
  },

  deleteSearch(userId, searchId) {
    const all = loadJson(SEARCHES_FILE, []);
    const updated = all.filter(s => !(s.id === searchId && (s.userId === userId || !s.userId)));
    safeWriteJson(SEARCHES_FILE, updated);
    return this.getSearches(userId);
  },

  clearSearches(userId) {
    const all = loadJson(SEARCHES_FILE, []);
    const updated = userId ? all.filter(s => s.userId !== userId) : [];
    safeWriteJson(SEARCHES_FILE, updated);
    return [];
  }
};
