// Nutrition Calculator Engine
// weGogym Smart Dynamic Nutrition & Macro Calculator

'use strict';

// Default profile values
const DEFAULT_PROFILE = {
  age: 26,
  sex: 'male',
  heightCm: 178,
  currentWeightKg: 75,
  activityLevel: 'moderately_active',
  fitnessGoal: 'maintenance',
  proteinFactor: 2.0,
  fatFactor: 0.8
};

// Activity multipliers
const ACTIVITY_MULTIPLIERS = {
  sedentary: 1.2,
  lightly_active: 1.375,
  moderately_active: 1.55,
  very_active: 1.725,
  extremely_active: 1.9
};

// Goal calorie adjustments (percentage points)
const GOAL_CALORIE_ADJUSTMENT = {
  muscle_building: 7,
  fat_loss: -15,
  maintenance: 0,
  strength: 3,
  endurance: 0
};

// Protein ranges (g/kg) by goal
const PROTEIN_RANGES = {
  muscle_building: { min: 1.6, max: 2.2, default: 2.0 },
  fat_loss: { min: 1.8, max: 2.2, default: 2.0 },
  maintenance: { min: 1.2, max: 1.6, default: 1.4 },
  strength: { min: 1.6, max: 2.0, default: 1.8 },
  endurance: { min: 1.2, max: 1.8, default: 1.6 }
};

// Fat ranges (g/kg)
const FAT_RANGES = {
  min: 0.6,
  max: 1.0,
  default: 0.8
};

const MIN_CARBS_G = 50;
const CALORIE_TOLERANCE = 50;

// Maps the app's goal labels (and calculator keys) to a calculator goal key.
// Unknown goals fall back to maintenance instead of throwing.
const GOAL_KEY_MAP = {
  'muscle growth': 'muscle_building',
  'muscle_building': 'muscle_building',
  'strength': 'strength',
  'fat loss': 'fat_loss',
  'fat_loss': 'fat_loss',
  'endurance': 'endurance',
  'calisthenics': 'strength',
  'maintenance': 'maintenance'
};

function normalizeGoal(goal) {
  const key = String(goal || '').trim().toLowerCase();
  return GOAL_KEY_MAP[key] || 'maintenance';
}

// Calculate BMR using Mifflin-St Jeor equation
function calculateBMR(weightKg, heightCm, age, sex) {
  const sexConstant = sex === 'female' ? -161 : 5;
  return (10 * weightKg) + (6.25 * heightCm) - (5 * age) + sexConstant;
}

// Calculate TDEE
function calculateTDEE(bmr, activityLevel) {
  const multiplier = ACTIVITY_MULTIPLIERS[activityLevel] || ACTIVITY_MULTIPLIERS.moderately_active;
  return bmr * multiplier;
}

// Calculate daily calories with goal adjustment
function calculateDailyCalories(tdee, goalKey) {
  const adjustment = GOAL_CALORIE_ADJUSTMENT[goalKey] || 0;
  return Math.round(tdee * (1 + adjustment / 100));
}

// Use the custom protein factor when it is a finite number inside the goal's range
function resolveProteinFactor(goalKey, customFactor) {
  const range = PROTEIN_RANGES[goalKey] || PROTEIN_RANGES.maintenance;
  if (Number.isFinite(customFactor) && customFactor >= range.min && customFactor <= range.max) {
    return customFactor;
  }
  return range.default;
}

// Clamp the fat factor to the allowed range; use the default when missing
function resolveFatFactor(customFactor) {
  if (!Number.isFinite(customFactor)) return FAT_RANGES.default;
  return Math.min(Math.max(customFactor, FAT_RANGES.min), FAT_RANGES.max);
}

function calculateProtein(weightKg, factor) {
  return Math.round(weightKg * factor);
}

function calculateFat(weightKg, factor) {
  return Math.round(weightKg * factor);
}

// Carbs fill the remaining calories after protein and fat (4 kcal/g carbs)
function calculateCarbs(dailyCalories, proteinG, fatG) {
  const remainingKcal = dailyCalories - (proteinG * 4) - (fatG * 9);
  return Math.round(remainingKcal / 4);
}

// Plausible human ranges. Values outside these are almost always typos,
// and they would otherwise produce negative macros.
const VALID_RANGES = {
  age: { min: 10, max: 100 },
  heightCm: { min: 100, max: 250 },
  currentWeightKg: { min: 25, max: 300 }
};

// Conservative floors below which a target should be reviewed by a professional.
const SAFE_CALORIE_FLOOR = { female: 1200, male: 1500 };

function inRange(value, range) {
  return Number.isFinite(value) && value >= range.min && value <= range.max;
}

// Main nutrition calculation function.
// The calorie target is never silently replaced. If macro minimums cannot fit
// inside it, the result says so via isWithinTolerance and a warning.
function calculateNutrition(profile = {}) {
  const sex = profile.sex === 'female' ? 'female' : 'male';
  const age = Number(profile.age);
  const heightCm = Number(profile.heightCm);
  const weightKg = Number(profile.currentWeightKg);

  if (!age || !heightCm || !weightKg) {
    return { error: 'profile_incomplete', message: 'Complete your profile to generate personalized nutrition targets.' };
  }
  if (!inRange(age, VALID_RANGES.age) || !inRange(heightCm, VALID_RANGES.heightCm) || !inRange(weightKg, VALID_RANGES.currentWeightKg)) {
    return { error: 'profile_out_of_range', message: 'Please check your age, height and weight.' };
  }

  const goalKey = normalizeGoal(profile.fitnessGoal);
  const activity = ACTIVITY_MULTIPLIERS[profile.activityLevel] ? profile.activityLevel : DEFAULT_PROFILE.activityLevel;

  const bmr = calculateBMR(weightKg, heightCm, age, sex);
  const tdee = calculateTDEE(bmr, activity);
  const dailyCalories = calculateDailyCalories(tdee, goalKey);

  const usedProteinFactor = resolveProteinFactor(goalKey, profile.proteinFactor);
  const usedFatFactor = resolveFatFactor(profile.fatFactor);

  let protein = calculateProtein(weightKg, usedProteinFactor);
  let fat = calculateFat(weightKg, usedFatFactor);
  let carbs = calculateCarbs(dailyCalories, protein, fat);
  const warnings = [];

  // Step 1: if carbs fall below the floor, drop fat to its minimum.
  if (carbs < MIN_CARBS_G) {
    fat = calculateFat(weightKg, FAT_RANGES.min);
    carbs = calculateCarbs(dailyCalories, protein, fat);
  }

  // Step 2: still short, so reduce protein toward its goal minimum (never below it).
  if (carbs < MIN_CARBS_G) {
    const minProtein = calculateProtein(weightKg, PROTEIN_RANGES[goalKey].min);
    if (minProtein < protein) {
      protein = minProtein;
      carbs = calculateCarbs(dailyCalories, protein, fat);
    }
  }

  // Step 3: the floor still cannot fit. Keep the target, enforce the carb floor, and flag the mismatch.
  if (carbs < MIN_CARBS_G) {
    carbs = MIN_CARBS_G;
    warnings.push('carb_floor_exceeds_target');
  }

  const macroCalories = protein * 4 + fat * 9 + carbs * 4;
  const isWithinTolerance = Math.abs(macroCalories - dailyCalories) <= CALORIE_TOLERANCE;
  if (!isWithinTolerance && !warnings.includes('carb_floor_exceeds_target')) warnings.push('macros_do_not_match_target');

  const safeFloor = SAFE_CALORIE_FLOOR[sex];
  if (dailyCalories < safeFloor) warnings.push('below_safe_calorie_floor');

  return {
    bmr: Math.round(bmr),
    tdee: Math.round(tdee),
    dailyCalories,                 // the target the user asked for, never silently replaced
    macroCalories: Math.round(macroCalories),
    calorieAdjustment: GOAL_CALORIE_ADJUSTMENT[goalKey] || 0,
    goalKey,
    protein,
    proteinFactor: usedProteinFactor,
    carbs,
    fat,
    fatFactor: usedFatFactor,
    isWithinTolerance,
    warnings,
    profileVersion: 2
  };
}

// Export for use by other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    calculateNutrition, calculateBMR, calculateTDEE, calculateDailyCalories,
    calculateProtein, calculateFat, calculateCarbs, normalizeGoal
  };
} else {
  window.wegogymNutrition = { calculateNutrition, normalizeGoal };
}
