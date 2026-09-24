/**
 * Testing switches read from the URL. Never persisted, so a parent's device is
 * unaffected unless the link itself carries the flag.
 */
function flag(name: string): boolean {
  if (typeof window === "undefined") return false;
  const v = new URLSearchParams(window.location.search).get(name);
  return v !== null && v !== "0" && v !== "false";
}

/** `?noplay` skips the play-break minigames, so a tester can walk a ladder straight through. */
export function playBreaksDisabled(): boolean {
  return flag("noplay");
}

/** `?voicedebug` logs every spoken line to the console: clip or fallback, and the audio state. */
export function voiceDebug(): boolean {
  return flag("voicedebug");
}
