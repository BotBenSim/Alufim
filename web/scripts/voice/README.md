# Voice clips

The app speaks Hebrew from pre-recorded clips made with OpenAI text-to-speech. A
line without a clip falls back to the browser's built-in voice, so nothing breaks
while clips are missing. English is still the browser voice.

## Quick start

```sh
cd web
export OPENAI_API_KEY=sk-...        # or put OPENAI_API_KEY=... in web/.env.local (gitignored)

npm run voice:sample                # sample lines in each sample voice → scripts/voice/samples/
npm run voice:lines                 # list every spoken line → locales/he.voice.lock.json
npm run voice:record                # record every line that has no clip yet
npm run voice:check                 # fails if the lock is stale or a clip is missing
```

`voice:record` only records what is missing, so it is safe to re-run. Add
`-- --limit 20` to try a few first, or `-- --prune` to delete clips nothing uses
any more.

## Current voice

Set in [`config.json`](config.json):

| Setting | Value |
| --- | --- |
| Provider | OpenAI `POST /v1/audio/speech` |
| Model | `gpt-4o-mini-tts` |
| Voice | `nova` |
| Stored as | AAC `m4a`, 32 kbps mono (OpenAI returns 128 kbps MP3; `afconvert` re-encodes it, so recording needs a Mac) |
| Concurrency | 6 requests at a time |
| Sample voices | `nova` |

Style instructions sent with every line (in Hebrew, which pulls the accent closer to native):

> דברי עברית ישראלית טבעית, במבטא ישראלי של דוברת עברית ילידית — בלי שום מבטא אמריקאי או זר. את גננת חמה ושמחה שמדברת עם ילד בן 4–6: קול מחייך, אנרגטי ומעודד. דברי קצת לאט מהרגיל והגי כל מילה בבירור. קראי את הטקסט בדיוק כפי שהוא כתוב, בלי לתרגם, להסביר או להוסיף מילים. שורה שמסתיימת ב־? היא שאלה; שורה שמסתיימת ב־! נאמרת בהתלהבות.

Changing the model, voice, encoding or instructions renames every clip, so the next
`voice:record` re-records everything (about 2,000 short lines — roughly a dollar).

## When copy changes

1. Edit the text in [`locales/he.json`](../../locales/he.json) (or a word list in `data/`).
2. `npm run voice:lines` — the diff of `locales/he.voice.lock.json` is exactly the
   lines to re-record: each changed line shows as one `-` and one `+`.
3. `npm run voice:record -- --prune`, then listen to the new clips.
4. Commit the copy, the lock and the clips together.

Each lock entry names the copy key it came from (`math.addAsk`), or `content:<file>`
for lines that come from data such as character names and minigame prompts.

## Fixing a word the voice gets wrong

Add the line to [`pronounce.json`](pronounce.json) with what the voice should read
instead — usually the same text with niqqud:

```json
{ "אלוף/ה!": "אַלּוּפִים!" }
```

The app still shows and looks up the original text; only the recording changes.

## How it fits together

- `inventory.ts` runs the real question generators (seeded, so runs are
  repeatable) plus the fixed lines, and writes the lock.
- `generate.ts` records missing clips into `public/audio/voice/<hash>.m4a` and
  writes `manifest.json`, the text → clip table the app loads.
- Addition and subtraction are recorded in two halves split before the second
  number (`כמה זה שבע ועוד` + `חמש?`), which keeps them to ~600 clips instead of
  every pair. The split follows the `{{b}}` placeholder in the copy — see
  `lib/voice/segments.ts`.
- `lib/voice/player.ts` plays clips through Web Audio; the service worker caches
  them as they are played rather than all at install.
