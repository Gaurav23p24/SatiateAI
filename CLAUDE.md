# CLAUDE.md — Satiety App: Hotfix — Voice Output + Figure Zones Broken After Step 4

## Context
Step 3b had working voice output (TTS playing after clarifying questions and final meal confirmation). Step 4 introduced Voice Selector + Intelligent Figure + BMI panel. After Step 4: **TTS is silent** and **figure zones don't fill**. Nothing else changed.

---

## Root Cause Analysis (Read This First — Don't Skip)

There are **three likely break points** introduced in Step 4. Diagnose in this order.

### Break #1 — TTS `voiceId` routing is broken in `server.mjs`

Step 4 changed `/api/tts` to accept a `voiceId` from the client. The likely bug: when `voiceId` is missing or `undefined`, the server either crashes silently or falls through without calling ElevenLabs.

**Check `server.mjs` `/api/tts` handler:**
```javascript
// BUG pattern — if voiceId is undefined, this produces a bad URL silently:
const voiceId = req.body.voiceId || process.env.ELEVENLABS_VOICE_ID
const url = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`
```

If `activeVoiceId` in `dashboard.js` is `null` at the time `speak()` is called (because `loadVoices()` hasn't resolved yet, or failed), the POST to `/api/tts` sends `voiceId: null`. The server may be constructing `https://api.elevenlabs.io/v1/text-to-speech/null` and getting a 400/404 back from ElevenLabs — but if the error isn't surfaced to the client, TTS just silently skips.

### Break #2 — `speak()` in `voice.js` isn't passing `voiceId`

Step 4 required passing `activeVoiceId` into the TTS call. If `voice.js` wasn't updated (per the file modification rules, it shouldn't be touched), but `dashboard.js` is calling `speak(text)` without threading the voice ID through — the call goes to the server without a voice ID.

The clean pattern: `speak()` should accept an optional `voiceId` param, OR `dashboard.js` should call the TTS endpoint directly. One of these wasn't done cleanly.

### Break #3 — `updateFigure()` was replaced but `sugar_g`/`fiber_g` fields aren't coming back from Gemini

The new `updateFigure(meals)` expects `sugar_g` on meal objects. If the FINALIZE prompt update in `server.mjs` wasn't saved correctly, Gemini returns JSON without `sugar_g`/`fiber_g`, and the function silently receives `undefined` for every zone calculation — opacity stays at 0.08, figure appears empty.

---

## Fix Instructions

### Step 1: Audit `/api/tts` in `server.mjs`

Find the `/api/tts` POST handler. It must look exactly like this:

```javascript
app.post('/api/tts', async (req, res) => {
  try {
    const { text, voiceId } = req.body
   
    // Sentinel check for preview requests
    const ttsText = text === '__PREVIEW__' ? VOICE_PREVIEW_TEXT : text
   
    // CRITICAL: always fall back to env var — never let voiceId be undefined
    const resolvedVoiceId = (voiceId && voiceId !== 'null' && voiceId !== 'undefined')
      ? voiceId
      : process.env.ELEVENLABS_VOICE_ID

    if (!resolvedVoiceId) {
      console.error('[TTS] No voice ID available — set ELEVENLABS_VOICE_ID in .env')
      return res.status(500).json({ error: 'No voice ID configured' })
    }

    if (!ttsText || ttsText.trim() === '') {
      console.error('[TTS] Empty text received')
      return res.status(400).json({ error: 'Empty text' })
    }

    console.log(`[TTS] Calling ElevenLabs — voice: ${resolvedVoiceId}, text length: ${ttsText.length}`)

    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${resolvedVoiceId}`,
      {
        method: 'POST',
        headers: {
          'xi-api-key': process.env.ELEVENLABS_API_KEY,
          'Content-Type': 'application/json',
          'Accept': 'audio/mpeg',
        },
        body: JSON.stringify({
          text: ttsText,
          model_id: 'eleven_turbo_v2',
          voice_settings: { stability: 0.5, similarity_boost: 0.75 },
        }),
      }
    )

    if (!response.ok) {
      const errBody = await response.text()
      console.error(`[TTS] ElevenLabs error ${response.status}:`, errBody)
      return res.status(500).json({ error: 'TTS failed', detail: errBody })
    }

    const audioBuffer = await response.arrayBuffer()
    console.log(`[TTS] Success — ${audioBuffer.byteLength} bytes`)
    res.set('Content-Type', 'audio/mpeg')
    res.send(Buffer.from(audioBuffer))
  } catch (err) {
    console.error('[TTS] Exception:', err)
    res.status(500).json({ error: 'TTS failed', detail: err.message })
  }
})
```

### Step 2: Audit `speak()` in `js/voice.js`

The `speak()` function must pass `voiceId` to the server. If `voice.js` was left untouched per Step 4 rules, it doesn't know about `activeVoiceId`. Fix this by updating `speak()` to accept an optional second argument:

```javascript
// js/voice.js — update speak() signature
export async function speak(text, voiceId = null) {
  const response = await fetch('/api/tts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, voiceId }),
  })

  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    console.error('[speak] TTS request failed:', err)
    throw new Error(err.error || 'TTS failed')
  }

  const blob = await response.blob()
  const url = URL.createObjectURL(blob)
  const audio = new Audio(url)

  return new Promise((resolve, reject) => {
    audio.onended = () => { URL.revokeObjectURL(url); resolve() }
    audio.onerror = (e) => { URL.revokeObjectURL(url); reject(e) }
    audio.play().catch(reject)
  })
}
```

### Step 3: Audit all `speak()` call sites in `js/dashboard.js`

Every call to `speak()` must now pass `activeVoiceId`:

```javascript
// Find these two lines in dashboard.js and update them:

// BEFORE (broken):
await speak(question)
// ...
await speak(mealData.voice_summary)

// AFTER (fixed):
await speak(question, activeVoiceId)
// ...
await speak(mealData.voice_summary, activeVoiceId)
```

Also confirm `activeVoiceId` is initialized before the voice loop can run:

```javascript
// At the top of dashboard.js module scope:
let activeVoiceId = null

// In loadVoices():
async function loadVoices() {
  try {
    const voices = await fetch('/api/voices').then(r => r.json())
    if (!voices || voices.length === 0) {
      console.warn('[loadVoices] No voices returned — falling back to env default')
      return // server will fall back to ELEVENLABS_VOICE_ID
    }
    activeVoiceId = voices[0].id
    renderVoiceSelector(voices)
    console.log('[loadVoices] Active voice:', activeVoiceId)
  } catch (err) {
    console.error('[loadVoices] Failed:', err)
    // activeVoiceId stays null — server falls back to env var
  }
}
```

### Step 4: Audit the FINALIZE prompt and `updateFigure` in `server.mjs`

Confirm the FINALIZE system prompt in `server.mjs` includes `sugar_g` and `fiber_g`:

```javascript
const FINALIZE_SYSTEM_PROMPT = `You are a nutritional analysis engine. Based on the full conversation,
estimate the nutritional content of everything described.
Output ONLY valid JSON — no preamble, no markdown fences:
{
  "summary": "brief meal description, max 10 words",
  "calories": integer,
  "protein_g": number (one decimal),
  "carbs_g": number (one decimal),
  "fat_g": number (one decimal),
  "fiber_g": number (one decimal),
  "sugar_g": number (one decimal),
  "satiety_score": number 0.0–1.0,
  "voice_summary": "one warm sentence confirming what was logged"
}
Satiety score: 0–0.3 low (candy/soda), 0.3–0.6 moderate, 0.6–0.8 high (protein/fiber), 0.8–1.0 very high.
Never return null values. Output only the JSON object.`
```

### Step 5: Add null-safety to `updateFigure` in `js/dashboard.js`

```javascript
function updateFigure(meals) {
  if (!meals || meals.length === 0) return

  const totals = meals.reduce((acc, m) => ({
    sugar_g:   acc.sugar_g   + (m.sugar_g   || 0),
    protein_g: acc.protein_g + (m.protein_g || 0),
    carbs_g:   acc.carbs_g   + (m.carbs_g   || 0),
    fat_g:     acc.fat_g     + (m.fat_g     || 0),
    fiber_g:   acc.fiber_g   + (m.fiber_g   || 0),
  }), { sugar_g: 0, protein_g: 0, carbs_g: 0, fat_g: 0, fiber_g: 0 })

  const targets = getTargets()

  applyZone('zone-head',  totals.sugar_g,   targets.sugar_g,   '#E05C5C')
  applyZone('zone-arms',  totals.protein_g, targets.protein_g, '#4CAF82')
  applyZone('zone-torso', totals.carbs_g,   targets.carbs_g,   '#E8A838')
  applyZone('zone-legs',  totals.fat_g,     targets.fat_g,     '#7B9EAD')
}

function applyZone(zoneId, consumed, target, color) {
  const el = document.getElementById(zoneId)
  if (!el) {
    console.warn(`[applyZone] Element #${zoneId} not found`)
    return
  }
  const ratio = Math.min((consumed || 0) / (target || 1), 1)
  const opacity = 0.08 + ratio * 0.64
  el.style.transition = 'fill-opacity 1.2s cubic-bezier(0.34, 1.56, 0.64, 1)'
  el.style.fillOpacity = opacity
  el.style.fill = color
}
```

---

## Verification Sequence

Run these in order. Do not skip to later steps if an earlier one fails.

**Test 1 — Is the server receiving TTS requests at all?**
```bash
# With server running, in a new terminal:
curl -X POST http://localhost:3000/api/tts \
  -H "Content-Type: application/json" \
  -d '{"text": "Hello, this is a test", "voiceId": null}' \
  --output /tmp/test_audio.mp3 -v

# Expected: 200, audio/mpeg response, file ~30-80KB
# If 500: check server logs for the [TTS] error line
```

**Test 2 — Is `activeVoiceId` populated before the voice loop runs?**
```javascript
// In browser console after dashboard.html loads:
console.log(window.activeVoiceId) // should NOT be null
// If null: loadVoices() failed — check Network tab for /api/voices
```

**Test 3 — Does the figure have the zone elements?**
```javascript
// In browser console:
['zone-head','zone-arms','zone-torso','zone-legs'].forEach(id => {
  const el = document.getElementById(id)
  console.log(id, el ? '✓ found' : '✗ MISSING')
})
```

**Test 4 — Manual figure update**
```javascript
// In browser console:
updateFigure([{
  protein_g: 45, carbs_g: 80, fat_g: 20,
  sugar_g: 25, fiber_g: 6, calories: 680
}])
// Expected: visible color change in figure zones within 1.2s
```

**Test 5 — Full voice loop**
- Click MIC, say "I had two scrambled eggs and toast"
- Click STOP
- Watch server logs — you should see `[TTS] Calling ElevenLabs` appear twice (once for clarifying question, once for voice_summary)
- You should hear audio both times

---

## If ElevenLabs Returns 401 or 403

```bash
# Verify API key works directly:
curl -X GET https://api.elevenlabs.io/v1/voices \
  -H "xi-api-key: YOUR_KEY_HERE"
# Should return JSON voice list
```

If this fails: the key in `.env` is wrong or expired. Regenerate at elevenlabs.io.

---

## If Audio Plays on Server but Not in Browser

The issue is `audio.play()` being blocked by browser autoplay policy. The fix:

```javascript
// In voice.js speak() — wrap play in user gesture check:
export async function speak(text, voiceId = null) {
  // ... fetch call as above ...
 
  const blob = await response.blob()
  const url = URL.createObjectURL(blob)
  const audio = new Audio(url)
  audio.volume = 1.0

  return new Promise((resolve, reject) => {
    audio.onended = () => { URL.revokeObjectURL(url); resolve() }
    audio.onerror = (e) => {
      console.error('[speak] Audio playback error:', e)
      URL.revokeObjectURL(url)
      reject(e)
    }
    // play() returns a Promise — must catch it
    const playPromise = audio.play()
    if (playPromise !== undefined) {
      playPromise.catch(err => {
        console.error('[speak] Autoplay blocked:', err)
        // Don't reject — resolve silently so the state machine continues
        URL.revokeObjectURL(url)
        resolve()
      })
    }
  })
}
```

**Note:** Autoplay is only blocked if the `speak()` call doesn't happen within the same user gesture chain that started with the mic button click. Since the entire loop is triggered by `mic-btn` click → awaited chain → `speak()`, this should not be the issue. But if it is, the above handles it gracefully.

---

## Hard Rules for This Hotfix
- Do NOT refactor the state machine logic
- Do NOT touch `js/auth.js`, `js/gemini.js`, `auth/callback.html`, `index.html`
- The ONLY changes are:
  - `server.mjs`: harden `/api/tts` handler + fix FINALIZE prompt
  - `js/voice.js`: add `voiceId` param to `speak()`
  - `js/dashboard.js`: pass `activeVoiceId` to both `speak()` calls + null-safe `updateFigure`
- After fix: run all 5 verification tests before declaring done
