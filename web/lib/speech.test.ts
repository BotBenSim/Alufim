import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { cancelAllSpeech, resetSpeechForTests, speakEnglish, speakHebrew } from "./speech";

function mockUtterance(text = "") {
  return {
    text,
    lang: "",
    voice: null,
    rate: 1,
    pitch: 1,
    volume: 1,
    onend: null as (() => void) | null,
    onerror: null as (() => void) | null,
  } as unknown as SpeechSynthesisUtterance;
}

function mockSynth(overrides: Partial<SpeechSynthesis> = {}) {
  const utterances: SpeechSynthesisUtterance[] = [];
  return {
    speaking: false,
    pending: false,
    paused: false,
    pause: vi.fn(),
    cancel: vi.fn(),
    resume: vi.fn(),
    getVoices: vi.fn(() => []),
    speak: vi.fn((u: SpeechSynthesisUtterance) => {
      utterances.push(u);
    }),
    utterances,
    ...overrides,
  } as SpeechSynthesis & { utterances: SpeechSynthesisUtterance[] };
}

describe("speech", () => {
  beforeEach(() => {
    resetSpeechForTests();
    vi.stubGlobal(
      "SpeechSynthesisUtterance",
      vi.fn(function (this: SpeechSynthesisUtterance, text: string) {
        Object.assign(this, mockUtterance(text));
      })
    );
    vi.stubGlobal("window", { speechSynthesis: mockSynth() });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("speaks hebrew synchronously and cancels when interrupting", () => {
    const s = mockSynth({ speaking: true });
    vi.stubGlobal("window", { speechSynthesis: s });

    speakHebrew("שלום");

    expect(s.cancel).toHaveBeenCalled();
    expect(s.speak).toHaveBeenCalledTimes(1);
    expect(s.utterances[0].text).toBe("שלום");
    expect(s.utterances[0].lang).toBe("he-IL");
  });

  it("queues without cancel", () => {
    const s = mockSynth({ speaking: true });
    vi.stubGlobal("window", { speechSynthesis: s });

    speakHebrew("שני", true);

    expect(s.cancel).not.toHaveBeenCalled();
    expect(s.speak).toHaveBeenCalledTimes(1);
  });

  it("keeps utterance refs through cancel (no held.clear before cancel)", () => {
    const s = mockSynth({ speaking: true });
    vi.stubGlobal("window", { speechSynthesis: s });

    speakHebrew("א");
    const first = s.utterances[0];
    expect(first.onend).toBeTypeOf("function");
    expect(first.onerror).toBeTypeOf("function");

    speakHebrew("ב");
    expect(s.cancel).toHaveBeenCalled();
    expect(s.speak).toHaveBeenCalledTimes(2);
  });

  it("cancelAllSpeech interrupts busy synth", () => {
    const s = mockSynth({ speaking: true });
    vi.stubGlobal("window", { speechSynthesis: s });
    speakHebrew("א");
    cancelAllSpeech();
    expect(s.cancel).toHaveBeenCalled();
  });

  it("speakEnglish uses en-US", () => {
    const s = mockSynth();
    vi.stubGlobal("window", { speechSynthesis: s });
    speakEnglish("hi");
    expect(s.utterances[0].lang).toBe("en-US");
  });
});
