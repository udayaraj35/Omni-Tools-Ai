import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * A utility function to create an array of numbers from 0 to n-1
 */
export const n = (n: number) => Array.from({ length: n }, (_, i) => i)

/**
 * Clears all user-related data from the browser (Auto-Clean System)
 * Clears LocalStorage, SessionStorage, IndexedDB, and all Cookies.
 */
export function clearUserSessionData() {
  if (typeof window !== 'undefined') {
    try {
        // 1. Clear Storage
        localStorage.clear();
        sessionStorage.clear();
        
        // 2. Clear all Cookies
        const cookies = document.cookie.split(";");
        for (let i = 0; i < cookies.length; i++) {
          const cookie = cookies[i];
          const eqPos = cookie.indexOf("=");
          const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
          document.cookie = `${name.trim()}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=${window.location.hostname}`;
          document.cookie = `${name.trim()}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
        }

        // 3. Clear IndexedDB (Simple approach)
        if (window.indexedDB && window.indexedDB.databases) {
            window.indexedDB.databases().then(dbs => {
                dbs.forEach(db => {
                    if (db.name) window.indexedDB.deleteDatabase(db.name);
                });
            });
        }
        
        console.log("OmniTools AI: User memory and session data auto-cleaned.");
    } catch (e) {
        console.error("Auto-clean error:", e);
    }
  }
}
