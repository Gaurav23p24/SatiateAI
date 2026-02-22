import { recordAudio, transcribe, stopRecording } from './voice.js';
import { askClarifyingQuestion, finalizeLog } from './gemini.js';

let state = 'IDLE';
let sessionMessages = [];

// In-memory meal storage (this step only)
const meals = [];
let pendingMealData = null;

// Voice selector state
let activeVoiceId = null;
let currentPreviewAudio = null;

// ── setState: wrap with UI hooks ──────────────────────────────────────────────
function setState(s) {
  state = s;

  // Core logic (original)
  document.getElementById('status').textContent = s;
  document.getElementById('mic-btn').disabled = !['IDLE', 'LISTENING', 'LISTENING_ANSWER'].includes(s);

  // UI hooks: orb data-state drives all CSS visual states
  document.getElementById('orb').dataset.state = s;
  document.getElementById('status-label').textContent = s.toLowerCase().replace(/_/g, ' ');

  // On IDLE transition with a completed meal → add card + update figure
  if (s === 'IDLE' && pendingMealData) {
    const meal = pendingMealData;
    pendingMealData = null;
    meals.push(meal);
    addMealCard(meal);
    updateFigure(meals);
    updateMacroProgress(meals);
    updateStatPills();
  }
}

// ── appendTranscript (original, preserved) ────────────────────────────────────
function appendTranscript(role, text) {
  const el = document.createElement('div');
  el.textContent = `[${role}] ${text}`;
  document.getElementById('transcript').appendChild(el);
}

// ── addMealCard ───────────────────────────────────────────────────────────────
function addMealCard(meal) {
  const log   = document.getElementById('meal-log');
  const empty = document.getElementById('empty-state');
  if (empty) empty.remove();

  const score = meal.satiety_score ?? 0;
  const tier  = score < 0.35 ? 'low' : score < 0.65 ? 'mid' : 'high';

  // Server returns: summary, calories, protein_g, carbs_g, fat_g, satiety_score
  const name     = meal.summary      ?? meal.meal_name ?? meal.name ?? 'Meal';
  const calories = meal.calories     ?? '—';
  const protein  = meal.protein_g    ?? meal.protein   ?? '—';
  const carbs    = meal.carbs_g      ?? meal.carbs     ?? '—';
  const fat      = meal.fat_g        ?? meal.fat       ?? '—';
  const pct      = Math.round(score * 100);

  // Build insights HTML from Gemini's insights array
  const insightsHTML = (meal.insights && meal.insights.length)
    ? meal.insights.map(item => {
        const type = (item.type === 'good' || item.type === 'warn' || item.type === 'tip') ? item.type : 'tip';
        const text = (item.text || '').trim();
        return text ? `<li class="insight-item insight-${type}">${text}</li>` : '';
      }).filter(Boolean).join('')
    : '<li class="insight-item insight-tip">No additional insights for this meal.</li>';

  const card = document.createElement('div');
  card.className = `meal-card tier-${tier}`;
  card.innerHTML = `
    <div class="card-accent"></div>
    <div class="card-body">
      <div class="card-left">
        <div class="card-meal-name">${name}</div>
        <div class="card-macros">${protein}g protein · ${carbs}g carbs · ${fat}g fat</div>
      </div>
      <div class="card-right">
        <div class="card-calories">${calories} kcal</div>
        <div class="card-satiety-pill">${pct}% satiety</div>
        <button class="card-insights-btn" aria-expanded="false">More info</button>
      </div>
    </div>
    <div class="card-insights" aria-hidden="true">
      <ul class="insights-list">${insightsHTML}</ul>
    </div>`;

  // Toggle insights panel
  const btn   = card.querySelector('.card-insights-btn');
  const panel = card.querySelector('.card-insights');
  btn.addEventListener('click', () => {
    const open = panel.classList.toggle('open');
    btn.classList.toggle('open', open);
    btn.setAttribute('aria-expanded', open);
    panel.setAttribute('aria-hidden', !open);
    btn.textContent = open ? 'Less info' : 'More info';
  });

  // Prepend (newest on top), then trigger entry animation on next frame
  log.insertBefore(card, log.firstChild);
  requestAnimationFrame(() => {
    requestAnimationFrame(() => card.classList.add('entered'));
  });
}

// ── satietyColor: red (0) → amber (0.5) → teal (1) ───────────────────────────
function satietyColor(t) {
  const low  = [217,  64,  64]; // red
  const mid  = [232, 168,  56]; // amber
  const high = [ 32, 184, 205]; // teal
  const from = t < 0.5 ? low : mid;
  const to   = t < 0.5 ? mid : high;
  const u    = t < 0.5 ? t / 0.5 : (t - 0.5) / 0.5;
  return from.map((v, i) => Math.round(v + (to[i] - v) * u));
}

// ── updateFigure: satiety-based fill + color animation ───────────────────────
function updateFigure(mealList) {
  if (!mealList || mealList.length === 0) return;

  const avgSatiety = mealList.reduce((s, m) => s + (m.satiety_score ?? 0), 0) / mealList.length;

  // Rise from bottom
  const fillRect = document.getElementById('fill-rect');
  if (fillRect) {
    fillRect.style.transition = 'transform 1.2s cubic-bezier(0.34,1.56,0.64,1)';
    fillRect.style.transform  = `translateY(${(1 - avgSatiety) * 500}px)`;
  }

  // Color: red → amber → teal (use rgb — stop-opacity on each stop handles alpha)
  const [r, g, b] = satietyColor(avgSatiety);
  const grad = document.getElementById('tealBodyFill');
  if (grad) {
    const stops = grad.querySelectorAll('stop');
    if (stops[0]) stops[0].setAttribute('stop-color', `rgb(${r},${g},${b})`);
    if (stops[1]) stops[1].setAttribute('stop-color', `rgb(${r},${g},${b})`);
    if (stops[2]) stops[2].setAttribute('stop-color', `rgb(${r},${g},${b})`);
  }
  // Glow stays static — only the figure fill changes color
}

// ── updateStatPills ───────────────────────────────────────────────────────────
function updateStatPills() {
  const totalCal  = meals.reduce((s, m) => s + (m.calories ?? 0), 0);
  const totalProt = meals.reduce((s, m) => s + (m.protein_g ?? m.protein ?? 0), 0);
  const avgScore  = meals.reduce((s, m) => s + (m.satiety_score ?? 0), 0) / meals.length;

  document.getElementById('stat-calories').textContent = Math.round(totalCal);
  document.getElementById('stat-protein').textContent  = Math.round(totalProt) + 'g';
  document.getElementById('stat-satiety').textContent  = Math.round(avgScore * 100) + '%';
}

// ── startMealLog (original flow, minimal extension) ───────────────────────────
async function startMealLog() {
  if (state !== 'IDLE') return;
  sessionMessages = [];

  try {
    setState('LISTENING');
    const audioBlob = await recordAudio();

    setState('PROCESSING_STT');
    const transcript = await transcribe(audioBlob);
    sessionMessages.push({ role: 'user', content: transcript });
    appendTranscript('user', transcript);

    setState('GEMINI_CLARIFYING');
    const question = await askClarifyingQuestion(transcript);
    sessionMessages.push({ role: 'assistant', content: question });
    appendTranscript('assistant', question);

    setState('TTS_SPEAKING_QUESTION');
    try {
      await speakWithVoice(question);
    } catch (ttsErr) {
      console.error('TTS speak failed, continuing:', ttsErr);
    }

    setState('LISTENING_ANSWER');
    const answerBlob = await recordAudio();

    setState('PROCESSING_STT_ANSWER');
    const answer = await transcribe(answerBlob);
    sessionMessages.push({ role: 'user', content: answer });
    appendTranscript('user', answer);

    setState('GEMINI_FINALIZING');
    const mealData = await finalizeLog(sessionMessages);

    // Stage meal data — setState('IDLE') will pick it up and render
    pendingMealData = mealData;

    setState('TTS_SPEAKING_RESULT');
    try {
      await speakWithVoice(mealData.voice_summary);
    } catch (ttsErr) {
      console.error('TTS result failed, continuing:', ttsErr);
    }

    console.log('MEAL LOGGED:', mealData);
    setState('IDLE');
  } catch (err) {
    if (err.message === 'MIC_DENIED') {
      alert('Microphone access needed');
    } else {
      console.error('Meal log error:', err);
      alert('Something went wrong — tap to retry');
    }
    setState('IDLE');
  }
}

// Orb doubles as stop button in LISTENING states
document.getElementById('mic-btn').addEventListener('click', () => {
  // Kill any playing voice preview before recording starts
  if (currentPreviewAudio) {
    currentPreviewAudio.pause();
    currentPreviewAudio = null;
  }
  if (state === 'LISTENING' || state === 'LISTENING_ANSWER') {
    stopRecording();
  } else {
    startMealLog();
  }
});
// Keep stop-btn wired (hidden in UI, fallback)
document.getElementById('stop-btn').addEventListener('click', stopRecording);

// ── speakWithVoice: local TTS wrapper that sends activeVoiceId ────────────────
async function speakWithVoice(text) {
  const response = await fetch('/api/tts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(activeVoiceId ? { text, voiceId: activeVoiceId } : { text }),
  });
  if (!response.ok) {
    console.error('TTS failed:', response.status, await response.text().catch(() => ''));
    return;
  }

  const blob = await response.blob();
  const url  = URL.createObjectURL(blob);
  const audio = new Audio(url);
  return new Promise((resolve) => {
    audio.onended = () => { URL.revokeObjectURL(url); resolve(); };
    audio.onerror = () => { URL.revokeObjectURL(url); resolve(); };
    audio.play().catch(e => { console.error('Audio play failed:', e); URL.revokeObjectURL(url); resolve(); });
  });
}

// ── Voice Selector ────────────────────────────────────────────────────────────
async function loadVoices() {
  try {
    const voices = await fetch('/api/voices').then(r => r.json());
    if (!voices || !voices.length) return;
    // Do NOT auto-select — keep activeVoiceId null so TTS uses ELEVENLABS_VOICE_ID default
    renderVoiceSelector(voices);
  } catch (err) {
    console.error('loadVoices failed:', err);
  }
}

function renderVoiceSelector(voices) {
  const container = document.getElementById('voice-cards');
  if (!container) return;

  container.innerHTML = voices.map(v => `
    <div class="voice-card ${activeVoiceId === v.id ? 'active' : ''}"
         data-voice-id="${v.id}"
         role="button" tabindex="0"
         aria-label="Select ${v.label} voice">
      <div class="voice-card-top">
        <span class="voice-card-label">${v.label}</span>
        <button class="voice-preview-btn" data-voice-id="${v.id}" aria-label="Preview ${v.label}">▶</button>
      </div>
      <div class="vw-bars">
        <div class="vw-bar" style="height:4px;"></div>
        <div class="vw-bar" style="height:8px;"></div>
        <div class="vw-bar" style="height:6px;"></div>
        <div class="vw-bar" style="height:10px;"></div>
        <div class="vw-bar" style="height:5px;"></div>
      </div>
    </div>
  `).join('');

  container.querySelectorAll('.voice-card').forEach(card => {
    card.addEventListener('click', (e) => {
      if (e.target.closest('.voice-preview-btn')) return;
      setVoice(card.dataset.voiceId);
    });
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        setVoice(card.dataset.voiceId);
      }
    });
  });

  container.querySelectorAll('.voice-preview-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      playPreview(btn.dataset.voiceId);
    });
  });
}

function setVoice(id) {
  activeVoiceId = id;
  document.querySelectorAll('.voice-card').forEach(el => {
    el.classList.toggle('active', el.dataset.voiceId === id);
  });
}

async function playPreview(voiceId) {
  // Cancel current preview
  if (currentPreviewAudio) {
    currentPreviewAudio.pause();
    currentPreviewAudio = null;
  }

  try {
    const response = await fetch('/api/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: '__PREVIEW__', voiceId }),
    });
    if (!response.ok) return;

    const blob = await response.blob();
    const url  = URL.createObjectURL(blob);
    const audio = new Audio(url);
    currentPreviewAudio = audio;

    audio.onended = () => { URL.revokeObjectURL(url); currentPreviewAudio = null; };
    audio.onerror = () => { URL.revokeObjectURL(url); currentPreviewAudio = null; };
    audio.play().catch(e => { console.error('Preview play failed:', e); URL.revokeObjectURL(url); currentPreviewAudio = null; });
  } catch (err) {
    console.error('playPreview failed:', err);
  }
}

// ── BMI + Macro Tracker ───────────────────────────────────────────────────────
function calculateTargets(heightInches, weightLbs) {
  const heightM  = heightInches * 0.0254;
  const weightKg = weightLbs * 0.453592;
  const bmi      = weightKg / (heightM ** 2);
  const bmr      = 10 * weightKg + 6.25 * (heightM * 100) - 5 * 30 + 5; // age 30
  const tdee     = bmr * 1.375; // light activity

  const bmi_category =
    bmi < 18.5 ? 'Underweight' :
    bmi < 25   ? 'Healthy' :
    bmi < 30   ? 'Overweight' : 'Obese';

  return {
    bmi:          +bmi.toFixed(1),
    bmi_category,
    calories:     Math.round(tdee),
    protein_g:    Math.round(weightKg * 1.6),
    carbs_g:      Math.round((tdee * 0.45) / 4),
    fat_g:        Math.round((tdee * 0.30) / 9),
    fiber_g:      Math.round(weightKg * 0.5),
    sugar_g:      50,
  };
}

const DEFAULTS = { calories: 2000, protein_g: 50, carbs_g: 250, fat_g: 78, fiber_g: 28, sugar_g: 50 };

function getTargets() {
  const h = parseFloat(localStorage.getItem('satiety_height_in'));
  const w = parseFloat(localStorage.getItem('satiety_weight_lbs'));
  if (h > 0 && w > 0) return calculateTargets(h, w);
  return DEFAULTS;
}

function loadBMIPanel() {
  const editBtn  = document.getElementById('bmi-edit-btn');
  const display  = document.getElementById('bmi-display');
  const editForm = document.getElementById('bmi-edit');
  const savBtn   = document.getElementById('bmi-save-btn');

  if (!editBtn) return;

  // Toggle edit mode
  editBtn.addEventListener('click', () => {
    const isEditing = editForm.style.display !== 'none';
    display.style.display  = isEditing ? '' : 'none';
    editForm.style.display = isEditing ? 'none' : '';
    if (!isEditing) {
      const storedH = localStorage.getItem('satiety_height_in');
      const storedW = localStorage.getItem('satiety_weight_lbs');
      if (storedH) document.getElementById('bmi-height').value = storedH;
      if (storedW) document.getElementById('bmi-weight').value = storedW;
    }
  });

  savBtn.addEventListener('click', () => {
    const hVal = parseFloat(document.getElementById('bmi-height').value);
    const wVal = parseFloat(document.getElementById('bmi-weight').value);
    if (!hVal || !wVal || hVal < 48 || hVal > 96 || wVal < 50 || wVal > 500) {
      alert('Please enter a valid height (48–96 in) and weight (50–500 lb).');
      return;
    }
    localStorage.setItem('satiety_height_in',   hVal);
    localStorage.setItem('satiety_weight_lbs',  wVal);
    display.style.display  = '';
    editForm.style.display = 'none';
    refreshBMIDisplay();
    updateMacroProgress(meals);
    updateFigure(meals);
  });

  refreshBMIDisplay();
  updateMacroProgress(meals);
}

function refreshBMIDisplay() {
  const h = parseFloat(localStorage.getItem('satiety_height_in'));
  const w = parseFloat(localStorage.getItem('satiety_weight_lbs'));
  const line  = document.getElementById('bmi-display-line');
  const badge = document.getElementById('bmi-badge');

  if (!h || !w) {
    if (line)  line.textContent  = 'Set your stats to personalize targets';
    if (badge) badge.style.display = 'none';
    return;
  }

  const t = calculateTargets(h, w);
  const feet   = Math.floor(h / 12);
  const inches = Math.round(h % 12);
  if (line)  line.textContent = `${feet}'${inches}"  ·  ${Math.round(w)} lb  ·  BMI ${t.bmi}`;

  if (badge) {
    badge.style.display = '';
    badge.textContent   = t.bmi_category;
    badge.className     = 'bmi-badge ' + t.bmi_category.toLowerCase();
  }
}

function updateMacroProgress(mealList) {
  const totals = mealList.reduce((acc, m) => ({
    protein_g: acc.protein_g + (m.protein_g || m.protein || 0),
    carbs_g:   acc.carbs_g   + (m.carbs_g   || m.carbs   || 0),
    fat_g:     acc.fat_g     + (m.fat_g     || m.fat     || 0),
    fiber_g:   acc.fiber_g   + (m.fiber_g   || 0),
    calories:  acc.calories  + (m.calories  || 0),
  }), { protein_g: 0, carbs_g: 0, fat_g: 0, fiber_g: 0, calories: 0 });

  const t = getTargets();

  setBar('protein',  totals.protein_g, t.protein_g, 'g',  '#4CAF82');
  setBar('carbs',    totals.carbs_g,   t.carbs_g,   'g',  '#E8A838');
  setBar('fat',      totals.fat_g,     t.fat_g,     'g',  '#7B9EAD');
  setBar('fiber',    totals.fiber_g,   t.fiber_g,   'g',  '#20B8CD');
  setBar('calories', totals.calories,  t.calories,  '',   '#1C2B3A');
}

function setBar(name, consumed, target, unit, color) {
  const fill = document.getElementById(`bar-${name}`);
  const nums = document.getElementById(`bar-nums-${name}`);
  if (!fill || !nums) return;

  const pct = target > 0 ? Math.min((consumed / target) * 100, 100) : 0;
  const over = consumed > target && target > 0;

  fill.style.width = pct + '%';
  if (over) {
    fill.classList.add('over-target');
    fill.style.removeProperty('background');
  } else {
    fill.classList.remove('over-target');
    fill.style.background = color;
  }

  const cLabel = unit ? `${Math.round(consumed)}${unit}` : Math.round(consumed);
  const tLabel = unit ? `${target}${unit}` : target;
  nums.textContent = `${cLabel} / ${tLabel}`;
}

// ── Initialize on load ────────────────────────────────────────────────────────
loadVoices();
loadBMIPanel();
