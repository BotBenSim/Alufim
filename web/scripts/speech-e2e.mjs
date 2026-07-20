/**
 * Browser speech E2E — run against dev server.
 * Usage: npm run test:speech
 * Requires: dev server at ALUFIM_URL (default http://localhost:3000/Alufim/)
 */
import { chromium } from "playwright";

const BASE = process.env.ALUFIM_URL ?? "http://localhost:3000/Alufim/";
const TIMEOUT = 4000;

const SPEECH_SPY = () => {
  window.__speechEvents = [];
  const s = window.speechSynthesis;
  const orig = s.speak.bind(s);
  s.speak = function (u) {
    window.__speechEvents.push({ type: "speak", text: u.text, t: Date.now() });
    u.addEventListener("start", () =>
      window.__speechEvents.push({ type: "onstart", text: u.text, t: Date.now() })
    );
    u.addEventListener("end", () =>
      window.__speechEvents.push({ type: "onend", text: u.text, t: Date.now() })
    );
    u.addEventListener("error", (e) =>
      window.__speechEvents.push({
        type: "onerror",
        text: u.text,
        error: e.error,
        t: Date.now(),
      })
    );
    return orig(u);
  };
};

async function waitForEvent(page, type, timeoutMs = TIMEOUT) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const events = await page.evaluate(() => window.__speechEvents ?? []);
    const hit = events.filter((e) => e.type === type);
    if (hit.length) return events;
    await page.waitForTimeout(100);
  }
  return page.evaluate(() => window.__speechEvents ?? []);
}

async function synthState(page) {
  return page.evaluate(() => ({
    speaking: speechSynthesis.speaking,
    pending: speechSynthesis.pending,
    paused: speechSynthesis.paused,
    voiceCount: speechSynthesis.getVoices().length,
  }));
}

function assert(name, ok, detail) {
  const mark = ok ? "PASS" : "FAIL";
  console.log(`${mark}  ${name}${detail ? ` — ${detail}` : ""}`);
  return ok;
}

async function main() {
  let failed = 0;
  console.log(`Speech E2E → ${BASE}\n`);

  const browser = await chromium.launch({
    headless: true,
    channel: "chrome",
  });
  const page = await browser.newPage();
  await page.addInitScript(SPEECH_SPY);

  // --- 1) Raw API after user gesture ---
  await page.goto("about:blank");
  await page.click("body");
  await page.evaluate(() => {
    window.__speechEvents = [];
    const u = new SpeechSynthesisUtterance("שלום בדיקה");
    u.lang = "he-IL";
    speechSynthesis.speak(u);
  });
  let events = await waitForEvent(page, "onstart", 3000);
  if (!assert("raw speechSynthesis onstart", events.some((e) => e.type === "onstart"))) {
    failed++;
    console.log("  events:", JSON.stringify(events));
  }

  // --- 2) App: profile hello ---
  await page.goto(BASE, { waitUntil: "networkidle" });
  await page.waitForTimeout(1500);
  await page.evaluate(() => {
    window.__speechEvents = [];
  });

  const profileBtn = page.locator("#profileCards button").first();
  if ((await profileBtn.count()) === 0) {
    console.log("FAIL  no profile cards — seed localStorage or create a profile");
    failed++;
  } else {
    await profileBtn.click();
    events = await waitForEvent(page, "onstart");
    const hello = events.find((e) => e.type === "onstart" && e.text?.includes("שלום"));
    if (!assert("profile tap speaks hello", !!hello, hello?.text)) {
      failed++;
      console.log("  events:", JSON.stringify(events));
      console.log("  synth:", await synthState(page));
    }
  }

  // --- 3) App: character name ---
  await page.waitForSelector("#charSection.show", { timeout: 5000 }).catch(() => null);
  const charBtns = page.locator("#charGrid button:not([disabled])");
  const charCount = await charBtns.count();

  if (charCount === 0) {
    console.log("SKIP  no owned character buttons");
  } else {
    await page.evaluate(() => {
      window.__speechEvents = [];
    });
    await charBtns.first().click();
    events = await waitForEvent(page, "onstart");
    const firstStart = events.find((e) => e.type === "onstart");
    if (!assert("character tap onstart", !!firstStart, firstStart?.text)) {
      failed++;
      console.log("  events:", JSON.stringify(events));
    }

    // --- 4) Rapid character switch ---
    if (charCount >= 2) {
      await page.evaluate(() => {
        window.__speechEvents = [];
      });
      await charBtns.nth(0).click();
      await page.waitForTimeout(150);
      await charBtns.nth(1).click();
      events = await waitForEvent(page, "onstart", 3000);
      const starts = events.filter((e) => e.type === "onstart");
      const errors = events.filter((e) => e.type === "onerror");
      const lastStart = starts.at(-1);
      const state = await synthState(page);
      const ok =
        starts.length >= 1 &&
        !errors.some((e) => e.error === "canceled" && !starts.some((s) => s.t > e.t));
      if (
        !assert(
          "character switch gets onstart",
          !!lastStart,
          `${starts.length} starts, speaking=${state.speaking}`
        )
      ) {
        failed++;
        console.log("  events:", JSON.stringify(events));
        console.log("  synth:", state);
      }
      await page.waitForTimeout(1500);
      const after = await synthState(page);
      if (!assert("not wedged after switch", !after.speaking, JSON.stringify(after))) {
        failed++;
      }
    }
  }

  await browser.close();
  console.log(failed ? `\n${failed} failed` : "\nAll passed");
  process.exit(failed ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
