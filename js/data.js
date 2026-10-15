/* data.js: static reference data (exercise library, split templates, goal presets). */
(function (global) {
  'use strict';

  const CATEGORIES = [
    { id: 'chest', label: 'Chest' },
    { id: 'back', label: 'Back' },
    { id: 'shoulders', label: 'Shoulders' },
    { id: 'biceps', label: 'Biceps' },
    { id: 'triceps', label: 'Triceps' },
    { id: 'legs', label: 'Legs' },
    { id: 'abs', label: 'Abs' },
    { id: 'cardio', label: 'Cardio' }
  ];

  const EXERCISES = [
    { id: 'bench-press', name: 'Barbell Bench Press', category: 'chest', equipment: 'Barbell, bench', muscles: 'Chest, front delts, triceps', instructions: 'Lie flat with a grip slightly wider than shoulders. Lower the bar to mid-chest, then press up.' },
    { id: 'incline-dumbbell-press', name: 'Incline Dumbbell Press', category: 'chest', equipment: 'Dumbbells, incline bench', muscles: 'Upper chest, front delts', instructions: 'Set the bench to 30 to 45 degrees. Press the dumbbells up and slightly together, then control the descent.' },
    { id: 'cable-fly', name: 'Cable Fly', category: 'chest', equipment: 'Cable machine', muscles: 'Chest (inner fibres)', instructions: 'Stand between high pulleys. Sweep your arms down and together in an arc with a slight elbow bend.' },
    { id: 'push-up', name: 'Push-Up', category: 'chest', equipment: 'Bodyweight', muscles: 'Chest, triceps, core', instructions: 'Hands under shoulders, body in a straight line. Lower your chest to the floor and push back up.' },
    { id: 'dips', name: 'Dips', category: 'triceps', equipment: 'Parallel bars', muscles: 'Triceps, lower chest', instructions: 'Lean slightly forward for chest emphasis. Lower until shoulders are below elbows, then press up.' },
    { id: 'pull-up', name: 'Pull-Up', category: 'back', equipment: 'Pull-up bar', muscles: 'Lats, biceps, rear delts', instructions: 'Hang with an overhand grip. Pull your chest toward the bar and lower under control.' },
    { id: 'barbell-row', name: 'Barbell Row', category: 'back', equipment: 'Barbell', muscles: 'Lats, rhomboids, rear delts', instructions: 'Hinge to about 45 degrees. Pull the bar to your lower ribs and squeeze your shoulder blades together.' },
    { id: 'lat-pulldown', name: 'Lat Pulldown', category: 'back', equipment: 'Cable machine', muscles: 'Lats, biceps', instructions: 'Grip the bar wider than shoulders. Pull to upper chest and control the return.' },
    { id: 'seated-cable-row', name: 'Seated Cable Row', category: 'back', equipment: 'Cable machine', muscles: 'Mid back, lats', instructions: 'Sit tall and pull the handle to your abdomen. Keep your torso still.' },
    { id: 'deadlift', name: 'Conventional Deadlift', category: 'back', equipment: 'Barbell', muscles: 'Posterior chain, back, grip', instructions: 'Bar over mid-foot. Brace, then drive the floor away while keeping the bar close to your legs.' },
    { id: 'face-pull', name: 'Face Pull', category: 'shoulders', equipment: 'Cable machine, rope', muscles: 'Rear delts, upper back', instructions: 'Pull the rope to your face with elbows high, then rotate your hands outward at the end.' },
    { id: 'overhead-press', name: 'Overhead Press', category: 'shoulders', equipment: 'Barbell', muscles: 'Front and side delts, triceps', instructions: 'Press the bar from collarbone height to overhead. Keep glutes and core tight.' },
    { id: 'lateral-raise', name: 'Lateral Raise', category: 'shoulders', equipment: 'Dumbbells', muscles: 'Side delts', instructions: 'Raise your arms to shoulder height with a slight elbow bend. Lead with the elbows.' },
    { id: 'barbell-curl', name: 'Barbell Curl', category: 'biceps', equipment: 'Barbell', muscles: 'Biceps brachii', instructions: 'Keep elbows at your sides. Curl the bar up and lower it slowly.' },
    { id: 'hammer-curl', name: 'Hammer Curl', category: 'biceps', equipment: 'Dumbbells', muscles: 'Brachialis, forearms', instructions: 'Hold the dumbbells with a neutral grip and curl without rotating the wrists.' },
    { id: 'tricep-pushdown', name: 'Tricep Pushdown', category: 'triceps', equipment: 'Cable machine', muscles: 'Triceps', instructions: 'Pin your elbows at your sides and extend fully to lockout.' },
    { id: 'skull-crusher', name: 'Skull Crusher', category: 'triceps', equipment: 'EZ bar, bench', muscles: 'Triceps (long head)', instructions: 'Lower the bar toward your forehead with elbows fixed, then extend back up.' },
    { id: 'squat', name: 'Back Squat', category: 'legs', equipment: 'Barbell, squat rack', muscles: 'Quads, glutes, core', instructions: 'Bar on upper back, brace, squat to at least parallel, then drive up.' },
    { id: 'romanian-deadlift', name: 'Romanian Deadlift', category: 'legs', equipment: 'Barbell or dumbbells', muscles: 'Hamstrings, glutes', instructions: 'Hinge at the hips with soft knees. Lower the weight along your legs and feel the hamstring stretch.' },
    { id: 'leg-press', name: 'Leg Press', category: 'legs', equipment: 'Leg press machine', muscles: 'Quads, glutes', instructions: 'Feet shoulder-width apart. Lower until knees are near your chest, then press through your heels.' },
    { id: 'leg-curl', name: 'Lying Leg Curl', category: 'legs', equipment: 'Leg curl machine', muscles: 'Hamstrings', instructions: 'Curl the pad toward your glutes, pause, and lower slowly.' },
    { id: 'lunge', name: 'Walking Lunge', category: 'legs', equipment: 'Dumbbells or bodyweight', muscles: 'Quads, glutes', instructions: 'Step forward and lower the back knee toward the floor. Push through the front heel.' },
    { id: 'calf-raise', name: 'Standing Calf Raise', category: 'legs', equipment: 'Machine or step', muscles: 'Calves', instructions: 'Rise onto your toes, pause at the top, then lower to a full stretch.' },
    { id: 'plank', name: 'Plank', category: 'abs', equipment: 'Bodyweight', muscles: 'Core, abs', instructions: 'Rest on forearms and toes with your body in a straight line. Breathe steadily.' },
    { id: 'crunch', name: 'Crunch', category: 'abs', equipment: 'Bodyweight', muscles: 'Rectus abdominis', instructions: 'Curl your shoulders off the floor, keep your lower back down, and exhale on the way up.' },
    { id: 'hanging-leg-raise', name: 'Hanging Leg Raise', category: 'abs', equipment: 'Pull-up bar', muscles: 'Lower abs, hip flexors', instructions: 'Hang from the bar and raise your legs to parallel. Lower with control.' },
    { id: 'treadmill-run', name: 'Treadmill Run', category: 'cardio', equipment: 'Treadmill', muscles: 'Heart and lungs, legs', instructions: 'Warm up at an easy pace, then hold a steady or interval pace for the set time.', minDuration: 5, maxDuration: 30 },
    { id: 'rowing-machine', name: 'Rowing Machine', category: 'cardio', equipment: 'Rower', muscles: 'Full body', instructions: 'Drive with the legs first, then lean back and pull. Reverse the sequence on the way back.', minDuration: 10, maxDuration: 30 },
    { id: 'stationary-bike', name: 'Stationary Bike', category: 'cardio', equipment: 'Stationary bike', muscles: 'Legs, cardiovascular system', instructions: 'Hold a steady cadence and adjust resistance to your target effort.', minDuration: 10, maxDuration: 30 },
    { id: 'dead-bug', name: 'Dead Bug', category: 'abs', equipment: 'None', muscles: 'Core, hip flexors', instructions: 'Lie on back with arms up and legs bent. Lower opposite arm and leg while keeping lower back pressed down.' },
    { id: 'farmers-carry', name: 'Farmer\'s Carries', category: 'legs', equipment: 'Dumbbells', muscles: 'Grip, core, upper back', instructions: 'Hold heavy dumbbells at your sides and walk while keeping your core tight.' },
    { id: 'elliptical-trainer', name: 'Elliptical Trainer', category: 'cardio', equipment: 'Elliptical machine', muscles: 'Cardio, legs', instructions: 'Pedal in a smooth elliptical motion with upright posture.', minDuration: 10, maxDuration: 30 },
    { id: 'battle-ropes', name: 'Battle Ropes', category: 'cardio', equipment: 'Battle ropes', muscles: 'Shoulders, core, cardio', instructions: 'Wave or slams the ropes in short, controlled bouts.', minDuration: 5, maxDuration: 15 },
    { id: 'preacher-curl', name: 'Preacher Curl', category: 'biceps', equipment: 'Preacher curl bench', muscles: 'Biceps', instructions: 'Sit at a preacher bench with elbows on the pad. Curl a bar or dumbbells up.' },
    { id: 'overhead-triceps-extension', name: 'Overhead Triceps Extension', category: 'triceps', equipment: 'Dumbbell, cable', muscles: 'Triceps', instructions: 'Extend elbows overhead with a dumbbell or cable pushdown attachment.' },
    { id: 'machine-chest-press', name: 'Machine Chest Press', category: 'chest', equipment: 'Chest press machine', muscles: 'Chest, triceps', instructions: 'Sit and press handles forward on a machine.' },
    { id: 'front-squat', name: 'Front Squat', category: 'legs', equipment: 'Barbell', muscles: 'Quads, core', instructions: 'Hold a barbell on the front of your shoulders and squat down.' },
    { id: 'bulgarian-split-squat', name: 'Bulgarian Split Squat', category: 'legs', equipment: 'Dumbbells, bench', muscles: 'Quads, glutes', instructions: 'Place one foot behind you on a bench and squat down with the front leg.' },
    { id: 'reverse-pec-deck', name: 'Reverse Pec Deck', category: 'shoulders', equipment: 'Pec deck machine', muscles: 'Rear delts, upper back', instructions: 'Squeeze rear delts by bringing handles together in a rear-delt fly motion.' },
    { id: 'seated-dumbbell-shoulder-press', name: 'Seated Dumbbell Shoulder Press', category: 'shoulders', equipment: 'Dumbbells', muscles: 'Shoulders, triceps', instructions: 'Sit and press dumbbells overhead from shoulder height.' },
    { id: 'push-ups', name: 'Push-Ups', category: 'chest', equipment: 'Bodyweight', muscles: 'Chest, triceps, core', instructions: 'Lower chest to floor and push back up while keeping body straight.' },
    { id: 'mobility-exercises', name: 'Mobility Exercises', category: 'abs', equipment: 'None', muscles: 'Joints, mobility', instructions: 'Perform gentle joint mobility movements to improve range of motion.' },
    { id: 'dumbbell-lateral-raise', name: 'Dumbbell Lateral Raise', category: 'shoulders', equipment: 'Dumbbells', muscles: 'Side delts', instructions: 'Raise dumbbells out to the sides to shoulder height with a slight elbow bend.' },
    { id: 'cable-triceps-pushdown', name: 'Cable Triceps Pushdown', category: 'triceps', equipment: 'Cable machine', muscles: 'Triceps', instructions: 'Attach a rope or bar to a cable machine and push down until arms are extended.' },
    { id: 'incline-dumbbell-curl', name: 'Incline Dumbbell Curl', category: 'biceps', equipment: 'Incline bench, dumbbells', muscles: 'Biceps', instructions: 'Sit on an incline bench with arms back, then curl dumbbells up.' },
    { id: 'barbell-back-squat', name: 'Barbell Back Squat', category: 'legs', equipment: 'Barbell, squat rack', muscles: 'Quads, glutes, core', instructions: 'Place a barbell on your upper back, brace, and squat down to at least parallel.' },
    { id: 'seated-leg-curl', name: 'Seated Leg Curl', category: 'legs', equipment: 'Leg curl machine', muscles: 'Hamstrings', instructions: 'Sit on a leg curl machine and curl the weight toward your glutes.' },
    { id: 'straight-arm-pulldown', name: 'Straight-Arm Pulldown', category: 'back', equipment: 'Cable machine', muscles: 'Lats', instructions: 'Stand facing a cable machine with straight arms and pull the handle down to your thighs.' },
    { id: 'face-pulls', name: 'Face Pulls', category: 'shoulders', equipment: 'Cable machine, rope', muscles: 'Rear delts, upper back', instructions: 'Pull a rope toward your face with elbows high, rotating hands outward at the end.' },
    { id: 'light-core-work', name: 'Light Core Work', category: 'abs', equipment: 'None', muscles: 'Core', instructions: 'Perform light core activation exercises such as dead bugs or bird dogs.' },
    { id: 'cable-crunch', name: 'Cable Crunch', category: 'abs', equipment: 'Cable machine', muscles: 'Rectus abdominis', instructions: 'Kneel facing a cable machine with a rope attachment. Curl your shoulders toward your hips while keeping your lower back still.' },
    { id: 'hip-thrust', name: 'Hip Thrust', category: 'legs', equipment: 'Barbell or hip thrust machine', muscles: 'Glutes, hamstrings', instructions: 'Sit with your upper back on a bench or pad, drive through your heels, and lift your hips until your body forms a straight line.' }
  ];

  const EXERCISE_BY_ID = {};
  EXERCISES.forEach(e => { EXERCISE_BY_ID[e.id] = e; });

  // Compound lifts get the longer rest period in generated plans.
  const COMPOUND_IDS = new Set([
    'bench-press', 'incline-dumbbell-press', 'dips', 'pull-up', 'barbell-row',
    'lat-pulldown', 'deadlift', 'overhead-press', 'squat', 'romanian-deadlift', 'leg-press'
  ]);

  // Template exercise IDs that map to existing library exercises.
  // The goal templates use descriptive IDs; this resolves them to real library entries.
  const EXERCISE_ALIASES = {
    'goblet-squat': 'squat',
    'goblet-squats': 'squat',
    'bodyweight-squats': 'squat',
    'dumbbell-bench-press': 'bench-press',
    'barbell-bench-press': 'bench-press',
    'incline-barbbell-bench-press': 'incline-dumbbell-press',
    'dumbbell-romanian-deadlift': 'romanian-deadlift',
    'incline-treadmill-walk': 'treadmill-run',
    'brisk-walking': 'treadmill-run',
    'stationary-cycling': 'stationary-bike',
    'outdoor-cycling': 'stationary-bike',
    'walking': 'stationary-bike',
    'easy-cycling': 'stationary-bike',
    'cycling': 'stationary-bike',
    'running': 'treadmill-run',
    'steady-state-running': 'treadmill-run',
    'interval-running': 'treadmill-run',
    'interval-cycling': 'stationary-bike',
    'outdoor-walking': 'treadmill-run',
    'swimming': 'rowing-machine',
    'rowing-machine': 'rowing-machine',
    'warm-up': 'treadmill-run',
    'cool-down': 'treadmill-run',
    'optional-easy-cardio': 'stationary-bike',
    'dead-bug': 'dead-bug',
    'farmers-carry': 'farmers-carry',
    'elliptical-trainer': 'elliptical-trainer',
    'battle-ropes': 'battle-ropes',
    'one-arm-dumbbell-row': 'barbell-row',
    'ez-bar-curl': 'barbell-curl',
    'preacher-curl': 'preacher-curl',
    'lying-leg-curl': 'leg-curl',
    'seated-calf-raise': 'calf-raise',
    'standing-calf-raise': 'calf-raise',
    'hanging-knee-raise': 'hanging-leg-raise',
    'paused-squats': 'squat',
    'pallof-press': 'pallof-press',
    'cable-lateral-raise': 'lateral-raise',
    'rear-delt-fly': 'face-pull',
    'overhead-triceps-extension': 'overhead-triceps-extension',
    'triceps-pushdown': 'tricep-pushdown',
    'chest-supported-row': 'barbell-row',
    'machine-chest-press': 'machine-chest-press',
    'bench-press-variation': 'bench-press',
    'overhead-press-variation': 'overhead-press',
    'front-squat': 'front-squat',
    'bulgarian-split-squat': 'bulgarian-split-squat',
    'reverse-pec-deck': 'reverse-pec-deck',
    'seated-dumbbell-shoulder-press': 'seated-dumbbell-shoulder-press',
    'overhead-press-variation': 'overhead-press',
    'dumbbell-lunge': 'lunge',
    'dumbbell-romanian-deadlift': 'romanian-deadlift',
    'cable-crunch': 'cable-crunch',
    'push-ups': 'push-up',
    'pull-ups': 'pull-up',
    'dumbbell-lateral-raise': 'lateral-raise',
    'cable-triceps-pushdown': 'tricep-pushdown',
    'incline-dumbbell-curl': 'barbell-curl',
    'barbell-back-squat': 'squat',
    'seated-leg-curl': 'leg-curl',
    'straight-arm-pulldown': 'seated-cable-row',
    'face-pulls': 'face-pull',
    'light-core-work': 'mobility-exercises'
  };

  // Split templates keyed by training days per week. Plans cycle through these.
  const SPLIT_LIBRARY = {
    3: [
      { label: 'Full Body A', focus: 'Full body', exercises: ['squat', 'bench-press', 'barbell-row', 'overhead-press', 'plank'] },
      { label: 'Full Body B', focus: 'Full body', exercises: ['deadlift', 'incline-dumbbell-press', 'lat-pulldown', 'lateral-raise', 'crunch'] },
      { label: 'Full Body C', focus: 'Full body', exercises: ['leg-press', 'push-up', 'seated-cable-row', 'barbell-curl', 'tricep-pushdown'] }
    ],
    4: [
      { label: 'Upper A', focus: 'Upper body', exercises: ['bench-press', 'barbell-row', 'overhead-press', 'lat-pulldown', 'barbell-curl', 'tricep-pushdown'] },
      { label: 'Lower A', focus: 'Lower body', exercises: ['squat', 'romanian-deadlift', 'leg-curl', 'calf-raise', 'plank'] },
      { label: 'Upper B', focus: 'Upper body', exercises: ['incline-dumbbell-press', 'pull-up', 'lateral-raise', 'seated-cable-row', 'hammer-curl', 'skull-crusher'] },
      { label: 'Lower B', focus: 'Lower body', exercises: ['deadlift', 'leg-press', 'lunge', 'hanging-leg-raise'] }
    ],
    5: [
      { label: 'Chest & Triceps', focus: 'Push', exercises: ['bench-press', 'incline-dumbbell-press', 'cable-fly', 'tricep-pushdown', 'dips'] },
      { label: 'Back & Biceps', focus: 'Pull', exercises: ['pull-up', 'barbell-row', 'lat-pulldown', 'barbell-curl', 'hammer-curl'] },
      { label: 'Legs', focus: 'Legs', exercises: ['squat', 'romanian-deadlift', 'leg-press', 'leg-curl', 'calf-raise'] },
      { label: 'Shoulders & Abs', focus: 'Shoulders', exercises: ['overhead-press', 'lateral-raise', 'face-pull', 'crunch', 'hanging-leg-raise'] },
      { label: 'Arms & Cardio', focus: 'Arms', exercises: ['skull-crusher', 'hammer-curl', 'barbell-curl', 'treadmill-run'] }
    ],
    6: [
      { label: 'Push A', focus: 'Push', exercises: ['bench-press', 'overhead-press', 'incline-dumbbell-press', 'lateral-raise', 'tricep-pushdown'] },
      { label: 'Pull A', focus: 'Pull', exercises: ['deadlift', 'pull-up', 'seated-cable-row', 'face-pull', 'barbell-curl'] },
      { label: 'Legs A', focus: 'Legs', exercises: ['squat', 'romanian-deadlift', 'leg-curl', 'calf-raise', 'plank'] },
      { label: 'Push B', focus: 'Push', exercises: ['incline-dumbbell-press', 'dips', 'cable-fly', 'lateral-raise', 'skull-crusher'] },
      { label: 'Pull B', focus: 'Pull', exercises: ['lat-pulldown', 'barbell-row', 'hammer-curl', 'crunch'] },
      { label: 'Legs B', focus: 'Legs', exercises: ['leg-press', 'lunge', 'leg-curl', 'calf-raise', 'hanging-leg-raise'] }
    ]
  };

  const DEFAULT_TRAINING_DAYS = {
    2: [0, 3],
    3: [0, 2, 4],
    4: [0, 1, 3, 4],
    5: [0, 1, 3, 4, 5],
    6: [0, 1, 2, 3, 4, 5]
  };

  // Rep ranges and rest periods per goal. Sets scale with experience.
  const GOAL_PRESETS = {
    strength:    { label: 'Strength', min: 3, max: 6, rest: 180 },
    hypertrophy: { label: 'Muscle growth (hypertrophy)', min: 8, max: 12, rest: 90 },
    'fat-loss':  { label: 'Fat loss & conditioning', min: 12, max: 15, rest: 60 },
    endurance:   { label: 'Endurance', min: 15, max: 20, rest: 45 }
  };

  const EXPERIENCE_LEVELS = {
    beginner: { label: 'Beginner (under 1 year)', sets: 3 },
    intermediate: { label: 'Intermediate (1 to 3 years)', sets: 4 },
    advanced: { label: 'Advanced (3+ years)', sets: 5 }
  };

  const EQUIPMENT_OPTIONS = [
    'Barbell & rack', 'Dumbbells', 'Cable machine', 'Machines',
    'Pull-up bar', 'Bench', 'Treadmill / cardio', 'Bodyweight only'
  ];

  const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  global.GymData = {
    CATEGORIES,
    EXERCISES,
    EXERCISE_BY_ID,
    COMPOUND_IDS,
    SPLIT_LIBRARY,
    DEFAULT_TRAINING_DAYS,
    GOAL_PRESETS,
    EXPERIENCE_LEVELS,
    EQUIPMENT_OPTIONS,
    WEEKDAYS,
    GOAL_TEMPLATES: GoalTemplates.GOAL_TEMPLATES,
    getGoalTrainingDays: GoalTemplates.getGoalTrainingDays,
    EXERCISE_ALIASES,
    exerciseById(id) { return EXERCISE_BY_ID[id] || { id, name: 'Unknown exercise', category: 'chest', equipment: '', muscles: '', instructions: '' }; }
  };
})(window);
