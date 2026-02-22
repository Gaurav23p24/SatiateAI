// patterns.js — Rendering logic for patterns.html
// No API calls. All computation is derived from MEAL_HISTORY in patterns-data.js.

import { MEAL_HISTORY } from './patterns-data.js';

// ─────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────
const DAYS       = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const TIME_BANDS = [
  { label: 'Morning',   hours: [6,7,8,9,10],       key: 'morning'   },
  { label: 'Afternoon', hours: [11,12,13,14,15,16], key: 'afternoon' },
  { label: 'Evening',   hours: [17,18,19,20],       key: 'evening'   },
  { label: 'Night',     hours: [21,22,23,0,1,2],    key: 'night'     },
];
const TODAY      = '2026-02-22';   // dummy data "today"
const TODAY_DATE = new Date(TODAY);

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────
function getTimeBandKey(hour) {
  for (const band of TIME_BANDS) {
    if (band.hours.includes(hour)) return band.key;
  }
  return 'night';
}

function satietyTier(score) {
  if (score >= 0.65) return 'high';
  if (score >= 0.35) return 'mid';
  return 'low';
}

function tierColor(tier) {
  if (tier === 'high') return '#20B8CD';
  if (tier === 'mid')  return '#E8A838';
  return '#E05C5C';
}

function tierBg(tier) {
  if (tier === 'high') return 'rgba(32,184,205,0.13)';
  if (tier === 'mid')  return 'rgba(232,168,56,0.13)';
  return 'rgba(224,92,92,0.13)';
}

function avg(arr) {
  if (!arr.length) return 0;
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

// ISO day-of-week: 0=Mon … 6=Sun
function isoDow(dateStr) {
  const d = new Date(dateStr);
  return (d.getDay() + 6) % 7;  // getDay(): 0=Sun → convert to 0=Mon
}

// Return Monday of the week containing dateStr
function weekStart(dateStr) {
  const d   = new Date(dateStr);
  const dow = (d.getDay() + 6) % 7;
  d.setDate(d.getDate() - dow);
  return d;
}

// Format date as "Mon Feb 2"
function fmtDateShort(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

// Format date range "Feb 2–5"
function fmtDateRange(start, end) {
  const s = new Date(start), e = new Date(end);
  const sm = s.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const ed = e.getDate();
  return `${sm}–${ed}`;
}

// ─────────────────────────────────────────────
// ZONE 1 — WEEKLY HEATMAP
// ─────────────────────────────────────────────
export function renderWeeklyView() {
  const container = document.getElementById('weekly-grid');
  const summary   = document.getElementById('weekly-summary');
  if (!container) return;

  // Current week: Mon Feb 16 → Sun Feb 22
  const wStart = weekStart(TODAY);

  // Build array of 7 date strings for this week
  const weekDates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(wStart);
    d.setDate(d.getDate() + i);
    return d.toISOString().slice(0, 10);
  });

  // Filter meals to this week
  const weekMeals = MEAL_HISTORY.filter(m => weekDates.includes(m.date));

  // Build cell map: cells[dayIndex][bandKey] = { scores:[], hasCraving, meals:[] }
  const cells = Array.from({ length: 7 }, () => {
    const o = {};
    TIME_BANDS.forEach(b => { o[b.key] = { scores: [], hasCraving: false, meals: [] }; });
    return o;
  });

  for (const meal of weekMeals) {
    const dayIdx = weekDates.indexOf(meal.date);
    if (dayIdx === -1) continue;
    const bandKey = getTimeBandKey(meal.time_hour);
    cells[dayIdx][bandKey].scores.push(meal.satiety_score);
    cells[dayIdx][bandKey].meals.push(meal);
    if (meal.craving) cells[dayIdx][bandKey].hasCraving = true;
  }

  // Find weakest and strongest filled cells for summary
  let weakest   = { label: '', score: Infinity };
  let strongest = { label: '', score: -Infinity };

  // Build HTML
  container.innerHTML = '';

  // Header row
  const headerRow = document.createElement('div');
  headerRow.className = 'wg-header-row';
  headerRow.innerHTML = '<div class="wg-band-label"></div>' +
    DAYS.map((d, i) => `<div class="wg-day-header">${d}<span class="wg-date-sub">${new Date(weekDates[i]).getDate()}</span></div>`).join('');
  container.appendChild(headerRow);

  // Data rows
  for (const band of TIME_BANDS) {
    const row = document.createElement('div');
    row.className = 'wg-row';

    const bandLabel = document.createElement('div');
    bandLabel.className = 'wg-band-label';
    bandLabel.textContent = band.label;
    row.appendChild(bandLabel);

    for (let dayIdx = 0; dayIdx < 7; dayIdx++) {
      const cell     = cells[dayIdx][band.key];
      const cellEl   = document.createElement('div');
      cellEl.className = 'wg-cell';

      if (cell.scores.length === 0) {
        // Empty cell
        cellEl.style.background = 'rgba(0,0,0,0.04)';
        cellEl.style.border     = '1px dashed rgba(28,43,58,0.12)';
      } else {
        const avgScore = avg(cell.scores);
        const tier     = satietyTier(avgScore);
        cellEl.style.background = tierBg(tier);
        cellEl.style.borderColor = tierColor(tier).replace(')', ',0.25)').replace('rgb', 'rgba');

        // Track for summary
        const label = `${DAYS[dayIdx]} ${band.label.toLowerCase()}s`;
        if (avgScore < weakest.score)   weakest   = { label, score: avgScore };
        if (avgScore > strongest.score) strongest = { label, score: avgScore };

        // Score text
        const scoreEl = document.createElement('div');
        scoreEl.className = 'wg-cell-score';
        scoreEl.style.color = tierColor(tier);
        scoreEl.textContent = Math.round(avgScore * 100) + '%';
        cellEl.appendChild(scoreEl);

        // Craving dot
        if (cell.hasCraving) {
          const dot = document.createElement('div');
          dot.className = 'wg-craving-dot';
          cellEl.appendChild(dot);
        }

        // Tooltip
        const tip = buildTooltip(cell.meals);
        cellEl.appendChild(tip);
        cellEl.classList.add('has-tooltip');
      }

      row.appendChild(cellEl);
    }

    container.appendChild(row);
  }

  // Summary sentence
  if (weakest.score !== Infinity && strongest.score !== -Infinity) {
    summary.textContent = `Your weakest window is ${weakest.label}. Strongest: ${strongest.label}.`;
  }
}

function buildTooltip(meals) {
  const tip = document.createElement('div');
  tip.className = 'wg-tooltip';
  tip.innerHTML = meals.map(m => {
    const tier = satietyTier(m.satiety_score);
    const pillColor = tierColor(tier);
    return `<div class="wg-tip-meal">
      <span class="wg-tip-name">${m.meal}</span>
      <span class="wg-tip-pill" style="background:${tierBg(tier)};color:${pillColor};">${Math.round(m.satiety_score*100)}%</span>
    </div>
    <div class="wg-tip-cal">${m.calories} kcal · ${m.protein_g}g protein</div>`;
  }).join('<hr class="wg-tip-hr">');
  return tip;
}

// ─────────────────────────────────────────────
// ZONE 2 — MONTHLY CALENDAR
// ─────────────────────────────────────────────
export function renderCalendar() {
  const grid = document.getElementById('cal-grid');
  if (!grid) return;

  // February 2026: 28 days, starts on Sunday (day index 6 in Mon-first week)
  const year = 2026, month = 1;  // 0-indexed month
  const firstDay = new Date(year, month, 1).getDay(); // 0=Sun
  // Convert to Mon-first: 0=Mon…6=Sun
  const firstDayMon = (firstDay + 6) % 7;

  const daysInMonth = 28;

  // Group MEAL_HISTORY by date for Feb 2026
  const mealsByDate = {};
  for (const meal of MEAL_HISTORY) {
    if (!mealsByDate[meal.date]) mealsByDate[meal.date] = [];
    mealsByDate[meal.date].push(meal);
  }

  // Build calendar cells (leading empty + date cells)
  const totalCells = Math.ceil((firstDayMon + daysInMonth) / 7) * 7;
  grid.innerHTML = '';

  for (let i = 0; i < totalCells; i++) {
    const dayNum = i - firstDayMon + 1;
    const cell   = document.createElement('div');

    if (dayNum < 1 || dayNum > daysInMonth) {
      cell.className = 'cal-cell cal-empty';
      grid.appendChild(cell);
      continue;
    }

    const dateStr   = `2026-02-${String(dayNum).padStart(2, '0')}`;
    const meals     = mealsByDate[dateStr] || [];
    const isToday   = dateStr === TODAY;
    const isWeekend = (i % 7 === 5) || (i % 7 === 6); // Sat or Sun col

    cell.className = 'cal-cell' + (isWeekend ? ' cal-weekend' : '') + (isToday ? ' cal-today' : '');
    cell.dataset.date = dateStr;

    // Day number
    const dayEl = document.createElement('div');
    dayEl.className = 'cal-day-num';
    dayEl.textContent = dayNum;
    cell.appendChild(dayEl);

    // Craving spike indicator
    const hasCraving = meals.some(m => m.craving);
    if (hasCraving) {
      const warn = document.createElement('span');
      warn.className = 'cal-craving-badge';
      warn.textContent = '⚠';
      warn.title = 'Craving logged';
      cell.appendChild(warn);
    }

    // Meal dots (max 3)
    if (meals.length > 0) {
      const dotsWrap = document.createElement('div');
      dotsWrap.className = 'cal-dots';

      const shown = meals.slice(0, 3);
      shown.forEach(m => {
        const dot = document.createElement('div');
        dot.className = 'cal-dot';
        dot.style.background = tierColor(satietyTier(m.satiety_score));
        dotsWrap.appendChild(dot);
      });

      if (meals.length > 3) {
        const more = document.createElement('span');
        more.className = 'cal-more';
        more.textContent = `+${meals.length - 3}`;
        dotsWrap.appendChild(more);
      }

      cell.appendChild(dotsWrap);
    }

    // Click → show day panel
    if (meals.length > 0) {
      cell.classList.add('cal-has-meals');
      cell.addEventListener('click', () => openDayPanel(dateStr, meals));
    }

    grid.appendChild(cell);
  }
}

function openDayPanel(dateStr, meals) {
  const panel    = document.getElementById('day-panel');
  const overlay  = document.getElementById('day-panel-overlay');
  const title    = document.getElementById('dp-title');
  const mealList = document.getElementById('dp-meal-list');
  const macroBar = document.getElementById('dp-macro-bar');

  if (!panel) return;

  // Set title
  const d = new Date(dateStr);
  title.textContent = d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  // Compute day totals
  const totals = {
    calories: meals.reduce((s, m) => s + m.calories, 0),
    protein:  meals.reduce((s, m) => s + m.protein_g, 0),
    carbs:    meals.reduce((s, m) => s + m.carbs_g, 0),
    fat:      meals.reduce((s, m) => s + m.fat_g, 0),
    sugar:    meals.reduce((s, m) => s + m.sugar_g, 0),
  };

  // Macro bar
  const totalMacroG = totals.protein + totals.carbs + totals.fat;
  const pPct = totalMacroG ? (totals.protein / totalMacroG * 100) : 33;
  const cPct = totalMacroG ? (totals.carbs   / totalMacroG * 100) : 34;
  const fPct = totalMacroG ? (totals.fat     / totalMacroG * 100) : 33;

  macroBar.innerHTML = `
    <div class="dp-macro-summary">
      <span>${totals.calories} kcal</span>
      <span style="color:#4CAF82">${totals.protein}g protein</span>
      <span style="color:#E8A838">${totals.carbs}g carbs</span>
      <span style="color:#7B9EAD">${totals.fat}g fat</span>
    </div>
    <div class="dp-macro-track">
      <div style="width:${pPct.toFixed(1)}%;background:#4CAF82;height:100%;border-radius:4px 0 0 4px;"></div>
      <div style="width:${cPct.toFixed(1)}%;background:#E8A838;height:100%;"></div>
      <div style="width:${fPct.toFixed(1)}%;background:#7B9EAD;height:100%;border-radius:0 4px 4px 0;"></div>
    </div>`;

  // Meal list
  mealList.innerHTML = meals.map(m => {
    const tier = satietyTier(m.satiety_score);
    const hour12 = m.time_hour === 0 ? '12am' : m.time_hour < 12 ? `${m.time_hour}am` : m.time_hour === 12 ? '12pm' : `${m.time_hour - 12}pm`;
    return `<div class="dp-meal">
      <div class="dp-meal-accent" style="background:${tierColor(tier)};"></div>
      <div class="dp-meal-body">
        <div class="dp-meal-top">
          <span class="dp-meal-name">${m.meal}</span>
          <span class="dp-meal-pill" style="background:${tierBg(tier)};color:${tierColor(tier)};">${Math.round(m.satiety_score * 100)}%</span>
        </div>
        <div class="dp-meal-meta">${hour12} · ${m.calories} kcal · ${m.protein_g}g protein${m.craving ? ' · <span class="dp-craving-flag">craving</span>' : ''}</div>
      </div>
    </div>`;
  }).join('');

  // Show
  panel.classList.add('open');
  overlay.classList.add('open');
}

function closeDayPanel() {
  document.getElementById('day-panel')?.classList.remove('open');
  document.getElementById('day-panel-overlay')?.classList.remove('open');
}

// ─────────────────────────────────────────────
// ZONE 3 — PATTERN INSIGHTS
// ─────────────────────────────────────────────
export function renderInsights() {
  // ── Insight 1: Time Pattern (craving hours) ──────────────────────
  const cravings    = MEAL_HISTORY.filter(m => m.craving);
  const nightCravs  = cravings.filter(m => m.time_hour >= 21 || m.time_hour <= 2);
  const nightPct    = cravings.length ? Math.round(nightCravs.length / cravings.length * 100) : 0;
  const afternoonCravs = cravings.filter(m => m.time_hour >= 14 && m.time_hour <= 16);
  const aftPct      = cravings.length ? Math.round(afternoonCravs.length / cravings.length * 100) : 0;

  const i1Stat    = `${nightPct}%`;
  const i1Context = `${nightPct}% of your cravings happen between 9–11pm. Afternoons (2–4pm) account for another ${aftPct}%. Late nights are your highest-risk window.`;

  // ── Insight 2: Weekly Rhythm (Saturday vs weekday calories) ──────
  // Compute average daily total calories per day-of-week
  const calByDate = {};
  for (const m of MEAL_HISTORY) {
    calByDate[m.date] = (calByDate[m.date] || 0) + m.calories;
  }

  const saturdayDates = Object.keys(calByDate).filter(d => new Date(d).getDay() === 6);
  const weekdayDates  = Object.keys(calByDate).filter(d => { const day = new Date(d).getDay(); return day >= 1 && day <= 5; });

  const satAvgCal  = avg(saturdayDates.map(d => calByDate[d]));
  const wkdAvgCal  = avg(weekdayDates.map(d => calByDate[d]));
  const calDiff    = Math.round(satAvgCal - wkdAvgCal);

  const i2Stat    = `+${Math.abs(calDiff)} kcal`;
  const i2Context = calDiff > 0
    ? `Saturdays average ${Math.abs(calDiff)} more calories than weekdays (${Math.round(satAvgCal)} vs ${Math.round(wkdAvgCal)} kcal). Social eating and dinner-out habits drive the gap.`
    : `Your Saturday intake is well-controlled, averaging ${Math.abs(calDiff)} fewer kcal than weekdays.`;

  // ── Insight 3: Best Satiety Streak ───────────────────────────────
  // Day = "good" if avg satiety ≥ 0.65
  const avgByDate = {};
  for (const m of MEAL_HISTORY) {
    if (!avgByDate[m.date]) avgByDate[m.date] = [];
    avgByDate[m.date].push(m.satiety_score);
  }

  const allDates = Object.keys(avgByDate).sort();
  let bestStreak = 0, bestStart = '', bestEnd = '';
  let curStreak = 0, curStart = '';

  for (const date of allDates) {
    const dayAvg = avg(avgByDate[date]);
    if (dayAvg >= 0.65) {
      if (curStreak === 0) curStart = date;
      curStreak++;
      if (curStreak > bestStreak) {
        bestStreak = curStreak;
        bestStart  = curStart;
        bestEnd    = date;
      }
    } else {
      curStreak = 0;
    }
  }

  const i3Stat    = `${bestStreak} days`;
  const i3Context = `Your best satiety streak was ${bestStreak} consecutive days: ${fmtDateRange(bestStart, bestEnd)}. Every meal in that window averaged above 65% satiety.`;

  // ── Insight 4: Macro Gap ─────────────────────────────────────────
  const wkdMornings = MEAL_HISTORY.filter(m => {
    const dow = new Date(m.date).getDay();
    return dow >= 1 && dow <= 5 && m.time_hour >= 6 && m.time_hour <= 11;
  });
  const wkndMornings = MEAL_HISTORY.filter(m => {
    const dow = new Date(m.date).getDay();
    return (dow === 0 || dow === 6) && m.time_hour >= 6 && m.time_hour <= 11;
  });

  const wkdProtAvg  = Math.round(avg(wkdMornings.map(m => m.protein_g)));
  const wkndProtAvg = Math.round(avg(wkndMornings.map(m => m.protein_g)));
  const protDrop    = Math.round((wkdProtAvg - wkndProtAvg) / wkdProtAvg * 100);

  // Friday evening carbs vs other weekday evenings
  const friEvenings = MEAL_HISTORY.filter(m => new Date(m.date).getDay() === 5 && m.time_hour >= 17 && m.time_hour <= 23);
  const otherEvenings = MEAL_HISTORY.filter(m => { const dow = new Date(m.date).getDay(); return dow >= 1 && dow <= 4 && m.time_hour >= 17 && m.time_hour <= 23; });
  const friCarbAvg   = Math.round(avg(friEvenings.map(m => m.carbs_g)));
  const otherCarbAvg = Math.round(avg(otherEvenings.map(m => m.carbs_g)));
  const carbSpike    = Math.round((friCarbAvg - otherCarbAvg) / otherCarbAvg * 100);

  const i4Stat    = `−${protDrop}%`;
  const i4Context = `Weekend morning protein drops ${protDrop}% vs weekdays (${wkndProtAvg}g vs ${wkdProtAvg}g). Friday evenings average ${friCarbAvg}g carbs — ${carbSpike > 0 ? carbSpike + '% above' : 'similar to'} other weeknight dinners.`;

  // ── Render cards ─────────────────────────────────────────────────
  const cards = [
    {
      id:   'insight-time',
      icon: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#20B8CD" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`,
      type: 'Time Pattern',
      stat: i1Stat,
      text: i1Context,
    },
    {
      id:   'insight-weekly',
      icon: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#20B8CD" stroke-width="1.8" stroke-linecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`,
      type: 'Weekly Rhythm',
      stat: i2Stat,
      text: i2Context,
    },
    {
      id:   'insight-streak',
      icon: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#20B8CD" stroke-width="1.8" stroke-linecap="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>`,
      type: 'Best Streak',
      stat: i3Stat,
      text: i3Context,
    },
    {
      id:   'insight-macro',
      icon: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#20B8CD" stroke-width="1.8" stroke-linecap="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>`,
      type: 'Macro Gap',
      stat: i4Stat,
      text: i4Context,
    },
  ];

  const container = document.getElementById('insights-grid');
  if (!container) return;

  container.innerHTML = cards.map(c => `
    <div class="insight-card" id="${c.id}">
      <div class="insight-accent"></div>
      <div class="insight-body">
        <div class="insight-icon-wrap">
          ${c.icon}
        </div>
        <div class="insight-type">${c.type}</div>
        <div class="insight-stat">${c.stat}</div>
        <div class="insight-text">${c.text}</div>
      </div>
    </div>`).join('');
}

// ─────────────────────────────────────────────
// INIT
// ─────────────────────────────────────────────
export function init() {
  renderWeeklyView();
  renderCalendar();
  renderInsights();

  // Day panel close
  document.getElementById('day-panel-close')?.addEventListener('click', closeDayPanel);
  document.getElementById('day-panel-overlay')?.addEventListener('click', closeDayPanel);

  // Scroll reveal
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
  }, { threshold: 0.08 });
  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
}
