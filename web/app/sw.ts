import { defaultCache } from "@serwist/next/worker";
import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";
import { CacheFirst, ExpirationPlugin, Serwist } from "serwist";

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: [
    {
      // Clip names are content hashes, so a cached clip never goes stale.
      matcher: ({ url }) => url.pathname.includes("/audio/voice/"),
      handler: new CacheFirst({
        cacheName: "voice-clips",
        plugins: [new ExpirationPlugin({ maxEntries: 4000, maxAgeSeconds: 365 * 24 * 3600 })],
      }),
    },
    ...defaultCache,
  ],
});

serwist.addEventListeners();
