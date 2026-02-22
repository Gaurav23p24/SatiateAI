// patterns-data.js — Static 30-day meal history (no runtime randomness)
// Two bad weeks (low satiety, high sugar), one strong week, realistic human patterns.
// Saturday evenings = social eating / high sugar. Weekday mornings = strong protein.
// Cravings: ~25% of entries, clustered 9–11pm and 2–4pm.

export const MEAL_HISTORY = [

  // ── Jan 23 (Fri) — Bad week 1 begins ──────────────────────────────
  { date: '2026-01-23', time_hour: 8,  meal: 'Scrambled eggs on toast',        calories: 420, protein_g: 22, carbs_g: 38, fat_g: 18, sugar_g:  4, satiety_score: 0.72, craving: false },
  { date: '2026-01-23', time_hour: 13, meal: 'Chicken Caesar salad',           calories: 480, protein_g: 34, carbs_g: 22, fat_g: 24, sugar_g:  6, satiety_score: 0.68, craving: false },
  { date: '2026-01-23', time_hour: 19, meal: 'Pasta Bolognese',                calories: 640, protein_g: 26, carbs_g: 76, fat_g: 22, sugar_g: 14, satiety_score: 0.48, craving: false },
  { date: '2026-01-23', time_hour: 22, meal: 'Late night cookies',             calories: 280, protein_g:  3, carbs_g: 42, fat_g: 12, sugar_g: 28, satiety_score: 0.26, craving: true  },

  // ── Jan 24 (Sat) ───────────────────────────────────────────────────
  { date: '2026-01-24', time_hour: 10, meal: 'Pancakes with maple syrup',      calories: 560, protein_g: 12, carbs_g: 90, fat_g: 14, sugar_g: 42, satiety_score: 0.35, craving: false },
  { date: '2026-01-24', time_hour: 15, meal: 'Chips and dip (afternoon snack)',calories: 320, protein_g:  4, carbs_g: 44, fat_g: 16, sugar_g:  2, satiety_score: 0.22, craving: true  },
  { date: '2026-01-24', time_hour: 19, meal: 'Takeout pizza (3 slices)',       calories: 800, protein_g: 34, carbs_g: 96, fat_g: 30, sugar_g: 14, satiety_score: 0.44, craving: false },
  { date: '2026-01-24', time_hour: 22, meal: 'Ice cream after movie',          calories: 340, protein_g:  6, carbs_g: 46, fat_g: 16, sugar_g: 40, satiety_score: 0.20, craving: true  },

  // ── Jan 25 (Sun) ───────────────────────────────────────────────────
  { date: '2026-01-25', time_hour: 10, meal: 'Bagel with cream cheese',        calories: 420, protein_g: 14, carbs_g: 62, fat_g: 12, sugar_g:  8, satiety_score: 0.36, craving: false },
  { date: '2026-01-25', time_hour: 15, meal: 'Candy bar (3pm craving)',        calories: 260, protein_g:  4, carbs_g: 36, fat_g: 12, sugar_g: 30, satiety_score: 0.18, craving: true  },
  { date: '2026-01-25', time_hour: 19, meal: 'Chicken stir-fry with rice',     calories: 580, protein_g: 36, carbs_g: 62, fat_g: 14, sugar_g:  8, satiety_score: 0.58, craving: false },

  // ── Jan 26 (Mon) ───────────────────────────────────────────────────
  { date: '2026-01-26', time_hour: 8,  meal: 'Greek yogurt with granola',      calories: 380, protein_g: 18, carbs_g: 46, fat_g: 10, sugar_g: 18, satiety_score: 0.65, craving: false },
  { date: '2026-01-26', time_hour: 13, meal: 'Turkey and avocado wrap',        calories: 520, protein_g: 34, carbs_g: 42, fat_g: 22, sugar_g:  4, satiety_score: 0.72, craving: false },
  { date: '2026-01-26', time_hour: 20, meal: 'Instant noodles (lazy night)',   calories: 480, protein_g: 12, carbs_g: 72, fat_g: 18, sugar_g:  6, satiety_score: 0.32, craving: false },
  { date: '2026-01-26', time_hour: 22, meal: 'Chocolate bar',                  calories: 220, protein_g:  3, carbs_g: 28, fat_g: 12, sugar_g: 24, satiety_score: 0.22, craving: true  },

  // ── Jan 27 (Tue) ───────────────────────────────────────────────────
  { date: '2026-01-27', time_hour: 7,  meal: 'Protein oatmeal',                calories: 400, protein_g: 24, carbs_g: 52, fat_g:  8, sugar_g: 10, satiety_score: 0.76, craving: false },
  { date: '2026-01-27', time_hour: 12, meal: 'Quinoa salad bowl',              calories: 460, protein_g: 22, carbs_g: 56, fat_g: 14, sugar_g:  8, satiety_score: 0.68, craving: false },
  { date: '2026-01-27', time_hour: 21, meal: 'Leftover pasta',                 calories: 540, protein_g: 18, carbs_g: 76, fat_g: 16, sugar_g: 10, satiety_score: 0.38, craving: false },
  { date: '2026-01-27', time_hour: 23, meal: 'Crackers and peanut butter',     calories: 290, protein_g:  9, carbs_g: 32, fat_g: 16, sugar_g:  6, satiety_score: 0.30, craving: true  },

  // ── Jan 28 (Wed) ───────────────────────────────────────────────────
  { date: '2026-01-28', time_hour: 8,  meal: 'Avocado toast with eggs',        calories: 460, protein_g: 20, carbs_g: 38, fat_g: 24, sugar_g:  4, satiety_score: 0.74, craving: false },
  { date: '2026-01-28', time_hour: 13, meal: 'Grilled chicken salad',          calories: 440, protein_g: 38, carbs_g: 18, fat_g: 18, sugar_g:  6, satiety_score: 0.78, craving: false },
  { date: '2026-01-28', time_hour: 19, meal: 'Sushi takeout',                  calories: 560, protein_g: 28, carbs_g: 78, fat_g:  8, sugar_g:  6, satiety_score: 0.54, craving: false },

  // ── Jan 29 (Thu) ───────────────────────────────────────────────────
  { date: '2026-01-29', time_hour: 8,  meal: 'Smoothie bowl',                  calories: 420, protein_g: 16, carbs_g: 64, fat_g: 10, sugar_g: 24, satiety_score: 0.56, craving: false },
  { date: '2026-01-29', time_hour: 18, meal: 'Salmon with roasted broccoli',   calories: 520, protein_g: 42, carbs_g: 22, fat_g: 22, sugar_g:  4, satiety_score: 0.82, craving: false },
  { date: '2026-01-29', time_hour: 22, meal: 'Late night chips',               calories: 240, protein_g:  3, carbs_g: 32, fat_g: 12, sugar_g:  2, satiety_score: 0.20, craving: true  },

  // ── Jan 30 (Fri) — Strong week begins ─────────────────────────────
  { date: '2026-01-30', time_hour: 7,  meal: 'Eggs, bacon and spinach',        calories: 480, protein_g: 34, carbs_g: 12, fat_g: 32, sugar_g:  2, satiety_score: 0.84, craving: false },
  { date: '2026-01-30', time_hour: 13, meal: 'Tuna salad sandwich',            calories: 440, protein_g: 32, carbs_g: 38, fat_g: 14, sugar_g:  4, satiety_score: 0.76, craving: false },
  { date: '2026-01-30', time_hour: 19, meal: 'Grilled steak and vegetables',   calories: 580, protein_g: 46, carbs_g: 24, fat_g: 28, sugar_g:  4, satiety_score: 0.82, craving: false },

  // ── Jan 31 (Sat) — Strong week, Saturday social eating ────────────
  { date: '2026-01-31', time_hour: 9,  meal: 'Veggie omelette',                calories: 380, protein_g: 24, carbs_g: 12, fat_g: 22, sugar_g:  2, satiety_score: 0.72, craving: false },
  { date: '2026-01-31', time_hour: 14, meal: 'Lunch out — pasta and wine',     calories: 720, protein_g: 24, carbs_g: 96, fat_g: 22, sugar_g: 20, satiety_score: 0.46, craving: false },
  { date: '2026-01-31', time_hour: 20, meal: 'Burgers and fries (dinner out)', calories: 860, protein_g: 36, carbs_g: 88, fat_g: 42, sugar_g: 24, satiety_score: 0.44, craving: false },
  { date: '2026-01-31', time_hour: 22, meal: 'Dessert — cake slice',           calories: 420, protein_g:  5, carbs_g: 62, fat_g: 18, sugar_g: 48, satiety_score: 0.20, craving: true  },

  // ── Feb 1 (Sun) ────────────────────────────────────────────────────
  { date: '2026-02-01', time_hour: 10, meal: 'Overnight oats with berries',    calories: 360, protein_g: 16, carbs_g: 54, fat_g:  8, sugar_g: 12, satiety_score: 0.62, craving: false },
  { date: '2026-02-01', time_hour: 19, meal: 'Chicken curry with rice',        calories: 620, protein_g: 38, carbs_g: 68, fat_g: 18, sugar_g:  8, satiety_score: 0.72, craving: false },

  // ── Feb 2 (Mon) — Best streak day 1 ───────────────────────────────
  { date: '2026-02-02', time_hour: 7,  meal: 'High-protein oatmeal',           calories: 420, protein_g: 28, carbs_g: 48, fat_g: 10, sugar_g:  8, satiety_score: 0.82, craving: false },
  { date: '2026-02-02', time_hour: 12, meal: 'Grilled chicken rice bowl',      calories: 560, protein_g: 42, carbs_g: 58, fat_g: 12, sugar_g:  4, satiety_score: 0.80, craving: false },
  { date: '2026-02-02', time_hour: 19, meal: 'Baked cod with quinoa',          calories: 480, protein_g: 38, carbs_g: 42, fat_g: 14, sugar_g:  2, satiety_score: 0.82, craving: false },

  // ── Feb 3 (Tue) — Best streak day 2 ───────────────────────────────
  { date: '2026-02-03', time_hour: 7,  meal: 'Scrambled eggs and avocado',     calories: 440, protein_g: 26, carbs_g: 16, fat_g: 32, sugar_g:  2, satiety_score: 0.80, craving: false },
  { date: '2026-02-03', time_hour: 13, meal: 'Greek salad with grilled chicken',calories: 480, protein_g: 38, carbs_g: 20, fat_g: 22, sugar_g:  6, satiety_score: 0.78, craving: false },
  { date: '2026-02-03', time_hour: 19, meal: 'Salmon and asparagus',           calories: 500, protein_g: 44, carbs_g: 14, fat_g: 26, sugar_g:  4, satiety_score: 0.84, craving: false },

  // ── Feb 4 (Wed) — Best streak day 3 ───────────────────────────────
  { date: '2026-02-04', time_hour: 8,  meal: 'Protein shake and banana',       calories: 360, protein_g: 30, carbs_g: 42, fat_g:  6, sugar_g: 16, satiety_score: 0.72, craving: false },
  { date: '2026-02-04', time_hour: 13, meal: 'Turkey and veggie wrap',         calories: 500, protein_g: 36, carbs_g: 46, fat_g: 14, sugar_g:  6, satiety_score: 0.76, craving: false },
  { date: '2026-02-04', time_hour: 19, meal: 'Chicken and sweet potato',       calories: 540, protein_g: 40, carbs_g: 54, fat_g: 12, sugar_g: 10, satiety_score: 0.80, craving: false },

  // ── Feb 5 (Thu) — Best streak day 4 ───────────────────────────────
  { date: '2026-02-05', time_hour: 7,  meal: 'Greek yogurt and berries',       calories: 320, protein_g: 22, carbs_g: 34, fat_g:  8, sugar_g: 18, satiety_score: 0.74, craving: false },
  { date: '2026-02-05', time_hour: 19, meal: 'Lentil soup with crusty bread',  calories: 480, protein_g: 22, carbs_g: 68, fat_g: 10, sugar_g:  6, satiety_score: 0.66, craving: false },

  // ── Feb 6 (Fri) — Bad week 2 begins ───────────────────────────────
  { date: '2026-02-06', time_hour: 8,  meal: 'Cereal with whole milk',         calories: 340, protein_g:  8, carbs_g: 62, fat_g:  6, sugar_g: 24, satiety_score: 0.40, craving: false },
  { date: '2026-02-06', time_hour: 20, meal: 'Frozen pizza (entire box)',       calories: 740, protein_g: 24, carbs_g: 88, fat_g: 30, sugar_g: 14, satiety_score: 0.38, craving: false },
  { date: '2026-02-06', time_hour: 22, meal: 'Chips watching Netflix',         calories: 260, protein_g:  3, carbs_g: 36, fat_g: 12, sugar_g:  2, satiety_score: 0.18, craving: true  },

  // ── Feb 7 (Sat) ────────────────────────────────────────────────────
  { date: '2026-02-07', time_hour: 10, meal: 'Waffles with butter and syrup',  calories: 620, protein_g: 10, carbs_g: 96, fat_g: 20, sugar_g: 50, satiety_score: 0.30, craving: false },
  { date: '2026-02-07', time_hour: 15, meal: 'Brownie (2pm craving)',          calories: 350, protein_g:  4, carbs_g: 52, fat_g: 16, sugar_g: 36, satiety_score: 0.18, craving: true  },
  { date: '2026-02-07', time_hour: 19, meal: 'Takeout Thai noodles',           calories: 760, protein_g: 22, carbs_g: 100, fat_g: 26, sugar_g: 24, satiety_score: 0.44, craving: false },
  { date: '2026-02-07', time_hour: 22, meal: 'Mochi ice cream',               calories: 280, protein_g:  3, carbs_g: 44, fat_g: 10, sugar_g: 34, satiety_score: 0.16, craving: true  },

  // ── Feb 8 (Sun) ────────────────────────────────────────────────────
  { date: '2026-02-08', time_hour: 11, meal: 'Brunch — French toast',         calories: 580, protein_g: 14, carbs_g: 78, fat_g: 22, sugar_g: 28, satiety_score: 0.36, craving: false },
  { date: '2026-02-08', time_hour: 20, meal: 'Pasta with cream sauce',         calories: 680, protein_g: 18, carbs_g: 88, fat_g: 28, sugar_g: 10, satiety_score: 0.40, craving: false },
  { date: '2026-02-08', time_hour: 22, meal: 'Oreos (late night)',             calories: 200, protein_g:  2, carbs_g: 28, fat_g:  8, sugar_g: 16, satiety_score: 0.14, craving: true  },

  // ── Feb 9 (Mon) ────────────────────────────────────────────────────
  { date: '2026-02-09', time_hour: 9,  meal: 'Granola bar (rushed)',           calories: 240, protein_g:  6, carbs_g: 36, fat_g:  8, sugar_g: 18, satiety_score: 0.34, craving: false },
  { date: '2026-02-09', time_hour: 14, meal: 'Vending machine snacks',         calories: 320, protein_g:  5, carbs_g: 48, fat_g: 14, sugar_g: 22, satiety_score: 0.22, craving: true  },
  { date: '2026-02-09', time_hour: 19, meal: 'Delivery pad thai',              calories: 720, protein_g: 24, carbs_g: 92, fat_g: 26, sugar_g: 18, satiety_score: 0.44, craving: false },
  { date: '2026-02-09', time_hour: 22, meal: 'Candy from the pantry',         calories: 180, protein_g:  1, carbs_g: 30, fat_g:  6, sugar_g: 26, satiety_score: 0.12, craving: true  },

  // ── Feb 10 (Tue) ───────────────────────────────────────────────────
  { date: '2026-02-10', time_hour: 8,  meal: 'Toast with jam (no protein)',    calories: 280, protein_g:  6, carbs_g: 52, fat_g:  4, sugar_g: 22, satiety_score: 0.36, craving: false },
  { date: '2026-02-10', time_hour: 13, meal: 'Caesar salad (no chicken)',      calories: 360, protein_g:  8, carbs_g: 22, fat_g: 28, sugar_g:  4, satiety_score: 0.40, craving: false },
  { date: '2026-02-10', time_hour: 21, meal: 'Mac and cheese',                 calories: 600, protein_g: 16, carbs_g: 82, fat_g: 24, sugar_g:  8, satiety_score: 0.38, craving: false },
  { date: '2026-02-10', time_hour: 23, meal: 'Late night snack mix',           calories: 300, protein_g:  6, carbs_g: 38, fat_g: 14, sugar_g: 10, satiety_score: 0.24, craving: true  },

  // ── Feb 11 (Wed) ───────────────────────────────────────────────────
  { date: '2026-02-11', time_hour: 8,  meal: 'Overnight oats',                 calories: 380, protein_g: 14, carbs_g: 56, fat_g: 10, sugar_g: 14, satiety_score: 0.56, craving: false },
  { date: '2026-02-11', time_hour: 19, meal: 'Stir-fry with tofu',             calories: 480, protein_g: 24, carbs_g: 52, fat_g: 16, sugar_g:  8, satiety_score: 0.62, craving: false },

  // ── Feb 12 (Thu) ───────────────────────────────────────────────────
  { date: '2026-02-12', time_hour: 8,  meal: 'Eggs on whole wheat toast',      calories: 400, protein_g: 22, carbs_g: 36, fat_g: 18, sugar_g:  4, satiety_score: 0.70, craving: false },
  { date: '2026-02-12', time_hour: 19, meal: 'Grilled chicken and salad',      calories: 520, protein_g: 44, carbs_g: 18, fat_g: 22, sugar_g:  4, satiety_score: 0.78, craving: false },

  // ── Feb 13 (Fri) — Recovery week ──────────────────────────────────
  { date: '2026-02-13', time_hour: 7,  meal: 'Protein oatmeal with berries',   calories: 420, protein_g: 26, carbs_g: 52, fat_g: 10, sugar_g: 14, satiety_score: 0.78, craving: false },
  { date: '2026-02-13', time_hour: 13, meal: 'Grilled salmon bowl',            calories: 560, protein_g: 40, carbs_g: 48, fat_g: 18, sugar_g:  4, satiety_score: 0.80, craving: false },
  { date: '2026-02-13', time_hour: 19, meal: 'Steak with roasted vegetables',  calories: 600, protein_g: 48, carbs_g: 28, fat_g: 28, sugar_g:  6, satiety_score: 0.82, craving: false },

  // ── Feb 14 (Sat) — Valentine's Day ────────────────────────────────
  { date: '2026-02-14', time_hour: 9,  meal: 'Smoothie and avocado toast',     calories: 380, protein_g: 14, carbs_g: 56, fat_g: 10, sugar_g: 18, satiety_score: 0.52, craving: false },
  { date: '2026-02-14', time_hour: 19, meal: "Valentine's dinner — pasta",     calories: 840, protein_g: 28, carbs_g: 108, fat_g: 28, sugar_g: 26, satiety_score: 0.48, craving: false },
  { date: '2026-02-14', time_hour: 21, meal: 'Chocolate fondue (Valentine)',   calories: 480, protein_g:  6, carbs_g: 68, fat_g: 22, sugar_g: 60, satiety_score: 0.24, craving: true  },

  // ── Feb 15 (Sun) ───────────────────────────────────────────────────
  { date: '2026-02-15', time_hour: 10, meal: 'Avocado toast and poached eggs', calories: 460, protein_g: 22, carbs_g: 40, fat_g: 24, sugar_g:  4, satiety_score: 0.68, craving: false },
  { date: '2026-02-15', time_hour: 15, meal: 'Apple and almond butter',        calories: 280, protein_g:  8, carbs_g: 36, fat_g: 14, sugar_g: 18, satiety_score: 0.58, craving: false },
  { date: '2026-02-15', time_hour: 19, meal: 'Homemade chicken chili',         calories: 540, protein_g: 34, carbs_g: 58, fat_g: 16, sugar_g:  8, satiety_score: 0.72, craving: false },

  // ── Feb 16 (Mon) ───────────────────────────────────────────────────
  { date: '2026-02-16', time_hour: 7,  meal: 'Protein oatmeal',                calories: 420, protein_g: 28, carbs_g: 48, fat_g: 10, sugar_g:  8, satiety_score: 0.82, craving: false },
  { date: '2026-02-16', time_hour: 12, meal: 'Chicken and veggie bowl',        calories: 540, protein_g: 42, carbs_g: 52, fat_g: 14, sugar_g:  6, satiety_score: 0.80, craving: false },
  { date: '2026-02-16', time_hour: 19, meal: 'Baked salmon with quinoa',       calories: 520, protein_g: 42, carbs_g: 44, fat_g: 18, sugar_g:  4, satiety_score: 0.82, craving: false },

  // ── Feb 17 (Tue) ───────────────────────────────────────────────────
  { date: '2026-02-17', time_hour: 7,  meal: 'Scrambled eggs and spinach',     calories: 400, protein_g: 26, carbs_g: 10, fat_g: 28, sugar_g:  2, satiety_score: 0.80, craving: false },
  { date: '2026-02-17', time_hour: 13, meal: 'Turkey sandwich on rye',         calories: 460, protein_g: 32, carbs_g: 44, fat_g: 14, sugar_g:  6, satiety_score: 0.74, craving: false },
  { date: '2026-02-17', time_hour: 19, meal: 'Grilled shrimp tacos',           calories: 560, protein_g: 34, carbs_g: 58, fat_g: 16, sugar_g:  6, satiety_score: 0.74, craving: false },

  // ── Feb 18 (Wed) ───────────────────────────────────────────────────
  { date: '2026-02-18', time_hour: 8,  meal: 'Greek yogurt bowl with honey',   calories: 360, protein_g: 24, carbs_g: 38, fat_g:  8, sugar_g: 16, satiety_score: 0.76, craving: false },
  { date: '2026-02-18', time_hour: 12, meal: 'Lentil and veggie soup',         calories: 420, protein_g: 22, carbs_g: 58, fat_g: 10, sugar_g:  8, satiety_score: 0.68, craving: false },
  { date: '2026-02-18', time_hour: 20, meal: 'Chicken stir-fry',               calories: 520, protein_g: 38, carbs_g: 48, fat_g: 16, sugar_g:  6, satiety_score: 0.76, craving: false },
  { date: '2026-02-18', time_hour: 22, meal: 'Small bowl of mixed nuts',       calories: 180, protein_g:  6, carbs_g:  8, fat_g: 16, sugar_g:  2, satiety_score: 0.48, craving: false },

  // ── Feb 19 (Thu) ───────────────────────────────────────────────────
  { date: '2026-02-19', time_hour: 7,  meal: 'Avocado and egg on toast',       calories: 440, protein_g: 22, carbs_g: 36, fat_g: 26, sugar_g:  2, satiety_score: 0.78, craving: false },
  { date: '2026-02-19', time_hour: 13, meal: 'Burrito bowl (no sour cream)',   calories: 580, protein_g: 38, carbs_g: 66, fat_g: 14, sugar_g:  6, satiety_score: 0.76, craving: false },
  { date: '2026-02-19', time_hour: 19, meal: 'Pan-seared cod with veggies',    calories: 480, protein_g: 40, carbs_g: 28, fat_g: 16, sugar_g:  4, satiety_score: 0.80, craving: false },

  // ── Feb 20 (Fri) — Current week ───────────────────────────────────
  { date: '2026-02-20', time_hour: 7,  meal: 'Protein smoothie',               calories: 400, protein_g: 30, carbs_g: 44, fat_g:  8, sugar_g: 16, satiety_score: 0.76, craving: false },
  { date: '2026-02-20', time_hour: 13, meal: 'Chicken Caesar wrap',            calories: 520, protein_g: 36, carbs_g: 46, fat_g: 18, sugar_g:  4, satiety_score: 0.74, craving: false },
  { date: '2026-02-20', time_hour: 19, meal: 'Pasta carbonara (Friday treat)', calories: 660, protein_g: 28, carbs_g: 82, fat_g: 26, sugar_g:  6, satiety_score: 0.50, craving: false },
  { date: '2026-02-20', time_hour: 22, meal: 'Trail mix (late night)',         calories: 220, protein_g:  7, carbs_g: 26, fat_g: 12, sugar_g: 10, satiety_score: 0.38, craving: true  },

  // ── Feb 21 (Sat) ───────────────────────────────────────────────────
  { date: '2026-02-21', time_hour: 10, meal: 'Eggs Benedict',                  calories: 580, protein_g: 24, carbs_g: 42, fat_g: 34, sugar_g:  4, satiety_score: 0.58, craving: false },
  { date: '2026-02-21', time_hour: 15, meal: 'Bakery cookie (afternoon)',      calories: 320, protein_g:  4, carbs_g: 46, fat_g: 14, sugar_g: 28, satiety_score: 0.22, craving: true  },
  { date: '2026-02-21', time_hour: 19, meal: 'Dinner out — steak and fries',  calories: 880, protein_g: 44, carbs_g: 72, fat_g: 48, sugar_g:  8, satiety_score: 0.56, craving: false },
  { date: '2026-02-21', time_hour: 22, meal: 'Cheesecake slice (dessert)',     calories: 440, protein_g:  7, carbs_g: 56, fat_g: 22, sugar_g: 44, satiety_score: 0.26, craving: true  },

  // ── Feb 22 (Sun — today) ──────────────────────────────────────────
  { date: '2026-02-22', time_hour: 10, meal: 'Bagel and lox',                  calories: 480, protein_g: 26, carbs_g: 52, fat_g: 16, sugar_g:  4, satiety_score: 0.64, craving: false },
  { date: '2026-02-22', time_hour: 15, meal: 'Protein bar',                    calories: 240, protein_g: 20, carbs_g: 26, fat_g:  8, sugar_g: 12, satiety_score: 0.58, craving: false },
];
