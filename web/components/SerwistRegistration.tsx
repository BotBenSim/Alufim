"use client";

import { useEffect } from "react";
import { assetPath } from "@/lib/utils";

/** Register the Serwist service worker for offline PWA play */
export function SerwistRegistration() {
  useEffect(() => {
    if (process.env.NODE_ENV === "development") return;
    if (!("serviceWorker" in navigator)) return;

    void navigator.serviceWorker
      .register(assetPath("sw.js"), { scope: assetPath("") })
      .catch(() => {
        /* offline is optional */
      });
  }, []);

  return null;
}
