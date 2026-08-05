import { initializeApp, getApps } from 'firebase/app';
import { getDatabase, ref } from 'firebase/database';

const STORAGE_KEY = 'satu_malam_firebase_config';

// Load config from environment variables or LocalStorage
export function getStoredFirebaseConfig() {
  const envConfigStr = import.meta.env.VITE_FIREBASE_CONFIG;
  if (envConfigStr) {
    try {
      return JSON.parse(envConfigStr);
    } catch (e) {
      console.error("Failed to parse VITE_FIREBASE_CONFIG env variable:", e);
    }
  }

  // Fallback to separate env variables
  if (import.meta.env.VITE_FIREBASE_API_KEY && import.meta.env.VITE_FIREBASE_DATABASE_URL) {
    return {
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
      databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
      appId: import.meta.env.VITE_FIREBASE_APP_ID,
    };
  }

  // Fallback to local storage config
  const localConfig = localStorage.getItem(STORAGE_KEY);
  if (localConfig) {
    try {
      return JSON.parse(localConfig);
    } catch (e) {
      console.error("Failed to parse local storage Firebase config:", e);
    }
  }

  return null;
}

let firebaseApp = null;
let database = null;

// Initialize Firebase with given configuration
export function initFirebase(config) {
  if (!config || !config.databaseURL) {
    return false;
  }

  try {
    // If apps already exist, reuse or re-initialize
    if (getApps().length > 0) {
      // Re-initialize to apply new configurations if needed
      firebaseApp = getApps()[0];
    } else {
      firebaseApp = initializeApp(config);
    }
    
    database = getDatabase(firebaseApp);
    
    // Save to local storage for persistence across reloads (if it's a custom config)
    if (!import.meta.env.VITE_FIREBASE_CONFIG && !import.meta.env.VITE_FIREBASE_API_KEY) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    }
    
    return true;
  } catch (error) {
    console.error("Error initializing Firebase:", error);
    return false;
  }
}

// Check if Firebase is currently initialized
export function isFirebaseConfigured() {
  return !!database;
}

// Try to auto-initialize on module load
const initialConfig = getStoredFirebaseConfig();
if (initialConfig) {
  initFirebase(initialConfig);
}

export function getDb() {
  return database;
}

export function getDbRef(path) {
  if (!database) {
    throw new Error("Firebase database is not initialized. Please configure it first.");
  }
  return ref(database, path);
}

// Save dynamic configuration manually
export function saveFirebaseConfig(config) {
  const success = initFirebase(config);
  if (success) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  }
  return success;
}

// Clear configuration
export function clearFirebaseConfig() {
  localStorage.removeItem(STORAGE_KEY);
  // Reloading the page resets firebase state
  window.location.reload();
}
