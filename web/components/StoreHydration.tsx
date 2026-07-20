"use client";

import { useEffect, useState } from "react";
import { useStore } from "@/state/store";

/**
 * Gate UI until zustand finishes loading localStorage.
 * Must start false on server AND client so static HTML never pre-renders the
 * game shell (which would duplicate content after client hydration).
 */
export function StoreHydration({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const finish = () => setReady(true);
    const unsub = useStore.persist.onFinishHydration(finish);
    if (useStore.persist.hasHydrated()) {
      finish();
    } else {
      void useStore.persist.rehydrate();
    }
    return unsub;
  }, []);

  if (!ready) return null;
  return children;
}
