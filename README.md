# Satiate

A voice-first food logging assistant that analyzes how full and satisfied a meal will keep you.

## What It Does

Speak what you ate. Satiate asks 1–2 smart clarifying questions (protein source, portion size, cooking method), then delivers a spoken summary with:

- Calorie estimate + macros (protein, carbs, fat, fiber)
- Satiety score (0–1)
- Estimated time until hunger returns

## Stack

- **Frontend** — Vanilla JS (ES modules), Tailwind CSS, HTML5
- **AI** — Google Gemini 2.5 Flash (conversation + nutritional analysis)
- **Voice** — ElevenLabs (speech-to-text + text-to-speech)
- **Auth** — Supabase (Google OAuth)
- **Backend** — Express (dev) / Netlify Functions (production)

## Flow

```
User speaks → STT (ElevenLabs) → Gemini clarifies → User answers
→ Gemini finalizes → TTS (ElevenLabs) → spoken summary + meal card logged
```

State machine: `IDLE → LISTENING → TRANSCRIBING → CLARIFYING → FINALIZING → IDLE`

## Project Structure

```
public/
  index.html          # main app
  dashboard.html      # meal history + stats
  js/
    voice.js          # audio recording, STT/TTS wrappers
    gemini.js         # Gemini API calls (clarify + finalize phases)
    auth.js           # Supabase OAuth
    dashboard.js      # state machine + meal card rendering
netlify/
  functions/
    chat.js           # Gemini conversation handler
    stt.js            # ElevenLabs speech-to-text
    tts.js            # ElevenLabs text-to-speech
    voices.js         # ElevenLabs voice list
server.mjs            # Express dev server (mirrors netlify/functions)
netlify.toml          # routes /api/* → /.netlify/functions/*
```

## Setup

### Environment Variables

```
ELEVENLABS_API_KEY=
ELEVENLABS_VOICE_ID=
GEMINI_API_KEY=
SUPABASE_URL=
SUPABASE_ANON_KEY=
```

### Local Dev

```bash
npm install
node server.mjs         # runs at localhost:3000
```

Or with Netlify CLI (tests functions locally):

```bash
npm install -g netlify-cli
netlify dev             # runs at localhost:8888
```

### Deploy

Push to `main`. Netlify auto-deploys from the `public/` directory and runs serverless functions from `netlify/functions/`.

Set all 5 environment variables in **Netlify → Site Configuration → Environment Variables**.
