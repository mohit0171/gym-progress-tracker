(function (global) {
  'use strict';

  const GOAL_TEMPLATES = {
    'fat-loss': {
      label: 'Fat Loss & Conditioning',
      description: 'Full-body strength + cardio to raise calorie expenditure while preserving muscle.',
      weeks: [
        [
          { label: 'Full-Body Strength + Cardio', focus: 'Full body',
            exercises: [
              { id: 'goblet-squat', sets: 3, repMin: 10, repMax: 15, restSec: 60 },
              { id: 'dumbbell-bench-press', sets: 3, repMin: 10, repMax: 15, restSec: 60 },
              { id: 'lat-pulldown', sets: 3, repMin: 10, repMax: 15, restSec: 60 },
              { id: 'dumbbell-romanian-deadlift', sets: 3, repMin: 10, repMax: 15, restSec: 60 },
              { id: 'plank', sets: 3, repMin: 30, repMax: 45, restSec: 30 },
              { id: 'incline-treadmill-walk', durationMin: 15, intensity: 'moderate' }
            ]
          },
          { label: 'Cardio', focus: 'Cardio',
            exercises: [
              { id: 'stationary-cycling', durationMin: 20, intensity: 'moderate' },
              { id: 'brisk-walking', durationMin: 10, intensity: 'moderate' },
              { id: 'dead-bug', sets: 3, repMin: 10, repMax: 15, restSec: 30 }
            ]
          },
          { label: 'Full-Body Conditioning', focus: 'Full body',
            exercises: [
              { id: 'leg-press', sets: 3, repMin: 12, repMax: 18, restSec: 60 },
              { id: 'seated-cable-row', sets: 3, repMin: 12, repMax: 18, restSec: 60 },
              { id: 'incline-dumbbell-press', sets: 3, repMin: 12, repMax: 18, restSec: 60 },
              { id: 'dumbbell-lunge', sets: 3, repMin: 10, repMax: 15, restSec: 60 },
              { id: 'farmers-carry', durationMin: 30, intensity: 'light' },
              { id: 'elliptical-trainer', durationMin: 10, intensity: 'light' }
            ]
          },
          { label: 'Moderate Cardio + Recovery', focus: 'Recovery',
            exercises: [
              { id: 'incline-treadmill-walk', durationMin: 25, intensity: 'light' },
              { id: 'easy-cycling', durationMin: 10, intensity: 'light' },
              { id: 'mobility-exercises', durationMin: 10, intensity: 'light' }
            ]
          },
          { label: 'Full-Body Strength + Cardio', focus: 'Full body',
            exercises: [
              { id: 'squat', sets: 3, repMin: 8, repMax: 12, restSec: 60 },
              { id: 'machine-chest-press', sets: 3, repMin: 12, repMax: 18, restSec: 60 },
              { id: 'lat-pulldown', sets: 3, repMin: 12, repMax: 18, restSec: 60 },
              { id: 'hip-thrust', sets: 3, repMin: 10, repMax: 15, restSec: 60 },
              { id: 'cable-crunch', sets: 3, repMin: 15, repMax: 20, restSec: 30 },
              { id: 'rowing-machine', durationMin: 10, intensity: 'moderate' }
            ]
          },
          { label: 'Optional Cardio', focus: 'Cardio',
            exercises: [
              { id: 'outdoor-walking', durationMin: 30, intensity: 'manageable' },
              { id: 'outdoor-cycling', durationMin: 30, intensity: 'manageable' },
              { id: 'swimming', durationMin: 30, intensity: 'manageable' },
              { id: 'elliptical-trainer', durationMin: 30, intensity: 'manageable' }
            ]
          },
          { label: 'Rest', focus: 'Rest', exercises: [] }
        ]
      ]
    },
    endurance: {
      label: 'Endurance',
      description: 'Aerobic capacity, stamina, pacing and recovery.',
      weeks: [
        [
          { label: 'Easy Aerobic Cardio', focus: 'Cardio',
            exercises: [
              { id: 'steady-state-running', durationMin: 20, intensity: 'easy' },
              { id: 'plank', sets: 3, repMin: 30, repMax: 45, restSec: 30 },
              { id: 'bodyweight-squats', sets: 3, repMin: 15, repMax: 20, restSec: 30 }
            ]
          },
          { label: 'Cycling Endurance', focus: 'Cardio',
            exercises: [
              { id: 'stationary-cycling', durationMin: 30, intensity: 'moderate' },
              { id: 'farmers-carry', durationMin: 30, intensity: 'light' },
              { id: 'dead-bug', sets: 3, repMin: 10, repMax: 15, restSec: 30 }
            ]
          },
          { label: 'Strength Endurance', focus: 'Strength endurance',
            exercises: [
              { id: 'goblet-squats', sets: 3, repMin: 15, repMax: 20, restSec: 45 },
              { id: 'push-ups', sets: 3, repMin: 12, repMax: 20, restSec: 45 },
              { id: 'seated-cable-row', sets: 3, repMin: 12, repMax: 18, restSec: 60 },
              { id: 'dumbbell-lunge', sets: 3, repMin: 12, repMax: 18, restSec: 45 },
              { id: 'battle-ropes', durationMin: 5, intensity: 'moderate' }
            ]
          },
          { label: 'Recovery Cardio', focus: 'Recovery',
            exercises: [
              { id: 'brisk-walking', durationMin: 20, intensity: 'easy' },
              { id: 'easy-cycling', durationMin: 20, intensity: 'easy' },
              { id: 'mobility-exercises', durationMin: 10, intensity: 'light' }
            ]
          },
          { label: 'Cardio Intervals', focus: 'Cardio',
            exercises: [
              { id: 'warm-up', durationMin: 5, intensity: 'easy' },
              { id: 'interval-running', durationMin: 20, intensity: 'intervals' },
              { id: 'interval-cycling', durationMin: 20, intensity: 'intervals' },
              { id: 'cool-down', durationMin: 5, intensity: 'easy' }
            ]
          },
          { label: 'Longer Aerobic Session', focus: 'Cardio',
            exercises: [
              { id: 'running', durationMin: 35, intensity: 'conversational' },
              { id: 'cycling', durationMin: 35, intensity: 'conversational' },
              { id: 'swimming', durationMin: 35, intensity: 'conversational' },
              { id: 'rowing-machine', durationMin: 35, intensity: 'conversational' }
            ]
          },
          { label: 'Rest', focus: 'Rest', exercises: [] }
        ]
      ]
    },
    hypertrophy: {
      label: 'Muscle Building (Hypertrophy)',
      description: 'Progressive overload, sufficient training volume and recovery.',
      weeks: [
        [
          { label: 'Push A', focus: 'Push',
            exercises: [
              { id: 'barbell-bench-press', sets: 4, repMin: 6, repMax: 10, restSec: 90 },
              { id: 'incline-dumbbell-press', sets: 3, repMin: 8, repMax: 12, restSec: 75 },
              { id: 'seated-dumbbell-shoulder-press', sets: 3, repMin: 8, repMax: 12, restSec: 75 },
              { id: 'dumbbell-lateral-raise', sets: 3, repMin: 12, repMax: 20, restSec: 60 },
              { id: 'cable-triceps-pushdown', sets: 3, repMin: 10, repMax: 15, restSec: 60 }
            ]
          },
          { label: 'Pull A', focus: 'Pull',
            exercises: [
              { id: 'lat-pulldown', sets: 4, repMin: 6, repMax: 10, restSec: 90 },
              { id: 'chest-supported-row', sets: 3, repMin: 8, repMax: 12, restSec: 75 },
              { id: 'seated-cable-row', sets: 3, repMin: 8, repMax: 12, restSec: 75 },
              { id: 'reverse-pec-deck', sets: 3, repMin: 12, repMax: 20, restSec: 60 },
              { id: 'incline-dumbbell-curl', sets: 3, repMin: 10, repMax: 15, restSec: 60 },
              { id: 'hammer-curl', sets: 3, repMin: 10, repMax: 15, restSec: 60 }
            ]
          },
          { label: 'Legs A', focus: 'Legs',
            exercises: [
              { id: 'barbell-back-squat', sets: 4, repMin: 6, repMax: 10, restSec: 120 },
              { id: 'romanian-deadlift', sets: 3, repMin: 8, repMax: 12, restSec: 90 },
              { id: 'leg-press', sets: 3, repMin: 10, repMax: 15, restSec: 75 },
              { id: 'seated-leg-curl', sets: 3, repMin: 10, repMax: 15, restSec: 60 },
              { id: 'standing-calf-raise', sets: 4, repMin: 10, repMax: 15, restSec: 60 },
              { id: 'cable-crunch', sets: 3, repMin: 15, repMax: 20, restSec: 30 }
            ]
          },
          { label: 'Push B', focus: 'Push',
            exercises: [
              { id: 'incline-barbbell-bench-press', sets: 4, repMin: 6, repMax: 10, restSec: 90 },
              { id: 'machine-chest-press', sets: 3, repMin: 8, repMax: 12, restSec: 75 },
              { id: 'cable-lateral-raise', sets: 3, repMin: 12, repMax: 20, restSec: 60 },
              { id: 'rear-delt-fly', sets: 3, repMin: 12, repMax: 20, restSec: 60 },
              { id: 'overhead-triceps-extension', sets: 3, repMin: 10, repMax: 15, restSec: 60 }
            ]
          },
          { label: 'Pull B', focus: 'Pull',
            exercises: [
              { id: 'pull-ups', sets: 4, repMin: 3, repMax: 10, restSec: 90 },
              { id: 'one-arm-dumbbell-row', sets: 3, repMin: 8, repMax: 12, restSec: 75 },
              { id: 'straight-arm-pulldown', sets: 3, repMin: 10, repMax: 15, restSec: 75 },
              { id: 'face-pulls', sets: 3, repMin: 12, repMax: 20, restSec: 60 },
              { id: 'ez-bar-curl', sets: 3, repMin: 10, repMax: 15, restSec: 60 },
              { id: 'preacher-curl', sets: 3, repMin: 10, repMax: 15, restSec: 60 }
            ]
          },
          { label: 'Legs B', focus: 'Legs',
            exercises: [
              { id: 'front-squat', sets: 3, repMin: 6, repMax: 10, restSec: 120 },
              { id: 'bulgarian-split-squat', sets: 3, repMin: 8, repMax: 12, restSec: 75 },
              { id: 'hip-thrust', sets: 3, repMin: 10, repMax: 15, restSec: 75 },
              { id: 'lying-leg-curl', sets: 3, repMin: 10, repMax: 15, restSec: 60 },
              { id: 'seated-calf-raise', sets: 4, repMin: 10, repMax: 15, restSec: 60 },
              { id: 'hanging-knee-raise', sets: 3, repMin: 10, repMax: 15, restSec: 45 }
            ]
          },
          { label: 'Rest', focus: 'Rest', exercises: [] }
        ]
      ]
    },
    strength: {
      label: 'Strength',
      description: 'Compound lifts with good technique, progressive loading and recovery.',
      weeks: [
        [
          { label: 'Squat Focus', focus: 'Squat',
            exercises: [
              { id: 'barbell-back-squat', sets: 5, repMin: 3, repMax: 6, restSec: 180 },
              { id: 'romanian-deadlift', sets: 3, repMin: 5, repMax: 8, restSec: 120 },
              { id: 'leg-press', sets: 2, repMin: 8, repMax: 12, restSec: 90 },
              { id: 'plank', sets: 2, repMin: 30, repMax: 45, restSec: 30 }
            ]
          },
          { label: 'Bench Press Focus', focus: 'Bench',
            exercises: [
              { id: 'barbell-bench-press', sets: 5, repMin: 3, repMax: 6, restSec: 180 },
              { id: 'overhead-press', sets: 3, repMin: 5, repMax: 8, restSec: 120 },
              { id: 'barbell-row', sets: 3, repMin: 6, repMax: 10, restSec: 120 },
              { id: 'triceps-pushdown', sets: 2, repMin: 8, repMax: 12, restSec: 60 }
            ]
          },
          { label: 'Recovery', focus: 'Recovery',
            exercises: [
              { id: 'easy-cycling', durationMin: 20, intensity: 'light' },
              { id: 'walking', durationMin: 20, intensity: 'light' },
              { id: 'mobility-exercises', durationMin: 10, intensity: 'light' },
              { id: 'light-core-work', durationMin: 10, intensity: 'light' }
            ]
          },
          { label: 'Deadlift Focus', focus: 'Deadlift',
            exercises: [
              { id: 'deadlift', sets: 5, repMin: 3, repMax: 6, restSec: 180 },
              { id: 'front-squat', sets: 2, repMin: 5, repMax: 8, restSec: 120 },
              { id: 'seated-leg-curl', sets: 2, repMin: 8, repMax: 12, restSec: 90 },
              { id: 'farmers-carry', durationMin: 40, intensity: 'moderate' }
            ]
          },
          { label: 'Upper-Body Strength', focus: 'Upper body',
            exercises: [
              { id: 'bench-press-variation', sets: 4, repMin: 4, repMax: 8, restSec: 150 },
              { id: 'pull-ups', sets: 4, repMin: 3, repMax: 8, restSec: 150 },
              { id: 'overhead-press-variation', sets: 3, repMin: 4, repMax: 8, restSec: 150 },
              { id: 'chest-supported-row', sets: 3, repMin: 6, repMax: 10, restSec: 120 },
              { id: 'barbell-curl', sets: 2, repMin: 6, repMax: 10, restSec: 60 }
            ]
          },
          { label: 'Technique + Assistance', focus: 'Accessory',
            exercises: [
              { id: 'paused-squats', sets: 3, repMin: 3, repMax: 6, restSec: 150 },
              { id: 'dumbbell-bench-press', sets: 3, repMin: 6, repMax: 10, restSec: 90 },
              { id: 'dumbbell-romanian-deadlift', sets: 3, repMin: 6, repMax: 10, restSec: 90 },
              { id: 'pallof-press', sets: 3, repMin: 10, repMax: 15, restSec: 60 },
              { id: 'optional-easy-cardio', durationMin: 15, intensity: 'light' }
            ]
          },
          { label: 'Rest', focus: 'Rest', exercises: [] }
        ]
      ]
    }
  };

  function getGoalTrainingDays(template, totalDays) {
    const days = template.weeks[0] || [];
    if (totalDays >= days.length) return days.map((_, i) => i);

    const order = days.map((_, i) => i);
    const selected = [];

    const weight = (i) => {
      const day = days[i];
      const ex = day.exercises || [];
      return ex.reduce((t, e) => t + (e.durationMin ? 0.5 : 1), 0);
    };

    while (selected.length < totalDays) {
      let bestIdx = -1;
      let bestScore = -Infinity;
      for (let i = 0; i < order.length; i++) {
        const idx = order[i];
        if (selected.includes(idx)) continue;
        const gapScore = selected.length ? weight((selected[selected.length - 1] + 4) % days.length) : 0;
        const score = weight(idx) + gapScore;
        if (score > bestScore) {
          bestScore = score;
          bestIdx = idx;
        }
      }
      if (bestIdx === -1) break;
      selected.push(bestIdx);
      order.splice(order.indexOf(bestIdx), 1);
    }

    return selected;
  }

  global.GoalTemplates = { GOAL_TEMPLATES, getGoalTrainingDays };
})(window);
