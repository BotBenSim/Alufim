import type { StateStorage } from "zustand/middleware";
import { migrateProfile, readAppState, STATE_KEY, writeAppState } from "@/lib/migrate";
import type { AppState } from "@/lib/types";

/** Persist only AppState as flat JSON — same key/shape as vanilla index.html */
export const alufimStorage: StateStorage = {
  getItem: (name) => {
    if (typeof window === "undefined") return null;
    const app = readAppState(localStorage.getItem(name));
    if (!app) return null;
    app.profiles = app.profiles.map(migrateProfile);
    return JSON.stringify({ state: { app }, version: 0 });
  },
  setItem: (name, value) => {
    if (typeof window === "undefined") return;
    try {
      const wrapper = JSON.parse(value) as { state?: { app?: AppState } };
      const app = wrapper.state?.app;
      if (app) writeAppState(app);
    } catch {
      /* ignore */
    }
  },
  removeItem: (name) => {
    if (typeof window === "undefined") return;
    localStorage.removeItem(name);
  },
};

export { STATE_KEY };
