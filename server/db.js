/**
 * =========================================================================================
 * THE NEOTIA UNIVERSITY (TNU) — ENTERPRISE HRMS & ERP AUTOMATION SYSTEM
 * Database Persistence Engine & Statutory Audit Logger
 * 
 * Lead Developer & System Architect: ABHAY
 * =========================================================================================
 */

const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const DATA_DIR = path.join(__dirname, '..', 'data');
const DB_FILE = path.join(DATA_DIR, 'hrms_db.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

let dbCache = null;
let writeQueue = Promise.resolve();

function initDb(initialData = {}) {
  if (fs.existsSync(DB_FILE)) {
    try {
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      dbCache = JSON.parse(raw);
    } catch (err) {
      console.error('Failed reading DB file, reinitializing:', err);
      dbCache = initialData;
      saveDbSync();
    }
  } else {
    dbCache = initialData;
    saveDbSync();
  }
  return dbCache;
}

function getDb() {
  if (!dbCache) {
    initDb();
  }
  return dbCache;
}

function saveDbSync() {
  fs.writeFileSync(DB_FILE, JSON.stringify(dbCache, null, 2), 'utf-8');
}

function persistDb() {
  writeQueue = writeQueue.then(async () => {
    try {
      const tempPath = `${DB_FILE}.tmp.${Date.now()}`;
      await fs.promises.writeFile(tempPath, JSON.stringify(dbCache, null, 2), 'utf-8');
      await fs.promises.rename(tempPath, DB_FILE);
    } catch (err) {
      console.error('Error saving DB:', err);
    }
  });
  return writeQueue;
}

function logAudit({ entityType, entityId, action, actorName, actorRole, previousState, newState, remarks, ip }) {
  const db = getDb();
  if (!db.auditLogs) db.auditLogs = [];
  
  const logEntry = {
    id: 'AUD-' + uuidv4().slice(0, 8).toUpperCase(),
    entityType,
    entityId,
    action,
    actorName: actorName || 'System Automated Engine',
    actorRole: actorRole || 'SYSTEM',
    timestamp: new Date().toISOString(),
    previousState: previousState ? JSON.parse(JSON.stringify(previousState)) : null,
    newState: newState ? JSON.parse(JSON.stringify(newState)) : null,
    remarks: remarks || '',
    ip: ip || '127.0.0.1'
  };
  
  db.auditLogs.unshift(logEntry);
  if (db.auditLogs.length > 2000) {
    db.auditLogs = db.auditLogs.slice(0, 2000);
  }
  persistDb();
  return logEntry;
}

module.exports = {
  initDb,
  getDb,
  persistDb,
  logAudit,
  DATA_DIR,
  DB_FILE
};
