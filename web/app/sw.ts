import { defaultCache } from "@serwist/next/worker";
import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";
import { NetworkOnly, Serwist } from "serwist";

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

/** PR staging lives under /Alufim/pr/<n>/ on the same origin as production. */
const PR_PREVIEW_PATH = /\/Alufim\/pr\//;

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: [
    {
      // Production SW scope is /Alufim/, which also matches preview URLs. Pass
      // those through to the network so staging is not served from the prod cache.
      matcher({ url }) {
        return PR_PREVIEW_PATH.test(url.pathname);
      },
      handler: new NetworkOnly(),
    },
    ...defaultCache,
  ],
});

serwist.addEventListeners();
