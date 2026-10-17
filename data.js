// ============================================================
//  All plan content lives here. Edit freely.
// ============================================================

const APP_NAME = "UcheFit";

// ---------- Weekly schedule (0 = Sunday) ----------
const WEEK = {
  0: { label: "Sunday",    shift: "Work 7am–7pm", workout: null,     note: "Long shift. Your steps at the door are today's training. Eat on schedule." },
  1: { label: "Monday",    shift: "Work 7am–7pm", workout: null,     note: "Long shift. Rest day for the gym. Stick to the packed meals." },
  2: { label: "Tuesday",   shift: "Off",          workout: "upperA", note: "Training day. Train in the morning, eat lunch after." },
  3: { label: "Wednesday", shift: "Off",          workout: "lowerA", note: "Training day. Batch-cook beans and pepper soup tonight." },
  4: { label: "Thursday",  shift: "Off",          workout: "walk",   note: "Recovery. A brisk 40-minute walk is your session." },
  5: { label: "Friday",    shift: "Off",          workout: "upperB", note: "Training day." },
  6: { label: "Saturday",  shift: "Off",          workout: "lowerB", note: "Training day. Cook for Sunday and Monday tonight (big pot)." },
};

// ---------- Workouts ----------
// Each exercise: gym version / home version (no-gym, cheap kit)
const WORKOUTS = {
  upperA: {
    name: "Upper A — Chest & Back",
    mins: 55,
    exercises: [
      { gym: "Bench press",               home: "Push-ups (feet raised when easy)",  sets: 4, reps: "6–10",  rest: "2 min" },
      { gym: "Chest-supported row",        home: "Backpack row (books in bag)",       sets: 4, reps: "8–12",  rest: "90 s" },
      { gym: "Overhead press (dumbbell)",  home: "Pike push-ups",                     sets: 3, reps: "8–12",  rest: "90 s" },
      { gym: "Lat pulldown",               home: "Door-frame / table rows",           sets: 3, reps: "10–12", rest: "90 s" },
      { gym: "Lateral raises",             home: "Lateral raises with water bottles", sets: 4, reps: "12–20", rest: "60 s" },
      { gym: "Triceps pushdown",           home: "Chair dips",                        sets: 2, reps: "10–15", rest: "60 s" },
      { gym: "Dumbbell curls",             home: "Backpack curls",                    sets: 2, reps: "10–15", rest: "60 s" },
    ],
  },
  lowerA: {
    name: "Lower A — Squat focus",
    mins: 50,
    exercises: [
      { gym: "Squat / leg press",          home: "Backpack goblet squat",             sets: 4, reps: "6–10",  rest: "2 min" },
      { gym: "Romanian deadlift",          home: "Single-leg RDL (backpack)",         sets: 3, reps: "8–12",  rest: "90 s" },
      { gym: "Walking lunges",             home: "Walking lunges",                    sets: 3, reps: "10/leg", rest: "90 s" },
      { gym: "Calf raises",                home: "Single-leg calf raises on a step",  sets: 3, reps: "12–20", rest: "60 s" },
      { gym: "Plank",                      home: "Plank",                             sets: 3, reps: "30–60 s", rest: "60 s" },
    ],
  },
  upperB: {
    name: "Upper B — Shoulders & Width",
    mins: 55,
    exercises: [
      { gym: "Incline dumbbell press",     home: "Decline push-ups (feet on bed)",    sets: 4, reps: "8–12",  rest: "90 s" },
      { gym: "Pull-ups (assisted if needed)", home: "Door-frame rows / towel rows",   sets: 4, reps: "6–10",  rest: "2 min" },
      { gym: "Seated cable row",           home: "Backpack row",                      sets: 3, reps: "10–12", rest: "90 s" },
      { gym: "Lateral raises",             home: "Lateral raises with water bottles", sets: 4, reps: "12–20", rest: "60 s" },
      { gym: "Face pulls",                 home: "Floor Y-T-W raises",                sets: 3, reps: "12–15", rest: "60 s" },
      { gym: "Hammer curls + overhead triceps", home: "Backpack curls + diamond push-ups", sets: 2, reps: "10–15", rest: "60 s" },
    ],
  },
  lowerB: {
    name: "Lower B — Hinge focus",
    mins: 50,
    exercises: [
      { gym: "Trap-bar / regular deadlift", home: "Backpack hip hinge / good morning", sets: 4, reps: "5–8",  rest: "2 min" },
      { gym: "Bulgarian split squat",      home: "Bulgarian split squat (bed/chair)", sets: 3, reps: "8–12/leg", rest: "90 s" },
      { gym: "Leg curl",                   home: "Glute bridge / single-leg bridge",  sets: 3, reps: "10–15", rest: "60 s" },
      { gym: "Hanging knee raises",        home: "Lying leg raises",                  sets: 3, reps: "10–15", rest: "60 s" },
      { gym: "Farmer's carry",             home: "Shopping-bag carry (filled)",       sets: 3, reps: "40 m",  rest: "60 s" },
    ],
  },
  walk: {
    name: "Recovery walk",
    mins: 40,
    exercises: [
      { gym: "Brisk walk (park or treadmill)", home: "Brisk walk outside", sets: 1, reps: "40 min", rest: "—" },
      { gym: "Hip & chest stretches",          home: "Hip & chest stretches", sets: 1, reps: "10 min", rest: "—" },
    ],
  },
};

const TRAINING_RULES = [
  "Add one rep or a little weight each week. When you hit the top of the rep range for all sets, go heavier.",
  "Leave 1–2 reps in the tank on most sets. Form first.",
  "Short on time or after a shift? Do only the first 3 exercises (about 30 min). That still counts.",
  "Missed a day? Do the next workout in the list. Don't try to cram two in one day.",
  "Aim for 8–10k steps on off-days. Shift days usually cover it.",
];

// ---------- Meals ----------
// kcal and protein (g) are estimates per portion.
const MEALS = {
  0: [ // Sunday — shift 7–7
    { time: "6:15",  name: "Breakfast before work", food: "3 boiled eggs + 2 slices wholemeal bread + tea", kcal: 390, p: 27 },
    { time: "12:30", name: "Packed lunch",          food: "Jollof rice (1½ cups cooked) + 2 chicken thighs (skin off) + cabbage/coleslaw", kcal: 730, p: 45 },
    { time: "16:00", name: "Break snack",           food: "Banana + small handful of peanuts (25 g)", kcal: 255, p: 7 },
    { time: "20:00", name: "Dinner",                food: "Egusi soup (1 cup, go light on oil) + mackerel + 1 fist-size wrap of poundo", kcal: 750, p: 33 },
    { time: "21:30", name: "Last food of the day",  food: "High-protein yoghurt (200 g)", kcal: 110, p: 20 },
  ],
  1: [ // Monday — shift 7–7
    { time: "6:15",  name: "Breakfast before work", food: "Oats (60 g) with milk + banana, 2 boiled eggs on the side", kcal: 600, p: 30 },
    { time: "12:30", name: "Packed lunch",          food: "Rice (1½ cups) + stew + 2 chicken thighs (Saturday's cook)", kcal: 780, p: 44 },
    { time: "16:00", name: "Break snack",           food: "2 boiled eggs + apple", kcal: 220, p: 12 },
    { time: "20:00", name: "Dinner",                food: "Chicken or fish pepper soup + 2 slices boiled yam", kcal: 550, p: 39 },
    { time: "21:30", name: "Last food of the day",  food: "High-protein yoghurt (200 g)", kcal: 110, p: 20 },
  ],
  2: [ // Tuesday — Upper A
    { time: "8:30",  name: "Breakfast",             food: "Egg sauce (3 eggs, tomato, onion, 1 tsp oil) + 2 slices wholemeal bread", kcal: 430, p: 26 },
    { time: "11:30", name: "After gym",             food: "High-protein yoghurt + banana", kcal: 215, p: 21 },
    { time: "14:00", name: "Lunch",                 food: "Beans/ewa (1½ cups) + boiled plantain + 1 tin sardines", kcal: 820, p: 40 },
    { time: "19:30", name: "Dinner",                food: "Rice (1 cup) + stew + 2 chicken thighs + steamed veg", kcal: 710, p: 40 },
    { time: "21:30", name: "If hungry",             food: "2 boiled eggs + tea", kcal: 140, p: 12 },
  ],
  3: [ // Wednesday — Lower A
    { time: "8:30",  name: "Breakfast",             food: "Oats with milk + 1 tbsp peanut butter, 2 boiled eggs", kcal: 590, p: 31 },
    { time: "13:30", name: "Lunch",                 food: "Jollof spaghetti (1½ cups) + tinned mackerel + veg", kcal: 670, p: 32 },
    { time: "16:30", name: "Snack",                 food: "1 wrap moi moi (or 2 boiled eggs)", kcal: 200, p: 12 },
    { time: "19:30", name: "Dinner",                food: "Okra soup with fish + 1 fist-size wrap of poundo/eba", kcal: 550, p: 37 },
    { time: "21:30", name: "Last food of the day",  food: "High-protein yoghurt (200 g)", kcal: 110, p: 20 },
  ],
  4: [ // Thursday — walk
    { time: "8:30",  name: "Breakfast",             food: "3 boiled eggs + 2 slices wholemeal bread", kcal: 370, p: 26 },
    { time: "13:30", name: "Lunch",                 food: "Rice and beans (1½ cups) + stew + 1 chicken thigh", kcal: 775, p: 42 },
    { time: "16:30", name: "Snack",                 food: "High-protein yoghurt + banana", kcal: 215, p: 21 },
    { time: "19:30", name: "Dinner",                food: "Egusi soup + fish + 1 fist-size wrap of poundo", kcal: 750, p: 33 },
    { time: "21:30", name: "If hungry",             food: "2 boiled eggs + tea", kcal: 140, p: 12 },
  ],
  5: [ // Friday — Upper B
    { time: "8:30",  name: "Breakfast",             food: "Oats with milk + banana, 2 boiled eggs", kcal: 600, p: 30 },
    { time: "11:30", name: "After gym",             food: "High-protein yoghurt (200 g)", kcal: 110, p: 20 },
    { time: "14:00", name: "Lunch",                 food: "Jollof rice + 2 chicken thighs + coleslaw", kcal: 730, p: 45 },
    { time: "19:30", name: "Dinner",                food: "Yam porridge (asaro, 1½ cups) + fish", kcal: 650, p: 25 },
    { time: "21:30", name: "If hungry",             food: "2 boiled eggs + tea", kcal: 140, p: 12 },
  ],
  6: [ // Saturday — Lower B + cook day
    { time: "8:30",  name: "Breakfast",             food: "Egg sauce + 2 slices wholemeal bread", kcal: 430, p: 26 },
    { time: "11:30", name: "After gym",             food: "High-protein yoghurt + banana", kcal: 215, p: 21 },
    { time: "14:00", name: "Lunch",                 food: "Beans + boiled plantain + 1 tin sardines", kcal: 820, p: 40 },
    { time: "19:30", name: "Dinner",                food: "Chicken pepper soup + 2 slices boiled yam", kcal: 550, p: 39 },
    { time: "21:30", name: "If hungry",             food: "2 boiled eggs + tea", kcal: 140, p: 12 },
  ],
};

const PORTIONS = [
  ["Rice / spaghetti", "1–1½ cups cooked (about your two cupped hands)"],
  ["Poundo / eba / semo", "One fist-size wrap. Not two."],
  ["Soup / stew", "1 cup. Skim the oil off the top of the pot."],
  ["Chicken / fish", "Palm-size pieces, 2 per meal. Take skin off chicken."],
  ["Oil", "1–2 tbsp for the whole pot of stew, not per plate."],
  ["Bread", "2 slices wholemeal, at breakfast only."],
];

const NIGHT_RULES = [
  "Kitchen closes at 9:30pm (10:45pm on late-shift nights). After that, only water, tea or caffeine-free Zero Coke.",
  "Bread has moved to breakfast. Don't keep it out on the counter; keep it in the freezer and toast 2 slices in the morning.",
  "Coke Zero has caffeine. After 7pm switch to the caffeine-free version so you sleep better.",
  "Hungry at night? First drink a big glass of water and wait 10 minutes. Still hungry: 2 boiled eggs or yoghurt.",
  "Don't skip breakfast. Skipping it is a big reason the night cravings hit so hard.",
];

// Approximate weekly shop (Lidl/Aldi + African food shop). Prices vary; check in store.
const SHOPPING = [
  { item: "Eggs (30)",                      cost: 5.50, where: "Lidl/Aldi" },
  { item: "Chicken thighs (2 kg)",           cost: 7.00, where: "Lidl/Aldi" },
  { item: "Frozen mackerel / fish",          cost: 3.50, where: "African shop" },
  { item: "Tinned sardines/mackerel (4)",    cost: 3.00, where: "Lidl/Aldi" },
  { item: "High-protein yoghurt (7 pots or big tubs)", cost: 5.00, where: "Lidl/Aldi" },
  { item: "Milk (4 pints)",                  cost: 1.60, where: "Lidl/Aldi" },
  { item: "Porridge oats (1 kg)",            cost: 1.00, where: "Lidl/Aldi" },
  { item: "Wholemeal bread (1 loaf)",        cost: 0.80, where: "Lidl/Aldi" },
  { item: "Bananas + apples",                cost: 2.50, where: "Lidl/Aldi" },
  { item: "Tomatoes, peppers, onions (tins ok)", cost: 3.50, where: "Lidl/Aldi" },
  { item: "Cabbage, okra, frozen veg",       cost: 2.50, where: "Lidl/Aldi" },
  { item: "Plantain (3) + yam (small)",      cost: 3.50, where: "African shop" },
  { item: "Beans (share of 2 kg bag)",       cost: 1.00, where: "African shop" },
  { item: "Rice (share of 5 kg bag)",        cost: 1.50, where: "Lidl/Aldi" },
  { item: "Poundo / egusi (share of bags)",  cost: 2.50, where: "African shop" },
  { item: "Peanuts / peanut butter",         cost: 1.00, where: "Lidl/Aldi" },
];

const COOK_PLAN = [
  ["Saturday evening", "Big pot of stew + jollof rice + chicken thighs + egusi. Covers Sun & Mon lunches/dinners. Pack into containers."],
  ["Wednesday evening", "Pot of beans + pepper soup. Covers Thu–Sat lunches and Sat dinner."],
  ["Every morning", "Boil 4–6 eggs at once. Keep in the fridge for snacks."],
];
