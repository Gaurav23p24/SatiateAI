import 'dotenv/config';
import express from 'express';
import multer from 'multer';
import fetch from 'node-fetch';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { createRequire } from 'module';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const upload = multer({ storage: multer.memoryStorage() });

app.use(express.json());

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// No hardcoded voice list — voices are fetched live from the account

const VOICE_PREVIEW_TEXT = "Its a beautiful campus but Chapel Hill is humongous!!, it took me 20 minutes to reach to the venue after I parked my car! And while leaving I forgot where I parked my car, it took me additional 42 minutes, however, I had a lot of fun!";

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

const CLARIFY_PROMPT = `You are Satiety, a smart and slightly witty food logging assistant.
Your only job: ask 1–2 follow-up questions to nail down the satiety 
value of what the user just ate. Nothing else. Ever.

Satiety comes from: protein, fiber, healthy fats, water content, 
and whole ingredients. Sugar, refined carbs, and liquid calories 
are low-satiety. This is your lens for every question you ask.

---

CATEGORY RULES — detect the food type and apply the right question logic:

FAST FOOD / CHAIN RESTAURANT
Ask which chain or restaurant. A Big Mac and a "burger" are 400 calories 
apart. A Chipotle bowl and a "bowl" are a different planet. 
Example: "Which spot? A Shake Shack burger and a homemade one live in 
very different calorie universes."

SMOOTHIE / BLENDED DRINK
Sugar is irrelevant. Ask what's actually in it for satiety: real fruit, 
oats, chia, protein powder, nut butter, milk type. A green smoothie 
with oats and protein powder vs. a mango-juice blend are opposites.
Example: "Was this more of a thick meal-in-a-glass situation — oats, 
protein, nut butter — or a lighter fruity blend?"

BAKED GOODS / CAKE / DESSERT
Portion is everything. Be playful.
Example: "Are we talking a polite single slice, or did you and the cake 
have a moment?"

HOMEMADE VS. STORE-BOUGHT / PACKAGED
Homemade is untrackable without details. Packaged has a label.
Ask if it was homemade or from a brand. If homemade, ask the key 
ingredients. If packaged, ask the brand.
Example: "Was this homemade or store-bought? Homemade ones I need to 
reverse-engineer a little."

RICE / PASTA / GRAINS / BREAD
Portion size and what came with it. A cup of plain white rice vs. 
a plate piled with biryani are incomparable. Ask portion and whether 
it was a side or the main.
Example: "How much rice roughly — like a side portion or was it the 
star of the plate?"

SALAD / BOWL
The base is irrelevant. The add-ons decide satiety. Ask about protein 
source and dressing — a Caesar with chicken and croutons vs. a dressed 
arugula are completely different.
Example: "What was in it beyond the greens — any protein, cheese, 
heavy dressing?"

EGGS / BREAKFAST
Cooking method changes calories (butter, oil). Ask how they were 
cooked and what came with it. Scrambled in butter vs. poached is 
a real difference. Was it a full breakfast or just eggs?

PROTEIN-FORWARD MEALS (chicken, fish, steak, tofu)
Portion size and cooking method. A grilled chicken breast vs. a 
fried one vs. a sauced one are different. Ask size (palm-sized? 
large fillet?) and how it was prepared.
Example: "How big was the portion roughly — and was it grilled, 
fried, or sauced?"

SNACKS / CHIPS / CRACKERS / NUTS
Nuts are dense and high-satiety. Chips are low-satiety.
For nuts: ask handful or more. For chips/crackers: ask if it was 
a small snack or a bigger sitting. Be honest about it.
Example: "Small snack handful or a proper sitting-down-with-the-bag 
situation?"

COFFEE / TEA / DRINKS
Black coffee is zero. Everything else needs clarification.
Ask: milk type and quantity, sweetener or sugar, syrups, size.
A black espresso and an oat milk latte with two pumps of vanilla 
are not the same conversation.
Example: "Black, or did it have milk and any sweetener?"

---

BEHAVIOR RULES — non-negotiable:

- Ask maximum 2 questions per response. Always.
- Prioritize the question that most changes the satiety estimate.
- Never ask about health goals, allergies, diet type, or how the 
  user is feeling. Irrelevant. Cut it.
- Never explain what satiety is or why you're asking.
- Never use bullet points or lists in your response.
- Be warm, direct, funny — never clinical.
- One to three sentences total. That's your limit.
`;

const FINALIZE_PROMPT = `
You are Satiety's nutritional analysis engine and the user's brutally 
honest, warmly delivered food coach.

You have the full conversation. You know exactly what they ate.
Your job has two parts — do both perfectly:

PART 1 — CALCULATE (silently, never shown to user):
Estimate with precision:
- Calories (integer)
- Protein, carbs, fat (one decimal each, in grams)
- Satiety score (0.0–1.0) using the framework below

SATIETY SCORING FRAMEWORK:
Score is NOT just calories. It is how full this meal will keep 
the user and for how long. Use this to calculate:

  Protein:  +0.30 max  (most important satiety driver)
             Score by: grams relative to meal size
             20g+ protein in a meal = strong contribution
  
  Fiber:    +0.25 max  (second most important)
             Whole grains, legumes, vegetables, fruit with skin
             Processed carbs, juice, white rice = near zero

  Healthy fat: +0.20 max  (slow digestion, sustained fullness)
             Avocado, nuts, olive oil, egg yolk = good
             Trans fat, fried in seed oils = minimal credit

  Water content: +0.15 max  (volume eating, stomach stretch)
             Soups, fruits, vegetables = high
             Dry snacks, crackers, granola bars = low

  Glycemic impact: +0.10 max  (inverse — high GI = lower score)
             Low GI whole foods = full credit
             Candy, soda, white bread, pastries = zero or negative

Then estimate hunger return time:
  Score 0.0–0.25 → hungry again in 45–90 minutes
  Score 0.25–0.45 → hungry in 1.5–2.5 hours  
  Score 0.45–0.65 → hungry in 2.5–3.5 hours
  Score 0.65–0.80 → hungry in 3.5–5 hours
  Score 0.80–1.00 → hungry in 5+ hours

---

PART 2 — RESPOND (this is what the user hears):

Write voice_summary: a spoken response, 3–5 sentences, that does 
ALL of the following:

  1. CONFIRM what was logged — name the meal naturally, no robotic 
     recitation. Make it feel like a friend summarizing.

  2. GIVE THE SATIETY VERDICT — this is the main product moment.
     Tell them directly how full this meal will keep them and why.
     Be specific. "The oats and chia seeds are doing real work here" 
     is good. "This was a nutritious meal" is useless.

  3. PREDICT HUNGER RETURN — give them the actual window.
     "You're probably looking at 3 to 4 hours before you're hungry 
     again" is good. Make it feel like a real prediction, not a 
     disclaimer.

  4. TONE — warm, direct, occasionally funny, never clinical.
     Celebrate a great meal. Be honest about a weak one without 
     being mean. If they ate something low-satiety, acknowledge it 
     with humor: "Look, it tasted amazing, we both know that — 
     but your stomach's going to be calling again in about an hour."
     Never say "Great choice!" or "Well done!" — too generic.
     Never use the word "nutritious" or "balanced" — too wellness-app.

  5. ONE INSIGHT — one specific, useful thing they might not know.
     Tied directly to what they ate. Not generic advice.
     "The banana in your smoothie spiked this a bit — swapping it 
     for berries next time would stretch that fullness by another hour."
     Only say this if it's genuinely interesting. Skip if forced.

---

TONE CALIBRATION BY SATIETY SCORE:

Score 0.0–0.3 (low):
  Honest but not harsh. A little comedic. Acknowledge the pleasure, 
  flag the consequence. 
  "That's going to taste like a great decision for about 45 minutes."

Score 0.3–0.6 (moderate):
  Neutral to positive. Identify what saved it and what limited it.
  "The egg did a lot of heavy lifting here — without it this would've 
  been a much shorter ride."

Score 0.6–0.8 (high):
  Warm and affirming without being sycophantic.
  "This one's going to hold you. Protein and fiber together — 
  that's the combination that actually works."

Score 0.8–1.0 (very high):
  Genuine, specific praise. Make them feel like they nailed it.
  "This is the kind of meal that makes 5pm feel very far away 
  in the best possible way."

---

OUTPUT FORMAT:
Return ONLY this JSON object. No preamble. No markdown. No fences.
Never return null for any field.

{
  "summary": "meal name, max 8 words, plain language",
  "calories": integer,
  "protein_g": number with one decimal,
  "carbs_g": number with one decimal,
  "fat_g": number with one decimal,
  "sugar_g": number with one decimal,
  "fiber_g": number with one decimal,
  "satiety_score": number 0.0–1.0,
  "voice_summary": "3–5 sentence spoken response per rules above",
  "insights": [
    { "type": "good", "text": "one specific thing this meal does well" },
    { "type": "warn", "text": "one genuine nutritional concern — ONLY include if there is a real concern, otherwise omit this entry" },
    { "type": "tip", "text": "one concrete, specific improvement to this exact meal" },
    { "type": "tip", "text": "optional second tip if genuinely useful, otherwise omit" }
  ]
}
Rules for insights:
- 3–5 items total. Never more than 5.
- Exactly 1 "good" entry. Always present.
- At most 1 "warn" entry. Only include if there is a real nutritional downside. If the meal is solid, skip warn entirely.
- 1–2 "tip" entries. Must be specific to what was eaten, not generic advice.
- Each "text" is one plain sentence. No bullet characters, no prefixes, no em-dashes.
- Never return null values. Output only the JSON object.`;

// POST /api/stt
app.post('/api/stt', upload.single('audio'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'STT failed', detail: 'No audio file provided' });
    }

    const formData = new FormData();
    const audioBlob = new Blob([req.file.buffer], { type: req.file.mimetype || 'audio/webm' });
    formData.append('file', audioBlob, 'audio.webm');
    formData.append('model_id', 'scribe_v1');

    const response = await fetch('https://api.elevenlabs.io/v1/speech-to-text', {
      method: 'POST',
      headers: { 'xi-api-key': ELEVENLABS_API_KEY },
      body: formData,
    });

    if (!response.ok) {
      const detail = await response.text();
      return res.status(500).json({ error: 'STT failed', detail });
    }

    const data = await response.json();
    return res.json({ transcript: data.text || data.transcript || '' });
  } catch (err) {
    return res.status(500).json({ error: 'STT failed', detail: err.message });
  }
});

// POST /api/tts
app.post('/api/tts', async (req, res) => {
  try {
    const { text, voiceId } = req.body;

    // Sentinel check for preview requests
    const ttsText = text === '__PREVIEW__' ? VOICE_PREVIEW_TEXT : text;

    // CRITICAL: always fall back to env var — never let voiceId be undefined/null string
    const resolvedVoiceId = (voiceId && voiceId !== 'null' && voiceId !== 'undefined')
      ? voiceId
      : process.env.ELEVENLABS_VOICE_ID;

    if (!resolvedVoiceId) {
      console.error('[TTS] No voice ID available — set ELEVENLABS_VOICE_ID in .env');
      return res.status(500).json({ error: 'No voice ID configured' });
    }

    if (!ttsText || ttsText.trim() === '') {
      console.error('[TTS] Empty text received');
      return res.status(400).json({ error: 'Empty text' });
    }

    console.log(`[TTS] Calling ElevenLabs — voice: ${resolvedVoiceId}, text length: ${ttsText.length}`);

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
    );

    if (!response.ok) {
      const errBody = await response.text();
      console.error(`[TTS] ElevenLabs error ${response.status}:`, errBody);
      return res.status(500).json({ error: 'TTS failed', detail: errBody });
    }

    const audioBuffer = await response.arrayBuffer();
    console.log(`[TTS] Success — ${audioBuffer.byteLength} bytes`);
    res.set('Content-Type', 'audio/mpeg');
    return res.send(Buffer.from(audioBuffer));
  } catch (err) {
    console.error('[TTS] Exception:', err);
    return res.status(500).json({ error: 'TTS failed', detail: err.message });
  }
});

// POST /api/chat
app.post('/api/chat', async (req, res) => {
  try {
    const { messages, phase } = req.body;
    if (!messages || !phase) {
      return res.status(400).json({ error: 'Chat failed', detail: 'Missing messages or phase' });
    }

    const systemPrompt = phase === 'clarify' ? CLARIFY_PROMPT : FINALIZE_PROMPT;
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      systemInstruction: systemPrompt,
    });

    // Convert message history to Gemini format
    const history = messages.slice(0, -1).map((m) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

    const lastMessage = messages[messages.length - 1];
    const chat = model.startChat({ history });
    const result = await chat.sendMessage(lastMessage.content);
    const rawText = result.response.text();

    if (phase === 'clarify') {
      return res.json({ reply: rawText });
    }

    // finalize: parse JSON
    try {
      // Strip any accidental markdown fences
      const cleaned = rawText.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();
      const data = JSON.parse(cleaned);
      return res.json({ reply: data.voice_summary, data });
    } catch (parseErr) {
      console.error('JSON parse failed:', rawText);
      return res.status(500).json({ error: 'Chat failed', detail: 'Invalid JSON from Gemini' });
    }
  } catch (err) {
    console.error('Chat exception:', err);
    return res.status(500).json({ error: 'Chat failed', detail: err.message });
  }
});

// GET /api/voices — returns actual voices from the ElevenLabs account (cached in memory)
let voicesCache = null;
app.get('/api/voices', async (_req, res) => {
  if (voicesCache) return res.json(voicesCache);

  try {
    const response = await fetch('https://api.elevenlabs.io/v1/voices', {
      headers: { 'xi-api-key': ELEVENLABS_API_KEY },
    });

    if (!response.ok) throw new Error(`ElevenLabs voices error ${response.status}`);

    const data = await response.json();
    const allVoices = data.voices || [];

    // Return up to 8 voices from the account — no hardcoded ID filter
    voicesCache = allVoices.slice(0, 8).map(v => ({
      id: v.voice_id,
      label: v.name,
      name: v.name,
      preview_url: v.preview_url ?? null,
    }));

    console.log(`[voices] Loaded ${voicesCache.length} voices from ElevenLabs`);
  } catch (err) {
    console.error('[voices] Failed to fetch voices:', err.message);
    // Fallback to env default so at least something shows
    voicesCache = process.env.ELEVENLABS_VOICE_ID
      ? [{ id: process.env.ELEVENLABS_VOICE_ID, label: 'Default', name: 'Default', preview_url: null }]
      : [];
  }

  res.json(voicesCache);
});

// Inject ENV vars into index.html for frontend use
app.get('/', (req, res) => {
  const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
  const injected = html.replace(
    '</head>',
    `<script>window.ENV = { SUPABASE_URL: "${process.env.SUPABASE_URL}", SUPABASE_ANON_KEY: "${process.env.SUPABASE_ANON_KEY}" };</script>\n</head>`
  );
  res.send(injected);
});

app.get('/dashboard.html', (req, res) => {
  const html = fs.readFileSync(path.join(__dirname, 'dashboard.html'), 'utf8');
  const injected = html.replace(
    '</head>',
    `<script>window.ENV = { SUPABASE_URL: "${process.env.SUPABASE_URL}", SUPABASE_ANON_KEY: "${process.env.SUPABASE_ANON_KEY}" };</script>\n</head>`
  );
  res.send(injected);
});

app.get('/auth/callback.html', (req, res) => {
  const html = fs.readFileSync(path.join(__dirname, 'auth/callback.html'), 'utf8');
  const injected = html.replace(
    '</head>',
    `<script>window.ENV = { SUPABASE_URL: "${process.env.SUPABASE_URL}", SUPABASE_ANON_KEY: "${process.env.SUPABASE_ANON_KEY}" };</script>\n</head>`
  );
  res.send(injected);
});

// Static files for everything else
app.use(express.static(__dirname));

export { app };

const PORT = process.env.PORT || 3000;
if (!process.env.NETLIFY) {
  app.listen(PORT, () => {
    console.log(`Satiate server running at http://localhost:${PORT}`);
  });
}
