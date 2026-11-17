/*************************************************************************
     * 1. PWA INSTALLATION SETUP
     * Uses persistent manifest, service worker, and PNG icons so browsers can
     * expose a real Install App option instead of only showing instructions.
     *************************************************************************/
    let deferredInstallPrompt = null;

    function isRunningStandalone() {
      return window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
    }

    function updateInstallControls() {
      const installed = isRunningStandalone();
      document.querySelectorAll('[data-install-button]').forEach(button => {
        button.disabled = installed;
        button.setAttribute('aria-disabled', String(installed));
        button.title = installed ? 'weGogym is already installed' : 'Install weGogym App';
        const label = button.querySelector('[data-install-label]');
        if (label) label.textContent = installed ? 'Installed' : 'Install App';
      });
    }

    (function initPWA() {
      if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
          navigator.serviceWorker.register('./service-worker.js', { scope: './' }).catch(err => {
            console.info('Offline mode will be available after deployment over HTTPS.', err);
          });
        });
      }

      window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredInstallPrompt = e;
        updateInstallControls();
      });

      window.addEventListener('appinstalled', () => {
        deferredInstallPrompt = null;
        updateInstallControls();
        showToast('weGogym is installed and ready to launch from your device.', 'success');
      });
    })();

    // Direct install only: tapping Install App fires the browser installer
    // immediately — no in-app popup or instructions modal.
    async function triggerInstallPWA() {
      if (isRunningStandalone()) {
        showToast('weGogym is already installed on this device.', 'info');
        return;
      }

      if (deferredInstallPrompt) {
        const promptEvent = deferredInstallPrompt;
        deferredInstallPrompt = null;
        promptEvent.prompt();
        const choice = await promptEvent.userChoice;
        if (choice.outcome === 'accepted') showToast('weGogym is installing…', 'success');
        else showToast('Install cancelled. Tap Install App anytime to try again.', 'info');
        updateInstallControls();
        return;
      }

      // Direct install is not available in this context (iOS Safari, or the
      // browser has not flagged the site as installable yet). Keep it light:
      // a short auto-dismissing toast instead of a blocking popup.
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      if (isIOS) {
        showToast('To install: open in Safari → Share → "Add to Home Screen".', 'info');
      } else {
        showToast('Direct install unavailable here — use your browser menu → "Install App" / "Add to Home Screen".', 'info');
      }
    }

    // Replace this one value when the GitHub repository is ready to publish.
    const GITHUB_REPOSITORY_URL = 'https://github.com/mohit0171';

    function openGitHubRepo() {
      window.open(GITHUB_REPOSITORY_URL, '_blank', 'noopener,noreferrer');
    }

    /*************************************************************************
     * 2. COMPREHENSIVE EXERCISE DATABASE (77 Exercises, goal-tagged, 10 Categories, 8 Gear)
     *************************************************************************/
    const EXERCISE_CATEGORIES = ['All', 'Chest', 'Back', 'Shoulders', 'Biceps', 'Triceps', 'Legs', 'Abs', 'Forearms', 'Cardio', 'Calisthenics'];
    const EQUIPMENT_TYPES = ['Dumbbells', 'Barbell', 'Cable Machine', 'Smith Machine', 'Resistance Bands', 'Bodyweight', 'Machines', 'Kettlebells'];

    const EXERCISE_DB = [
      // CHEST
      { id: 'ex_bench_press', videoId: 'gBZkSn-zsD0', steps: ['Lie on the bench with eyes under the bar and feet flat on the floor.', 'Grip the bar slightly wider than shoulder-width and unrack with straight arms.', 'Lower the bar to mid-chest with elbows at about 45 degrees.', 'Pause briefly on the chest without bouncing.', 'Press up and slightly back toward your eyes until arms lock out.'], goals: ['Strength', 'Muscle Growth'], name: 'Barbell Bench Press', category: 'Chest', equipment: 'Barbell', difficulty: 'Intermediate', target: 'Pectoralis Major', secondary: 'Anterior Deltoid, Triceps', setsReps: '4 sets × 6–10 reps', instructions: 'Retract shoulder blades onto the bench, lower bar under control to mid-chest, and press explosively without bouncing.', mistakes: 'Flaring elbows to 90 degrees or lifting hips off the bench.' },
      { id: 'ex_incline_db_press', steps: ['Set the bench to about 30 degrees and sit back with dumbbells on your thighs.', 'Kick the dumbbells up to shoulder height, palms facing forward.', 'Lower slowly until you feel a stretch across the upper chest.', 'Press up and slightly together over the upper chest.', 'Keep wrists stacked over elbows throughout.'], goals: ['Muscle Growth'], name: 'Incline Dumbbell Press', category: 'Chest', equipment: 'Dumbbells', difficulty: 'Beginner', target: 'Upper Pectorals', secondary: 'Front Delts, Triceps', setsReps: '3 sets × 8–12 reps', instructions: 'Set bench to 30 degrees. Press dumbbells up and slightly inward while keeping wrists stacked over elbows.', mistakes: 'Setting bench angle too steep (45°+), shifting load to shoulders.' },
      { id: 'ex_cable_fly', steps: ['Set the pulleys at about shoulder height and grab a handle in each hand.', 'Step forward into a staggered stance with a slight bend in the elbows.', 'Bring the handles together in front of your chest in a wide arc.', 'Pause for a second with a squeeze in the chest.', 'Open the arms back out slowly until you feel a stretch.'], goals: ['Muscle Growth'], name: 'Standing Cable Chest Fly', category: 'Chest', equipment: 'Cable Machine', difficulty: 'Beginner', target: 'Inner & Mid Chest', secondary: 'Anterior Deltoid', setsReps: '3 sets × 12–15 reps', instructions: 'Step forward with a staggered stance, keep a slight bend in elbows, and bring handles together in a hugging arc.', mistakes: 'Turning the fly into a press by bending elbows excessively.' },
      { id: 'ex_smith_incline', steps: ['Set the bench at an incline inside the Smith machine, bar aligned with your upper chest.', 'Unrack the bar with arms straight, over your chest.', 'Lower the bar to the clavicle line under control.', 'Press up along the fixed bar path until your arms lock out.', 'Keep feet planted and your back on the pad.'], goals: ['Muscle Growth', 'Strength'], name: 'Smith Machine Incline Press', category: 'Chest', equipment: 'Smith Machine', difficulty: 'Beginner', target: 'Upper Chest', secondary: 'Triceps, Front Delts', setsReps: '3 sets × 8–12 reps', instructions: 'Align upper chest with the bar path. Unrack, lower to clavicle line, and drive smoothly upward.', mistakes: 'Positioning bench too far forward or backward relative to bar.' },
      // BACK
      { id: 'ex_barbell_row', steps: ['Stand with feet hip-width and grip the bar just outside the knees.', 'Hinge forward to about 45 degrees with a flat back and braced core.', 'Pull the bar to your lower ribs, driving the elbows back.', 'Squeeze the shoulder blades together at the top.', 'Lower the bar with control until arms are straight.'], goals: ['Strength', 'Muscle Growth'], name: 'Bent-Over Barbell Row', category: 'Back', equipment: 'Barbell', difficulty: 'Intermediate', target: 'Latissimus Dorsi & Rhomboids', secondary: 'Rear Delts, Biceps, Erectors', setsReps: '4 sets × 8–10 reps', instructions: 'Hinge at hips to ~45°, brace core, and row barbell toward lower sternum while squeezing shoulder blades.', mistakes: 'Using excessive lower-back momentum to heave the weight.' },
      { id: 'ex_lat_pulldown', steps: ['Sit with thighs under the pads and grip the bar wider than shoulders.', 'Lean back slightly and pull your shoulders down first.', 'Pull the bar to your upper chest, driving elbows toward the floor.', 'Pause briefly with the chest up.', 'Let the bar rise slowly until your arms are almost straight.'], goals: ['Muscle Growth', 'Endurance'], name: 'Wide-Grip Lat Pulldown', category: 'Back', equipment: 'Cable Machine', difficulty: 'Beginner', target: 'Latissimus Dorsi', secondary: 'Biceps, Teres Major', setsReps: '3 sets × 10–12 reps', instructions: 'Grip bar slightly wider than shoulders, depress scapulae, and pull bar to upper chest with elbows driving down.', mistakes: 'Leaning all the way back horizontally or pulling behind the neck.' },
      { id: 'ex_single_db_row', steps: ['Place one knee and hand on a bench, with the other foot on the floor.', 'Hold a dumbbell in the free hand with the arm hanging straight.', 'Pull the dumbbell toward your hip, keeping the elbow close to your body.', 'Squeeze the lat at the top without twisting the torso.', 'Lower under control, then complete all reps before switching sides.'], goals: ['Muscle Growth'], name: 'Single-Arm Dumbbell Row', category: 'Back', equipment: 'Dumbbells', difficulty: 'Beginner', target: 'Lats & Mid-Back', secondary: 'Biceps, Rear Delts', setsReps: '3 sets × 10–12 reps/side', instructions: 'Support one hand on a bench, keep spine neutral, and pull dumbbell toward your hip pocket.', mistakes: 'Twisting the torso upward at the top of each rep.' },
      { id: 'ex_pullups', steps: ['Grip the bar slightly wider than shoulders, palms facing away.', 'Start from a full dead hang with shoulders engaged.', 'Pull your chest toward the bar, leading with the elbows.', 'Pass the chin over the bar, then pause.', 'Lower slowly until your arms are fully straight.'], goals: ['Strength', 'Calisthenics'], name: 'Strict Pull-Ups', category: 'Back', equipment: 'Bodyweight', difficulty: 'Intermediate', target: 'Latissimus Dorsi', secondary: 'Biceps, Core, Forearms', setsReps: '4 sets × 6–12 reps', instructions: 'Start from a dead hang, engage lats, and pull until chin clears the bar without kipping.', mistakes: 'Half-reps at the top without extending arms fully at the bottom.' },
      // SHOULDERS
      { id: 'ex_ohp', steps: ['Set the bar at collarbone height with hands just outside shoulders.', 'Brace your abs and squeeze your glutes before pressing.', 'Press straight up, moving your head back slightly to clear your face.', 'Lock out overhead with the bar over mid-foot.', 'Lower under control back to the collarbones.'], goals: ['Strength', 'Muscle Growth'], name: 'Standing Overhead Barbell Press', category: 'Shoulders', equipment: 'Barbell', difficulty: 'Intermediate', target: 'Anterior & Lateral Deltoids', secondary: 'Triceps, Upper Traps, Core', setsReps: '4 sets × 6–8 reps', instructions: 'Brace glutes and abs, press barbell vertically past your face, and lock out directly over mid-foot.', mistakes: 'Overarching the lumbar spine as weight goes overhead.' },
      { id: 'ex_db_lateral_raise', steps: ['Stand tall with dumbbells at your sides and a slight elbow bend.', 'Raise both arms out to the sides, leading with the elbows.', 'Stop when your arms are about parallel to the floor.', 'Lower slowly over about three seconds.', 'Keep the torso still and avoid shrugging.'], goals: ['Muscle Growth'], name: 'Dumbbell Lateral Raise', category: 'Shoulders', equipment: 'Dumbbells', difficulty: 'Beginner', target: 'Lateral Deltoid', secondary: 'Upper Trapezius', setsReps: '4 sets × 12–15 reps', instructions: 'Raise dumbbells out to sides with soft elbows until arms are parallel to floor; lower slowly.', mistakes: 'Swinging torso or shrugging traps up toward ears.' },
      { id: 'ex_face_pull', steps: ['Set the rope at about forehead height on a cable pulley.', 'Grip the rope with palms down and step back to create tension.', 'Pull the rope toward your face, spreading the ends apart.', 'Rotate the hands outward so the thumbs point back at the finish.', 'Return slowly to full arm extension.'], goals: ['Muscle Growth', 'Endurance'], name: 'Cable Rope Face Pull', category: 'Shoulders', equipment: 'Cable Machine', difficulty: 'Beginner', target: 'Rear Deltoids & Rotator Cuff', secondary: 'Rhomboids, Mid Traps', setsReps: '3 sets × 15–20 reps', instructions: 'Set pulley to eye level, pull rope toward forehead while externally rotating thumbs backward.', mistakes: 'Pulling with biceps and letting elbows drop below wrists.' },
      { id: 'ex_band_pull_apart', steps: ['Hold a band in front of you at shoulder height with arms straight.', 'Keep a light grip and a tall posture.', 'Pull the band apart by moving your hands out toward your sides.', 'Stop when the band touches your chest.', 'Return slowly without letting the arms drop.'], goals: ['Endurance', 'Muscle Growth'], name: 'Resistance Band Pull-Apart', category: 'Shoulders', equipment: 'Resistance Bands', difficulty: 'Beginner', target: 'Posterior Deltoids', secondary: 'Rhomboids, Trapezius', setsReps: '3 sets × 15–20 reps', instructions: 'Hold band at shoulder height with straight arms and pull apart until band touches chest.', mistakes: 'Hyperextending lower back or bending elbows.' },
      // BICEPS
      { id: 'ex_barbell_curl', steps: ['Stand with feet hip-width and grip the bar shoulder-width, palms up.', 'Keep your elbows pinned to your sides.', 'Curl the bar up until your forearms are near vertical.', 'Squeeze the biceps at the top for a moment.', 'Lower slowly until your elbows are fully straight.'], goals: ['Muscle Growth', 'Strength'], name: 'EZ / Barbell Biceps Curl', category: 'Biceps', equipment: 'Barbell', difficulty: 'Beginner', target: 'Biceps Brachii', secondary: 'Brachialis, Forearms', setsReps: '3 sets × 8–12 reps', instructions: 'Pin elbows to ribs and curl bar smoothly through full range of motion without swinging.', mistakes: 'Driving elbows forward at the top to cheat the load.' },
      { id: 'ex_incline_db_curl', steps: ['Sit on a 45-degree incline bench with dumbbells hanging straight down.', 'Let your upper arms rest back so the elbows point behind you.', 'Curl the dumbbells up without moving your upper arms forward.', 'Squeeze at the top, then lower with control.', 'Feel a full stretch at the bottom of each rep.'], goals: ['Muscle Growth'], name: 'Incline Dumbbell Curl', category: 'Biceps', equipment: 'Dumbbells', difficulty: 'Intermediate', target: 'Biceps Long Head', secondary: 'Brachialis', setsReps: '3 sets × 10–12 reps', instructions: 'Sit on a 45° incline bench letting arms hang behind torso for a deep stretch before curling.', mistakes: 'Lifting shoulders forward off the incline pad.' },
      { id: 'ex_cable_hammer_curl', steps: ['Attach a rope to a low pulley and grip it with palms facing each other.', 'Stand tall with elbows pinned at your sides.', 'Curl the rope toward your shoulders, keeping the grip neutral.', 'Pause briefly at the top.', 'Lower slowly, keeping constant tension on the cable.'], goals: ['Muscle Growth', 'Endurance'], name: 'Cable Rope Hammer Curl', category: 'Biceps', equipment: 'Cable Machine', difficulty: 'Beginner', target: 'Brachialis & Brachioradialis', secondary: 'Biceps Brachii', setsReps: '3 sets × 12–15 reps', instructions: 'Use neutral grip on rope attachment, keep constant cable tension, and curl toward shoulders.', mistakes: 'Letting weight stack slam between reps.' },
      // TRICEPS
      { id: 'ex_cable_pushdown', steps: ['Attach a straight bar or rope to a high pulley and grip it about shoulder-width.', 'Stand with elbows tucked at your sides and a slight forward lean.', 'Push the bar down until your arms are fully extended.', 'Squeeze the triceps at the bottom.', 'Let the bar rise slowly until your forearms are at about 90 degrees.'], goals: ['Muscle Growth', 'Endurance'], name: 'Cable Triceps Pushdown', category: 'Triceps', equipment: 'Cable Machine', difficulty: 'Beginner', target: 'Triceps Lateral & Medial Heads', secondary: 'Anconeus', setsReps: '3 sets × 12–15 reps', instructions: 'Tuck elbows tightly to sides, extend forearms fully downward, and control the return to 90°.', mistakes: 'Letting elbows drift forward or leaning over the bar.' },
      { id: 'ex_skullcrusher', steps: ['Lie on a flat bench holding dumbbells above your chest, palms facing each other.', 'Keep upper arms vertical and still.', 'Bend the elbows to lower the weights toward your temples.', 'Extend back up to the starting position.', 'Keep the elbows pointed toward the ceiling throughout.'], goals: ['Muscle Growth', 'Strength'], name: 'Lying Dumbbell Skullcrushers', category: 'Triceps', equipment: 'Dumbbells', difficulty: 'Intermediate', target: 'Triceps Long Head', secondary: 'Lateral Head', setsReps: '3 sets × 10–12 reps', instructions: 'Lower dumbbells beside temples by hinging only at the elbows, then extend back to lockout.', mistakes: 'Flaring elbows wide outward during extension.' },
      { id: 'ex_bench_dips', steps: ['Grip the parallel bars and lift yourself with arms straight.', 'Lean slightly forward to emphasize the triceps.', 'Lower until your elbows reach about 90 degrees.', 'Press back up to full lockout.', 'Keep your shoulders down and away from your ears.'], goals: ['Strength', 'Calisthenics', 'Muscle Growth'], name: 'Weighted / Bodyweight Dips', category: 'Triceps', equipment: 'Bodyweight', difficulty: 'Intermediate', target: 'Triceps Brachii', secondary: 'Lower Chest, Front Delts', setsReps: '3 sets × 8–15 reps', instructions: 'Keep torso upright on parallel bars, lower until elbows reach 90°, and press back up.', mistakes: 'Dipping too deep with rounded shoulders.' },
      // LEGS
      { id: 'ex_back_squat', steps: ['Set the bar on your upper back and unrack with a tight grip.', 'Take two or three steps back and set feet shoulder-width apart.', 'Brace your core, then sit hips down and back until thighs are at least parallel.', 'Drive up through mid-foot while keeping your chest tall.', 'Lock out your hips and knees at the top.'], goals: ['Strength', 'Muscle Growth'], name: 'Barbell Back Squat', category: 'Legs', equipment: 'Barbell', difficulty: 'Intermediate', target: 'Quadriceps & Glutes', secondary: 'Hamstrings, Adductors, Core', setsReps: '4 sets × 6–10 reps', instructions: 'Brace core, sit hips back and down until thighs reach at least parallel, and drive through mid-foot.', mistakes: 'Knees caving inward (valgus) or heels lifting off the floor.' },
      { id: 'ex_rdl', steps: ['Hold the bar at hip height with an overhand grip and feet hip-width apart.', 'Soften the knees slightly and keep the bar close to your legs.', 'Push the hips straight back until you feel a stretch in the hamstrings.', 'Keep a flat back and lower the bar to about mid-shin.', 'Drive the hips forward to stand tall.'], goals: ['Strength', 'Muscle Growth'], name: 'Romanian Deadlift (RDL)', category: 'Legs', equipment: 'Barbell', difficulty: 'Intermediate', target: 'Hamstrings & Glutes', secondary: 'Spinal Erectors, Forearms', setsReps: '3 sets × 8–10 reps', instructions: 'Unlock knees slightly, push hips straight back keeping bar against thighs until deep hamstring stretch.', mistakes: 'Rounding the upper or lower back at bottom range.' },
      { id: 'ex_leg_press', steps: ['Sit with your back flat on the pad and feet shoulder-width on the platform.', 'Release the safety and lower the sled with control.', 'Stop when knees are about 90 degrees, without lifting your lower back off the pad.', 'Press through your whole foot back to near lockout.', 'Keep knees soft at the top and avoid locking them hard.'], goals: ['Muscle Growth', 'Strength'], name: '45-Degree Machine Leg Press', category: 'Legs', equipment: 'Machines', difficulty: 'Beginner', target: 'Quadriceps', secondary: 'Glutes, Hamstrings', setsReps: '3 sets × 10–15 reps', instructions: 'Place feet shoulder-width on sled, lower until knees reach 90° without tailbone curling off pad.', mistakes: 'Locking knees violently at the top of the press.' },
      { id: 'ex_kb_goblet_squat', steps: ['Hold a kettlebell by the horns at your chest.', 'Stand with feet slightly wider than hip-width and toes turned out a little.', 'Squat down between your knees while keeping your chest up.', 'Pause briefly at the bottom.', 'Drive up through your feet to stand.'], goals: ['Fat Loss', 'Endurance'], name: 'Kettlebell Goblet Squat', category: 'Legs', equipment: 'Kettlebells', difficulty: 'Beginner', target: 'Quadriceps & Core', secondary: 'Glutes, Upper Back', setsReps: '3 sets × 12–15 reps', instructions: 'Hold kettlebell close to sternum, keep torso upright, and squat between your knees.', mistakes: 'Letting the kettlebell pull your chest forward.' },
      { id: 'ex_smith_split_squat', steps: ['Place one foot on the bench behind you and the other a comfortable stride forward.', 'Unrack the bar and set it across your upper back.', 'Lower straight down until the front thigh is near parallel.', 'Drive through the front heel to return up.', 'Complete reps on one leg before switching.'], goals: ['Muscle Growth', 'Strength'], name: 'Smith Machine Bulgarian Split Squat', category: 'Legs', equipment: 'Smith Machine', difficulty: 'Intermediate', target: 'Quads & Glutes (Unilateral)', secondary: 'Core Stabilizers', setsReps: '3 sets × 8–12 reps/leg', instructions: 'Elevate rear foot on bench behind you, descend vertically, and drive through front heel.', mistakes: 'Standing too close to the bench causing heel lift.' },
      // ABS
      { id: 'ex_hanging_leg_raise', steps: ['Hang from a bar with an overhand grip and shoulders engaged.', 'Brace the core and keep the legs straight or the knees bent.', 'Curl the pelvis up toward your ribs.', 'Lower the legs slowly without swinging.', 'Repeat for the target reps with control.'], goals: ['Strength', 'Calisthenics'], name: 'Hanging Knee / Leg Raise', category: 'Abs', equipment: 'Bodyweight', difficulty: 'Intermediate', target: 'Lower Rectus Abdominis', secondary: 'Hip Flexors, Forearms', setsReps: '3 sets × 10–15 reps', instructions: 'Curl pelvis upward toward ribs rather than merely swinging straight legs.', mistakes: 'Using momentum to swing back and forth.' },
      { id: 'ex_cable_crunch', steps: ['Kneel facing a high pulley and hold the rope beside your head.', 'Keep your hips still and sit back on your heels at the start.', 'Crunch your ribs down toward your hips by flexing the spine.', 'Pause briefly with the abs fully contracted.', 'Return slowly to the start.'], goals: ['Muscle Growth'], name: 'Kneeling Cable Rope Crunch', category: 'Abs', equipment: 'Cable Machine', difficulty: 'Beginner', target: 'Rectus Abdominis', secondary: 'Obliques', setsReps: '3 sets × 12–15 reps', instructions: 'Hold rope beside head, lock hips stationary, and flex spine downward toward thighs.', mistakes: 'Sitting hips back onto heels instead of flexing the spine.' },
      { id: 'ex_plank', steps: ['Lie face down and set your elbows under your shoulders.', 'Tuck the pelvis and squeeze your glutes and quads.', 'Pull your elbows toward your toes while keeping the body in one line.', 'Hold while breathing steadily.', 'Stop when form breaks and the hips sag.'], goals: ['Endurance', 'Calisthenics'], name: 'RKC Hollow Body Plank', category: 'Abs', equipment: 'Bodyweight', difficulty: 'Beginner', target: 'Transverse Abdominis', secondary: 'Glutes, Shoulders', setsReps: '3 sets × 45–60 sec', instructions: 'Tuck pelvis posteriorly, squeeze glutes and quads hard, and pull elbows toward toes.', mistakes: 'Letting hips sag toward the floor.' },
      // FOREARMS
      { id: 'ex_wrist_curl', steps: ['Sit on a bench with forearms resting on your thighs, palms up.', 'Let the bar roll down to your fingertips.', 'Curl the wrists up as high as possible.', 'Pause briefly at the top.', 'Lower slowly, keeping the forearms still.'], goals: ['Muscle Growth'], name: 'Seated Barbell Wrist Curl', category: 'Forearms', equipment: 'Barbell', difficulty: 'Beginner', target: 'Wrist Flexors', secondary: 'Grip Strength', setsReps: '3 sets × 15–20 reps', instructions: 'Rest forearms on thighs with palms up, roll bar to fingertips, and curl wrists upward.', mistakes: 'Lifting forearms off thighs during the curl.' },
      { id: 'ex_farmers_carry', steps: ['Pick up heavy dumbbells from the floor beside your legs.', 'Stand tall with shoulders packed down and back.', 'Walk briskly with short, controlled steps.', 'Keep the core tight and the torso upright.', 'Set the weights down under control at the end of each set.'], goals: ['Strength', 'Endurance', 'Fat Loss'], name: 'Heavy Dumbbell Farmer’s Carry', category: 'Forearms', equipment: 'Dumbbells', difficulty: 'Beginner', target: 'Forearm Flexors & Grip', secondary: 'Traps, Core, Calves', setsReps: '4 sets × 30–40 meters', instructions: 'Pick up heavy dumbbells, stand tall with shoulders packed down, and walk briskly with tight core.', mistakes: 'Hunching shoulders forward or taking sloppy steps.' },
      // CARDIO
      { id: 'ex_kb_swing', steps: ['Stand with feet slightly wider than shoulder-width, kettlebell a foot in front.', 'Hinge at the hips and swing the bell back between your legs.', 'Snap the hips forward to float the bell to chest height.', 'Let the bell fall back into the hinge and repeat without squatting.', 'Keep your arms loose so they act only as ropes.'], goals: ['Fat Loss', 'Endurance', 'Strength'], name: 'Russian Kettlebell Swing', category: 'Cardio', equipment: 'Kettlebells', difficulty: 'Intermediate', target: 'Posterior Chain & Conditioning', secondary: 'Glutes, Hamstrings, Core', setsReps: '4 sets × 20 reps', instructions: 'Explosively snap hips forward to float kettlebell to chest height; let arms act only as ropes.', mistakes: 'Squatting the swing or lifting with shoulders.' },
      { id: 'ex_rowing_erg', steps: ['Sit on the rower with feet strapped in and knees bent.', 'Start the drive by pushing through the legs first.', 'As the legs finish, lean the torso back slightly, then pull the handle to the ribs.', 'Reverse the sequence on the recovery: arms, torso, then knees.', 'Keep a steady rhythm and breathe continuously.'], goals: ['Endurance', 'Fat Loss'], name: 'Rowing Machine Intervals', category: 'Cardio', equipment: 'Machines', difficulty: 'Beginner', target: 'Quadriceps & Cardiovascular Endurance', secondary: 'Legs, Back, Arms', setsReps: '5 rounds × 250m sprint', instructions: 'Drive with legs first (60%), hinge torso (20%), and finish with arm pull (20%).', mistakes: 'Pulling with arms before legs finish driving.' },
      // CALISTHENICS
      { id: 'ex_pushups', steps: ['Set your hands just wider than shoulders in a high plank.', 'Keep head, hips and heels in one straight line.', 'Lower your chest to the floor over about two seconds.', 'Press back up with elbows at about 45 degrees to the body.', 'Keep the core braced and avoid letting the hips sag.'], goals: ['Calisthenics', 'Endurance', 'Fat Loss'], name: 'Tempo Deficit Push-Ups', category: 'Calisthenics', equipment: 'Bodyweight', difficulty: 'Beginner', target: 'Pectorals & Core', secondary: 'Triceps, Front Delts', setsReps: '3 sets × 12–20 reps', instructions: 'Maintain a rigid plank line from head to heels, lower chest to floor in 2 seconds, and press.', mistakes: 'Flaring elbows out or letting lower back dip.' },
      { id: 'ex_muscle_up_prog', steps: ['Start from a dead hang with a tight, hollow body position.', 'Pull explosively and drive the elbows down and back.', 'Bring your lower chest toward the bar.', 'Lower under control back to a full hang.', 'Build up with strict pull-ups and negatives before attempting it.'], goals: ['Calisthenics', 'Strength'], name: 'Explosive Chest-to-Bar Pull-Up', category: 'Calisthenics', equipment: 'Bodyweight', difficulty: 'Advanced', target: 'Lats & Explosive Power', secondary: 'Biceps, Rear Delts, Abs', setsReps: '4 sets × 4–6 reps', instructions: 'Initiate with a tight hollow body pull, accelerating elbows down to bring lower chest to bar.', mistakes: 'Losing hollow body tension into an arched swing.' },
      { id: 'ex_deadlift', steps: ['Stand with the bar over mid-foot and grip just outside the knees.', 'Hinge down, flatten the back and take the slack out of the bar.', 'Brace, then push the floor away with your legs.', 'Keep the bar close to your legs as you stand tall.', 'Lower by pushing the hips back and returning the bar to the floor.'], goals: ['Strength'], name: 'Conventional Barbell Deadlift', category: 'Legs', equipment: 'Barbell', difficulty: 'Intermediate', target: 'Hamstrings & Glutes', secondary: 'Erectors, Lats, Traps, Forearms', setsReps: '4 sets × 3–5 reps', instructions: 'Bar over mid-foot, grip just outside the knees, brace hard, then push the floor away while the bar stays close to your shins.', mistakes: 'Jerking the bar off the floor or rounding the lower back under load.' },
      { id: 'ex_close_grip_bench', steps: ['Lie under the bar with hands just inside shoulder-width.', 'Unrack and lower the bar to the lower chest with elbows tucked.', 'Pause briefly without bouncing.', 'Press up while keeping elbows close to your body.', 'Lock out and repeat.'], goals: ['Strength', 'Muscle Growth'], name: 'Close-Grip Barbell Bench Press', category: 'Triceps', equipment: 'Barbell', difficulty: 'Intermediate', target: 'Triceps Brachii', secondary: 'Pectorals, Front Delts', setsReps: '4 sets × 6–8 reps', instructions: 'Hands about shoulder-width apart, elbows tucked toward your sides, lower to the lower chest and press to lockout.', mistakes: 'Grip so narrow that wrists bend back under load.' },
      { id: 'ex_front_squat', steps: ['Rest the bar on your front shoulders with elbows high.', 'Stand with feet shoulder-width and toes slightly out.', 'Squat straight down while keeping elbows up and chest tall.', 'Drive back up through mid-foot.', 'Re-rack the bar carefully when the set is done.'], goals: ['Strength'], name: 'Barbell Front Squat', category: 'Legs', equipment: 'Barbell', difficulty: 'Advanced', target: 'Quadriceps & Core', secondary: 'Glutes, Erectors, Upper Back', setsReps: '4 sets × 5–6 reps', instructions: 'Bar rests on front delts with elbows high. Keep chest tall and sit straight down between your feet.', mistakes: 'Elbows dropping, letting the chest collapse forward at the bottom.' },
      { id: 'ex_pendlay_row', steps: ['Set the bar on the floor and hinge until your torso is near parallel.', 'Pull the bar explosively to your lower ribs.', 'Lower the bar back to the floor on every rep.', 'Keep your back flat and hips stable throughout.', 'Reset fully between reps.'], goals: ['Strength'], name: 'Pendlay Row', category: 'Back', equipment: 'Barbell', difficulty: 'Intermediate', target: 'Lats & Upper Back', secondary: 'Erectors, Biceps, Rear Delts', setsReps: '4 sets × 5–6 reps', instructions: 'Torso parallel to floor, bar on the ground each rep. Explode the bar to the lower ribs and return it to the floor.', mistakes: 'Standing up mid-rep or bouncing the bar off the floor.' },
      { id: 'ex_db_shoulder_press', steps: ['Sit on a bench with back support and dumbbells at shoulder height.', 'Press the weights overhead until your arms are straight.', 'Keep the dumbbells over your shoulders at the top.', 'Lower under control to ear level.', 'Avoid arching the lower back.'], goals: ['Muscle Growth', 'Strength'], name: 'Seated Dumbbell Shoulder Press', category: 'Shoulders', equipment: 'Dumbbells', difficulty: 'Beginner', target: 'Anterior & Lateral Deltoids', secondary: 'Triceps, Upper Traps', setsReps: '3 sets × 8–12 reps', instructions: 'Sit tall with back support, press dumbbells overhead in a slight arc, and lower to ear level under control.', mistakes: 'Arching the lower back to push the weight up.' },
      { id: 'ex_kb_clean_press', steps: ['Start with the kettlebell between your feet and hinge to grip it.', 'Swing the bell up and catch it in the rack position on your forearm.', 'Stand tall with the bell close to the shoulder and glutes engaged.', 'Press overhead until the arm is locked.', 'Lower to the rack position, then back to the floor.'], goals: ['Strength', 'Fat Loss'], name: 'Kettlebell Clean & Press', category: 'Shoulders', equipment: 'Kettlebells', difficulty: 'Intermediate', target: 'Deltoids & Full-Body Power', secondary: 'Triceps, Glutes, Core', setsReps: '3 sets × 6–8 reps/side', instructions: 'Swing the bell to the rack position on the shoulder, then press overhead with a locked, braced torso.', mistakes: 'Slamming the bell onto the forearm instead of catching it softly.' },
      { id: 'ex_db_thruster', steps: ['Hold dumbbells at shoulder height with palms facing in.', 'Squat to depth with the torso upright.', 'Drive up through the legs and press the dumbbells overhead in one motion.', 'Lower the weights back to the shoulders as you descend into the next squat.', 'Keep the core braced throughout.'], goals: ['Fat Loss', 'Strength'], name: 'Dumbbell Thruster', category: 'Legs', equipment: 'Dumbbells', difficulty: 'Intermediate', target: 'Quadriceps & Shoulders', secondary: 'Glutes, Triceps, Core', setsReps: '3 sets × 10–12 reps', instructions: 'Hold dumbbells at shoulders, squat to depth, then drive up and press overhead in one fluid motion.', mistakes: 'Letting the heels lift or pressing before hips fully extend.' },
      { id: 'ex_hammer_curl_db', steps: ['Stand holding dumbbells at your sides with palms facing in.', 'Keep your elbows pinned to your sides.', 'Curl the dumbbells up without rotating the wrists.', 'Pause briefly at the top.', 'Lower slowly to a full stretch.'], goals: ['Muscle Growth'], name: 'Dumbbell Hammer Curl', category: 'Biceps', equipment: 'Dumbbells', difficulty: 'Beginner', target: 'Brachialis & Brachioradialis', secondary: 'Biceps Brachii, Forearms', setsReps: '3 sets × 10–12 reps', instructions: 'Hold dumbbells with palms facing in, pin elbows, and curl up without rotating the wrists.', mistakes: 'Swinging the torso to lift the weight.' },
      { id: 'ex_hip_thrust_db', steps: ['Sit with your upper back against a bench and a dumbbell across your hips.', 'Plant your feet flat, hip-width apart.', 'Drive the hips up until the torso is level with the floor.', 'Squeeze the glutes hard at the top for a second.', 'Lower slowly until the hips are just above the floor.'], goals: ['Muscle Growth', 'Strength'], name: 'Dumbbell Hip Thrust', category: 'Legs', equipment: 'Dumbbells', difficulty: 'Beginner', target: 'Glutes Maximus', secondary: 'Hamstrings, Core', setsReps: '3 sets × 10–12 reps', instructions: 'Upper back on a bench, dumbbell across hips. Drive through heels and squeeze glutes hard at the top.', mistakes: 'Hyperextending the lower back at lockout.' },
      { id: 'ex_leg_extension', steps: ['Sit with your back against the pad and the pad on your lower shins.', 'Grip the handles and align the knee with the machine pivot.', 'Extend the legs until they are straight.', 'Squeeze the quads for a second at the top.', 'Lower slowly without letting the weight drop.'], goals: ['Muscle Growth'], name: 'Seated Leg Extension', category: 'Legs', equipment: 'Machines', difficulty: 'Beginner', target: 'Quadriceps', secondary: 'Knee Stabilizers', setsReps: '3 sets × 12–15 reps', instructions: 'Align the knee with the machine pivot, extend fully, and pause briefly before lowering slowly.', mistakes: 'Using momentum or lifting the hips off the seat.' },
      { id: 'ex_lying_leg_curl', steps: ['Lie face down with the pad resting on the back of your ankles.', 'Grip the handles and keep your hips pressed into the bench.', 'Curl the heels toward your glutes.', 'Pause briefly when fully contracted.', 'Lower slowly until the legs are straight.'], goals: ['Muscle Growth'], name: 'Lying Leg Curl', category: 'Legs', equipment: 'Machines', difficulty: 'Beginner', target: 'Hamstrings', secondary: 'Calves, Glutes', setsReps: '3 sets × 10–15 reps', instructions: 'Lie face down, pad just above the heels, and curl toward the glutes while keeping the hips pressed down.', mistakes: 'Lifting the hips off the pad to cheat the rep.' },
      { id: 'ex_seated_cable_row', steps: ['Sit with feet on the platform and knees slightly bent.', 'Hold the handle with arms straight and a neutral spine.', 'Pull the handle toward your navel, squeezing the shoulder blades together.', 'Pause for a moment with the chest up.', 'Reach forward slowly until you feel a stretch.'], goals: ['Muscle Growth', 'Endurance'], name: 'Seated Cable Row', category: 'Back', equipment: 'Cable Machine', difficulty: 'Beginner', target: 'Mid-Back & Lats', secondary: 'Rhomboids, Biceps, Rear Delts', setsReps: '3 sets × 10–12 reps', instructions: 'Sit tall, pull the handle to your navel, squeeze shoulder blades together, then reach forward with control.', mistakes: 'Rocking the torso back and forth to move the load.' },
      { id: 'ex_machine_chest_press', steps: ['Adjust the seat so the handles line up with mid-chest.', 'Grip the handles and keep your back against the pad.', 'Press forward until your arms are nearly straight.', 'Pause briefly without locking the elbows hard.', 'Return slowly until you feel a chest stretch.'], goals: ['Muscle Growth', 'Strength'], name: 'Machine Chest Press', category: 'Chest', equipment: 'Machines', difficulty: 'Beginner', target: 'Mid Pectorals', secondary: 'Triceps, Front Delts', setsReps: '3 sets × 10–12 reps', instructions: 'Adjust the seat so handles line up with mid-chest. Press forward and let the chest open on the way back.', mistakes: 'Locking elbows hard at the end of each rep.' },
      { id: 'ex_pec_deck', steps: ['Sit with your back against the pad and forearms on the pads.', 'Bring the pads together in front of your chest.', 'Pause for a moment with a hard squeeze.', 'Open the arms slowly until you feel a chest stretch.', 'Keep the shoulders down and back throughout.'], goals: ['Muscle Growth'], name: 'Pec Deck Machine Fly', category: 'Chest', equipment: 'Machines', difficulty: 'Beginner', target: 'Pectoralis Major (Sternal)', secondary: 'Anterior Deltoid', setsReps: '3 sets × 12–15 reps', instructions: 'Forearms on the pads, bring them together in front of the chest, and pause for one second at peak squeeze.', mistakes: 'Letting the shoulders roll forward at the start.' },
      { id: 'ex_cable_lateral_raise', steps: ['Stand side-on to a low cable with the handle in the far hand.', 'Raise the arm out to the side to shoulder height.', 'Keep a slight elbow bend and lead with the elbow.', 'Pause briefly at the top.', 'Lower slowly across your body.'], goals: ['Muscle Growth'], name: 'Single-Arm Cable Lateral Raise', category: 'Shoulders', equipment: 'Cable Machine', difficulty: 'Beginner', target: 'Lateral Deltoid', secondary: 'Upper Trapezius', setsReps: '3 sets × 12–15 reps', instructions: 'Stand side-on to the stack, raise the handle to shoulder height with a soft elbow, and lower with control.', mistakes: 'Leaning away from the cable to swing the weight up.' },
      { id: 'ex_oh_cable_extension', steps: ['Face away from a low cable and hold the rope overhead.', 'Keep elbows close to your head and upper arms still.', 'Extend the arms overhead until straight.', 'Pause briefly at full extension.', 'Lower slowly for a full stretch.'], goals: ['Muscle Growth'], name: 'Overhead Cable Triceps Extension', category: 'Triceps', equipment: 'Cable Machine', difficulty: 'Beginner', target: 'Triceps Long Head', secondary: 'Lateral Head', setsReps: '3 sets × 10–12 reps', instructions: 'Face away from the stack with the rope overhead. Extend elbows fully and keep upper arms still.', mistakes: 'Elbows flaring wide as you extend.' },
      { id: 'ex_preacher_curl_machine', steps: ['Sit with upper arms on the pad and the handles in front.', 'Curl the handles up without lifting the elbows.', 'Squeeze the biceps at the top.', 'Lower until your arms are fully straight.', 'Avoid bouncing at the bottom.'], goals: ['Muscle Growth'], name: 'Machine Preacher Curl', category: 'Biceps', equipment: 'Machines', difficulty: 'Beginner', target: 'Biceps Brachii', secondary: 'Brachialis', setsReps: '3 sets × 10–12 reps', instructions: 'Arms resting on the pad, curl up under control and fully straighten at the bottom without bouncing.', mistakes: 'Lifting the elbows off the pad.' },
      { id: 'ex_standing_calf_raise', steps: ['Place your shoulders under the pads and the balls of your feet on the platform.', 'Lower your heels to a full stretch.', 'Rise onto your toes as high as possible.', 'Pause for a second at the top.', 'Lower slowly and repeat.'], goals: ['Muscle Growth', 'Endurance'], name: 'Standing Calf Raise Machine', category: 'Legs', equipment: 'Machines', difficulty: 'Beginner', target: 'Gastrocnemius', secondary: 'Soleus', setsReps: '4 sets × 12–20 reps', instructions: 'Shoulders under the pads, rise onto the balls of the feet as high as possible, then pause and lower into a full stretch.', mistakes: 'Bouncing at the bottom instead of pausing.' },
      { id: 'ex_assault_bike', steps: ['Set the seat so your knee is slightly bent at the bottom of the pedal stroke.', 'Grip the handles and start pedalling at a steady pace.', 'Push and pull the handles as you pedal.', 'Sprint at near-max effort for 30 seconds.', 'Recover for 60 seconds at an easy pace, then repeat.'], goals: ['Fat Loss', 'Endurance'], name: 'Assault Bike Sprints', category: 'Cardio', equipment: 'Machines', difficulty: 'Beginner', target: 'Quadriceps & Cardiovascular Endurance', secondary: 'Hamstrings, Arms, Core', setsReps: '6 rounds × 30 sec on / 60 sec off', instructions: 'Push and pull the handles as hard as you pull the pedals. Sprint at near-max effort for each 30-second burst.', mistakes: 'Starting too fast and fading by round three.' },
      { id: 'ex_incline_walk', steps: ['Set the incline to 6 to 10 percent and a comfortable speed.', 'Stand tall with your gaze ahead.', 'Take short, quick steps and land mid-foot.', 'Keep your hands off the rails as much as possible.', 'Hold the pace for the target duration.'], goals: ['Fat Loss', 'Endurance'], name: 'Treadmill Incline Walk', category: 'Cardio', equipment: 'Machines', difficulty: 'Beginner', target: 'Glutes & Calves (Aerobic)', secondary: 'Hamstrings, Quads', setsReps: '20–30 min steady', instructions: 'Set a 6–10% incline, walk with a tall posture and short quick steps, and avoid gripping the handrails.', mistakes: 'Leaning on the rails, which unloads your legs and inflates the pace.' },
      { id: 'ex_burpee', steps: ['Stand tall, then squat and place your hands on the floor.', 'Jump or step your feet back into a plank.', 'Lower your chest toward the floor and press back up.', 'Hop your feet back toward your hands.', 'Jump up with arms overhead and land softly.'], goals: ['Fat Loss', 'Endurance', 'Calisthenics'], name: 'Burpees', category: 'Cardio', equipment: 'Bodyweight', difficulty: 'Beginner', target: 'Quadriceps & Core', secondary: 'Chest, Shoulders, Glutes', setsReps: '3 sets × 10–15 reps', instructions: 'Squat, jump the feet back to a plank, drop the chest, press up, hop the feet in, then jump with arms overhead.', mistakes: 'Sagging hips in the plank position.' },
      { id: 'ex_jump_rope', steps: ['Hold the handles at hip height with elbows close to your sides.', 'Turn the rope from the wrists, not the arms.', 'Jump just high enough for the rope to pass under your feet.', 'Land softly on the balls of your feet.', 'Keep a steady rhythm during each interval.'], goals: ['Fat Loss', 'Endurance'], name: 'Jump Rope Intervals', category: 'Cardio', equipment: 'Bodyweight', difficulty: 'Beginner', target: 'Calves & Cardiovascular Endurance', secondary: 'Shoulders, Forearms, Core', setsReps: '5 rounds × 60 sec', instructions: 'Stay on the balls of the feet, keep elbows close, and turn the rope from the wrists with minimal jumping height.', mistakes: 'Jumping too high and landing heavily on the heels.' },
      { id: 'ex_mountain_climber', steps: ['Start in a high plank with your hands under your shoulders.', 'Keep your hips level and core braced.', 'Drive one knee toward your chest.', 'Switch legs quickly in a running motion.', 'Keep the pace steady for the full interval.'], goals: ['Fat Loss', 'Endurance', 'Calisthenics'], name: 'Mountain Climbers', category: 'Abs', equipment: 'Bodyweight', difficulty: 'Beginner', target: 'Rectus Abdominis & Hip Flexors', secondary: 'Shoulders, Quads', setsReps: '3 sets × 30–40 sec', instructions: 'Hands under shoulders, body in a straight plank. Drive alternating knees toward the chest at a steady rhythm.', mistakes: 'Lifting the hips into a pike to cheat the movement.' },
      { id: 'ex_stair_climber', steps: ['Step onto the machine and find a comfortable starting pace.', 'Stand tall and use full steps.', 'Keep your weight on your legs and only lightly touch the rails.', 'Maintain the pace through the interval.', 'Recover at an easy pace between rounds.'], goals: ['Endurance', 'Fat Loss'], name: 'Stair Climber Intervals', category: 'Cardio', equipment: 'Machines', difficulty: 'Intermediate', target: 'Glutes & Quads', secondary: 'Calves, Cardiovascular Endurance', setsReps: '5 rounds × 2 min', instructions: 'Stand upright, step through the full stride, and avoid leaning on the handles for support.', mistakes: 'Leaning on the rails and shortening each step.' },
      { id: 'ex_bike_intervals', steps: ['Set a resistance you can ride at a steady pace during the work phase.', 'Ride hard for two minutes at a challenging effort.', 'Drop to an easy pace for one minute to recover.', 'Repeat the hard and easy rounds.', 'Finish with a three-minute easy cool-down.'], goals: ['Endurance'], name: 'Stationary Bike Intervals', category: 'Cardio', equipment: 'Machines', difficulty: 'Beginner', target: 'Quadriceps & Cardiovascular Endurance', secondary: 'Hamstrings, Calves', setsReps: '6 rounds × 2 min hard / 1 min easy', instructions: 'Hard rounds at a pace you could hold for about 2 minutes. Easy rounds should let your breathing recover.', mistakes: 'Riding every round at the same moderate effort.' },
      { id: 'ex_box_jump', steps: ['Stand a short distance from a sturdy box with feet hip-width apart.', 'Swing your arms back and load the hips.', 'Jump up and land softly with the whole foot on the box.', 'Stand tall on the box with hips and knees fully extended.', 'Step down rather than jumping back down.'], goals: ['Fat Loss', 'Calisthenics'], name: 'Box Jump', category: 'Cardio', equipment: 'Bodyweight', difficulty: 'Intermediate', target: 'Quadriceps & Explosive Power', secondary: 'Glutes, Calves', setsReps: '4 sets × 5–8 reps', instructions: 'Swing arms, load the hips, and land softly with the full foot on the box. Step down rather than jumping back.', mistakes: 'Landing on the toes or jumping onto a box that is too high.' },
      { id: 'ex_incline_pushup', steps: ['Place your hands on a bench or sturdy box, slightly wider than shoulders.', 'Keep a straight line from head to heels.', 'Lower your chest toward the edge of the box.', 'Press back up without letting the hips sag.', 'Repeat for the target reps.'], goals: ['Calisthenics', 'Endurance'], name: 'Incline Push-Ups', category: 'Calisthenics', equipment: 'Bodyweight', difficulty: 'Beginner', target: 'Lower Chest & Triceps', secondary: 'Front Delts, Core', setsReps: '3 sets × 10–15 reps', instructions: 'Hands on a bench or sturdy box. Keep a straight line from head to heels, lower the chest toward the edge and press back up.', mistakes: 'Sagging hips or flaring the elbows wide.' },
      { id: 'ex_scapular_pullup', steps: ['Hang from a bar with straight arms and an overhand grip.', 'Pull the shoulder blades down and back without bending the elbows.', 'Hold the top position briefly.', 'Let the shoulders rise slowly back to the hang.', 'Repeat with control.'], goals: ['Calisthenics', 'Strength'], name: 'Scapular Pull-Ups', category: 'Calisthenics', equipment: 'Bodyweight', difficulty: 'Beginner', target: 'Lats & Lower Traps', secondary: 'Forearms, Rhomboids', setsReps: '3 sets × 6–10 reps', instructions: 'Hang with straight arms. Pull the shoulder blades down and back without bending the elbows.', mistakes: 'Bending the elbows and turning it into a regular pull-up too early.' },
      { id: 'ex_inverted_row', steps: ['Set a bar at hip-to-chest height and lie underneath it.', 'Grip the bar and keep your body in a straight line from heels to head.', 'Pull your chest up to the bar, squeezing the shoulder blades.', 'Lower with control until your arms are straight.', 'Make it harder by lowering the bar or straightening the body more.'], goals: ['Calisthenics', 'Muscle Growth'], name: 'Bodyweight Inverted Row', category: 'Calisthenics', equipment: 'Bodyweight', difficulty: 'Beginner', target: 'Latissimus Dorsi & Rhomboids', secondary: 'Biceps, Rear Delts, Core', setsReps: '3 sets × 8–12 reps', instructions: 'Grip a sturdy bar at hip-to-chest height, keep the body rigid from heels to head, and pull the chest to the bar.', mistakes: 'Sagging hips or shrugging the shoulders toward the ears.' },
      { id: 'ex_tempo_squat', steps: ['Stand with feet shoulder-width apart and toes slightly turned out.', 'Lower over about 3 seconds, keeping your chest up.', 'Pause briefly at the bottom.', 'Drive through the full foot to stand.', 'Keep your heels down throughout.'], goals: ['Calisthenics', 'Endurance', 'Fat Loss'], name: 'Tempo Bodyweight Squat', category: 'Calisthenics', equipment: 'Bodyweight', difficulty: 'Beginner', target: 'Quadriceps & Glutes', secondary: 'Hamstrings, Core', setsReps: '3 sets × 15–20 reps', instructions: 'Feet shoulder-width. Take 3 seconds to descend, keep the chest up, then stand by driving through the full foot.', mistakes: 'Heels lifting or knees caving inward.' },
      { id: 'ex_glute_bridge', steps: ['Lie on your back with knees bent and feet flat on the floor.', 'Squeeze the glutes and lift the hips up.', 'Hold briefly at the top in a straight line from knees to shoulders.', 'Lower slowly to the floor.', 'Keep your ribs down and avoid overarching the lower back.'], goals: ['Calisthenics', 'Muscle Growth'], name: 'Glute Bridge', category: 'Calisthenics', equipment: 'Bodyweight', difficulty: 'Beginner', target: 'Glutes & Hamstrings', secondary: 'Core, Lower Back', setsReps: '3 sets × 12–15 reps', instructions: 'Lie with knees bent and feet flat. Squeeze the glutes to lift the hips until the body forms a straight line, then lower slowly.', mistakes: 'Overarching the lower back at the top.' },
      { id: 'ex_chair_dips', steps: ['Sit on the edge of a sturdy chair with hands gripping the edge beside your hips.', 'Slide your hips off the chair with legs extended in front.', 'Bend the elbows to lower until they reach about 90 degrees.', 'Press back up to the top.', 'Keep your back close to the chair.'], goals: ['Calisthenics', 'Muscle Growth'], name: 'Chair Dips', category: 'Calisthenics', equipment: 'Bodyweight', difficulty: 'Beginner', target: 'Triceps Brachii', secondary: 'Front Delts, Chest', setsReps: '3 sets × 8–12 reps', instructions: 'Hands on a sturdy chair behind you, slide the hips off, bend the elbows to about 90°, and press back up.', mistakes: 'Letting the shoulders roll forward or dropping too deep.' },
      { id: 'ex_reverse_lunge', steps: ['Stand tall with feet hip-width apart.', 'Step one foot back and lower the back knee toward the floor.', 'Keep the front shin vertical and your torso upright.', 'Push through the front heel to return to standing.', 'Complete the reps on one leg, then switch.'], goals: ['Calisthenics', 'Endurance', 'Fat Loss'], name: 'Reverse Lunge (Bodyweight)', category: 'Calisthenics', equipment: 'Bodyweight', difficulty: 'Beginner', target: 'Quadriceps & Glutes', secondary: 'Hamstrings, Calves, Core', setsReps: '3 sets × 10 reps/leg', instructions: 'Step one foot back and lower the back knee toward the floor. Push through the front heel to return to standing.', mistakes: 'Leaning the torso forward or pushing off the back foot.' },
      { id: 'ex_hollow_hold', steps: ['Lie on your back with arms extended overhead.', 'Press the lower back into the floor.', 'Lift the shoulders and legs a few inches off the floor.', 'Hold the position while breathing steadily.', 'Lower before your lower back arches.'], goals: ['Calisthenics', 'Strength'], name: 'Hollow Body Hold', category: 'Calisthenics', equipment: 'Bodyweight', difficulty: 'Beginner', target: 'Rectus Abdominis', secondary: 'Hip Flexors, Transverse Abdominis', setsReps: '3 sets × 20–30 sec', instructions: 'Lie flat, press the lower back into the floor, lift the shoulders and legs a few inches, and reach the arms overhead.', mistakes: 'Lower back arching off the floor as fatigue sets in.' },
      { id: 'ex_superman_hold', steps: ['Lie face down with arms extended in front of you.', 'Lift your arms, chest and legs a few inches off the floor.', 'Squeeze the glutes and upper back.', 'Hold the position with your neck neutral.', 'Lower slowly and rest.'], goals: ['Calisthenics', 'Endurance'], name: 'Superman Hold', category: 'Calisthenics', equipment: 'Bodyweight', difficulty: 'Beginner', target: 'Erector Spinae & Glutes', secondary: 'Rear Delts, Hamstrings', setsReps: '3 sets × 20–30 sec', instructions: 'Lie face down, reach arms forward, and lift arms, chest and legs slightly off the floor. Squeeze the glutes and upper back.', mistakes: 'Cranking the neck up to look forward.' },
      { id: 'ex_bear_crawl', steps: ['Start on hands and toes with knees hovering just above the floor.', 'Keep your hips level and back flat.', 'Move the right hand and left foot forward together.', 'Alternate sides while keeping the knees off the floor.', 'Crawl forward and back for the target distance.'], goals: ['Calisthenics', 'Endurance', 'Fat Loss'], name: 'Bear Crawl', category: 'Calisthenics', equipment: 'Bodyweight', difficulty: 'Beginner', target: 'Core & Shoulders', secondary: 'Quadriceps, Triceps, Hip Flexors', setsReps: '3 rounds × 20 m', instructions: 'Hands and toes on the floor, knees hovering an inch above the ground. Crawl forward and back while keeping hips level.', mistakes: 'Hips rising into the air or knees swinging side to side.' },
      { id: 'ex_decline_pushup', steps: ['Place your feet on a bench and your hands on the floor under your shoulders.', 'Keep your body in a rigid line.', 'Lower your chest toward the floor between your hands.', 'Press back up without piking the hips.', 'Keep your neck neutral.'], goals: ['Calisthenics', 'Muscle Growth', 'Strength'], name: 'Decline Push-Ups', category: 'Calisthenics', equipment: 'Bodyweight', difficulty: 'Intermediate', target: 'Upper Chest & Front Delts', secondary: 'Triceps, Core', setsReps: '3 sets × 8–12 reps', instructions: 'Feet elevated on a bench, hands about shoulder-width. Keep the body rigid and lower the chin to the floor between your hands.', mistakes: 'Piking the hips up or sagging the lower back.' },
      { id: 'ex_pike_pushup', steps: ['Start in a downward-dog position with hips high.', 'Place your hands about shoulder-width apart.', 'Bend the elbows to lower the top of your head toward the floor.', 'Press back up to the starting position.', 'Keep your hips high throughout.'], goals: ['Calisthenics', 'Strength', 'Muscle Growth'], name: 'Pike Push-Ups', category: 'Calisthenics', equipment: 'Bodyweight', difficulty: 'Intermediate', target: 'Anterior Deltoids & Triceps', secondary: 'Upper Traps, Core', setsReps: '3 sets × 8–12 reps', instructions: 'Form an inverted V with hips high and hands under shoulders. Lower the head toward the floor between your hands and press back up.', mistakes: 'Dropping the hips so it becomes a regular push-up.' },
      { id: 'ex_archer_pushup', steps: ['Set a wide hand position, at least shoulder-width apart.', 'Shift your weight toward one side while bending that elbow.', 'Keep the other arm straight as you lower.', 'Press back to the center and repeat on the other side.', 'Keep your hips and body level.'], goals: ['Calisthenics', 'Strength'], name: 'Archer Push-Ups', category: 'Calisthenics', equipment: 'Bodyweight', difficulty: 'Intermediate', target: 'Pectorals (Unilateral)', secondary: 'Triceps, Front Delts, Core', setsReps: '3 sets × 6–8 reps/side', instructions: 'Wide stance, shift weight to one side while the opposite arm straightens. Lower until the bent-arm chest is near that hand.', mistakes: 'Rotating the hips or letting the straight arm bend.' },
      { id: 'ex_chin_ups', steps: ['Grip the bar with palms facing you, shoulder-width apart.', 'Start from a full dead hang.', 'Pull your chest toward the bar, leading with the elbows.', 'Pause briefly at the top with your chin above the bar.', 'Lower slowly to a full hang.'], goals: ['Calisthenics', 'Strength', 'Muscle Growth'], name: 'Chin-Ups (Supinated Grip)', category: 'Calisthenics', equipment: 'Bodyweight', difficulty: 'Intermediate', target: 'Biceps & Latissimus Dorsi', secondary: 'Forearms, Core, Rhomboids', setsReps: '4 sets × 6–10 reps', instructions: 'Underhand shoulder-width grip. Pull the chest toward the bar, keep the body tight, and lower to a full dead hang.', mistakes: 'Kipping or cutting the range of motion short.' },
      { id: 'ex_bulgarian_bw', steps: ['Place your rear foot on a bench and your front foot about two feet ahead.', 'Keep your torso upright and your hands on your hips.', 'Lower straight down until your front thigh is near parallel.', 'Drive through the front heel to return to standing.', 'Complete reps on one leg before switching.'], goals: ['Calisthenics', 'Muscle Growth'], name: 'Bodyweight Bulgarian Split Squat', category: 'Calisthenics', equipment: 'Bodyweight', difficulty: 'Intermediate', target: 'Quads & Glutes (Unilateral)', secondary: 'Core Stabilizers, Hamstrings', setsReps: '3 sets × 8–12 reps/leg', instructions: 'Rear foot on a bench, front foot about two feet forward. Lower straight down and drive through the front heel.', mistakes: 'Standing too close to the bench, which causes heel lift.' },
      { id: 'ex_assisted_pistol', steps: ['Hold a doorframe or suspension strap for balance.', 'Stand on one leg with the other extended in front.', 'Sit down slowly, keeping your heel on the floor.', 'Pause at the bottom, then stand back up.', 'Use the support as needed and reduce it over time.'], goals: ['Calisthenics', 'Strength'], name: 'Assisted Pistol Squat', category: 'Calisthenics', equipment: 'Bodyweight', difficulty: 'Intermediate', target: 'Quadriceps & Glutes (Unilateral)', secondary: 'Ankle Mobility, Core', setsReps: '3 sets × 5–8 reps/leg', instructions: 'Hold a doorframe or suspension strap for balance. Sit down on one leg with the heel planted, then stand back up.', mistakes: 'Letting the heel lift or the knee cave inward.' },
      { id: 'ex_l_sit', steps: ['Sit on the floor or between parallel bars with hands next to your hips.', 'Press your palms down and lift your shoulders away from your ears.', 'Straighten the legs in front of you.', 'Lift your hips until your legs are level with the floor.', 'Hold while breathing steadily.'], goals: ['Calisthenics', 'Strength'], name: 'L-Sit Hold', category: 'Calisthenics', equipment: 'Bodyweight', difficulty: 'Intermediate', target: 'Hip Flexors & Lower Abs', secondary: 'Triceps, Lower Traps, Quads', setsReps: '4 sets × 10–20 sec', instructions: 'Support yourself on parallel bars or the floor, press the shoulders down, and lift the straight legs level with the hips.', mistakes: 'Shrugging the shoulders up toward the ears.' },
      { id: 'ex_negative_pullup', steps: ['Jump or step so your chin is above the bar.', 'Grip the bar with palms facing away.', 'Lower yourself as slowly as possible for 4 to 5 seconds.', 'Stop when your arms are straight.', 'Reset and repeat.'], goals: ['Calisthenics', 'Strength'], name: 'Negative Pull-Ups', category: 'Calisthenics', equipment: 'Bodyweight', difficulty: 'Intermediate', target: 'Latissimus Dorsi', secondary: 'Biceps, Forearms', setsReps: '4 sets × 3–5 reps (5 sec lowering)', instructions: 'Jump or step to the top position, then lower as slowly as possible for 4–5 seconds until the arms are straight.', mistakes: 'Dropping quickly to the bottom and losing control.' },
      { id: 'ex_wall_handstand', steps: ['Stand facing a wall with hands about shoulder-width apart.', 'Kick up one leg at a time until your feet touch the wall.', 'Keep your body in a straight line, with glutes and ribs braced.', 'Hold the position while breathing steadily.', 'Come down slowly with control.'], goals: ['Calisthenics', 'Strength'], name: 'Wall-Supported Handstand Hold', category: 'Calisthenics', equipment: 'Bodyweight', difficulty: 'Intermediate', target: 'Anterior Deltoids & Shoulder Stabilizers', secondary: 'Triceps, Core, Upper Traps', setsReps: '4 sets × 20–40 sec', instructions: 'Kick up into a wall handstand with hands shoulder-width apart. Brace the glutes and ribs and hold a tall, straight line.', mistakes: 'Arching the lower back and bending the elbows.' }
    ];

    /*************************************************************************
     * 3. STATE MANAGEMENT & LOCALSTORAGE PERSISTENCE (weGogym_db)
     *************************************************************************/
    const DB_KEY = 'weGogym_db';
    const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    const DEFAULT_DB = {
      ui: {
        hideWelcomeBanner: false
      },
      profile: {
        name: 'Athlete',
        avatar: '',
        age: 26,
        heightCm: 178,
        currentWeightKg: 75,
        targetWeightKg: 78,
        goal: 'Muscle Growth',
        level: 'Intermediate',
        scheduleTime: '07:30'
      },
      settings: {
        theme: 'light',
        units: 'metric', // 'metric' (kg/cm), 'imperial' (lbs/in) or 'stone' (st/cm)
        reminders: true
      },
      planBuilder: {
        goal: 'Muscle Growth',
        level: 'Intermediate',
        duration: 60,
        daysPerWeek: 4,
        selectedDays: ['Mon', 'Tue', 'Thu', 'Fri'],
        equipment: ['Barbell', 'Dumbbells', 'Cable Machine', 'Bodyweight', 'Machines'],
        draftPlan: null
      },
      activePlan: null, // { id, name, goal, level, duration, createdAt, days: { Mon: {...}, ... } }
      savedPlans: [],
      workouts: [],     // Completed workout logs
      activeSession: null, // In-progress workout session
      measurements: [], // { id, date, weightKg, bodyFat, chestCm, armsCm, waistCm, thighsCm, shouldersCm, calvesCm }
      photos: [],       // { id, date, dataUrl, note, workoutId }
      favorites: ['ex_bench_press', 'ex_pullups', 'ex_back_squat'],
      customExercises: []
    };

    /*************************************************************************
     * PHOTO VAULT: progress photos live in IndexedDB, encrypted with AES-GCM.
     * The key is non-extractable and stored in IndexedDB, so exported
     * localStorage or backup files never contain photo bytes.
     *************************************************************************/
    let photoVaultReady = false;

    const PhotoVault = (() => {
      const DB_NAME = 'wegogym-photos';
      let dbPromise = null;
      let keyPromise = null;

      function openDb() {
        if (!dbPromise) {
          dbPromise = new Promise((resolve, reject) => {
            if (!window.indexedDB || !window.crypto || !window.crypto.subtle) {
              reject(new Error('Secure photo storage needs a browser with IndexedDB and WebCrypto (HTTPS).'));
              return;
            }
            const req = indexedDB.open(DB_NAME, 1);
            req.onupgradeneeded = () => {
              const d = req.result;
              if (!d.objectStoreNames.contains('photos')) d.createObjectStore('photos', { keyPath: 'id' });
              if (!d.objectStoreNames.contains('keys')) d.createObjectStore('keys');
            };
            req.onsuccess = () => resolve(req.result);
            req.onerror = () => { dbPromise = null; reject(req.error); };
          });
        }
        return dbPromise;
      }

      async function run(store, mode, work) {
        const d = await openDb();
        return new Promise((resolve, reject) => {
          const tx = d.transaction(store, mode);
          const req = work(tx.objectStore(store));
          let result;
          if (req) req.onsuccess = () => { result = req.result; };
          tx.oncomplete = () => resolve(result);
          tx.onerror = () => reject(tx.error);
          tx.onabort = () => reject(tx.error);
        });
      }

      function getKey() {
        if (!keyPromise) {
          keyPromise = (async () => {
            const existing = await run('keys', 'readonly', (s) => s.get('photo-key'));
            if (existing) return existing;
            const key = await crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']);
            await run('keys', 'readwrite', (s) => s.put(key, 'photo-key'));
            return key;
          })().catch((err) => { keyPromise = null; throw err; });
        }
        return keyPromise;
      }

      async function encryptText(text) {
        const key = await getKey();
        const iv = crypto.getRandomValues(new Uint8Array(12));
        const ct = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, new TextEncoder().encode(text));
        return { iv, ct };
      }

      async function decryptText({ iv, ct }) {
        const key = await getKey();
        const pt = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, ct);
        return new TextDecoder().decode(pt);
      }

      return {
        async put(photo) {
          const { iv, ct } = await encryptText(photo.dataUrl);
          await run('photos', 'readwrite', (s) => s.put({
            id: photo.id,
            date: photo.date,
            note: photo.note || '',
            workoutId: photo.workoutId ?? null,
            iv,
            ct
          }));
        },
        async remove(id) {
          await run('photos', 'readwrite', (s) => s.delete(id));
        },
        async clear() {
          await run('photos', 'readwrite', (s) => s.clear());
        },
        async loadAll() {
          const records = (await run('photos', 'readonly', (s) => s.getAll())) || [];
          const out = [];
          for (const r of records) {
            try {
              out.push({ id: r.id, date: r.date, note: r.note, workoutId: r.workoutId, dataUrl: await decryptText(r) });
            } catch (err) {
              console.error('Skipping unreadable progress photo', r.id, err);
            }
          }
          return out.sort((a, b) => a.date.localeCompare(b.date));
        }
      };
    })();

    // Moves photos saved by older versions (inside localStorage) into the vault, then loads them.
    async function hydratePhotos() {
      try {
        const legacy = db.photos.filter(p => p.dataUrl);
        for (const p of legacy) await PhotoVault.put(p);
        db.photos = await PhotoVault.loadAll();
        photoVaultReady = true;
        saveDB(); // now strips any photo bytes out of localStorage
      } catch (err) {
        console.error(err);
        // Leave legacy photos where they are until the vault works.
        showToast('Secure photo storage is unavailable here. Photos cannot be saved until it is (HTTPS needed).', 'error');
      }
    }


    let db = loadDB();
    syncCustomExercises();

    // Custom exercises live in db.customExercises; mirror them into EXERCISE_DB.
    function syncCustomExercises() {
      for (let i = EXERCISE_DB.length - 1; i >= 0; i--) {
        if (EXERCISE_DB[i].custom) EXERCISE_DB.splice(i, 1);
      }
      (db.customExercises || []).forEach(ex => EXERCISE_DB.push({ ...ex, custom: true }));
    }

    function loadDB() {
      try {
        const raw = localStorage.getItem(DB_KEY);
        if (!raw) return structuredClone(DEFAULT_DB);
        const parsed = JSON.parse(raw);
        return {
          ...structuredClone(DEFAULT_DB),
          ...parsed,
          ui: { ...DEFAULT_DB.ui, ...(parsed.ui || {}) },
          profile: { ...DEFAULT_DB.profile, ...(parsed.profile || {}) },
          // One-time switch to the cream theme for saved data that still says 'dark'.
          // After this, the user's own theme choice is kept.
          settings: ((st) => ({
            ...DEFAULT_DB.settings,
            ...st,
            ...(st.themeMigrated ? {} : { theme: 'light', themeMigrated: true })
          }))(parsed.settings || {}),
          planBuilder: { ...DEFAULT_DB.planBuilder, ...(parsed.planBuilder || {}) }
        };
      } catch (err) {
        console.error('Failed to load DB:', err);
        return structuredClone(DEFAULT_DB);
      }
    }

    function saveDB() {
      try {
        // Photo bytes never go into localStorage once the vault is confirmed working.
        const persisted = photoVaultReady
          ? { ...db, photos: db.photos.map(({ dataUrl, ...meta }) => meta) }
          : db;
        localStorage.setItem(DB_KEY, JSON.stringify(persisted));
      } catch (e) {
        showToast('Storage quota reached. Consider removing older high-res photos.', 'error');
      }
    }

    // Escape any user-controlled string before it enters innerHTML/attribute contexts (XSS guard).
    function esc(value) {
      return String(value ?? '').replace(/[&<>"']/g, (ch) => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
      }[ch]));
    }

    /*************************************************************************
     * 4. UTILITY HELPERS (Units, Dates, Formatting, Audio, Toasts)
     *************************************************************************/
    function todayISO() {
      const d = new Date();
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    }

    function getWeekdayShort(dateObj = new Date()) {
      const idx = (dateObj.getDay() + 6) % 7; // Mon=0 .. Sun=6
      return WEEKDAYS[idx];
    }

    const UNIT_SYSTEMS = {
      metric: { label: 'kg / cm', weight: 'kg', length: 'cm' },
      imperial: { label: 'lbs / inches', weight: 'lbs', length: 'in' },
      stone: { label: 'stone / cm', weight: 'st', length: 'cm' }
    };
    const KG_PER_STONE = 6.35029318;

    function currentUnitSystem() {
      return UNIT_SYSTEMS[db.settings.units] ? db.settings.units : 'metric';
    }
    function weightUnitLabel() { return UNIT_SYSTEMS[currentUnitSystem()].weight; }
    function lengthUnitLabel() { return UNIT_SYSTEMS[currentUnitSystem()].length; }
    function unitToggleClass(active) {
      return `px-3 py-1 rounded-full text-xs font-bold transition ${active
        ? 'tab-nav-active bg-volt-400 text-charcoal-950 font-extrabold'
        : 'text-gray-500 dark:text-gray-400'}`;
    }

    function formatWeight(kgVal, includeUnit = false) {
      if (kgVal === null || kgVal === undefined || kgVal === '') return '—';
      const num = Number(kgVal);
      if (Number.isNaN(num)) return '—';
      const sys = currentUnitSystem();
      let val;
      if (sys === 'imperial') val = (num * 2.20462).toFixed(1);
      else if (sys === 'stone') val = (num / KG_PER_STONE).toFixed(1);
      else val = Number(num.toFixed(1));
      return includeUnit ? `${val} ${weightUnitLabel()}` : val;
    }

    function toStoredKg(inputVal) {
      if (inputVal === '' || inputVal === null || inputVal === undefined) return null;
      const num = parseFloat(inputVal);
      if (Number.isNaN(num)) return null;
      const sys = currentUnitSystem();
      if (sys === 'imperial') return +(num / 2.20462).toFixed(2);
      if (sys === 'stone') return +(num * KG_PER_STONE).toFixed(2);
      return +num.toFixed(2);
    }

    function formatLength(cmVal, includeUnit = false) {
      if (cmVal === null || cmVal === undefined || cmVal === '') return '—';
      const num = Number(cmVal);
      if (Number.isNaN(num)) return '—';
      const val = db.settings.units === 'imperial' ? (num / 2.54).toFixed(1) : Number(num.toFixed(1));
      return includeUnit ? `${val} ${lengthUnitLabel()}` : val;
    }

    function toStoredCm(inputVal) {
      if (inputVal === '' || inputVal === null || inputVal === undefined) return null;
      const num = parseFloat(inputVal);
      if (Number.isNaN(num)) return null;
      return db.settings.units === 'imperial' ? +(num * 2.54).toFixed(2) : +num.toFixed(2);
    }

    function showToast(message, type = 'info') {
      const container = document.getElementById('toast-container');
      const colors = {
        info: 'border-charcoal-700 bg-charcoal-900 text-gray-100',
        success: 'border-volt-400/60 bg-charcoal-900 text-volt-400',
        error: 'border-rose-400/50 bg-charcoal-900 text-rose-300'
      };
      const el = document.createElement('div');
      el.className = `pointer-events-auto px-4 py-3 rounded-2xl border shadow-xl text-xs font-semibold flex items-center justify-between gap-3 transition-all ${colors[type] || colors.info}`;
      // Built with DOM APIs instead of innerHTML so message text can never inject markup.
      const span = document.createElement('span');
      span.textContent = String(message);
      const btn = document.createElement('button');
      btn.className = 'opacity-70 hover:opacity-100';
      btn.textContent = '✕';
      btn.setAttribute('aria-label', 'Dismiss notification');
      btn.addEventListener('click', () => el.remove());
      el.append(span, btn);
      container.appendChild(el);
      setTimeout(() => el.remove(), 3800);
    }

    function playChime() {
      try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const now = ctx.currentTime;
        [523.25, 659.25, 783.99].forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + i * 0.12);
          gain.gain.setValueAtTime(0.14, now + i * 0.12);
          gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.12 + 0.4);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + i * 0.12);
          osc.stop(now + i * 0.12 + 0.42);
        });
      } catch (_) {}
    }

    function compressImageFile(file, maxWidth = 900, quality = 0.78) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onerror = reject;
        reader.onload = (e) => {
          const img = new Image();
          img.onerror = reject;
          img.onload = () => {
            const scale = Math.min(1, maxWidth / img.width);
            const canvas = document.createElement('canvas');
            canvas.width = Math.round(img.width * scale);
            canvas.height = Math.round(img.height * scale);
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            resolve(canvas.toDataURL('image/jpeg', quality));
          };
          img.src = e.target.result;
        };
        reader.readAsDataURL(file);
      });
    }

    function openModal(html) {
      const backdrop = document.getElementById('modal-backdrop');
      const content = document.getElementById('modal-content');
      content.innerHTML = html;
      backdrop.classList.remove('hidden');
      lucide.createIcons();
    }

    function closeModal() {
      document.getElementById('modal-backdrop').classList.add('hidden');
    }

    /*************************************************************************
     * 5. NAVIGATION & THEME CONTROLLER
     *************************************************************************/
    const NAV_TABS = [
      { id: 'dashboard', label: 'Dashboard', short: 'Home', icon: 'layout-dashboard', mobilePrimary: true },
      { id: 'plan', label: 'Workout Plan', short: 'Plan', icon: 'clipboard-list', mobilePrimary: true },
      { id: 'log', label: 'Workout Log', short: 'Log', icon: 'dumbbell', mobilePrimary: true },
      { id: 'library', label: 'Exercise Library', short: 'Library', icon: 'book-open', mobilePrimary: true },
      { id: 'calendar', label: 'Calendar', icon: 'calendar', mobilePrimary: false },
      { id: 'progress', label: 'Body Progress', icon: 'trending-up', mobilePrimary: false },
      { id: 'report', label: 'Monthly Report', icon: 'file-bar-chart-2', mobilePrimary: false },
      { id: 'profile', label: 'Profile & Goals', icon: 'user-cog', mobilePrimary: false }
    ];

    let activeTab = 'dashboard';

    function renderNavigation() {
      // Desktop Sidebar
      const desktopNav = document.getElementById('desktop-nav');
      desktopNav.innerHTML = NAV_TABS.map(tab => {
        const isActive = activeTab === tab.id;
        return `
          <button onclick="switchTab('${esc(tab.id)}')" class="tab-nav-button w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition ${
            isActive
              ? 'tab-nav-active bg-volt-400 text-charcoal-950 shadow-md shadow-volt-400/20'
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-charcoal-800 hover:text-gray-900 dark:hover:text-gray-100'
          }">
            <i data-lucide="${esc(tab.icon)}" class="w-4 h-4 ${isActive ? 'text-charcoal-950' : ''}"></i>
            <span>${esc(tab.label)}</span>
            ${tab.id === 'log' && db.activeSession ? `<span class="ml-auto w-2 h-2 rounded-full ${isActive ? 'bg-charcoal-950' : 'bg-volt-400'} animate-pulse"></span>` : ''}
          </button>
        `;
      }).join('');

      // Mobile Floating Pill Bottom Bar (4 Primary + More)
      const mobileBottom = document.getElementById('mobile-bottom-nav');
      const primaryTabs = NAV_TABS.filter(t => t.mobilePrimary);
      const secondaryTabs = NAV_TABS.filter(t => !t.mobilePrimary);
      const isSecondaryActive = secondaryTabs.some(t => t.id === activeTab);

      mobileBottom.innerHTML = primaryTabs.map(tab => {
        const isActive = activeTab === tab.id;
        return `
          <button onclick="switchTab('${esc(tab.id)}')" class="tab-nav-button flex flex-col items-center justify-center py-1.5 px-3 rounded-full transition ${
            isActive ? 'tab-nav-active bg-volt-400 text-charcoal-950 font-extrabold' : 'text-gray-300 hover:text-white'
          }">
            <i data-lucide="${esc(tab.icon)}" class="w-4 h-4"></i>
            <span class="text-[10px] mt-0.5 leading-none">${tab.short || tab.label.split(' ')[0]}</span>
          </button>
        `;
      }).join('') + `
        <button onclick="toggleMobileMore(true)" class="tab-nav-button flex flex-col items-center justify-center py-1.5 px-3 rounded-full transition ${
          isSecondaryActive ? 'tab-nav-active bg-volt-400 text-charcoal-950 font-extrabold' : 'text-gray-300 hover:text-white'
        }">
          <i data-lucide="grid" class="w-4 h-4"></i>
          <span class="text-[10px] mt-0.5 leading-none">More</span>
        </button>
      `;

      // Mobile More Drawer
      document.getElementById('mobile-more-grid').innerHTML = NAV_TABS.map(tab => {
        const isActive = activeTab === tab.id;
        return `
          <button onclick="switchTab('${esc(tab.id)}'); toggleMobileMore(false);" class="tab-nav-button flex items-center gap-2.5 p-3.5 rounded-2xl text-xs font-bold border transition ${
            isActive
              ? 'tab-nav-active bg-volt-400 border-volt-400 text-charcoal-950'
              : 'bg-gray-50 dark:bg-charcoal-800 border-gray-200 dark:border-charcoal-700'
          }">
            <i data-lucide="${esc(tab.icon)}" class="w-4 h-4 ${isActive ? 'text-charcoal-950' : 'text-volt-400'}"></i>
            <span>${esc(tab.label)}</span>
          </button>
        `;
      }).join('');

      lucide.createIcons();
    }

    function toggleMobileMore(show) {
      document.getElementById('mobile-more-drawer').classList.toggle('hidden', !show);
    }

    let tabTransitionVersion = 0;

    function renderTabContent(tabId) {
      if (tabId === 'dashboard') renderDashboard();
      if (tabId === 'plan') renderWorkoutPlanBuilder();
      if (tabId === 'log') renderWorkoutLogTab();
      if (tabId === 'library') renderExerciseLibrary();
      if (tabId === 'calendar') renderCalendar();
      if (tabId === 'progress') renderBodyProgressTab();
      if (tabId === 'report') renderMonthlyReport();
      if (tabId === 'profile') renderProfileTab();
      refreshChartThemes();
    }

    function switchTab(tabId) {
      const target = document.getElementById(`tab-${tabId}`);
      if (!target) return;

      const current = document.getElementById(`tab-${activeTab}`);
      const isChangingTab = activeTab !== tabId;
      const transitionVersion = ++tabTransitionVersion;
      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      activeTab = tabId;

      // Update the selected state immediately; it makes long tab names and the mobile
      // More drawer feel responsive even while the current page is exiting.
      renderNavigation();
      window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });

      const revealTarget = () => {
        // A newer tab click occurred while this exit animation was still running.
        if (transitionVersion !== tabTransitionVersion) return;

        document.querySelectorAll('.tab-section').forEach(section => {
          if (section !== target) {
            section.classList.add('hidden');
            section.classList.remove('tab-enter', 'tab-exit');
          }
        });

        target.classList.remove('hidden', 'tab-exit', 'tab-enter');
        if (!reduceMotion) {
          // Force a reflow so tab-enter restarts when a user returns to a tab.
          void target.offsetWidth;
          target.classList.add('tab-enter');
        }
        renderTabContent(tabId);
      };

      // Initial load, reduced motion, or a repeated click can reveal straight away.
      if (!isChangingTab || !current || current === target || current.classList.contains('hidden') || reduceMotion) {
        revealTarget();
        return;
      }

      // Keep the old section in flow briefly while it fades upward, then reveal the
      // requested tab. This prevents the abrupt hide/show flash from the old switcher.
      current.classList.remove('tab-enter', 'tab-exit');
      void current.offsetWidth;
      current.classList.add('tab-exit');
      window.setTimeout(revealTarget, 170);
    }

    function isDarkMode() {
      return document.documentElement.classList.contains('dark') || db.settings.theme === 'dark';
    }

    // Chart axis labels: pure white in dark theme, the existing slate grey in light theme.
    function chartTextColor() {
      return isDarkMode() ? '#FFFFFF' : '#4B5563';
    }

    function chartGridColor() {
      return isDarkMode() ? 'rgba(255, 255, 255, 0.16)' : 'rgba(17, 24, 39, 0.08)';
    }

    // Re-colour any charts already on screen when the theme changes.
    function refreshChartThemes() {
      if (typeof Chart !== 'undefined') Chart.defaults.color = chartTextColor();
      [dashboardChartInstance, bodyProgressChartInstance].forEach(chart => {
        if (!chart) return;
        ['x', 'y'].forEach(axis => {
          const scale = chart.options.scales[axis];
          scale.ticks.color = () => chartTextColor();
          if (scale.grid && axis === 'y') scale.grid.color = () => chartGridColor();
        });
        chart.update('none');
      });
    }

    function applyThemeAndUnits() {
      const isDark = db.settings.theme === 'dark';
      document.documentElement.classList.toggle('dark', isDark);
      const label = document.getElementById('sidebar-theme-label');
      if (label) label.textContent = isDark ? 'Dark Mode' : 'Light Mode';

      const wUnit = weightUnitLabel();
      const lUnit = lengthUnitLabel();
      document.querySelectorAll('.unit-weight-label').forEach(el => {
        if (el.textContent.includes('(')) el.textContent = `Volume (${wUnit})`;
        else el.textContent = wUnit;
      });
      document.querySelectorAll('.unit-length-label').forEach(el => el.textContent = lUnit);
      const badge = document.getElementById('sidebar-unit-badge');
      if (badge) badge.textContent = `${wUnit.toUpperCase()} / ${lUnit.toUpperCase()}`;
      refreshChartThemes();
    }

    function toggleTheme() {
      db.settings.theme = db.settings.theme === 'dark' ? 'light' : 'dark';
      saveDB();
      applyThemeAndUnits();
      if (activeTab === 'dashboard') renderDashboard();
      if (activeTab === 'progress') renderProgressChart();
    }

    function setUnits(unitSystem) {
      db.settings.units = unitSystem;
      saveDB();
      applyThemeAndUnits();
      renderProfileTab();
      if (activeTab === 'dashboard') renderDashboard();
      showToast(`Units switched to ${UNIT_SYSTEMS[unitSystem]?.label || UNIT_SYSTEMS.metric.label}`, 'info');
    }

    /*************************************************************************
     * 6. ANALYTICS & STREAK CALCULATIONS (100% Real Stored Records)
     *************************************************************************/
    function calculateStats() {
      const completed = db.workouts.filter(w => w.status === 'completed');
      const totalWorkouts = completed.length;

      // Total Volume in stored kg
      const totalVolumeKg = completed.reduce((sum, w) => sum + (Number(w.totalVolumeKg) || 0), 0);

      // Unique workout dates sorted ascending
      const uniqueDates = [...new Set(completed.map(w => w.date))].sort();

      // Current Streak & Longest Streak
      let longestStreak = 0;
      let tempStreak = 0;
      for (let i = 0; i < uniqueDates.length; i++) {
        if (i === 0) {
          tempStreak = 1;
        } else {
          const prev = new Date(uniqueDates[i - 1] + 'T00:00:00');
          const curr = new Date(uniqueDates[i] + 'T00:00:00');
          const diffDays = Math.round((curr - prev) / 86400000);
          tempStreak = diffDays === 1 ? tempStreak + 1 : 1;
        }
        if (tempStreak > longestStreak) longestStreak = tempStreak;
      }

      let currentStreak = 0;
      if (uniqueDates.length > 0) {
        const today = new Date(todayISO() + 'T00:00:00');
        const lastDate = new Date(uniqueDates[uniqueDates.length - 1] + 'T00:00:00');
        const gapFromToday = Math.round((today - lastDate) / 86400000);
        if (gapFromToday <= 1) {
          currentStreak = 1;
          for (let i = uniqueDates.length - 1; i > 0; i--) {
            const c = new Date(uniqueDates[i] + 'T00:00:00');
            const p = new Date(uniqueDates[i - 1] + 'T00:00:00');
            if (Math.round((c - p) / 86400000) === 1) currentStreak++;
            else break;
          }
        }
      }

      // Current week (Mon–Sun) workouts
      const now = new Date();
      const dayOfWeek = (now.getDay() + 6) % 7;
      const monday = new Date(now);
      monday.setDate(now.getDate() - dayOfWeek);
      monday.setHours(0, 0, 0, 0);
      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);
      sunday.setHours(23, 59, 59, 999);

      const thisWeekDates = new Set(
        completed
          .filter(w => {
            const d = new Date(w.date + 'T12:00:00');
            return d >= monday && d <= sunday;
          })
          .map(w => w.date)
      );

      const plannedDaysCount = db.activePlan
        ? Object.values(db.activePlan.days).filter(d => !d.isRest).length
        : 0;

      const completionRate = plannedDaysCount > 0
        ? Math.min(100, Math.round((thisWeekDates.size / plannedDaysCount) * 100))
        : (totalWorkouts > 0 ? 100 : 0);

      return {
        totalWorkouts,
        totalVolumeKg,
        currentStreak,
        longestStreak,
        weeklyCount: thisWeekDates.size,
        weeklyTarget: plannedDaysCount,
        completionRate
      };
    }

    /*************************************************************************
     * 7. TAB 1: DASHBOARD RENDERER
     *************************************************************************/
    let dashboardChartInstance = null;

    function getTimeGreeting() {
      const hr = new Date().getHours();
      if (hr >= 5 && hr < 12) return 'Good Morning';
      if (hr >= 12 && hr < 17) return 'Good Afternoon';
      if (hr >= 17 && hr < 21) return 'Good Evening';
      return 'Good Night';
    }

    function renderDashboard() {
      const banner = document.getElementById('welcome-hero-banner');
      if (banner) {
        banner.classList.toggle('hidden', !!db.ui?.hideWelcomeBanner);
      }

      const now = new Date();
      document.getElementById('dash-greeting').textContent = `${getTimeGreeting()}, ${db.profile.name || 'Athlete'}`;
      document.getElementById('dash-date').textContent = now.toLocaleDateString('en-US', {
        weekday: 'long', month: 'long', day: 'numeric', year: 'numeric'
      });
      document.getElementById('dash-goal-badge').textContent = `Goal: ${db.profile.goal}`;

      // Avatars
      const initials = (db.profile.name || 'WG').slice(0, 2).toUpperCase();
      const avatarHtml = db.profile.avatar
        ? `<img src="${db.profile.avatar}" alt="Avatar" class="w-full h-full object-cover" />`
        : `<span class="font-display font-extrabold text-volt-400">${initials}</span>`;
      document.getElementById('dash-avatar').innerHTML = avatarHtml;
      document.getElementById('mobile-header-avatar').innerHTML = avatarHtml;

      // Stats
      const stats = calculateStats();
      document.getElementById('stat-workouts-count').textContent = stats.totalWorkouts;
      document.getElementById('stat-completion-rate').textContent = `${stats.completionRate}% weekly adherence`;
      document.getElementById('stat-current-streak').textContent = stats.currentStreak;
      document.getElementById('stat-longest-streak').textContent = `Best: ${stats.longestStreak} days`;
      document.getElementById('stat-total-volume').textContent = Number(formatWeight(stats.totalVolumeKg)).toLocaleString();
      document.getElementById('stat-weekly-activity').textContent = stats.weeklyCount;
      document.getElementById('stat-weekly-target').textContent = `/ ${stats.weeklyTarget} days`;

      // Today's Workout Card
      const todayDay = getWeekdayShort(now);
      const todayDate = todayISO();
      const completedToday = db.workouts.find(w => w.date === todayDate && w.status === 'completed');
      const todayPlan = db.activePlan?.days?.[todayDay];
      const card = document.getElementById('todays-workout-card');

      if (completedToday) {
        card.innerHTML = `
          <div>
            <div class="flex items-center justify-between gap-2 mb-3">
              <span class="pill-chip px-3 py-1 text-xs bg-emerald-400/20 text-emerald-400 border border-emerald-400/30 flex items-center gap-1.5">
                <i data-lucide="check-circle-2" class="w-3.5 h-3.5"></i> Completed Today
              </span>
              <span class="text-xs font-semibold text-gray-400">${esc(todayDay)}</span>
            </div>
            <h2 class="text-2xl sm:text-3xl font-extrabold mb-2">${esc(completedToday.title)}</h2>
            <p class="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-4">
              Logged ${esc(completedToday.exercises.length)} exercises • ${esc(completedToday.durationMin)} min • ${formatWeight(completedToday.totalVolumeKg, true)} lifted
            </p>
          </div>
          <div class="flex flex-wrap gap-3">
            <button onclick="switchTab('log')" class="btn-primary px-6 py-3 text-xs sm:text-sm flex items-center gap-2">
              <i data-lucide="eye" class="w-4 h-4"></i> View Session Log
            </button>
          </div>
        `;
      } else if (todayPlan && !todayPlan.isRest) {
        card.innerHTML = `
          <div>
            <div class="flex flex-wrap items-center justify-between gap-2 mb-3">
              <span class="pill-chip px-3 py-1 text-xs bg-volt-400 text-charcoal-950 font-extrabold">Today's Scheduled Session</span>
              <div class="flex items-center gap-2 text-xs font-semibold">
                <span class="px-2.5 py-1 rounded-full bg-gray-100 dark:bg-charcoal-800 text-volt-500 dark:text-volt-400 border border-gray-200 dark:border-charcoal-700 flex items-center gap-1">
                  <i data-lucide="clock" class="w-3 h-3"></i> ${esc(todayPlan.duration)} min
                </span>
                <span class="px-2.5 py-1 rounded-full bg-gray-100 dark:bg-charcoal-800 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-charcoal-700">
                  ${esc(todayPlan.exercises.length)} Exercises
                </span>
              </div>
            </div>
            <h2 class="text-2xl sm:text-3xl font-extrabold mb-1">${esc(todayPlan.title)}</h2>
            <p class="text-xs font-semibold text-gray-500 dark:text-gray-300 mb-4">Target Muscles: ${esc(todayPlan.muscles)}</p>
            <div class="flex flex-wrap gap-1.5 mb-5">
              ${todayPlan.exercises.slice(0, 4).map(ex => `<span class="px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-charcoal-800 border border-gray-200 dark:border-charcoal-700 text-[11px] font-medium">${esc(ex.name)}</span>`).join('')}
              ${todayPlan.exercises.length > 4 ? `<span class="px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-charcoal-800 text-[11px] text-gray-400">+${todayPlan.exercises.length - 4} more</span>` : ''}
            </div>
          </div>
          <div class="flex flex-wrap items-center gap-3">
            <button onclick="startPlannedWorkout('${esc(todayDay)}')" class="btn-primary w-full sm:w-auto px-7 py-3.5 text-sm flex items-center justify-center gap-2">
              <i data-lucide="play" class="w-4 h-4 fill-current"></i> START WORKOUT
            </button>
          </div>
        `;
      } else if (todayPlan && todayPlan.isRest) {
        card.innerHTML = `
          <div>
            <span class="pill-chip px-3 py-1 text-xs bg-gray-500/20 text-gray-400 inline-block mb-3">Active Recovery</span>
            <h2 class="text-2xl sm:text-3xl font-extrabold mb-2">Scheduled Rest Day</h2>
            <p class="text-sm text-gray-500 dark:text-gray-400 mb-5">Muscle growth happens during recovery. Hydrate, stretch, or log an optional mobility session.</p>
          </div>
          <div>
            <button onclick="startEmptyWorkout()" class="px-5 py-2.5 rounded-full text-xs font-bold bg-gray-100 dark:bg-charcoal-800 hover:border-volt-400 border border-gray-200 dark:border-charcoal-700 text-volt-500 dark:text-volt-400 transition">
              + Start Optional Freestyle Workout
            </button>
          </div>
        `;
      } else {
        card.innerHTML = `
          <div>
            <span class="pill-chip px-3 py-1 text-xs bg-volt-400/15 text-volt-600 dark:text-volt-400 border border-volt-400/30 inline-block mb-3">No Active Plan</span>
            <h2 class="text-2xl sm:text-3xl font-extrabold mb-2">Build Your Training Split</h2>
            <p class="text-sm text-gray-500 dark:text-gray-400 mb-5">Generate a structured weekly workout routine tailored to your goals and schedule, or start a freestyle session right away.</p>
          </div>
          <div class="flex flex-wrap gap-3">
            <button onclick="switchTab('plan')" class="btn-primary px-6 py-3 text-xs sm:text-sm flex items-center gap-2">
              <i data-lucide="sparkles" class="w-4 h-4"></i> Create Workout Plan
            </button>
            <button onclick="startEmptyWorkout()" class="px-5 py-3 rounded-full text-xs sm:text-sm font-semibold bg-gray-100 dark:bg-charcoal-800 border border-gray-200 dark:border-charcoal-700">
              Start Empty Workout
            </button>
          </div>
        `;
      }

      // Mini Monthly Consistency Calendar
      renderMiniCalendar(now);

      // Weekly Volume Chart (Last 7 Days)
      renderDashboardVolumeChart();

      // Recent Workouts List
      const recentEl = document.getElementById('dash-recent-workouts');
      const recent = [...db.workouts].reverse().slice(0, 4);
      if (recent.length === 0) {
        recentEl.innerHTML = `
          <div class="h-full flex flex-col items-center justify-center text-center py-8 px-4 rounded-2xl border border-dashed border-gray-300 dark:border-charcoal-700">
            <i data-lucide="dumbbell" class="w-8 h-8 text-gray-400 mb-2"></i>
            <p class="text-xs font-semibold text-gray-400">No workouts logged yet.</p>
            <p class="text-[11px] text-gray-500 mt-1">Complete your first session to populate analytics.</p>
          </div>
        `;
      } else {
        recentEl.innerHTML = recent.map(w => `
          <div class="elevated-box p-3.5 flex items-center justify-between gap-2">
            <div>
              <p class="text-xs font-bold">${esc(w.title)}</p>
              <p class="text-[11px] text-gray-400">${esc(w.date)} • ${esc(w.durationMin)} min</p>
            </div>
            <span class="text-xs font-extrabold text-volt-500 dark:text-volt-400">${formatWeight(w.totalVolumeKg, true)}</span>
          </div>
        `).join('');
      }

      lucide.createIcons();
    }

    function dismissWelcomeBanner() {
      db.ui.hideWelcomeBanner = true;
      saveDB();
      document.getElementById('welcome-hero-banner')?.classList.add('hidden');
    }

    function renderMiniCalendar(now) {
      const year = now.getFullYear();
      const month = now.getMonth();
      document.getElementById('dash-month-label').textContent = now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

      const firstDay = new Date(year, month, 1);
      const startOffset = (firstDay.getDay() + 6) % 7;
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      const todayStr = todayISO();

      let html = WEEKDAYS.map(d => `<div class="text-[10px] font-bold text-gray-400 pb-1">${d[0]}</div>`).join('');
      for (let i = 0; i < startOffset; i++) html += `<div></div>`;

      for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const status = getDateStatus(dateStr);
        const dotColors = {
          completed: 'bg-emerald-400 text-charcoal-950 font-bold',
          missed: 'bg-rose-400/20 text-rose-400 border border-rose-400/40',
          planned: 'bg-volt-400/20 text-volt-500 dark:text-volt-300 border border-volt-400/40',
          inprogress: 'bg-volt-400 text-charcoal-950 font-extrabold',
          rest: 'bg-gray-200/70 dark:bg-charcoal-800 text-gray-400'
        };
        const ring = dateStr === todayStr ? 'ring-2 ring-volt-400' : '';
        html += `<div onclick="switchTab('calendar')" class="aspect-square rounded-lg text-[11px] flex items-center justify-center cursor-pointer ${dotColors[status]} ${ring}">${day}</div>`;
      }
      document.getElementById('dash-mini-calendar').innerHTML = html;
    }

    function renderDashboardVolumeChart() {
      const ctx = document.getElementById('dashboardVolumeChart');
      if (!ctx) return;

      const labels = [];
      const data = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        labels.push(d.toLocaleDateString('en-US', { weekday: 'short' }));
        const dayVolKg = db.workouts
          .filter(w => w.date === iso && w.status === 'completed')
          .reduce((s, w) => s + (Number(w.totalVolumeKg) || 0), 0);
        data.push(Number(formatWeight(dayVolKg)));
      }

      if (dashboardChartInstance) dashboardChartInstance.destroy();
      
      dashboardChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
          labels,
          datasets: [{
            label: `Volume (${weightUnitLabel()})`,
            data,
            backgroundColor: '#C5F02E',
            hoverBackgroundColor: '#C5F02E',
            borderRadius: 10,
            maxBarThickness: 34
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false }
          },
          scales: {
            y: {
              beginAtZero: true,
              grid: { color: () => chartGridColor() },
              ticks: { color: () => chartTextColor(), font: { size: 11 } }
            },
            x: {
              grid: { display: false },
              ticks: { color: () => chartTextColor(), font: { size: 11 } }
            }
          }
        }
      });
    }

    /*************************************************************************
     * 8. TAB 2: INTERACTIVE WORKOUT PLAN BUILDER
     *************************************************************************/
    const GOALS_LIST = ['Strength', 'Muscle Growth', 'Fat Loss', 'Endurance', 'Calisthenics'];
    const LEVELS_LIST = ['Beginner', 'Intermediate', 'Advanced'];
    const DURATIONS_LIST = [30, 45, 60, 75];

    function renderWorkoutPlanBuilder() {
      const pb = db.planBuilder;

      // Active Plan Status Pill
      document.getElementById('active-plan-status-pill').innerHTML = db.activePlan
        ? `<span class="pill-chip px-3.5 py-1.5 text-xs bg-volt-400 text-charcoal-950 font-extrabold flex items-center gap-1.5"><i data-lucide="check-circle" class="w-3.5 h-3.5"></i> Active Plan: ${esc(db.activePlan.name)}</span>`
        : `<span class="pill-chip px-3.5 py-1.5 text-xs bg-gray-200 dark:bg-charcoal-800 text-gray-400">No Active Plan Saved</span>`;

      // Every selection control carries a shared hook plus a group-specific hook so its
      // selected colour can be restyled consistently in light and dark themes.
      // Goal Chips
      document.getElementById('plan-goal-chips').innerHTML = GOALS_LIST.map(g => `
        <button type="button" onclick="setPlanBuilderField('goal', '${esc(g)}')" class="plan-selection-control plan-selection-goal pill-chip px-4 py-2 text-xs ${
          pb.goal === g
            ? 'is-selected font-extrabold'
            : 'bg-gray-100 dark:bg-charcoal-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-charcoal-700'
        }">${esc(g)}</button>
      `).join('');

      // Experience Level
      document.getElementById('plan-level-chips').innerHTML = LEVELS_LIST.map(l => `
        <button type="button" onclick="setPlanBuilderField('level', '${esc(l)}')" class="plan-selection-control plan-selection-level py-2 px-3 rounded-xl text-xs font-bold transition ${
          pb.level === l
            ? 'is-selected font-extrabold'
            : 'bg-gray-100 dark:bg-charcoal-800 text-gray-600 dark:text-gray-300'
        }">${esc(l)}</button>
      `).join('');

      // Duration
      document.getElementById('plan-duration-chips').innerHTML = DURATIONS_LIST.map(d => `
        <button type="button" onclick="setPlanBuilderField('duration', ${esc(d)})" class="plan-selection-control plan-selection-duration py-2 px-2 rounded-xl text-xs font-bold transition ${
          pb.duration === d
            ? 'is-selected font-extrabold'
            : 'bg-gray-100 dark:bg-charcoal-800 text-gray-600 dark:text-gray-300'
        }">${esc(d)}m</button>
      `).join('');

      // Day count presets (2..7)
      document.getElementById('plan-daycount-chips').innerHTML = [2, 3, 4, 5, 6, 7].map(cnt => `
        <button type="button" onclick="setPlanDayCount(${esc(cnt)})" class="plan-selection-control plan-selection-day-count w-7 h-7 rounded-full text-xs font-bold transition ${
          pb.selectedDays.length === cnt
            ? 'is-selected font-extrabold'
            : 'bg-gray-100 dark:bg-charcoal-800 text-gray-400'
        }">${esc(cnt)}</button>
      `).join('');

      // Individual Mon-Sun toggles
      document.getElementById('plan-weekdays-selector').innerHTML = WEEKDAYS.map(day => {
        const active = pb.selectedDays.includes(day);
        return `
          <button type="button" onclick="togglePlanWeekday('${esc(day)}')" class="plan-selection-control plan-selection-weekday py-2.5 rounded-xl text-xs font-extrabold border transition flex flex-col items-center gap-0.5 ${
            active
              ? 'is-selected'
              : 'bg-gray-100 dark:bg-charcoal-800 border-transparent text-gray-400'
          }">
            <span>${esc(day)}</span>
            <span class="text-[9px] uppercase">${active ? 'Train' : 'Rest'}</span>
          </button>
        `;
      }).join('');

      // Equipment Chips
      document.getElementById('plan-equipment-chips').innerHTML = EQUIPMENT_TYPES.map(eq => {
        const checked = pb.equipment.includes(eq);
        return `
          <button type="button" onclick="togglePlanEquipment('${esc(eq)}')" class="plan-selection-control plan-selection-equipment pill-chip px-3.5 py-1.5 text-xs border transition flex items-center gap-1.5 ${
            checked
              ? 'is-selected'
              : 'bg-gray-100 dark:bg-charcoal-800 border-transparent text-gray-400'
          }">
            <span>${checked ? '✓' : '+'}</span> ${esc(eq)}
          </button>
        `;
      }).join('');

      // Render Draft or Active Plan
      const planToShow = pb.draftPlan || db.activePlan;
      const output = document.getElementById('plan-schedule-output');
      if (!planToShow) {
        output.innerHTML = `
          <div class="surface-card box-plan-empty-state p-8 text-center">
            <i data-lucide="calendar-plus" class="w-10 h-10 text-volt-500 dark:text-volt-400 mx-auto mb-3"></i>
            <h3 class="text-lg font-bold">Ready to Generate Your Weekly Split</h3>
            <p class="text-xs text-gray-500 dark:text-gray-400 max-w-md mx-auto mt-1">Configure your goal, training days, and equipment above, then tap <strong>Generate Plan</strong>.</p>
          </div>
        `;
      } else {
        output.innerHTML = `
          <div class="flex flex-wrap items-center justify-between gap-2">
            <h2 class="text-lg font-extrabold">${esc(planToShow.name)} ${pb.draftPlan ? '<span class="text-xs font-bold text-volt-500 dark:text-volt-400 ml-2">(Unsaved Draft)</span>' : '<span class="text-xs font-semibold text-emerald-400 ml-2">(Saved Active)</span>'}</h2>
            <span class="text-xs text-gray-400">${esc(planToShow.goal)} • ${esc(planToShow.level)} • ~${esc(planToShow.duration)} min/session</span>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            ${WEEKDAYS.map(day => {
              const d = planToShow.days[day];
              if (d.isRest) {
                return `
                  <div class="surface-card box-plan-rest-day box-plan-day-${day.toLowerCase()} p-5 opacity-75 flex items-center justify-between">
                    <div>
                      <span class="text-xs font-extrabold uppercase tracking-wider text-gray-400">${esc(day)}</span>
                      <h3 class="text-base font-bold mt-0.5">Rest & Active Recovery</h3>
                      <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">Mobility, light walking, and sleep optimization.</p>
                    </div>
                    <span class="px-3 py-1 rounded-full bg-gray-200 dark:bg-charcoal-800 text-xs font-semibold text-gray-400">Rest Day</span>
                  </div>
                `;
              }
              return `
                <div class="surface-card box-plan-training-day box-plan-day-${day.toLowerCase()} p-5 space-y-3">
                  <div class="flex items-start justify-between gap-2">
                    <div>
                      <span class="text-xs font-extrabold uppercase tracking-wider text-volt-600 dark:text-volt-400">${esc(day)}</span>
                      <h3 class="text-lg font-extrabold">${esc(d.title)}</h3>
                      <p class="text-xs text-gray-500 dark:text-gray-400">${esc(d.muscles)} • Rest: ${esc(d.restInterval)}</p>
                    </div>
                    <button onclick="startPlannedWorkout('${esc(day)}', true)" class="px-3.5 py-1.5 rounded-full bg-volt-400 text-charcoal-950 text-xs font-extrabold transition hover:opacity-90">
                      Start
                    </button>
                  </div>
                  <div class="space-y-2 pt-2 border-t border-gray-200 dark:border-charcoal-700">
                    ${d.exercises.map((ex, idx) => `
                      <div class="elevated-box p-2.5 flex items-center justify-between gap-2 text-xs">
                        <div>
                          <p class="font-bold">${idx + 1}. ${esc(ex.name)}</p>
                          <p class="text-[11px] text-gray-400">${esc(ex.equipment)} • ${esc(ex.sets)} sets × ${esc(ex.reps)}</p>
                        </div>
                        <button onclick="removeExerciseFromPlanDay('${esc(day)}', ${esc(idx)})" class="text-gray-400 hover:text-rose-400 p-1" title="Remove">
                          <i data-lucide="x" class="w-3.5 h-3.5"></i>
                        </button>
                      </div>
                    `).join('')}
                  </div>
                  <button onclick="openMuscleAddModal('day', '${esc(day)}')" class="add-exercise-btn add-exercise-btn--block">
                    <i data-lucide="plus" class="w-3.5 h-3.5"></i> Add Exercise
                  </button>
                </div>
              `;
            }).join('')}
          </div>
        `;
      }

      lucide.createIcons();
    }

    function setPlanBuilderField(key, val) {
      db.planBuilder[key] = val;
      saveDB();
      renderWorkoutPlanBuilder();
    }

    function setPlanDayCount(count) {
      const presets = {
        2: ['Mon', 'Thu'],
        3: ['Mon', 'Wed', 'Fri'],
        4: ['Mon', 'Tue', 'Thu', 'Fri'],
        5: ['Mon', 'Tue', 'Wed', 'Fri', 'Sat'],
        6: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
        7: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
      };
      db.planBuilder.selectedDays = presets[count] || ['Mon', 'Wed', 'Fri'];
      saveDB();
      renderWorkoutPlanBuilder();
    }

    function togglePlanWeekday(day) {
      const idx = db.planBuilder.selectedDays.indexOf(day);
      if (idx >= 0) {
        if (db.planBuilder.selectedDays.length <= 1) {
          showToast('Select at least 1 training day.', 'error');
          return;
        }
        db.planBuilder.selectedDays.splice(idx, 1);
      } else {
        db.planBuilder.selectedDays.push(day);
        db.planBuilder.selectedDays.sort((a, b) => WEEKDAYS.indexOf(a) - WEEKDAYS.indexOf(b));
      }
      saveDB();
      renderWorkoutPlanBuilder();
    }

    function togglePlanEquipment(eq) {
      const idx = db.planBuilder.equipment.indexOf(eq);
      if (idx >= 0) {
        if (db.planBuilder.equipment.length <= 1) {
          showToast('Keep at least 1 equipment option selected.', 'error');
          return;
        }
        db.planBuilder.equipment.splice(idx, 1);
      } else {
        db.planBuilder.equipment.push(eq);
      }
      saveDB();
      renderWorkoutPlanBuilder();
    }

    const CATEGORY_ALIASES = { Arms: ['Biceps', 'Triceps'], Calves: ['Legs'] };
    const GOAL_EXTRA_CATEGORY = { Calisthenics: 'Calisthenics', 'Fat Loss': 'Cardio', Endurance: 'Cardio' };
    const LEVEL_RANK = { Beginner: 0, Intermediate: 1, Advanced: 2 };

    // Expands legacy split labels ("Arms", "Calves") and adds the category a goal leans on.
    function splitCategoriesForGoal(cats, goal) {
      const expanded = cats.flatMap(c => CATEGORY_ALIASES[c] || [c]);
      const extra = GOAL_EXTRA_CATEGORY[goal];
      if (extra) expanded.push(extra);
      return [...new Set(expanded)];
    }

    // Goal-tagged exercises rank first, then the closest difficulty to the user's level.
    function rankPoolForGoal(pool, goal, level, shuffle) {
      const lvl = LEVEL_RANK[level] ?? 1;
      return pool
        .map(ex => {
          const goalScore = ex.goals?.includes(goal) ? 4 : 0;
          const levelScore = Math.max(0, 2 - Math.abs((LEVEL_RANK[ex.difficulty] ?? 1) - lvl));
          return { ex, score: goalScore + levelScore + (shuffle ? Math.random() * 0.9 : 0) };
        })
        .sort((a, b) => b.score - a.score)
        .map(o => o.ex);
    }

    function generateWorkoutPlan(shuffle = false) {
      const { goal, level, duration, selectedDays, equipment } = db.planBuilder;
      const n = selectedDays.length;

      // Smart Split Templates based on number of training days & goal
      const splitTemplates = {
        1: [{ title: 'Full Body Power & Conditioning', cats: ['Chest', 'Back', 'Legs', 'Shoulders', 'Abs'] }],
        2: [
          { title: 'Upper Body Strength & Hypertrophy', cats: ['Chest', 'Back', 'Shoulders', 'Biceps', 'Triceps'] },
          { title: 'Lower Body & Core Foundation', cats: ['Legs', 'Abs', 'Calves', 'Cardio'] }
        ],
        3: [
          { title: 'Push — Chest, Shoulders & Triceps', cats: ['Chest', 'Shoulders', 'Triceps'] },
          { title: 'Pull — Back, Rear Delts & Biceps', cats: ['Back', 'Biceps', 'Forearms'] },
          { title: 'Legs & Core Performance', cats: ['Legs', 'Abs'] }
        ],
        4: [
          { title: 'Upper Body A (Push Focus)', cats: ['Chest', 'Shoulders', 'Triceps', 'Back'] },
          { title: 'Lower Body A (Quad & Core)', cats: ['Legs', 'Abs'] },
          { title: 'Upper Body B (Pull & Arms)', cats: ['Back', 'Biceps', 'Shoulders', 'Forearms'] },
          { title: 'Lower Body B (Posterior & Conditioning)', cats: ['Legs', 'Abs', 'Cardio'] }
        ],
        5: [
          { title: 'Chest & Triceps', cats: ['Chest', 'Triceps'] },
          { title: 'Back & Biceps', cats: ['Back', 'Biceps', 'Forearms'] },
          { title: 'Legs & Abs', cats: ['Legs', 'Abs'] },
          { title: 'Shoulders & Arms', cats: ['Shoulders', 'Biceps', 'Triceps'] },
          { title: 'Full Body Athletic & Conditioning', cats: ['Legs', 'Chest', 'Back', 'Cardio'] }
        ],
        6: [
          { title: 'Chest + Triceps', cats: ['Chest', 'Triceps'] },
          { title: 'Back + Biceps', cats: ['Back', 'Biceps'] },
          { title: 'Legs + Abs', cats: ['Legs', 'Abs'] },
          { title: 'Shoulders + Forearms', cats: ['Shoulders', 'Forearms'] },
          { title: 'Chest + Back Hypertrophy', cats: ['Chest', 'Back'] },
          { title: 'Arms + Core + Conditioning', cats: ['Biceps', 'Triceps', 'Abs', 'Cardio'] }
        ],
        7: [
          { title: 'Chest + Triceps', cats: ['Chest', 'Triceps'] },
          { title: 'Back + Biceps', cats: ['Back', 'Biceps'] },
          { title: 'Legs (Quad Focus)', cats: ['Legs'] },
          { title: 'Shoulders + Abs', cats: ['Shoulders', 'Abs'] },
          { title: 'Upper Body Pump', cats: ['Chest', 'Back', 'Arms'] },
          { title: 'Legs (Posterior) + Forearms', cats: ['Legs', 'Forearms'] },
          { title: 'Calisthenics & Metabolic Conditioning', cats: ['Calisthenics', 'Cardio', 'Abs'] }
        ]
      };

      const templates = splitTemplates[n] || splitTemplates[4];
      const setsCount = level === 'Beginner' ? 3 : level === 'Intermediate' ? 4 : 4;
      const repScheme = goal === 'Strength' ? '5–6' : goal === 'Muscle Growth' ? '8–12' : goal === 'Fat Loss' ? '12–15' : '15–20';
      const restInterval = goal === 'Strength' ? '120–180s' : goal === 'Muscle Growth' ? '75–90s' : '45–60s';
      const maxExercises = duration <= 30 ? 4 : duration <= 45 ? 5 : duration <= 60 ? 6 : 7;

      const daysObj = {};
      let trainIdx = 0;

      WEEKDAYS.forEach(day => {
        if (!selectedDays.includes(day)) {
          daysObj[day] = { isRest: true };
          return;
        }
        const tpl = templates[trainIdx % templates.length];
        trainIdx++;
        const cats = splitCategoriesForGoal(tpl.cats, goal);

        const usedIds = new Set();
        const chosenExercises = [];

        // Filter exercises matching equipment (with Bodyweight fallback)
        let pool = EXERCISE_DB.filter(ex =>
          (cats.includes(ex.category) || (goal === 'Calisthenics' && ex.category === 'Calisthenics')) &&
          (equipment.includes(ex.equipment) || ex.equipment === 'Bodyweight')
        );
        if (pool.length < 3) {
          pool = EXERCISE_DB.filter(ex => equipment.includes(ex.equipment) || ex.equipment === 'Bodyweight');
        }
        if (shuffle) {
          pool = [...pool].sort(() => Math.random() - 0.5);
        }
        pool = rankPoolForGoal(pool, goal, level, shuffle);

        // Round-robin pick across target categories to avoid duplicate exercises
        let safety = 0;
        while (chosenExercises.length < maxExercises && safety < 50) {
          const cat = cats[safety % cats.length];
          const candidate = pool.find(ex => ex.category === cat && !usedIds.has(ex.id))
            || pool.find(ex => !usedIds.has(ex.id));
          if (candidate) {
            usedIds.add(candidate.id);
            chosenExercises.push({
              exerciseId: candidate.id,
              name: candidate.name,
              equipment: candidate.equipment,
              category: candidate.category,
              sets: setsCount,
              reps: repScheme
            });
          }
          safety++;
        }

        daysObj[day] = {
          isRest: false,
          title: tpl.title,
          muscles: tpl.cats.join(', '),
          duration,
          restInterval,
          exercises: chosenExercises
        };
      });

      db.planBuilder.draftPlan = {
        id: 'plan_' + Date.now(),
        name: `${n}-Day ${goal} Split`,
        goal,
        level,
        duration,
        createdAt: todayISO(),
        days: daysObj
      };
      saveDB();
      renderWorkoutPlanBuilder();
      showToast(shuffle ? 'Regenerated fresh exercise selection!' : 'Workout plan generated! Click Save Active Plan to activate.', 'success');
    }

    function saveDraftPlan() {
      const plan = db.planBuilder.draftPlan || db.activePlan;
      if (!plan) {
        showToast('Generate a workout plan first.', 'error');
        return;
      }
      db.activePlan = structuredClone(plan);
      db.savedPlans.unshift(structuredClone(plan));
      db.planBuilder.draftPlan = null;
      saveDB();
      renderWorkoutPlanBuilder();
      showToast('Active workout plan saved! Calendar & Today’s Workout updated.', 'success');
    }

    function discardDraftPlan() {
      db.planBuilder.draftPlan = null;
      saveDB();
      renderWorkoutPlanBuilder();
      showToast('Draft plan discarded.', 'info');
    }

    function removeExerciseFromPlanDay(day, exIndex) {
      const target = db.planBuilder.draftPlan || db.activePlan;
      if (!target || !target.days[day]) return;
      target.days[day].exercises.splice(exIndex, 1);
      saveDB();
      renderWorkoutPlanBuilder();
    }

    /*************************************************************************
     * 9. TAB 3: WORKOUT LOG, ACTIVE SESSION, REST TIMER & PROGRESS PHOTO PROMPT
     *************************************************************************/
    let activeElapsedInterval = null;
    let restTimerState = {
      totalSec: 90,
      remainingSec: 90,
      running: false,
      intervalId: null
    };

    function startPlannedWorkout(day, fromDraft = false) {
      const sourcePlan = fromDraft && db.planBuilder.draftPlan ? db.planBuilder.draftPlan : db.activePlan;
      const dayPlan = sourcePlan?.days?.[day];
      if (!dayPlan || dayPlan.isRest) {
        startEmptyWorkout();
        return;
      }

      db.activeSession = {
        id: 'sess_' + Date.now(),
        title: dayPlan.title,
        date: todayISO(),
        startedAt: Date.now(),
        exercises: dayPlan.exercises.map(ex => ({
          exerciseId: ex.exerciseId || '',
          name: ex.name,
          skipped: false,
          notes: '',
          sets: Array.from({ length: ex.sets || 3 }, () => ({
            weightKg: '',
            reps: parseInt(ex.reps) || 10,
            completed: false
          }))
        }))
      };
      saveDB();
      switchTab('log');
      showToast(`Started: ${dayPlan.title}`, 'success');
    }

    function startEmptyWorkout() {
      db.activeSession = {
        id: 'sess_' + Date.now(),
        title: 'Custom Gym Session',
        date: todayISO(),
        startedAt: Date.now(),
        exercises: []
      };
      saveDB();
      switchTab('log');
      showToast('Freestyle workout started. Add exercises below!', 'info');
    }

    function renderWorkoutLogTab() {
      const activeContainer = document.getElementById('active-workout-container');
      const hubContainer = document.getElementById('workout-log-hub');

      if (db.activeSession) {
        hubContainer.classList.add('hidden');
        activeContainer.classList.remove('hidden');
        renderActiveWorkoutScreen();
        return;
      }

      if (activeElapsedInterval) clearInterval(activeElapsedInterval);
      activeContainer.classList.add('hidden');
      hubContainer.classList.remove('hidden');

      // Render This Week's Plan Launcher
      const weekGrid = document.getElementById('log-weekly-plan-grid');
      if (!db.activePlan) {
        weekGrid.innerHTML = `<div class="col-span-full text-xs text-gray-400 py-4">No active weekly plan yet. Create one in the <strong>Workout Plan</strong> tab.</div>`;
      } else {
        weekGrid.innerHTML = WEEKDAYS.map(day => {
          const d = db.activePlan.days[day];
          if (d.isRest) {
            return `
              <div class="elevated-box p-3.5 opacity-60">
                <span class="text-[10px] font-bold uppercase text-gray-400">${esc(day)}</span>
                <p class="text-xs font-bold mt-0.5">Rest Day</p>
              </div>
            `;
          }
          return `
            <div class="elevated-box p-3.5 flex flex-col justify-between gap-2.5">
              <div>
                <span class="text-[10px] font-extrabold uppercase text-volt-600 dark:text-volt-400">${esc(day)} • ${esc(d.exercises.length)} exercises</span>
                <p class="text-xs font-extrabold mt-0.5 line-clamp-1">${esc(d.title)}</p>
              </div>
              <button onclick="startPlannedWorkout('${esc(day)}')" class="w-full py-2 rounded-full bg-volt-400/20 hover:bg-volt-400 text-volt-600 dark:text-volt-400 hover:text-charcoal-950 text-xs font-extrabold transition">
                Start Session
              </button>
            </div>
          `;
        }).join('');
      }

      // Saved Plans
      const savedList = document.getElementById('log-saved-plans-list');
      if (db.savedPlans.length === 0) {
        savedList.innerHTML = `<p class="text-xs text-gray-400 py-4">No saved plans archived yet.</p>`;
      } else {
        savedList.innerHTML = db.savedPlans.slice(0, 5).map((p, idx) => `
          <div class="elevated-box p-3.5 flex items-center justify-between gap-2">
            <div>
              <p class="text-xs font-bold">${esc(p.name)}</p>
              <p class="text-[11px] text-gray-400">${esc(p.goal)} • ${esc(p.level)}</p>
            </div>
            <button onclick="activateSavedPlan(${esc(idx)})" class="px-3 py-1.5 rounded-full bg-volt-400 text-charcoal-950 text-xs font-extrabold">Activate</button>
          </div>
        `).join('');
      }

      // Past Completed Workouts
      const pastList = document.getElementById('log-past-workouts-list');
      const past = [...db.workouts].reverse();
      document.getElementById('log-past-count').textContent = `${past.length} sessions`;
      if (past.length === 0) {
        pastList.innerHTML = `<p class="text-xs text-gray-400 py-6 text-center">No completed workouts recorded yet.</p>`;
      } else {
        pastList.innerHTML = past.map(w => `
          <div class="elevated-box p-4 space-y-2">
            <div class="flex items-center justify-between gap-2">
              <div>
                <h4 class="text-sm font-extrabold">${esc(w.title)}</h4>
                <p class="text-[11px] text-gray-400">${esc(w.date)} • ${esc(w.durationMin)} min • ${esc(w.totalSets)} sets</p>
              </div>
              <span class="px-3 py-1 rounded-full bg-volt-400 text-charcoal-950 text-xs font-extrabold">${formatWeight(w.totalVolumeKg, true)}</span>
            </div>
            <div class="flex flex-wrap gap-1.5">
              ${w.exercises.map(e => `<span class="text-[11px] px-2 py-0.5 rounded bg-white/60 dark:bg-charcoal-900 text-gray-600 dark:text-gray-300">${esc(e.name)}</span>`).join('')}
            </div>
          </div>
        `).join('');
      }

      lucide.createIcons();
    }

    function activateSavedPlan(idx) {
      const chosen = db.savedPlans[idx];
      if (!chosen) return;
      db.activePlan = structuredClone(chosen);
      saveDB();
      renderWorkoutLogTab();
      showToast(`Activated "${chosen.name}"`, 'success');
    }

    function renderActiveWorkoutScreen() {
      const s = db.activeSession;
      if (!s) return;
      const wUnit = weightUnitLabel();

      const container = document.getElementById('active-workout-container');
      container.innerHTML = `
        <!-- Top Kinetic Active Workout Header -->
        <div class="surface-card box-log-active-session p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 border-volt-400/40">
          <div>
            <div class="flex items-center gap-2 mb-1">
              <span class="px-2.5 py-0.5 rounded-full bg-volt-400 text-charcoal-950 text-[11px] font-extrabold flex items-center gap-1">
                <span class="w-1.5 h-1.5 rounded-full bg-charcoal-950 animate-ping"></span> Workout In Progress
              </span>
              <span class="text-xs text-gray-400">${esc(s.date)}</span>
            </div>
            <input type="text" value="${esc(s.title)}" onchange="db.activeSession.title = this.value; saveDB();" class="text-xl sm:text-2xl font-display font-extrabold bg-transparent border-b border-transparent focus:border-volt-400 focus:outline-none w-full" />
          </div>

          <div class="flex flex-wrap items-center gap-2.5">
            <div class="px-4 py-2 rounded-full bg-gray-100 dark:bg-charcoal-800 border border-gray-200 dark:border-charcoal-700 font-display font-extrabold text-sm text-volt-500 dark:text-volt-400 flex items-center gap-1.5">
              <i data-lucide="timer" class="w-4 h-4"></i>
              <span id="active-session-clock">00:00</span>
            </div>
            <button onclick="openAddExerciseToSessionModal()" class="px-4 py-2.5 rounded-full bg-gray-100 dark:bg-charcoal-800 border border-gray-200 dark:border-charcoal-700 text-xs font-bold flex items-center gap-1.5 hover:border-volt-400">
              <i data-lucide="plus" class="w-4 h-4 text-volt-400"></i> Add Exercise
            </button>
            <button onclick="cancelActiveWorkout()" class="px-4 py-2.5 rounded-full bg-rose-500/15 text-rose-400 hover:bg-rose-500/25 text-xs font-bold">
              Cancel
            </button>
            <button onclick="finishActiveWorkout()" class="btn-primary px-6 py-2.5 text-xs sm:text-sm flex items-center gap-1.5">
              <i data-lucide="check-circle-2" class="w-4 h-4"></i> Finish Workout
            </button>
          </div>
        </div>

        <!-- Functional Rest Timer Widget -->
        <div class="surface-card box-log-rest-timer p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div class="flex items-center gap-4">
            <div class="relative w-16 h-16 flex items-center justify-center">
              <svg class="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
                <circle cx="32" cy="32" r="27" stroke="currentColor" stroke-width="5" fill="none" class="text-gray-200 dark:text-charcoal-800" />
                <circle id="rest-timer-ring" cx="32" cy="32" r="27" stroke="#C5F02E" stroke-width="5" fill="none" stroke-dasharray="169.6" stroke-dashoffset="0" stroke-linecap="round" />
              </svg>
              <span id="rest-timer-display" class="absolute font-display font-extrabold text-sm">01:30</span>
            </div>
            <div>
              <h3 class="text-sm font-extrabold">Rest Interval Timer</h3>
              <div class="flex items-center gap-1.5 mt-1.5">
                ${[30, 60, 90, 120].map(sec => `
                  <button onclick="setRestDuration(${esc(sec)})" class="px-2.5 py-1 rounded-full text-[11px] font-bold bg-gray-100 dark:bg-charcoal-800 hover:bg-volt-400 hover:text-charcoal-950 transition">${esc(sec)}s</button>
                `).join('')}
                <input type="number" min="5" max="600" placeholder="Sec" onchange="if(this.value) setRestDuration(parseInt(this.value))" class="w-14 px-2 py-1 rounded-full bg-gray-100 dark:bg-charcoal-800 text-[11px] text-center" />
              </div>
            </div>
          </div>

          <div class="flex items-center gap-2">
            <button onclick="startRestTimer()" class="px-4 py-2 rounded-full bg-volt-400 text-charcoal-950 text-xs font-extrabold">Start</button>
            <button onclick="pauseRestTimer()" class="px-4 py-2 rounded-full bg-gray-100 dark:bg-charcoal-800 text-xs font-bold">Pause</button>
            <button onclick="resetRestTimer()" class="px-4 py-2 rounded-full bg-gray-100 dark:bg-charcoal-800 text-xs font-bold">Reset</button>
          </div>
        </div>

        <!-- Exercise Cards -->
        <div class="space-y-4">
          ${s.exercises.length === 0 ? `
            <div class="surface-card box-log-empty-session p-8 text-center">
              <p class="text-sm font-bold mb-2">No exercises in this session yet</p>
              <button onclick="openAddExerciseToSessionModal()" class="btn-primary px-5 py-2.5 text-xs">+ Add Exercise from Library</button>
            </div>
          ` : s.exercises.map((ex, exIdx) => `
            <div class="surface-card box-log-session-exercise box-log-session-exercise-${exIdx + 1} p-5 space-y-3 ${ex.skipped ? 'opacity-50' : ''}">
              <div class="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h3 class="text-base font-extrabold">${exIdx + 1}. ${esc(ex.name)} ${ex.skipped ? '<span class="text-xs text-volt-400">(Skipped)</span>' : ''}</h3>
                </div>
                <div class="flex items-center gap-2">
                  ${ex.exerciseId ? `<button onclick="openExerciseDetailModal('${esc(ex.exerciseId)}')" class="px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 dark:bg-charcoal-800 text-gray-500 dark:text-gray-300 hover:text-volt-400">How</button>` : ''}
                  <button onclick="toggleSkipSessionExercise(${esc(exIdx)})" class="px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 dark:bg-charcoal-800 text-gray-400 hover:text-volt-400">
                    ${ex.skipped ? 'Unskip' : 'Skip'}
                  </button>
                  <button onclick="removeSessionExercise(${esc(exIdx)})" class="p-1.5 rounded-full text-rose-400 hover:bg-rose-500/10" title="Remove Exercise">
                    <i data-lucide="trash-2" class="w-4 h-4"></i>
                  </button>
                </div>
              </div>

              <!-- Exercise Notes -->
              <input type="text" value="${esc(ex.notes || '')}" placeholder="Add form note, tempo, or machine pin setting..." onchange="db.activeSession.exercises[${esc(exIdx)}].notes = this.value; saveDB();" class="w-full px-3 py-1.5 rounded-xl bg-gray-100 dark:bg-charcoal-800/80 text-xs focus:outline-none focus:border-volt-400" />

              <!-- Sets Table -->
              <div class="space-y-2">
                <div class="grid grid-cols-12 gap-2 text-[11px] font-bold text-gray-400 px-2">
                  <div class="col-span-2">SET</div>
                  <div class="col-span-4">WEIGHT (${esc(wUnit)})</div>
                  <div class="col-span-4">REPS</div>
                  <div class="col-span-2 text-right">DONE</div>
                </div>
                ${ex.sets.map((set, setIdx) => {
                  const displayW = set.weightKg !== '' ? formatWeight(set.weightKg) : '';
                  return `
                    <div class="grid grid-cols-12 gap-2 items-center p-2 rounded-xl ${set.completed ? 'bg-volt-400/15 border border-volt-400/40' : 'elevated-box'}">
                      <div class="col-span-2 font-display font-extrabold text-xs pl-1">#${setIdx + 1}</div>
                      <div class="col-span-4">
                        <input type="number" step="0.5" value="${esc(displayW)}" placeholder="0" onchange="updateSessionSet(${esc(exIdx)}, ${esc(setIdx)}, 'weight', this.value)" class="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-charcoal-900 border border-gray-200 dark:border-charcoal-700 text-xs font-bold" />
                      </div>
                      <div class="col-span-4">
                        <input type="number" value="${esc(set.reps)}" placeholder="10" onchange="updateSessionSet(${esc(exIdx)}, ${esc(setIdx)}, 'reps', this.value)" class="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-charcoal-900 border border-gray-200 dark:border-charcoal-700 text-xs font-bold" />
                      </div>
                      <div class="col-span-2 flex justify-end">
                        <button onclick="toggleSetCompleted(${esc(exIdx)}, ${esc(setIdx)})" class="w-8 h-8 rounded-xl flex items-center justify-center transition ${
                          set.completed ? 'tab-nav-active bg-volt-400 text-charcoal-950 font-extrabold' : 'bg-gray-200 dark:bg-charcoal-900 text-gray-400'
                        }">
                          <i data-lucide="check" class="w-4 h-4"></i>
                        </button>
                      </div>
                    </div>
                  `;
                }).join('')}
              </div>

              <div class="flex gap-2 pt-1">
                <button onclick="addSetToSessionExercise(${esc(exIdx)})" class="text-xs font-bold text-volt-600 dark:text-volt-400 hover:underline">+ Add Set</button>
                ${ex.sets.length > 1 ? `<button onclick="removeSetFromSessionExercise(${esc(exIdx)})" class="text-xs font-semibold text-gray-400 hover:text-rose-400 ml-3">- Remove Set</button>` : ''}
              </div>
            </div>
          `).join('')}
        </div>
      `;

      updateRestTimerUI();
      startElapsedClock();
      lucide.createIcons();
    }

    function startElapsedClock() {
      if (activeElapsedInterval) clearInterval(activeElapsedInterval);
      const update = () => {
        if (!db.activeSession) return;
        const sec = Math.max(0, Math.floor((Date.now() - db.activeSession.startedAt) / 1000));
        const m = String(Math.floor(sec / 60)).padStart(2, '0');
        const s = String(sec % 60).padStart(2, '0');
        const el = document.getElementById('active-session-clock');
        if (el) el.textContent = `${m}:${s}`;
      };
      update();
      activeElapsedInterval = setInterval(update, 1000);
    }

    function setRestDuration(seconds) {
      restTimerState.totalSec = seconds;
      restTimerState.remainingSec = seconds;
      updateRestTimerUI();
      startRestTimer();
    }

    function startRestTimer() {
      if (restTimerState.running) return;
      if (restTimerState.remainingSec <= 0) restTimerState.remainingSec = restTimerState.totalSec;
      restTimerState.running = true;
      restTimerState.intervalId = setInterval(() => {
        restTimerState.remainingSec--;
        updateRestTimerUI();
        if (restTimerState.remainingSec <= 0) {
          pauseRestTimer();
          playChime();
          showToast('Rest complete! Ready for next set.', 'success');
        }
      }, 1000);
    }

    function pauseRestTimer() {
      restTimerState.running = false;
      if (restTimerState.intervalId) clearInterval(restTimerState.intervalId);
    }

    function resetRestTimer() {
      pauseRestTimer();
      restTimerState.remainingSec = restTimerState.totalSec;
      updateRestTimerUI();
    }

    function updateRestTimerUI() {
      const disp = document.getElementById('rest-timer-display');
      const ring = document.getElementById('rest-timer-ring');
      if (!disp || !ring) return;
      const m = String(Math.floor(restTimerState.remainingSec / 60)).padStart(2, '0');
      const s = String(restTimerState.remainingSec % 60).padStart(2, '0');
      disp.textContent = `${m}:${s}`;
      const ratio = restTimerState.totalSec > 0 ? restTimerState.remainingSec / restTimerState.totalSec : 0;
      ring.style.strokeDashoffset = (169.6 * (1 - ratio)).toFixed(1);
    }

    function updateSessionSet(exIdx, setIdx, field, rawVal) {
      const set = db.activeSession.exercises[exIdx].sets[setIdx];
      if (field === 'weight') set.weightKg = toStoredKg(rawVal) ?? '';
      if (field === 'reps') set.reps = parseInt(rawVal) || 0;
      saveDB();
    }

    function toggleSetCompleted(exIdx, setIdx) {
      const set = db.activeSession.exercises[exIdx].sets[setIdx];
      set.completed = !set.completed;
      saveDB();
      renderActiveWorkoutScreen();
      if (set.completed) {
        resetRestTimer();
        startRestTimer();
      }
    }

    function addSetToSessionExercise(exIdx) {
      const prev = db.activeSession.exercises[exIdx].sets.slice(-1)[0] || { weightKg: '', reps: 10 };
      db.activeSession.exercises[exIdx].sets.push({ weightKg: prev.weightKg, reps: prev.reps, completed: false });
      saveDB();
      renderActiveWorkoutScreen();
    }

    function removeSetFromSessionExercise(exIdx) {
      db.activeSession.exercises[exIdx].sets.pop();
      saveDB();
      renderActiveWorkoutScreen();
    }

    function toggleSkipSessionExercise(exIdx) {
      db.activeSession.exercises[exIdx].skipped = !db.activeSession.exercises[exIdx].skipped;
      saveDB();
      renderActiveWorkoutScreen();
    }

    function removeSessionExercise(exIdx) {
      db.activeSession.exercises.splice(exIdx, 1);
      saveDB();
      renderActiveWorkoutScreen();
    }

    function openAddExerciseToSessionModal() {
      openModal(`
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-extrabold">Add Exercise to Session</h3>
            <button onclick="closeModal()" aria-label="Close" class="p-2 rounded-full bg-gray-100 dark:bg-charcoal-800 text-gray-700 dark:text-gray-200 hover:text-volt-500"><i data-lucide="x" class="w-4 h-4"></i></button>
          </div>
          <input type="text" id="session-ex-search" oninput="filterSessionExModal(this.value)" placeholder="Filter exercises..." class="w-full px-4 py-2 rounded-full bg-slate-100 dark:bg-navy-800 text-sm" />
          <div id="session-ex-modal-list" class="space-y-2 max-h-72 overflow-y-auto">
            ${EXERCISE_DB.map(ex => `
              <button onclick="appendExerciseToSession('${ex.id}')" class="w-full text-left p-3 rounded-xl elevated-box hover:border-ice-400 flex items-center justify-between">
                <div>
                  <p class="text-xs font-bold">${ex.name}</p>
                  <p class="text-[11px] text-slate-400">${ex.category} • ${ex.equipment}</p>
                </div>
                <span class="text-xs font-bold text-ice-400">+ Add</span>
              </button>
            `).join('')}
          </div>
        </div>
      `);
    }

    function filterSessionExModal(query) {
      const q = query.toLowerCase();
      const filtered = EXERCISE_DB.filter(e => e.name.toLowerCase().includes(q) || e.category.toLowerCase().includes(q));
      document.getElementById('session-ex-modal-list').innerHTML = filtered.map(ex => `
        <button onclick="appendExerciseToSession('${esc(ex.id)}')" class="w-full text-left p-3 rounded-xl elevated-box hover:border-ice-400 flex items-center justify-between">
          <div>
            <p class="text-xs font-bold">${esc(ex.name)}</p>
            <p class="text-[11px] text-slate-400">${esc(ex.category)} • ${esc(ex.equipment)}</p>
          </div>
          <span class="text-xs font-bold text-ice-400">+ Add</span>
        </button>
      `).join('');
    }

    function appendExerciseToSession(exId) {
      const ex = EXERCISE_DB.find(e => e.id === exId);
      if (!ex || !db.activeSession) return;
      db.activeSession.exercises.push({
        exerciseId: ex.id,
        name: ex.name,
        skipped: false,
        notes: '',
        sets: [
          { weightKg: '', reps: 10, completed: false },
          { weightKg: '', reps: 10, completed: false },
          { weightKg: '', reps: 10, completed: false }
        ]
      });
      saveDB();
      closeModal();
      renderActiveWorkoutScreen();
    }

    function cancelActiveWorkout() {
      openModal(`
        <div class="space-y-4">
          <h3 class="text-lg font-extrabold text-rose-400">Cancel Active Workout?</h3>
          <p class="text-sm text-slate-400">Your current unsaved sets will be discarded.</p>
          <div class="flex gap-2 justify-end">
            <button onclick="closeModal()" class="px-4 py-2 rounded-full bg-slate-100 dark:bg-navy-800 text-xs font-bold">Keep Training</button>
            <button onclick="db.activeSession=null; saveDB(); closeModal(); renderWorkoutLogTab();" class="px-4 py-2 rounded-full bg-rose-500 text-white text-xs font-bold">Discard Session</button>
          </div>
        </div>
      `);
    }

    function finishActiveWorkout() {
      const s = db.activeSession;
      if (!s) return;

      // Calculate metrics & check Personal Records
      const prevMaxByExercise = {};
      db.workouts.forEach(w => {
        w.exercises.forEach(ex => {
          ex.sets.forEach(st => {
            const wKg = Number(st.weightKg) || 0;
            if (wKg > (prevMaxByExercise[ex.name] || 0)) prevMaxByExercise[ex.name] = wKg;
          });
        });
      });

      let totalSets = 0;
      let totalVolumeKg = 0;
      let completedExercises = 0;
      const newPRs = [];

      s.exercises.forEach(ex => {
        if (ex.skipped) return;
        const doneSets = ex.sets.filter(st => st.completed || (Number(st.weightKg) > 0 && Number(st.reps) > 0));
        if (doneSets.length > 0) completedExercises++;
        doneSets.forEach(st => {
          totalSets++;
          const wKg = Number(st.weightKg) || 0;
          const reps = Number(st.reps) || 0;
          totalVolumeKg += wKg * reps;
          if (wKg > 0 && wKg > (prevMaxByExercise[ex.name] || 0)) {
            prevMaxByExercise[ex.name] = wKg;
            if (!newPRs.some(p => p.name === ex.name)) {
              newPRs.push({ name: ex.name, weightKg: wKg });
            }
          }
        });
      });

      const durationMin = Math.max(1, Math.round((Date.now() - s.startedAt) / 60000));
      const completedRecord = {
        id: s.id,
        title: s.title,
        date: s.date,
        status: 'completed',
        durationMin,
        exercisesCompleted: completedExercises,
        totalSets,
        totalVolumeKg: +totalVolumeKg.toFixed(1),
        prs: newPRs,
        exercises: s.exercises
      };

      db.workouts.push(completedRecord);
      db.activeSession = null;
      pauseRestTimer();
      saveDB();
      renderNavigation();
      renderWorkoutLogTab();

      // Mandatory Post-Workout Summary + Progress Photo Prompt
      openModal(`
        <div class="space-y-5">
          <div class="text-center">
            <div class="w-12 h-12 rounded-2xl bg-volt-400 text-charcoal-950 flex items-center justify-center mx-auto mb-2">
              <i data-lucide="trophy" class="w-6 h-6"></i>
            </div>
            <h3 class="text-2xl font-display font-extrabold">Workout Completed!</h3>
            <p class="text-xs text-gray-400">${esc(completedRecord.title)} • ${completedRecord.date}</p>
          </div>

          <div class="grid grid-cols-2 gap-2.5 text-center">
            <div class="elevated-box p-3">
              <p class="text-[11px] text-gray-400">Duration</p>
              <p class="text-lg font-extrabold">${durationMin} min</p>
            </div>
            <div class="elevated-box p-3">
              <p class="text-[11px] text-gray-400">Total Volume</p>
              <p class="text-lg font-extrabold text-volt-500 dark:text-volt-400">${formatWeight(totalVolumeKg, true)}</p>
            </div>
            <div class="elevated-box p-3">
              <p class="text-[11px] text-gray-400">Exercises / Sets</p>
              <p class="text-lg font-extrabold">${completedExercises} / ${totalSets}</p>
            </div>
            <div class="elevated-box p-3">
              <p class="text-[11px] text-gray-400">New PRs</p>
              <p class="text-lg font-extrabold text-volt-500 dark:text-volt-400">${newPRs.length}</p>
            </div>
          </div>

          ${newPRs.length > 0 ? `
            <div class="p-3 rounded-2xl bg-volt-400/15 border border-volt-400/40 text-xs">
              <p class="font-extrabold text-volt-500 dark:text-volt-400 mb-1">Personal Records Set:</p>
              ${newPRs.map(p => `<p>• ${p.name}: <strong>${formatWeight(p.weightKg, true)}</strong></p>`).join('')}
            </div>
          ` : ''}

          <!-- Post-Workout Private Progress Photo Prompt -->
          <div class="elevated-box p-4 space-y-3 border-volt-400/35">
            <div class="flex items-center justify-between">
              <h4 class="text-sm font-extrabold flex items-center gap-1.5">
                <i data-lucide="camera" class="w-4 h-4 text-volt-500 dark:text-volt-400"></i> Capture Post-Workout Progress Photo
              </h4>
              <span class="text-[10px] px-2 py-0.5 rounded-full bg-charcoal-900 text-volt-400 font-bold">Private</span>
            </div>
            <p class="text-xs text-gray-400">Document your pump and build your Monthly Transformation Video. Encrypted and stored on this device only.</p>

            <input type="text" id="post-workout-photo-note" placeholder="Optional note (e.g., Post push-day pump)" class="w-full px-3 py-2 rounded-xl bg-white dark:bg-charcoal-900 border border-gray-200 dark:border-charcoal-700 text-xs" />

            <div class="grid grid-cols-2 gap-2">
              <label class="btn-primary py-2.5 text-xs flex items-center justify-center gap-1.5 cursor-pointer">
                <i data-lucide="camera" class="w-3.5 h-3.5"></i> Take Photo
                <input type="file" accept="image/*" capture="environment" class="hidden" onchange="savePostWorkoutPhoto(event, '${completedRecord.id}', '${completedRecord.date}')" />
              </label>
              <label class="py-2.5 rounded-full bg-gray-200 dark:bg-charcoal-900 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer">
                <i data-lucide="image" class="w-3.5 h-3.5 text-volt-400"></i> Upload Gallery
                <input type="file" accept="image/*" class="hidden" onchange="savePostWorkoutPhoto(event, '${completedRecord.id}', '${completedRecord.date}')" />
              </label>
            </div>
          </div>

          <button onclick="closeModal()" class="w-full py-2.5 rounded-full text-xs font-semibold text-gray-400 hover:text-white">
            Skip Photo & Close
          </button>
        </div>
      `);
    }

    async function savePostWorkoutPhoto(event, workoutId, dateStr) {
      const file = event.target.files?.[0];
      if (!file) return;
      try {
        const dataUrl = await compressImageFile(file);
        const note = document.getElementById('post-workout-photo-note')?.value || '';
        const photo = { id: 'photo_' + Date.now(), date: dateStr, dataUrl, note, workoutId };
        await PhotoVault.put(photo);
        db.photos.push(photo);
        saveDB();
        closeModal();
        showToast('Private progress photo saved to your journal!', 'success');
      } catch (err) {
        showToast('Could not process image file.', 'error');
      }
    }

    /*************************************************************************
     * 10. TAB 4: EXERCISE LIBRARY
     *************************************************************************/
    let librarySelectedCategory = 'All';
    let libraryFavoritesOnly = false;

    /*************************************************************************
     * 2b. MUSCLE FIGURE (front/back anatomy map that highlights target muscles)
     *************************************************************************/
    const MUSCLE_LABELS = {
      chest: 'Chest', delts: 'Shoulders', biceps: 'Biceps', triceps: 'Triceps', forearms: 'Forearms',
      abs: 'Abs', obliques: 'Obliques', quads: 'Quads', hamstrings: 'Hamstrings', glutes: 'Glutes',
      calves: 'Calves', lats: 'Lats', upperBack: 'Upper Back', erectors: 'Lower Back'
    };
    const MUSCLE_RULES = [
      ['chest', /pector|chest/i],
      ['delts', /delt|shoulder/i],
      ['biceps', /bicep|brachialis|\barms?\b/i],
      ['triceps', /tricep|anconeus|\barms?\b/i],
      ['forearms', /forearm|brachioradialis|grip|wrist/i],
      ['abs', /abdom|\babs?\b|core|transverse|hip flexor/i],
      ['obliques', /oblique/i],
      ['quads', /quad|\blegs?\b/i],
      ['hamstrings', /hamstring|posterior chain|\blegs?\b/i],
      ['glutes', /glute|posterior chain|\blegs?\b/i],
      ['calves', /calf|calves|gastrocnem|soleus|\blegs?\b/i],
      ['lats', /latissimus|\blats?\b|\bback\b/i],
      ['upperBack', /trap|rhomboid|mid-back|upper back|\bback\b/i],
      ['erectors', /erector|spinal|posterior chain|lower back/i]
    ];
    const MF_BACK_KEYS = ['lats', 'upperBack', 'erectors', 'glutes', 'hamstrings', 'triceps'];

    // Muscle map drawn for the left half of the body; the right half is mirrored across x = 100.
    const MF_BODY_LEFT = [
      'M64 84 C52 88 48 102 48 118 L46 176 C46 196 42 222 40 246 L36 268 C38 274 50 276 54 270 L60 246 C62 222 64 200 66 180 C70 160 74 140 74 124 C72 104 70 92 64 84 Z',
      'M100 66 C86 66 72 72 62 84 C68 98 74 118 74 136 L72 196 C72 214 70 228 68 240 L100 248 Z',
      'M68 240 C64 280 66 316 70 338 L72 378 C72 386 86 388 88 380 L94 340 C96 310 98 280 100 248 Z',
      'M72 380 L70 394 L92 396 L90 382 Z'
    ];
    const MF_HEAD = '<circle cx="100" cy="34" r="19"/><rect x="92" y="50" width="16" height="18" rx="5"/>';
    const MF_FRONT = [
      { key: 'chest', d: 'M100 92 C92 86 80 88 74 96 C70 104 72 116 78 122 C86 128 96 124 100 116 Z' },
      { key: 'delts', d: 'M66 84 C56 90 50 102 52 116 C58 110 66 102 72 94 Z' },
      { key: 'biceps', d: 'M52 124 C48 140 48 158 52 170 C58 168 62 152 62 134 C62 126 58 122 52 124 Z' },
      { key: 'forearms', d: 'M47 184 C43 206 40 226 38 246 L48 248 C52 226 56 206 61 186 Z' },
      { key: 'abs', d: 'M86 134 L100 134 L100 206 C95 209 90 207 87 200 Z' },
      { key: 'obliques', d: 'M74 142 C72 166 72 186 76 202 L86 200 C85 178 85 158 86 136 C80 134 76 136 74 142 Z' },
      { key: 'quads', d: 'M70 254 C66 282 68 310 72 332 L94 332 C98 306 100 280 98 254 Z' },
      { key: 'calves', d: 'M74 346 C70 360 72 376 76 386 L88 386 C90 370 92 356 92 344 Z' }
    ];
    const MF_BACK = [
      { key: 'delts', d: 'M66 84 C56 90 50 102 52 116 C58 110 66 102 72 94 Z' },
      { key: 'triceps', d: 'M52 124 C48 142 48 160 52 172 C60 170 64 152 62 130 C60 124 56 122 52 124 Z' },
      { key: 'forearms', d: 'M47 184 C43 206 40 226 38 246 L48 248 C52 226 56 206 61 186 Z' },
      { key: 'upperBack', d: 'M100 74 C92 74 84 78 80 84 C84 98 92 114 100 122 Z' },
      { key: 'lats', d: 'M76 104 C70 124 74 152 90 172 L98 138 C90 126 84 114 80 104 Z' },
      { key: 'erectors', d: 'M94 122 L106 122 L106 208 L94 208 Z', center: true },
      { key: 'glutes', d: 'M74 206 C70 222 72 236 84 242 L100 232 L100 206 C90 204 80 204 74 206 Z' },
      { key: 'hamstrings', d: 'M72 254 C68 282 70 310 74 332 L94 332 C98 306 100 280 98 254 Z' },
      { key: 'calves', d: 'M74 346 C70 360 72 376 76 386 L88 386 C90 370 92 356 92 344 Z' }
    ];

    function getExerciseMuscles(ex) {
      const matchKeys = text => MUSCLE_RULES.filter(([, re]) => re.test(text || '')).map(([k]) => k);
      const primary = new Set(matchKeys(ex.target));
      const secondary = new Set(matchKeys(ex.secondary).filter(k => !primary.has(k)));
      return { primary, secondary };
    }

    function mfPair(d, cls, centerOnly = false) {
      const base = `<path class="${cls}" d="${d}"/>`;
      return centerOnly ? base : base + `<path class="${cls}" d="${d}" transform="matrix(-1 0 0 1 200 0)"/>`;
    }

    function mfViewSVG(view, primary, secondary, mini = false) {
      const muscles = view === 'front' ? MF_FRONT : MF_BACK;
      const body = MF_BODY_LEFT.map(d => mfPair(d, 'mf-body')).join('') + `<g class="mf-body">${MF_HEAD}</g>`;
      const parts = muscles.map(m => {
        const state = primary.has(m.key) ? 'mf-primary' : secondary.has(m.key) ? 'mf-secondary' : '';
        return mfPair(m.d, `mf-muscle ${state}`, !!m.center);
      }).join('');
      return `<svg class="mf-svg${mini ? ' mf-svg-mini' : ''}" viewBox="0 0 200 400" role="img" aria-label="${view} muscle map"><g>${body}</g><g>${parts}</g></svg>`;
    }

    function muscleFigureSVG(ex, opts = {}) {
      const { primary, secondary } = getExerciseMuscles(ex);
      if (opts.mini) {
        const view = [...primary].some(k => MF_BACK_KEYS.includes(k)) ? 'back' : 'front';
        return mfViewSVG(view, primary, secondary, true);
      }
      const names = [...primary].map(k => MUSCLE_LABELS[k]);
      return `
        <div class="mf-figure-wrap">
          <figure class="mf-figure">${mfViewSVG('front', primary, secondary)}<figcaption>Front</figcaption></figure>
          <figure class="mf-figure">${mfViewSVG('back', primary, secondary)}<figcaption>Back</figcaption></figure>
        </div>
        <div class="mf-legend">
          <span><i class="mf-dot mf-dot-primary"></i>Primary</span>
          <span><i class="mf-dot mf-dot-secondary"></i>Secondary</span>
        </div>
        <p class="mf-muscle-list">${names.length ? names.join(', ') : 'Whole-body conditioning'}</p>
      `;
    }

    function getExerciseIllustrationSVG(category) {
      const icons = {
        Chest: `<path d="M4 12h16M7 7l3 5-3 5M17 7l-3 5 3 5"/>`,
        Back: `<path d="M12 4v16M7 8l5-4 5 4M7 16l5 4 5-4"/>`,
        Shoulders: `<path d="M4 15l4-6h8l4 6M12 5v4"/>`,
        Biceps: `<path d="M7 17c0-5 3-9 7-9 2 0 3 1.5 3 3.5S15 15 13 15"/>`,
        Triceps: `<path d="M8 6v12M16 6v12M8 12h8"/>`,
        Legs: `<path d="M9 4v7l-2 9M15 4v7l2 9"/>`,
        Abs: `<rect x="8" y="5" width="8" height="14" rx="3"/><path d="M8 10h8M8 14h8M12 5v14"/>`,
        Forearms: `<path d="M6 15l6-6 6 6M9 18h6"/>`,
        Cardio: `<path d="M3 12h4l3-7 4 14 3-7h4"/>`,
        Calisthenics: `<circle cx="12" cy="5" r="2"/><path d="M5 10h14M12 7v7l-4 6M12 14l4 6"/>`
      };
      return `
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#C5F02E" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          ${icons[category] || icons.Chest}
        </svg>
      `;
    }

    function renderExerciseLibrary() {
      // Category / muscle pills use the same semantic selected-state hook as the
      // other library filters, independent of the general navigation colours.
      document.getElementById('lib-category-pills').innerHTML = EXERCISE_CATEGORIES.map(cat => `
        <button onclick="librarySelectedCategory='${esc(cat)}'; renderExerciseLibrary();" class="library-selection-control library-selection-muscle pill-chip px-3.5 py-1.5 text-xs whitespace-nowrap ${
          librarySelectedCategory === cat
            ? 'is-selected font-extrabold'
            : 'bg-gray-100 dark:bg-charcoal-800 text-gray-600 dark:text-gray-300'
        }">${esc(cat)}</button>
      `).join('');

      // Populate Equipment Dropdown once
      const eqSelect = document.getElementById('lib-equipment-select');
      if (eqSelect.options.length === 1) {
        EQUIPMENT_TYPES.forEach(eq => {
          const opt = document.createElement('option');
          opt.value = eq;
          opt.textContent = eq;
          eqSelect.appendChild(opt);
        });
      }

      const query = (document.getElementById('lib-search-input')?.value || '').toLowerCase();
      const eqFilter = eqSelect.value;
      const goalFilter = document.getElementById('lib-goal-select')?.value || 'All';

      const filtered = EXERCISE_DB.filter(ex => {
        if (librarySelectedCategory !== 'All' && ex.category !== librarySelectedCategory) return false;
        if (eqFilter !== 'All' && ex.equipment !== eqFilter) return false;
        if (goalFilter !== 'All' && !(ex.goals || []).includes(goalFilter)) return false;
        if (libraryFavoritesOnly && !db.favorites.includes(ex.id)) return false;
        if (query && !`${ex.name} ${ex.target} ${ex.secondary} ${ex.category}`.toLowerCase().includes(query)) return false;
        return true;
      });

      const grid = document.getElementById('lib-exercises-grid');
      if (filtered.length === 0) {
        grid.innerHTML = `<div class="col-span-full surface-card box-library-empty p-8 text-center text-xs text-gray-400">No exercises match your current filter criteria.</div>`;
        return;
      }

      grid.innerHTML = filtered.map(ex => {
        const isFav = db.favorites.includes(ex.id);
        return `
          <div class="surface-card box-library-exercise box-library-exercise-${esc(ex.id)} p-5 flex flex-col justify-between gap-4 hover:border-volt-400/50">
            <div>
              <div class="flex items-start justify-between gap-2 mb-3">
                <div class="mf-mini-wrap">
                  ${muscleFigureSVG(ex, { mini: true })}
                </div>
                <div class="flex items-center gap-1.5">
                  ${ex.custom ? '<span class="custom-badge">Custom</span>' : ''}
                  <span class="px-2.5 py-1 rounded-full bg-gray-100 dark:bg-charcoal-800 text-[10px] font-bold text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-charcoal-700">${esc(ex.difficulty)}</span>
                  <button onclick="toggleFavoriteExercise('${esc(ex.id)}')" class="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-charcoal-800 transition" title="Favorite">
                    <i data-lucide="heart" class="w-4 h-4 ${isFav ? 'fill-volt-400 text-volt-400' : 'text-gray-400'}"></i>
                  </button>
                </div>
              </div>
              <h3 class="text-base font-extrabold">${esc(ex.name)}</h3>
              <p class="text-xs text-volt-600 dark:text-volt-400 font-semibold mt-0.5">${esc(ex.target)}</p>
              <p class="text-[11px] text-gray-400 mt-1">${esc(ex.category)} • ${esc(ex.equipment)}</p>
            </div>

            <div class="flex flex-wrap items-center gap-2 pt-3 border-t border-gray-200 dark:border-charcoal-700">
              <button onclick="openExerciseDetailModal('${esc(ex.id)}')" class="flex-1 py-2 rounded-full bg-gray-100 dark:bg-charcoal-800 hover:bg-gray-200 dark:hover:bg-charcoal-700 text-xs font-bold transition">
                Form & Details
              </button>
              <button onclick="openCreateExerciseModal('library')" class="add-exercise-btn">
                <i data-lucide="plus" class="w-3.5 h-3.5"></i> Add Exercise
              </button>
              <button onclick="openAddExerciseToPlanModal('${esc(ex.id)}')" class="px-3.5 py-2 rounded-full bg-volt-400 text-charcoal-950 text-xs font-extrabold transition hover:opacity-90">
                + Plan
              </button>
            </div>
          </div>
        `;
      }).join('');

      lucide.createIcons();
    }

    function toggleLibraryFavoritesFilter() {
      libraryFavoritesOnly = !libraryFavoritesOnly;
      const btn = document.getElementById('lib-fav-toggle');
      btn.classList.toggle('border-rose-400', libraryFavoritesOnly);
      btn.classList.toggle('text-rose-400', libraryFavoritesOnly);
      renderExerciseLibrary();
    }

    function toggleFavoriteExercise(exId) {
      const idx = db.favorites.indexOf(exId);
      if (idx >= 0) db.favorites.splice(idx, 1);
      else db.favorites.push(exId);
      saveDB();
      renderExerciseLibrary();
    }

    // Form video: embedded for every exercise (specific video when available, otherwise a YouTube search for that exercise's form).
    function videoEmbedURL(ex) {
      if (ex.videoId) return `https://www.youtube.com/embed/${ex.videoId}`;
      return `https://www.youtube.com/results?search_query=${encodeURIComponent(ex.name + ' exercise form')}`;
    }
    function videoWatchURL(ex) {
      if (ex.videoId) return `https://www.youtube.com/watch?v=${ex.videoId}`;
      return `https://www.youtube.com/results?search_query=${encodeURIComponent(ex.name + ' proper form')}`;
    }

    function renderTextBlock(text) {
      const lines = String(text ?? '').split('\n').map(l => l.trim()).filter(Boolean);
      if (lines.length <= 1) {
        return `<p class="text-slate-600 dark:text-slate-300 leading-relaxed">${esc(lines[0] || '')}</p>`;
      }
      return `<ul class="text-bullets">${lines.map(l => `<li>${esc(l)}</li>`).join('')}</ul>`;
    }

    function openExerciseDetailModal(exId) {
      const ex = EXERCISE_DB.find(e => e.id === exId);
      if (!ex) return;
      openModal(`
        <div class="space-y-4">
          <div class="flex items-start justify-between gap-2">
            <div>
              <span class="text-xs font-bold text-ice-400 uppercase">${esc(ex.category)} • ${esc(ex.equipment)}</span>
              <h3 class="text-xl font-extrabold mt-0.5">${esc(ex.name)}</h3>
            </div>
            <button onclick="closeModal()" aria-label="Close" class="p-2 rounded-full bg-gray-100 dark:bg-charcoal-800 text-gray-700 dark:text-gray-200 hover:text-volt-500"><i data-lucide="x" class="w-4 h-4"></i></button>
          </div>

          <div class="mb-4">${muscleFigureSVG(ex)}</div>
          <div class="grid grid-cols-2 gap-2.5 text-xs">
            <div class="elevated-box p-3">
              <p class="text-slate-400">Primary Target</p>
              <p class="font-bold mt-0.5">${esc(ex.target)}</p>
            </div>
            <div class="elevated-box p-3">
              <p class="text-slate-400">Recommended</p>
              <p class="font-bold text-ice-400 mt-0.5">${esc(ex.setsReps)}</p>
            </div>
          </div>

          <div class="text-xs">
            <p class="text-slate-400 font-semibold">Secondary Muscles</p>
            <p class="mt-0.5">${esc(ex.secondary)}</p>
          </div>

          <div class="elevated-box p-3.5 text-xs space-y-2">
            <p class="font-bold text-volt-600 dark:text-volt-400">How To Perform</p>
            <ol class="mf-steps">${(ex.steps || []).map(st => `<li>${esc(st)}</li>`).join('')}</ol>
            <a href="${videoWatchURL(ex)}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1 text-xs font-bold text-volt-600 dark:text-volt-400 hover:underline">Search form on YouTube &#8599;</a>
          </div>
          <div class="elevated-box p-3.5 text-xs space-y-1">
            <p class="font-bold text-emerald-400">Execution Instructions</p>
            ${renderTextBlock(ex.instructions)}
          </div>

          <div class="elevated-box p-3.5 text-xs space-y-1 border-rose-400/25">
            <p class="font-bold text-rose-400">Common Mistakes to Avoid</p>
            ${renderTextBlock(ex.mistakes)}
          </div>

          <button onclick="closeModal(); openAddExerciseToPlanModal('${ex.id}')" class="btn-primary w-full py-3 text-xs font-bold">
            + Add to Workout Plan
          </button>
          ${ex.custom ? `<button onclick="deleteCustomExercise('${esc(ex.id)}')" class="w-full py-2.5 rounded-full text-xs font-bold text-rose-400 border border-rose-400/40">Delete Custom Exercise</button>` : ''}
        </div>
      `);
    }

    function openAddExerciseToPlanModal(exId) {
      const ex = EXERCISE_DB.find(e => e.id === exId);
      if (!ex) return;
      const targetPlan = db.planBuilder.draftPlan || db.activePlan;
      if (!targetPlan) {
        openModal(`
          <div class="space-y-4">
            <h3 class="text-lg font-extrabold">No Workout Plan Found</h3>
            <p class="text-xs text-slate-400">Generate a weekly plan first so you can assign <strong>${ex.name}</strong> to a specific training day.</p>
            <button onclick="closeModal(); switchTab('plan');" class="btn-primary w-full py-2.5 text-xs">Go to Workout Plan Builder</button>
          </div>
        `);
        return;
      }

      openModal(`
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-extrabold">Add "${esc(ex.name)}" to Plan</h3>
            <button onclick="closeModal()" aria-label="Close" class="p-2 rounded-full bg-gray-100 dark:bg-charcoal-800 text-gray-700 dark:text-gray-200 hover:text-volt-500"><i data-lucide="x" class="w-4 h-4"></i></button>
          </div>
          <p class="text-xs text-slate-400">Choose which day of <strong>${targetPlan.name}</strong> to append this exercise to:</p>
          <div class="grid grid-cols-2 gap-2">
            ${WEEKDAYS.map(day => {
              const d = targetPlan.days[day];
              return `
                <button onclick="confirmAddExerciseToPlanDay('${ex.id}', '${day}')" class="p-3 rounded-xl elevated-box hover:border-ice-400 text-left">
                  <p class="text-xs font-extrabold text-ice-400">${day}</p>
                  <p class="text-[11px] truncate">${d.isRest ? 'Convert Rest → Workout' : d.title}</p>
                </button>
              `;
            }).join('')}
          </div>
        </div>
      `);
    }

    /*************************************************************************
     * 10b. ADD EXERCISE BY MUSCLE (tap a muscle on the figure to browse exercises)
     *************************************************************************/
    let muscleAddContext = { mode: 'library', day: null };

    function openMuscleAddModal(mode, day = null) {
      if (mode === 'day') {
        const plan = db.planBuilder.draftPlan || db.activePlan;
        if (!plan || !plan.days[day]) {
          showToast('Generate a workout plan first.', 'error');
          return;
        }
      }
      muscleAddContext = { mode, day };

      const subtitle = mode === 'day'
        ? `Adding to <strong>${esc(day)}</strong>`
        : 'Pick a muscle, then add an exercise to your plan';

      openModal(`
        <div class="space-y-4">
          <div class="flex items-start justify-between gap-2">
            <div>
              <span class="text-xs font-bold text-ice-400 uppercase">Add Exercise</span>
              <h3 class="text-xl font-extrabold mt-0.5">Choose a Muscle</h3>
              <p class="text-xs text-slate-400 mt-0.5">${subtitle}</p>
            </div>
            <button onclick="closeModal()" aria-label="Close" class="p-2 rounded-full bg-gray-100 dark:bg-charcoal-800 text-gray-700 dark:text-gray-200 hover:text-volt-500"><i data-lucide="x" class="w-4 h-4"></i></button>
          </div>

          <div class="mf-figure-wrap">
            <figure class="mf-figure">${mfPickerViewSVG('front')}<figcaption>Front</figcaption></figure>
            <figure class="mf-figure">${mfPickerViewSVG('back')}<figcaption>Back</figcaption></figure>
          </div>

          <p id="muscle-add-label" class="mf-muscle-list">Tap a muscle to see exercises</p>
          <div id="muscle-add-list" class="space-y-2 max-h-72 overflow-y-auto">
            <p class="text-xs text-slate-400 text-center py-3">Tap a highlighted muscle above.</p>
          </div>
          <button onclick="openCreateExerciseModal(muscleAddContext.mode, muscleAddContext.day)" class="add-exercise-btn add-exercise-btn--block"><i data-lucide="plus" class="w-3.5 h-3.5"></i> Create new exercise</button>
        </div>
      `);
    }

    function mfPickerViewSVG(view) {
      const muscles = view === 'front' ? MF_FRONT : MF_BACK;
      const body = MF_BODY_LEFT.map(d => mfPair(d, 'mf-body')).join('') + `<g class="mf-body">${MF_HEAD}</g>`;
      const parts = muscles.map(m => {
        const attrs = `class="mf-muscle mf-pick" data-muscle="${m.key}" onclick="selectMuscleForAdd('${m.key}')"`;
        const right = m.center ? '' : `<path ${attrs} d="${m.d}" transform="matrix(-1 0 0 1 200 0)"/>`;
        return `<path ${attrs} d="${m.d}"/>${right}`;
      }).join('');
      return `<svg class="mf-svg" viewBox="0 0 200 400" role="img" aria-label="${view} muscle picker"><g>${body}</g><g>${parts}</g></svg>`;
    }

    function exercisesForMuscle(key) {
      return EXERCISE_DB
        .map(ex => {
          const { primary, secondary } = getExerciseMuscles(ex);
          if (primary.has(key)) return { ex, rank: 0 };
          if (secondary.has(key)) return { ex, rank: 1 };
          return null;
        })
        .filter(Boolean)
        .sort((a, b) => a.rank - b.rank)
        .map(r => r.ex);
    }

    function selectMuscleForAdd(key) {
      document.querySelectorAll('.mf-pick').forEach(el => {
        el.classList.toggle('is-chosen', el.dataset.muscle === key);
      });
      document.getElementById('muscle-add-label').textContent = MUSCLE_LABELS[key] || key;

      const list = document.getElementById('muscle-add-list');
      const exs = exercisesForMuscle(key);
      if (exs.length === 0) {
        list.innerHTML = `<p class="text-xs text-slate-400 text-center py-3">No exercises tagged for ${esc(MUSCLE_LABELS[key] || key)} yet.</p>`;
        return;
      }

      const isDay = muscleAddContext.mode === 'day';
      list.innerHTML = exs.map(ex => {
        const isPrimary = getExerciseMuscles(ex).primary.has(key);
        const action = isDay
          ? `confirmAddExerciseToPlanDay('${ex.id}', '${muscleAddContext.day}', true)`
          : `openAddExerciseToPlanModal('${ex.id}')`;
        return `
          <div class="elevated-box p-3 flex items-center justify-between gap-2">
            <div class="min-w-0">
              <p class="text-xs font-extrabold truncate">${esc(ex.name)}</p>
              <p class="text-[11px] text-slate-400">${esc(ex.equipment)} • ${isPrimary ? 'Primary' : 'Secondary'} • ${esc(ex.difficulty)}</p>
            </div>
            <div class="flex items-center gap-1.5 flex-shrink-0">
              <button onclick="openExerciseDetailModal('${ex.id}')" class="px-3 py-1.5 rounded-full bg-gray-100 dark:bg-charcoal-800 text-xs font-bold">Form</button>
              <button onclick="${action}" class="px-3 py-1.5 rounded-full bg-volt-400 text-charcoal-950 text-xs font-extrabold">${isDay ? '+ Add' : '+ Plan'}</button>
            </div>
          </div>`;
      }).join('');
    }

    /*************************************************************************
     * 10c. CREATE CUSTOM EXERCISE
     *************************************************************************/
    let ceContext = { mode: 'library', day: null };
    let ceGoals = [];

    function openCreateExerciseModal(mode = 'library', day = null) {
      if (mode === 'day') {
        const plan = db.planBuilder.draftPlan || db.activePlan;
        if (!plan || !plan.days[day]) {
          showToast('Generate a workout plan first.', 'error');
          return;
        }
      }
      ceContext = { mode, day };
      ceGoals = [];
      const opts = list => list.map(o => `<option value="${esc(o)}">${esc(o)}</option>`).join('');

      openModal(`
        <div class="space-y-4">
          <div class="flex items-start justify-between gap-2">
            <div>
              <span class="text-xs font-bold text-ice-400 uppercase">New Exercise</span>
              <h3 class="text-xl font-extrabold mt-0.5">Create Exercise</h3>
              <p class="text-xs text-slate-400 mt-0.5">${mode === 'day' ? `It will be added to <strong>${esc(day)}</strong> after saving.` : 'It will be saved to your exercise library.'}</p>
            </div>
            <button onclick="closeModal()" aria-label="Close" class="p-2 rounded-full bg-gray-100 dark:bg-charcoal-800 text-gray-700 dark:text-gray-200 hover:text-volt-500"><i data-lucide="x" class="w-4 h-4"></i></button>
          </div>

          <div>
            <label class="ce-label" for="ce-name">Exercise name</label>
            <input id="ce-name" class="ce-input" type="text" maxlength="80" placeholder="e.g. Cable Crossover" />
          </div>

          <div class="ce-grid">
            <div>
              <label class="ce-label" for="ce-category">Muscle group</label>
              <select id="ce-category" class="ce-select">${opts(EXERCISE_CATEGORIES.filter(c => c !== 'All'))}</select>
            </div>
            <div>
              <label class="ce-label" for="ce-equipment">Equipment</label>
              <select id="ce-equipment" class="ce-select">${opts(EQUIPMENT_TYPES)}</select>
            </div>
          </div>

          <div class="ce-grid">
            <div>
              <label class="ce-label" for="ce-difficulty">Difficulty</label>
              <select id="ce-difficulty" class="ce-select">${opts(LEVELS_LIST)}</select>
            </div>
            <div>
              <label class="ce-label" for="ce-setsreps">Recommended sets × reps</label>
              <input id="ce-setsreps" class="ce-input" type="text" placeholder="e.g. 3 sets × 10–12 reps" />
            </div>
          </div>

          <div class="ce-grid">
            <div>
              <label class="ce-label" for="ce-target">Primary target</label>
              <input id="ce-target" class="ce-input" type="text" placeholder="e.g. Pectoralis Major" />
            </div>
            <div>
              <label class="ce-label" for="ce-secondary">Secondary muscles</label>
              <input id="ce-secondary" class="ce-input" type="text" placeholder="e.g. Triceps, Front Delts" />
            </div>
          </div>

          <div>
            <span class="ce-label">Goals</span>
            <div class="ce-chips">
              ${GOALS_LIST.map(g => `<button type="button" class="ce-chip" data-goal="${esc(g)}" onclick="toggleCustomGoal(this)">${esc(g)}</button>`).join('')}
            </div>
          </div>

          <div>
            <label class="ce-label" for="ce-steps">How to perform (one step per line)</label>
            <textarea id="ce-steps" class="ce-textarea" placeholder="Press Enter for the next step"></textarea>
          </div>
          <div>
            <label class="ce-label" for="ce-instructions">Execution instructions</label>
            <textarea id="ce-instructions" class="ce-textarea" placeholder="Press Enter for the next point"></textarea>
          </div>
          <div>
            <label class="ce-label" for="ce-mistakes">Common mistakes to avoid</label>
            <textarea id="ce-mistakes" class="ce-textarea" placeholder="Press Enter for the next point"></textarea>
          </div>
          <div>
            <label class="ce-label" for="ce-video">YouTube form video (optional)</label>
            <input id="ce-video" class="ce-input" type="text" placeholder="https://www.youtube.com/watch?v=..." />
          </div>

          <p id="ce-error" class="ce-error" role="alert"></p>
          <div class="ce-actions">
            <button onclick="closeModal()" class="px-4 py-2.5 rounded-full text-xs font-bold text-gray-400">Cancel</button>
            <button onclick="saveCustomExercise()" class="btn-primary px-6 py-2.5 text-xs font-bold">Save Exercise</button>
          </div>
        </div>
      `);
      bindListTextareas();
    }

    // Auto list behaviour: numbered steps (1. 2. 3.) or bullets (•).
    function listMarker(numbered, n) {
      return numbered ? `${n}. ` : '• ';
    }

    function enableListTyping(ta, numbered) {
      if (!ta) return;
      ta.addEventListener('focus', () => {
        if (!ta.value.trim()) ta.value = listMarker(numbered, 1);
        ta.setSelectionRange(ta.value.length, ta.value.length);
      });
      ta.addEventListener('keydown', e => {
        if (e.key !== 'Enter' || e.shiftKey) return;
        e.preventDefault();
        const caret = ta.selectionStart;
        const lineStart = ta.value.slice(0, caret).lastIndexOf('\n') + 1;
        const line = ta.value.slice(lineStart, caret);
        const marker = numbered ? /^\d+\. $/ : /^• $/;

        // Enter on an empty item ends the list
        if (marker.test(line)) {
          ta.setRangeText('', lineStart, caret, 'end');
          return;
        }
        const before = ta.value.slice(0, caret);
        const filled = before.split('\n').filter(l => l.trim()).length;
        ta.setRangeText('\n' + listMarker(numbered, filled + 1), caret, ta.selectionEnd, 'end');
      });
    }

    function bindListTextareas() {
      enableListTyping(document.getElementById('ce-steps'), true);
      enableListTyping(document.getElementById('ce-instructions'), false);
      enableListTyping(document.getElementById('ce-mistakes'), false);
    }

    // Strip list markers ("1. ", "• ", "- ") and empty lines before saving.
    function cleanLines(id) {
      return document.getElementById(id).value
        .split('\n')
        .map(l => l.replace(/^\s*(\d+\.|•|-|\*)\s*/, '').trim())
        .filter(Boolean);
    }

    function toggleCustomGoal(btn) {
      const goal = btn.dataset.goal;
      const i = ceGoals.indexOf(goal);
      if (i >= 0) ceGoals.splice(i, 1);
      else ceGoals.push(goal);
      btn.classList.toggle('is-on', i < 0);
    }

    function parseYouTubeId(url) {
      const m = String(url || '').match(/(?:v=|youtu\.be\/|embed\/)([A-Za-z0-9_-]{11})/);
      return m ? m[1] : '';
    }

    function saveCustomExercise() {
      const get = id => document.getElementById(id).value.trim();
      const fail = msg => { document.getElementById('ce-error').textContent = msg; };

      const name = get('ce-name');
      const target = get('ce-target');
      const steps = cleanLines('ce-steps');
      const videoRaw = get('ce-video');
      const videoId = parseYouTubeId(videoRaw);

      if (!name) return fail('Enter an exercise name.');
      if (EXERCISE_DB.some(e => e.name.toLowerCase() === name.toLowerCase())) return fail('An exercise with this name already exists.');
      if (!target) return fail('Enter the primary target muscle.');
      if (steps.length === 0) return fail('Add at least one step under How to perform.');
      if (videoRaw && !videoId) return fail('Enter a valid YouTube link or leave it empty.');

      const ex = {
        id: 'custom_' + Date.now(),
        name,
        category: get('ce-category'),
        equipment: get('ce-equipment'),
        difficulty: get('ce-difficulty'),
        target,
        secondary: get('ce-secondary') || 'None',
        setsReps: get('ce-setsreps') || '3 sets × 8–12 reps',
        steps,
        instructions: cleanLines('ce-instructions').join('\n') || steps.join(' '),
        mistakes: cleanLines('ce-mistakes').join('\n') || 'None noted',
        goals: [...ceGoals],
        ...(videoId ? { videoId } : {})
      };

      db.customExercises = db.customExercises || [];
      db.customExercises.push(ex);
      syncCustomExercises();
      saveDB();

      if (ceContext.mode === 'day') {
        confirmAddExerciseToPlanDay(ex.id, ceContext.day);
      } else {
        closeModal();
        renderExerciseLibrary();
        showToast(`Created ${name}`, 'success');
      }
    }

    function deleteCustomExercise(exId) {
      if (!confirm('Delete this custom exercise? Plans that already include it keep their copy.')) return;
      db.customExercises = (db.customExercises || []).filter(e => e.id !== exId);
      db.favorites = db.favorites.filter(id => id !== exId);
      syncCustomExercises();
      saveDB();
      closeModal();
      renderExerciseLibrary();
      showToast('Custom exercise deleted.', 'info');
    }

    function confirmAddExerciseToPlanDay(exId, day, keepOpen = false) {
      const ex = EXERCISE_DB.find(e => e.id === exId);
      const targetPlan = db.planBuilder.draftPlan || db.activePlan;
      if (!ex || !targetPlan) return;

      if (targetPlan.days[day].isRest) {
        targetPlan.days[day] = {
          isRest: false,
          title: `${ex.category} Focus`,
          muscles: ex.category,
          duration: 45,
          restInterval: '75s',
          exercises: []
        };
      }
      targetPlan.days[day].exercises.push({
        exerciseId: ex.id,
        name: ex.name,
        equipment: ex.equipment,
        category: ex.category,
        sets: 3,
        reps: '10–12'
      });
      saveDB();
      if (!keepOpen) closeModal();
      renderWorkoutPlanBuilder();
      showToast(`Added ${ex.name} to ${day}!`, 'success');
    }

    /*************************************************************************
     * 11. TAB 5: CALENDAR
     *************************************************************************/
    let calViewYear = new Date().getFullYear();
    let calViewMonth = new Date().getMonth();
    let calSelectedDate = todayISO();

    function getDateStatus(dateStr) {
      if (db.activeSession && db.activeSession.date === dateStr) return 'inprogress';
      const hasCompleted = db.workouts.some(w => w.date === dateStr && w.status === 'completed');
      if (hasCompleted) return 'completed';

      const dObj = new Date(dateStr + 'T12:00:00');
      const weekday = getWeekdayShort(dObj);
      const todayStr = todayISO();

      if (db.activePlan) {
        const planDay = db.activePlan.days[weekday];
        if (!planDay || planDay.isRest) return 'rest';
        if (dateStr < todayStr && dateStr >= (db.activePlan.createdAt || '2000-01-01')) return 'missed';
        if (dateStr >= todayStr) return 'planned';
      }
      return 'rest';
    }

    function changeCalendarMonth(delta) {
      calViewMonth += delta;
      if (calViewMonth > 11) { calViewMonth = 0; calViewYear++; }
      if (calViewMonth < 0) { calViewMonth = 11; calViewYear--; }
      renderCalendar();
    }

    function renderCalendar() {
      const monthDate = new Date(calViewYear, calViewMonth, 1);
      document.getElementById('cal-current-month-title').textContent = monthDate.toLocaleDateString('en-US', {
        month: 'long', year: 'numeric'
      });

      const startOffset = (monthDate.getDay() + 6) % 7;
      const daysInMonth = new Date(calViewYear, calViewMonth + 1, 0).getDate();

      let counts = { completed: 0, missed: 0, planned: 0, rest: 0 };
      let gridHtml = '';
      for (let i = 0; i < startOffset; i++) gridHtml += `<div></div>`;

      const dotBadge = {
        completed: 'bg-emerald-400',
        missed: 'bg-rose-400',
        planned: 'bg-ice-400',
        inprogress: 'bg-amber-400',
        rest: 'bg-slate-500'
      };

      for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = `${calViewYear}-${String(calViewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const status = getDateStatus(dateStr);
        if (counts[status] !== undefined) counts[status]++;
        const isSelected = dateStr === calSelectedDate;
        const hasPhoto = db.photos.some(p => p.date === dateStr);

        gridHtml += `
          <button onclick="calSelectedDate='${dateStr}'; renderCalendar();" class="p-2 sm:p-3 rounded-2xl border text-left flex flex-col justify-between aspect-square transition ${
            isSelected
              ? 'bg-ice-400/20 border-ice-400'
              : 'elevated-box hover:border-ice-400/40'
          }">
            <div class="flex items-center justify-between w-full">
              <span class="text-xs sm:text-sm font-extrabold">${day}</span>
              <span class="w-2 h-2 rounded-full ${dotBadge[status]}"></span>
            </div>
            <div class="flex items-center justify-between w-full">
              <span class="text-[9px] text-slate-400 capitalize hidden sm:inline">${status}</span>
              ${hasPhoto ? '<i data-lucide="camera" class="w-3 h-3 text-cyan-400"></i>' : ''}
            </div>
          </button>
        `;
      }

      document.getElementById('calendar-days-grid').innerHTML = gridHtml;
      document.getElementById('cal-stat-completed').textContent = counts.completed;
      document.getElementById('cal-stat-missed').textContent = counts.missed;
      document.getElementById('cal-stat-planned').textContent = counts.planned;
      document.getElementById('cal-stat-rest').textContent = counts.rest;

      const denom = counts.completed + counts.missed;
      const consistency = denom > 0 ? Math.round((counts.completed / denom) * 100) : (counts.completed > 0 ? 100 : 0);
      document.getElementById('cal-stat-consistency').textContent = `${consistency}%`;

      renderCalendarDayDetail();
      lucide.createIcons();
    }

    function renderCalendarDayDetail() {
      const detailEl = document.getElementById('calendar-day-detail');
      const dObj = new Date(calSelectedDate + 'T12:00:00');
      const weekday = getWeekdayShort(dObj);
      const status = getDateStatus(calSelectedDate);
      const completedLogs = db.workouts.filter(w => w.date === calSelectedDate && w.status === 'completed');
      const scheduled = db.activePlan?.days?.[weekday];
      const dayPhotos = db.photos.filter(p => p.date === calSelectedDate);

      detailEl.innerHTML = `
        <div class="space-y-4">
          <div>
            <span class="text-xs font-bold uppercase text-ice-400">${dObj.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</span>
            <h3 class="text-xl font-extrabold mt-0.5 capitalize">Status: ${esc(status)}</h3>
          </div>

          <div class="elevated-box p-3.5 text-xs space-y-1">
            <p class="text-slate-400 font-semibold">Scheduled Plan (${esc(weekday)})</p>
            <p class="font-bold">${scheduled ? (scheduled.isRest ? 'Rest Day' : scheduled.title) : 'No active plan'}</p>
          </div>

          ${completedLogs.length > 0 ? completedLogs.map(w => `
            <div class="elevated-box p-3.5 text-xs space-y-2 border-emerald-400/30">
              <div class="flex justify-between font-bold text-emerald-400">
                <span>✓ ${esc(w.title)}</span>
                <span>${esc(w.durationMin)} min</span>
              </div>
              <p class="text-slate-400">Volume: ${formatWeight(w.totalVolumeKg, true)} • ${esc(w.totalSets)} sets</p>
              <div class="space-y-1 pt-1 border-t border-slate-200 dark:border-ice-400/10">
                ${w.exercises.map(ex => `<p>• ${esc(ex.name)} (${esc(ex.sets.length)} sets)</p>`).join('')}
              </div>
            </div>
          `).join('') : `<p class="text-xs text-slate-400">No completed workout logged on this date.</p>`}

          ${dayPhotos.length > 0 ? `
            <div class="space-y-2">
              <p class="text-xs font-bold text-cyan-400">Progress Photo</p>
              ${dayPhotos.map(p => `
                <img src="${esc(p.dataUrl)}" onclick="openFullPhotoModal('${esc(p.id)}')" class="w-full h-44 object-cover rounded-2xl cursor-pointer border border-ice-400/30" />
              `).join('')}
            </div>
          ` : ''}
        </div>
      `;
    }

    /*************************************************************************
     * 12. TAB 6: BODY PROGRESS & PHOTO COMPARISON
     *************************************************************************/
    let bodyProgressChartInstance = null;
    let progressTrendRange = 'ALL';

    function renderBodyProgressTab() {
      const dateInput = document.getElementById('meas-date');
      if (dateInput && !dateInput.value) dateInput.value = todayISO();

      // Range Pills
      const ranges = ['7D', '30D', '3M', '6M', '1Y', 'ALL'];
      document.getElementById('trend-range-pills').innerHTML = ranges.map(r => `
        <button onclick="progressTrendRange='${esc(r)}'; renderProgressChart();" class="px-2.5 py-1 rounded-full text-[10px] font-bold transition ${
          progressTrendRange === r ? 'bg-ice-400 text-navy-950' : 'bg-slate-100 dark:bg-navy-800 text-slate-400'
        }">${esc(r)}</button>
      `).join('');

      renderProgressChart();
      renderMeasurementHistory();
      renderProgressPhotos();
      lucide.createIcons();
    }

    function saveMeasurementEntry(e) {
      e.preventDefault();
      const editId = document.getElementById('meas-edit-id').value;
      const date = document.getElementById('meas-date').value;
      const entry = {
        id: editId || 'meas_' + Date.now(),
        date,
        weightKg: toStoredKg(document.getElementById('meas-weight').value),
        bodyFat: parseFloat(document.getElementById('meas-bodyfat').value) || null,
        chestCm: toStoredCm(document.getElementById('meas-chest').value),
        armsCm: toStoredCm(document.getElementById('meas-arms').value),
        waistCm: toStoredCm(document.getElementById('meas-waist').value),
        thighsCm: toStoredCm(document.getElementById('meas-thighs').value),
        shouldersCm: toStoredCm(document.getElementById('meas-shoulders').value),
        calvesCm: toStoredCm(document.getElementById('meas-calves').value)
      };

      const hasAnyValue = [entry.weightKg, entry.bodyFat, entry.chestCm, entry.armsCm, entry.waistCm, entry.thighsCm, entry.shouldersCm, entry.calvesCm].some(v => v !== null);
      if (!hasAnyValue) {
        showToast('Enter at least one body measurement value.', 'error');
        return;
      }

      if (editId) {
        const idx = db.measurements.findIndex(m => m.id === editId);
        if (idx >= 0) db.measurements[idx] = entry;
      } else {
        db.measurements.push(entry);
      }

      if (entry.weightKg) db.profile.currentWeightKg = entry.weightKg;
      db.measurements.sort((a, b) => a.date.localeCompare(b.date));
      saveDB();
      resetMeasurementForm();
      renderBodyProgressTab();
      showToast('Body measurement saved!', 'success');
    }

    function editMeasurementEntry(id) {
      const m = db.measurements.find(x => x.id === id);
      if (!m) return;
      document.getElementById('meas-edit-id').value = m.id;
      document.getElementById('meas-form-title').textContent = 'Edit Measurement';
      document.getElementById('meas-cancel-edit').classList.remove('hidden');
      document.getElementById('meas-date').value = m.date;
      document.getElementById('meas-weight').value = m.weightKg !== null ? formatWeight(m.weightKg) : '';
      document.getElementById('meas-bodyfat').value = m.bodyFat ?? '';
      document.getElementById('meas-chest').value = m.chestCm !== null ? formatLength(m.chestCm) : '';
      document.getElementById('meas-arms').value = m.armsCm !== null ? formatLength(m.armsCm) : '';
      document.getElementById('meas-waist').value = m.waistCm !== null ? formatLength(m.waistCm) : '';
      document.getElementById('meas-thighs').value = m.thighsCm !== null ? formatLength(m.thighsCm) : '';
      document.getElementById('meas-shoulders').value = m.shouldersCm !== null ? formatLength(m.shouldersCm) : '';
      document.getElementById('meas-calves').value = m.calvesCm !== null ? formatLength(m.calvesCm) : '';
    }

    function resetMeasurementForm() {
      document.getElementById('measurement-form').reset();
      document.getElementById('meas-edit-id').value = '';
      document.getElementById('meas-date').value = todayISO();
      document.getElementById('meas-form-title').textContent = 'Record Measurements';
      document.getElementById('meas-cancel-edit').classList.add('hidden');
    }

    function deleteMeasurementEntry(id) {
      db.measurements = db.measurements.filter(m => m.id !== id);
      saveDB();
      renderBodyProgressTab();
      showToast('Measurement deleted.', 'info');
    }

    function renderProgressChart() {
      const metric = document.getElementById('trend-metric-select')?.value || 'weight';
      const fieldMap = {
        weight: { key: 'weightKg', conv: formatWeight, unit: weightUnitLabel() },
        bodyFat: { key: 'bodyFat', conv: v => v, unit: '%' },
        chest: { key: 'chestCm', conv: formatLength, unit: lengthUnitLabel() },
        arms: { key: 'armsCm', conv: formatLength, unit: lengthUnitLabel() },
        waist: { key: 'waistCm', conv: formatLength, unit: lengthUnitLabel() },
        thighs: { key: 'thighsCm', conv: formatLength, unit: lengthUnitLabel() },
        shoulders: { key: 'shouldersCm', conv: formatLength, unit: lengthUnitLabel() },
        calves: { key: 'calvesCm', conv: formatLength, unit: lengthUnitLabel() }
      };
      const cfg = fieldMap[metric];

      const rangeDays = { '7D': 7, '30D': 30, '3M': 90, '6M': 180, '1Y': 365, 'ALL': 99999 }[progressTrendRange];
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - rangeDays);

      const points = db.measurements
        .filter(m => m[cfg.key] !== null && m[cfg.key] !== undefined && new Date(m.date + 'T12:00:00') >= cutoff)
        .map(m => ({ date: m.date, val: Number(cfg.conv(m[cfg.key])) }));

      // Changes Since First Entry
      const changesEl = document.getElementById('changes-since-first');
      if (points.length === 0) {
        changesEl.innerHTML = `<div class="col-span-full text-xs text-gray-400">Record measurements to view delta & % change since first entry.</div>`;
      } else {
        const first = points[0].val;
        const latest = points[points.length - 1].val;
        const diff = +(latest - first).toFixed(1);
        const pct = first !== 0 ? +((diff / first) * 100).toFixed(1) : 0;
        const sign = diff > 0 ? '+' : '';
        changesEl.innerHTML = `
          <div class="elevated-box p-2.5">
            <p class="text-[10px] text-gray-400">Initial</p>
            <p class="text-sm font-extrabold">${esc(first)} ${esc(cfg.unit)}</p>
          </div>
          <div class="elevated-box p-2.5">
            <p class="text-[10px] text-gray-400">Latest</p>
            <p class="text-sm font-extrabold text-volt-500 dark:text-volt-400">${esc(latest)} ${esc(cfg.unit)}</p>
          </div>
          <div class="elevated-box p-2.5">
            <p class="text-[10px] text-gray-400">Total Change</p>
            <p class="text-sm font-extrabold ${diff >= 0 ? 'text-emerald-400' : 'text-volt-400'}">${esc(sign)}${esc(diff)} ${esc(cfg.unit)}</p>
          </div>
          <div class="elevated-box p-2.5">
            <p class="text-[10px] text-gray-400">% Change</p>
            <p class="text-sm font-extrabold">${esc(sign)}${esc(pct)}%</p>
          </div>
        `;
      }

      const ctx = document.getElementById('bodyProgressChart');
      if (!ctx) return;
      if (bodyProgressChartInstance) bodyProgressChartInstance.destroy();
      
      bodyProgressChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
          labels: points.map(p => p.date),
          datasets: [{
            label: `${metric.toUpperCase()} (${cfg.unit})`,
            data: points.map(p => p.val),
            borderColor: '#C5F02E',
            backgroundColor: 'rgba(250, 204, 21, 0.14)',
            fill: true,
            tension: 0.35,
            pointRadius: 4,
            pointBackgroundColor: '#C5F02E'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            y: {
              grid: { color: () => chartGridColor() },
              ticks: { color: () => chartTextColor(), font: { size: 11 } }
            },
            x: {
              grid: { display: false },
              ticks: { color: () => chartTextColor(), font: { size: 11 } }
            }
          }
        }
      });
    }

    function renderMeasurementHistory() {
      const container = document.getElementById('measurement-history-container');
      if (db.measurements.length === 0) {
        container.innerHTML = `<p class="text-xs text-slate-400 py-4">No measurement entries recorded yet.</p>`;
        return;
      }
      const rows = [...db.measurements].reverse();
      container.innerHTML = `
        <table class="w-full text-left text-xs border-collapse">
          <thead>
            <tr class="border-b border-slate-200 dark:border-ice-400/15 text-slate-400">
              <th class="py-2.5 pr-3">Date</th>
              <th class="py-2.5 px-2">Weight</th>
              <th class="py-2.5 px-2">BF%</th>
              <th class="py-2.5 px-2">Chest</th>
              <th class="py-2.5 px-2">Arms</th>
              <th class="py-2.5 px-2">Waist</th>
              <th class="py-2.5 px-2">Thighs</th>
              <th class="py-2.5 px-2">Shoulders</th>
              <th class="py-2.5 px-2">Calves</th>
              <th class="py-2.5 pl-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-200 dark:divide-ice-400/10">
            ${rows.map(m => `
              <tr>
                <td class="py-2.5 pr-3 font-bold whitespace-nowrap">${esc(m.date)}</td>
                <td class="py-2.5 px-2 font-semibold text-ice-400">${formatWeight(m.weightKg)}</td>
                <td class="py-2.5 px-2">${m.bodyFat ?? '—'}</td>
                <td class="py-2.5 px-2">${formatLength(m.chestCm)}</td>
                <td class="py-2.5 px-2">${formatLength(m.armsCm)}</td>
                <td class="py-2.5 px-2">${formatLength(m.waistCm)}</td>
                <td class="py-2.5 px-2">${formatLength(m.thighsCm)}</td>
                <td class="py-2.5 px-2">${formatLength(m.shouldersCm)}</td>
                <td class="py-2.5 px-2">${formatLength(m.calvesCm)}</td>
                <td class="py-2.5 pl-2 text-right whitespace-nowrap">
                  <button onclick="editMeasurementEntry('${esc(m.id)}')" class="text-ice-400 hover:underline mr-2">Edit</button>
                  <button onclick="deleteMeasurementEntry('${esc(m.id)}')" class="text-rose-400 hover:underline">Delete</button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;
    }

    async function handleDirectPhotoUpload(event) {
      const file = event.target.files?.[0];
      if (!file) return;
      try {
        const dataUrl = await compressImageFile(file);
        const photo = { id: 'photo_' + Date.now(), date: todayISO(), dataUrl, note: 'Progress check-in', workoutId: null };
        await PhotoVault.put(photo);
        db.photos.push(photo);
        saveDB();
        renderProgressPhotos();
        showToast('Private progress photo added!', 'success');
      } catch (e) {
        showToast('Failed to load photo.', 'error');
      }
    }

    function renderProgressPhotos() {
      const filterMonth = document.getElementById('photo-filter-month')?.value || '';
      const sorted = [...db.photos].sort((a, b) => a.date.localeCompare(b.date));
      const filtered = filterMonth ? sorted.filter(p => p.date.startsWith(filterMonth)) : sorted;

      // Before/After Comparison Section
      const baSection = document.getElementById('before-after-section');
      if (sorted.length >= 2) {
        baSection.classList.remove('hidden');
        const beforeSel = document.getElementById('ba-before-select');
        const afterSel = document.getElementById('ba-after-select');
        const prevB = beforeSel.value;
        const prevA = afterSel.value;

        const opts = sorted.map((p, idx) => `<option value="${p.id}">#${idx + 1} • ${p.date}</option>`).join('');
        beforeSel.innerHTML = opts;
        afterSel.innerHTML = opts;

        beforeSel.value = sorted.some(p => p.id === prevB) ? prevB : sorted[0].id;
        afterSel.value = sorted.some(p => p.id === prevA) ? prevA : sorted[sorted.length - 1].id;
        updateBeforeAfterViewer();
      } else {
        baSection.classList.add('hidden');
      }

      const grid = document.getElementById('progress-photos-grid');
      if (filtered.length === 0) {
        grid.innerHTML = `<div class="col-span-full text-center py-8 text-xs text-slate-400 border border-dashed border-slate-300 dark:border-ice-400/20 rounded-2xl">No progress photos stored yet. Capture one after your workout or upload above.</div>`;
        return;
      }

      grid.innerHTML = filtered.map(p => `
        <div class="group relative rounded-2xl overflow-hidden aspect-[3/4] bg-navy-950 border border-ice-400/20">
          <img src="${esc(p.dataUrl)}" onclick="openFullPhotoModal('${esc(p.id)}')" alt="Progress ${esc(p.date)}" class="w-full h-full object-cover cursor-pointer group-hover:scale-105 transition duration-300" />
          <div class="absolute inset-x-0 bottom-0 p-2.5 bg-gradient-to-t from-navy-950/90 via-navy-950/50 to-transparent text-white">
            <p class="text-[11px] font-bold">${esc(p.date)}</p>
            ${p.note ? `<p class="text-[10px] text-slate-300 truncate">${esc(p.note)}</p>` : ''}
          </div>
          <button onclick="deleteProgressPhoto('${esc(p.id)}')" class="absolute top-2 right-2 w-7 h-7 rounded-full bg-navy-950/75 text-rose-400 flex items-center justify-center opacity-0 group-hover:opacity-100 transition" title="Delete Photo">
            <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
          </button>
        </div>
      `).join('');

      lucide.createIcons();
    }

    function updateBeforeAfterViewer() {
      const bId = document.getElementById('ba-before-select').value;
      const aId = document.getElementById('ba-after-select').value;
      const bPhoto = db.photos.find(p => p.id === bId);
      const aPhoto = db.photos.find(p => p.id === aId);
      if (!bPhoto || !aPhoto) return;

      document.getElementById('ba-before-img').src = bPhoto.dataUrl;
      document.getElementById('ba-after-img').src = aPhoto.dataUrl;
      document.getElementById('ba-before-label').textContent = `Before (${bPhoto.date})`;
      document.getElementById('ba-after-label').textContent = `After (${aPhoto.date})`;

      const box = document.getElementById('ba-slider-box');
      if (box) {
        document.getElementById('ba-after-img').style.width = box.offsetWidth + 'px';
      }
    }

    function slideBeforeAfter(val) {
      document.getElementById('ba-after-wrapper').style.width = `${val}%`;
      document.getElementById('ba-divider').style.left = `${val}%`;
    }

    function openFullPhotoModal(photoId) {
      const p = db.photos.find(x => x.id === photoId);
      if (!p) return;
      openModal(`
        <div class="space-y-3">
          <div class="flex items-center justify-between">
            <div>
              <h3 class="text-base font-extrabold">${p.date}</h3>
              <p class="text-xs text-slate-400">${esc(p.note || 'Private Progress Entry')}</p>
            </div>
            <button onclick="closeModal()" aria-label="Close" class="p-2 rounded-full bg-gray-100 dark:bg-charcoal-800 text-gray-700 dark:text-gray-200 hover:text-volt-500"><i data-lucide="x" class="w-4 h-4"></i></button>
          </div>
          <img src="${p.dataUrl}" class="w-full max-h-[70vh] object-contain rounded-2xl bg-navy-950" />
        </div>
      `);
    }

    async function deleteProgressPhoto(id) {
      try {
        await PhotoVault.remove(id);
      } catch (err) {
        console.error(err);
        showToast('Could not delete that photo. Please try again.', 'error');
        return;
      }
      db.photos = db.photos.filter(p => p.id !== id);
      saveDB();
      renderProgressPhotos();
      showToast('Photo removed.', 'info');
    }

    /*************************************************************************
     * 13. TAB 7: MONTHLY REPORT & AUTOMATIC MONTHLY PROGRESS VIDEO ENGINE
     *************************************************************************/
    let videoGenerationState = {
      consentGranted: false,
      musicEnabled: true,
      selectedPhotoIds: [],
      generatedUrl: null,
      generatedMonth: null,
      generatedExt: 'webm',
      rendering: false
    };

    function renderMonthlyReport() {
      const picker = document.getElementById('report-month-picker');
      if (!picker.value) picker.value = todayISO().slice(0, 7);
      const ym = picker.value; // YYYY-MM
      const [yearStr, monthStr] = ym.split('-');
      const year = parseInt(yearStr);
      const monthIdx = parseInt(monthStr) - 1;
      const monthName = new Date(year, monthIdx, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

      // Check if today is last calendar day of the month
      const now = new Date();
      const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
      const isLastCalendarDay = now.getDate() === lastDayOfMonth;
      document.getElementById('eom-badge').textContent = isLastCalendarDay
        ? 'Last day of the month: your recap is ready to generate'
        : `End-of-Month Recap (${monthName})`;

      // Header Metadata
      document.getElementById('rep-subtitle-month').textContent = `Reporting Period: ${monthName}`;
      document.getElementById('rep-user-line').textContent = `${db.profile.name} • Goal: ${db.profile.goal} (${db.profile.level})`;
      document.getElementById('rep-generated-date').textContent = `Generated: ${new Date().toLocaleDateString()}`;

      // Current Month Workouts vs Previous Month
      const prevMonthDate = new Date(year, monthIdx - 1, 1);
      const prevYm = `${prevMonthDate.getFullYear()}-${String(prevMonthDate.getMonth() + 1).padStart(2, '0')}`;

      const curWorkouts = db.workouts.filter(w => w.date.startsWith(ym) && w.status === 'completed');
      const prevWorkouts = db.workouts.filter(w => w.date.startsWith(prevYm) && w.status === 'completed');

      const curVol = curWorkouts.reduce((s, w) => s + (Number(w.totalVolumeKg) || 0), 0);
      const prevVol = prevWorkouts.reduce((s, w) => s + (Number(w.totalVolumeKg) || 0), 0);
      const avgDur = curWorkouts.length > 0 ? Math.round(curWorkouts.reduce((s, w) => s + (w.durationMin || 0), 0) / curWorkouts.length) : 0;
      const activeDays = new Set(curWorkouts.map(w => w.date)).size;

      // Consistency calculation for selected month
      const daysInSelMonth = new Date(year, monthIdx + 1, 0).getDate();
      let plannedInMonth = 0;
      const nowDate = new Date();
      const isCurrentMonth = nowDate.getFullYear() === year && nowDate.getMonth() === monthIdx;
      const elapsedDays = isCurrentMonth ? nowDate.getDate() : daysInSelMonth;
      if (db.activePlan) {
        for (let d = 1; d <= elapsedDays; d++) {
          const wd = getWeekdayShort(new Date(year, monthIdx, d));
          if (db.activePlan.days[wd] && !db.activePlan.days[wd].isRest) plannedInMonth++;
        }
      }
      const consistencyPct = plannedInMonth > 0 ? Math.min(100, Math.round((activeDays / plannedInMonth) * 100)) : (activeDays > 0 ? 100 : 0);

      const deltaWorkouts = curWorkouts.length - prevWorkouts.length;
      const deltaVolKg = curVol - prevVol;

      document.getElementById('rep-overview-grid').innerHTML = `
        <div class="elevated-box report-kpi report-kpi-workouts p-3.5">
          <p class="report-kpi-label text-[11px] text-slate-400">Total Workouts</p>
          <p class="report-kpi-value text-xl font-extrabold mt-0.5">${esc(curWorkouts.length)}</p>
          <p class="report-kpi-delta text-[10px] ${deltaWorkouts >= 0 ? 'text-emerald-400' : 'text-rose-400'}">${deltaWorkouts >= 0 ? '+' : ''}${esc(deltaWorkouts)} vs prev month</p>
        </div>
        <div class="elevated-box report-kpi report-kpi-volume p-3.5">
          <p class="report-kpi-label text-[11px] text-slate-400">Training Volume</p>
          <p class="report-kpi-value text-xl font-extrabold text-ice-400 mt-0.5">${formatWeight(curVol, true)}</p>
          <p class="report-kpi-delta text-[10px] ${deltaVolKg >= 0 ? 'text-emerald-400' : 'text-rose-400'}">${deltaVolKg >= 0 ? '+' : ''}${formatWeight(deltaVolKg, true)} vs prev</p>
        </div>
        <div class="elevated-box report-kpi report-kpi-consistency p-3.5">
          <p class="report-kpi-label text-[11px] text-slate-400">Consistency</p>
          <p class="report-kpi-value text-xl font-extrabold text-cyan-400 mt-0.5">${esc(consistencyPct)}%</p>
          <p class="report-kpi-delta text-[10px] text-slate-400">${esc(activeDays)} active days</p>
        </div>
        <div class="elevated-box report-kpi report-kpi-duration p-3.5">
          <p class="report-kpi-label text-[11px] text-slate-400">Avg Duration</p>
          <p class="report-kpi-value text-xl font-extrabold mt-0.5">${esc(avgDur)} min</p>
          <p class="report-kpi-delta text-[10px] text-slate-400">Per session</p>
        </div>
        <div class="elevated-box report-kpi report-kpi-days p-3.5 col-span-2 sm:col-span-1">
          <p class="report-kpi-label text-[11px] text-slate-400">Active Days</p>
          <p class="report-kpi-value text-xl font-extrabold mt-0.5">${esc(activeDays)}</p>
          <p class="report-kpi-delta text-[10px] text-slate-400">Out of ${esc(daysInSelMonth)} days</p>
        </div>
      `;

      // Body Measurements Start vs End of Month
      const monthMeas = db.measurements.filter(m => m.date.startsWith(ym)).sort((a, b) => a.date.localeCompare(b.date));
      const measEl = document.getElementById('rep-measurements-table');
      if (monthMeas.length === 0) {
        measEl.innerHTML = `<p class="text-xs text-slate-400">No body measurements recorded during ${esc(monthName)}.</p>`;
      } else {
        const startM = monthMeas[0];
        const endM = monthMeas[monthMeas.length - 1];
        const rows = [
          { label: 'Weight', s: startM.weightKg, e: endM.weightKg, fmt: formatWeight, unit: weightUnitLabel() },
          { label: 'Body Fat %', s: startM.bodyFat, e: endM.bodyFat, fmt: v => v ?? '—', unit: '%' },
          { label: 'Chest', s: startM.chestCm, e: endM.chestCm, fmt: formatLength, unit: lengthUnitLabel() },
          { label: 'Arms', s: startM.armsCm, e: endM.armsCm, fmt: formatLength, unit: lengthUnitLabel() },
          { label: 'Waist', s: startM.waistCm, e: endM.waistCm, fmt: formatLength, unit: lengthUnitLabel() },
          { label: 'Thighs', s: startM.thighsCm, e: endM.thighsCm, fmt: formatLength, unit: lengthUnitLabel() }
        ];
        measEl.innerHTML = `
          <table class="report-measurement-table w-full text-left text-xs">
            <thead>
              <tr class="border-b border-slate-200 dark:border-ice-400/15 text-slate-400">
                <th class="py-2">Metric</th>
                <th class="py-2">Start (${esc(startM.date)})</th>
                <th class="py-2">End (${esc(endM.date)})</th>
                <th class="py-2">Change</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-200 dark:divide-ice-400/10">
              ${rows.map(r => {
                const diff = (r.s !== null && r.e !== null) ? +(Number(r.fmt(r.e)) - Number(r.fmt(r.s))).toFixed(1) : null;
                return `
                  <tr>
                    <td class="py-2 font-bold">${esc(r.label)}</td>
                    <td class="py-2">${r.s !== null ? `${r.fmt(r.s)} ${esc(r.unit)}` : '—'}</td>
                    <td class="py-2">${r.e !== null ? `${r.fmt(r.e)} ${esc(r.unit)}` : '—'}</td>
                    <td class="py-2 font-bold ${diff > 0 ? 'text-emerald-400' : diff < 0 ? 'text-cyan-400' : ''}">${diff !== null ? `${diff > 0 ? '+' : ''}${esc(diff)} ${esc(r.unit)}` : '—'}</td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        `;
      }

      // Top Lifts & PRs in Month
      const maxLiftMap = {};
      curWorkouts.forEach(w => {
        w.exercises.forEach(ex => {
          ex.sets.forEach(st => {
            const wKg = Number(st.weightKg) || 0;
            if (wKg > (maxLiftMap[ex.name] || 0)) maxLiftMap[ex.name] = wKg;
          });
        });
      });
      const prEntries = Object.entries(maxLiftMap).sort((a, b) => b[1] - a[1]).slice(0, 6);
      document.getElementById('rep-prs-grid').innerHTML = prEntries.length === 0
        ? `<p class="text-xs text-slate-400 col-span-full">No weighted lifts logged in ${esc(monthName)}.</p>`
        : prEntries.map(([name, wKg]) => `
          <div class="elevated-box report-pr-card p-3 flex items-center justify-between text-xs">
            <span class="font-bold truncate pr-2">${esc(name)}</span>
            <span class="font-extrabold text-ice-400 whitespace-nowrap">${formatWeight(wKg, true)}</span>
          </div>
        `).join('');

      // Chronological Photos for Selected Month
      const monthPhotos = db.photos.filter(p => p.date.startsWith(ym)).sort((a, b) => a.date.localeCompare(b.date));
      document.getElementById('rep-photos-grid').innerHTML = monthPhotos.length === 0
        ? `<p class="text-xs text-slate-400 col-span-full">No progress photographs uploaded for ${esc(monthName)}.</p>`
        : monthPhotos.map(p => `
          <div class="report-photo-card rounded-xl overflow-hidden border border-slate-200 dark:border-ice-400/20">
            <img src="${esc(p.dataUrl)}" class="w-full aspect-[3/4] object-cover" />
            <div class="report-photo-date p-2 text-[10px] font-bold bg-slate-100 dark:bg-navy-800">${esc(p.date)}</div>
          </div>
        `).join('');

      // Render Automatic Monthly Video Studio
      renderMonthlyVideoStudio(monthPhotos, monthName, {
        workoutsCount: curWorkouts.length,
        volumeStr: formatWeight(curVol, true),
        consistencyPct
      });

      lucide.createIcons();
    }

    function renderMonthlyVideoStudio(monthPhotos, monthName, statsObj) {
      const studioEl = document.getElementById('monthly-video-studio-body');
      const selectedYm = document.getElementById('report-month-picker').value;
      // A rendered video belongs to the month it was made for; never show another month's file.
      const visibleUrl = videoGenerationState.generatedMonth === selectedYm ? videoGenerationState.generatedUrl : null;

      // Honest validation: require >= 2 real photos; never fake transformation
      if (monthPhotos.length < 2) {
        studioEl.innerHTML = `
          <div class="elevated-box p-4 flex items-start gap-3 border-amber-400/30">
            <i data-lucide="info" class="w-5 h-5 text-amber-400 shrink-0 mt-0.5"></i>
            <div class="text-xs space-y-1">
              <p class="font-bold text-amber-400">Insufficient Progress Photos for ${esc(monthName)} (${esc(monthPhotos.length)}/2 minimum)</p>
              <p class="text-slate-500 dark:text-slate-300 leading-relaxed">
                weGogym never generates fake or synthetic body transformations. Upload at least <strong>2 chronological progress photos</strong> during ${esc(monthName)} to unlock your monthly transformation video.
              </p>
            </div>
          </div>
        `;
        return;
      }

      // Sync default selection
      if (videoGenerationState.selectedPhotoIds.length === 0 || !monthPhotos.some(p => videoGenerationState.selectedPhotoIds.includes(p.id))) {
        videoGenerationState.selectedPhotoIds = monthPhotos.map(p => p.id);
      }

      studioEl.innerHTML = `
        <div class="space-y-4">
          <!-- Photo Selection Strip -->
          <div>
            <p class="text-xs font-bold mb-2">1. Select Chronological Photos to Include (${esc(videoGenerationState.selectedPhotoIds.length)} selected)</p>
            <div class="flex gap-2.5 overflow-x-auto pb-2">
              ${monthPhotos.map(p => {
                const checked = videoGenerationState.selectedPhotoIds.includes(p.id);
                return `
                  <label class="relative shrink-0 w-20 rounded-xl overflow-hidden border-2 cursor-pointer ${checked ? 'border-ice-400' : 'border-transparent opacity-50'}">
                    <img src="${esc(p.dataUrl)}" class="w-full h-24 object-cover" />
                    <input type="checkbox" ${checked ? 'checked' : ''} onchange="toggleVideoPhotoSelection('${esc(p.id)}')" class="absolute top-1.5 right-1.5 accent-sky-400" />
                    <span class="block text-[9px] font-bold text-center bg-navy-950/85 text-white py-0.5">${p.date.slice(5)}</span>
                  </label>
                `;
              }).join('')}
            </div>
          </div>

          <!-- Permission & Audio Options -->
          <div class="elevated-box p-3.5 space-y-2.5 text-xs">
            <label class="flex items-start gap-2.5 cursor-pointer">
              <input type="checkbox" ${videoGenerationState.consentGranted ? 'checked' : ''} onchange="videoGenerationState.consentGranted = this.checked" class="mt-0.5 accent-sky-400" />
              <span><strong>Privacy Permission:</strong> I authorize weGogym to locally process my selected private progress photos on this device to render my transformation video. Photos are encrypted on this device and never uploaded. Anyone who can use this unlocked browser can still view them.</span>
            </label>
            <label class="flex items-center gap-2.5 cursor-pointer pt-1 border-t border-slate-200 dark:border-ice-400/10">
              <input type="checkbox" ${videoGenerationState.musicEnabled ? 'checked' : ''} onchange="videoGenerationState.musicEnabled = this.checked" class="accent-sky-400" />
              <span>Include synthesized ambient electronic background soundtrack</span>
            </label>
          </div>

          <!-- Action Buttons -->
          <div class="flex flex-wrap items-center gap-2.5">
            <button onclick='compileMonthlyTransformationVideo(${JSON.stringify(monthName)}, ${JSON.stringify(statsObj)})' ${videoGenerationState.rendering ? 'disabled' : ''} class="btn-primary px-5 py-2.5 text-xs flex items-center gap-2">
              <i data-lucide="clapperboard" class="w-4 h-4"></i>
              ${videoGenerationState.rendering ? 'Rendering Video...' : (visibleUrl ? 'Regenerate Video' : 'Generate Monthly Video')}
            </button>

            ${visibleUrl ? `
              <a href="${esc(visibleUrl)}" download="weGogym_${monthName.replace(/\s+/g, '_')}_Transformation.${esc(videoGenerationState.generatedExt)}" class="px-4 py-2.5 rounded-full bg-emerald-400/20 text-emerald-400 border border-emerald-400/30 text-xs font-bold flex items-center gap-1.5">
                <i data-lucide="download" class="w-3.5 h-3.5"></i> Download Video
              </a>
              <button onclick="shareTransformationVideo('${esc(monthName)}')" class="px-4 py-2.5 rounded-full bg-slate-100 dark:bg-navy-800 text-xs font-bold flex items-center gap-1.5">
                <i data-lucide="share-2" class="w-3.5 h-3.5 text-ice-400"></i> Share
              </button>
            ` : ''}
          </div>

          <!-- Video Player Output -->
          ${visibleUrl ? `
            <div class="max-w-sm mx-auto pt-2">
              <video src="${esc(visibleUrl)}" controls playsinline class="w-full rounded-2xl border border-ice-400/30 shadow-xl bg-navy-950"></video>
            </div>
          ` : ''}
        </div>
      `;
    }

    function toggleVideoPhotoSelection(photoId) {
      const idx = videoGenerationState.selectedPhotoIds.indexOf(photoId);
      if (idx >= 0) videoGenerationState.selectedPhotoIds.splice(idx, 1);
      else videoGenerationState.selectedPhotoIds.push(photoId);
      renderMonthlyReport();
    }

    async function compileMonthlyTransformationVideo(monthName, statsObj) {
      if (!videoGenerationState.consentGranted) {
        showToast('Please check the Privacy Permission box before processing your photos.', 'error');
        return;
      }

      const ym = document.getElementById('report-month-picker').value;
      const selectedPhotos = db.photos
        .filter(p => p.date.startsWith(ym) && videoGenerationState.selectedPhotoIds.includes(p.id))
        .sort((a, b) => a.date.localeCompare(b.date));

      if (selectedPhotos.length < 2) {
        showToast('Select at least 2 photos to render a transformation video.', 'error');
        return;
      }

      if (typeof MediaRecorder === 'undefined') {
        showToast('Video recording is not supported in this browser.', 'error');
        return;
      }

      videoGenerationState.rendering = true;
      let recorder = null;
      let audioCtx = null;
      let onVisibility = null;
      renderMonthlyReport();
      showToast('Rendering your video. Keep weGogym open and visible until it finishes.', 'info');

      try {
        // Load all HTMLImageElements
        const loadedImgs = await Promise.all(selectedPhotos.map(p => new Promise((res, rej) => {
          const im = new Image();
          im.onload = () => res({ img: im, date: p.date, note: p.note });
          im.onerror = rej;
          im.src = p.dataUrl;
        })));

        const canvas = document.createElement('canvas');
        canvas.width = 720;
        canvas.height = 960;
        const ctx = canvas.getContext('2d');

        const stream = canvas.captureStream(30);

        // Optional Synthesized Ambient Background Audio via Web Audio API
        if (videoGenerationState.musicEnabled) {
          try {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            const dest = audioCtx.createMediaStreamDestination();
            const master = audioCtx.createGain();
            master.gain.value = 0.08;
            master.connect(dest);

            // Warm ambient chord pad (A minor 9)
            [220, 261.63, 329.63, 392.00].forEach(freq => {
              const osc = audioCtx.createOscillator();
              osc.type = 'triangle';
              osc.frequency.value = freq;
              osc.connect(master);
              osc.start();
            });
            dest.stream.getAudioTracks().forEach(t => stream.addTrack(t));
          } catch (_) {}
        }

        const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
          ? 'video/webm;codecs=vp9'
          : (MediaRecorder.isTypeSupported('video/mp4') ? 'video/mp4' : 'video/webm');
        videoGenerationState.generatedExt = mimeType.includes('mp4') ? 'mp4' : 'webm';

        const chunks = [];
        recorder = new MediaRecorder(stream, { mimeType });
        recorder.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data); };

        const recordingDone = new Promise(resolve => {
          recorder.onstop = () => {
            if (audioCtx) audioCtx.close().catch(() => {});
            const blob = new Blob(chunks, { type: mimeType });
            resolve(URL.createObjectURL(blob));
          };
        });

        recorder.start();

        // Render timeline frames: Intro (1.2s) + Each Photo (1.3s with smooth crossfade) + End Stats (1.8s)
        const fps = 30;
        const introFrames = 36;
        const perPhotoFrames = 39;
        const outroFrames = 54;
        const totalFrames = introFrames + loadedImgs.length * perPhotoFrames + outroFrames;

        // Frames are scheduled against the clock, so pauses do not accumulate into a longer video.
        const renderStart = performance.now();
        const frameMs = 1000 / fps;
        onVisibility = () => {
          if (document.hidden) showToast('Rendering slows down while weGogym is in the background. Return to the app to finish faster.', 'info');
        };
        document.addEventListener('visibilitychange', onVisibility);

        for (let f = 0; f < totalFrames; f++) {
          const frameWait = renderStart + f * frameMs - performance.now();
          if (frameWait > 0) await new Promise(r => setTimeout(r, frameWait));

          ctx.fillStyle = '#0F1115';
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          if (f < introFrames) {
            // Intro Title Card
            const alpha = Math.min(1, f / 15);
            ctx.globalAlpha = alpha;
            ctx.fillStyle = '#C5F02E';
            ctx.font = 'bold 26px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('weGogym TRANSFORMATION', canvas.width / 2, 410);
            ctx.fillStyle = '#F3F4F6';
            ctx.font = '800 54px sans-serif';
            ctx.fillText(monthName.toUpperCase(), canvas.width / 2, 480);
            ctx.fillStyle = '#9CA3AF';
            ctx.font = '500 24px sans-serif';
            ctx.fillText(`${db.profile.name} • ${loadedImgs.length} Check-Ins`, canvas.width / 2, 535);
            ctx.globalAlpha = 1;
          } else if (f < introFrames + loadedImgs.length * perPhotoFrames) {
            const rel = f - introFrames;
            const photoIdx = Math.min(loadedImgs.length - 1, Math.floor(rel / perPhotoFrames));
            const localFrame = rel % perPhotoFrames;
            const item = loadedImgs[photoIdx];

            // Draw fitted photo with subtle zoom
            const zoom = 1 + (localFrame / perPhotoFrames) * 0.04;
            drawCoverPhoto(ctx, item.img, canvas.width, canvas.height, zoom);

            // Crossfade from previous photo during first 10 frames
            if (photoIdx > 0 && localFrame < 10) {
              ctx.globalAlpha = 1 - localFrame / 10;
              drawCoverPhoto(ctx, loadedImgs[photoIdx - 1].img, canvas.width, canvas.height, 1.04);
              ctx.globalAlpha = 1;
            }

            // Top Brand Pill & Bottom Date Overlay
            ctx.fillStyle = 'rgba(15, 17, 21, 0.78)';
            ctx.fillRect(0, 0, canvas.width, 76);
            ctx.fillStyle = '#C5F02E';
            ctx.font = '800 24px sans-serif';
            ctx.textAlign = 'left';
            ctx.fillText('weGogym', 34, 48);
            ctx.fillStyle = '#D1D5DB';
            ctx.font = '600 20px sans-serif';
            ctx.textAlign = 'right';
            ctx.fillText(monthName, canvas.width - 34, 48);

            ctx.fillStyle = 'rgba(15, 17, 21, 0.85)';
            ctx.fillRect(0, canvas.height - 110, canvas.width, 110);
            ctx.fillStyle = '#F3F4F6';
            ctx.font = '800 32px sans-serif';
            ctx.textAlign = 'left';
            ctx.fillText(item.date, 34, canvas.height - 58);
            ctx.fillStyle = '#C5F02E';
            ctx.font = '600 20px sans-serif';
            ctx.fillText(item.note || `Check-in ${photoIdx + 1} of ${loadedImgs.length}`, 34, canvas.height - 25);
          } else {
            // End Screen Monthly Progress Statistics
            ctx.fillStyle = '#C5F02E';
            ctx.font = '800 30px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('weGogym MONTHLY SUMMARY', canvas.width / 2, 260);

            ctx.fillStyle = '#F3F4F6';
            ctx.font = '800 46px sans-serif';
            ctx.fillText(monthName, canvas.width / 2, 325);

            const lines = [
              `Workouts Completed: ${statsObj.workoutsCount}`,
              `Total Volume Lifted: ${statsObj.volumeStr}`,
              `Monthly Consistency: ${statsObj.consistencyPct}%`,
              `Transformation Check-Ins: ${loadedImgs.length}`
            ];
            lines.forEach((line, idx) => {
              ctx.fillStyle = idx % 2 === 0 ? '#E5E7EB' : '#C5F02E';
              ctx.font = '700 30px sans-serif';
              ctx.fillText(line, canvas.width / 2, 440 + idx * 68);
            });
          }

        }

        recorder.stop();
        document.removeEventListener('visibilitychange', onVisibility);
        const newUrl = await recordingDone;
        if (videoGenerationState.generatedUrl && videoGenerationState.generatedUrl !== newUrl) {
          URL.revokeObjectURL(videoGenerationState.generatedUrl);
        }
        videoGenerationState.generatedUrl = newUrl;
        videoGenerationState.generatedMonth = ym;
        videoGenerationState.rendering = false;
        renderMonthlyReport();
        showToast('Monthly transformation video rendered successfully!', 'success');
      } catch (err) {
        console.error(err);
        if (onVisibility) document.removeEventListener('visibilitychange', onVisibility);
        // Release everything a half-finished render may still hold.
        if (recorder && recorder.state !== 'inactive') {
          recorder.onstop = null;
          try { recorder.stop(); } catch (_) {}
        }
        if (audioCtx) audioCtx.close().catch(() => {});
        videoGenerationState.rendering = false;
        renderMonthlyReport();
        showToast('Video rendering failed on this device/browser.', 'error');
      }
    }

    function drawCoverPhoto(ctx, img, cw, ch, zoom = 1) {
      const scale = Math.max(cw / img.width, ch / img.height) * zoom;
      const w = img.width * scale;
      const h = img.height * scale;
      ctx.drawImage(img, (cw - w) / 2, (ch - h) / 2, w, h);
    }

    async function shareTransformationVideo(monthName) {
      if (!videoGenerationState.generatedUrl) return;
      try {
        const res = await fetch(videoGenerationState.generatedUrl);
        const blob = await res.blob();
        const file = new File([blob], `weGogym_${monthName.replace(/\s+/g, '_')}_Transformation.${videoGenerationState.generatedExt}`, { type: blob.type });
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: `My ${monthName} Transformation — weGogym`,
            files: [file]
          });
          return;
        }
      } catch (_) {}
      showToast('Use the Download Video button to save and share your video.', 'info');
    }

    function downloadReportPDF() {
      showToast('Opening print dialog — select "Save as PDF" to export your report.', 'info');
      setTimeout(() => window.print(), 350);
    }

    /*************************************************************************
     * 14. TAB 8: PROFILE, GOALS, DEMO DATA & RESET ZONE
     *************************************************************************/
    function renderProfileTab() {
      const p = db.profile;
      document.getElementById('prof-name').value = p.name || '';
      document.getElementById('prof-age').value = p.age || '';
      document.getElementById('prof-height').value = p.heightCm ? formatLength(p.heightCm) : '';
      document.getElementById('prof-weight').value = p.currentWeightKg ? formatWeight(p.currentWeightKg) : '';
      document.getElementById('prof-target-weight').value = p.targetWeightKg ? formatWeight(p.targetWeightKg) : '';
      document.getElementById('prof-goal').value = p.goal || 'Muscle Growth';
      document.getElementById('prof-level').value = p.level || 'Intermediate';
      document.getElementById('prof-schedule-time').value = p.scheduleTime || '07:30';
      document.getElementById('pref-reminders').checked = !!db.settings.reminders;

      const avatarBox = document.getElementById('profile-avatar-preview');
      avatarBox.innerHTML = p.avatar
        ? `<img src="${esc(p.avatar)}" class="w-full h-full object-cover" />`
        : (p.name || 'WG').slice(0, 2).toUpperCase();

      // Unit button highlights
      ['metric', 'imperial', 'stone'].forEach(u => {
        const btn = document.getElementById(`unit-btn-${u}`);
        if (btn) btn.className = unitToggleClass(db.settings.units === u);
      });

      // Overall Progress Summary
      const stats = calculateStats();
      const firstWeightEntry = db.measurements.find(m => m.weightKg !== null);
      const firstW = firstWeightEntry ? firstWeightEntry.weightKg : p.currentWeightKg;

      document.getElementById('profile-progress-summary').innerHTML = `
        <div class="flex justify-between py-1.5 border-b border-slate-200 dark:border-ice-400/10">
          <span class="text-slate-400">Total Workouts</span>
          <span class="font-bold">${esc(stats.totalWorkouts)}</span>
        </div>
        <div class="flex justify-between py-1.5 border-b border-slate-200 dark:border-ice-400/10">
          <span class="text-slate-400">Current Streak</span>
          <span class="font-bold text-cyan-400">${esc(stats.currentStreak)} days</span>
        </div>
        <div class="flex justify-between py-1.5 border-b border-slate-200 dark:border-ice-400/10">
          <span class="text-slate-400">Total Training Volume</span>
          <span class="font-bold text-ice-400">${formatWeight(stats.totalVolumeKg, true)}</span>
        </div>
        <div class="flex justify-between py-1.5 border-b border-slate-200 dark:border-ice-400/10">
          <span class="text-slate-400">First Recorded Weight</span>
          <span class="font-bold">${formatWeight(firstW, true)}</span>
        </div>
        <div class="flex justify-between py-1.5 border-b border-slate-200 dark:border-ice-400/10">
          <span class="text-slate-400">Current → Target Weight</span>
          <span class="font-bold">${formatWeight(p.currentWeightKg, true)} → ${formatWeight(p.targetWeightKg, true)}</span>
        </div>
      `;

      lucide.createIcons();
    }

    function saveUserProfile(e) {
      e.preventDefault();
      db.profile.name = document.getElementById('prof-name').value.trim() || 'Athlete';
      db.profile.age = parseInt(document.getElementById('prof-age').value) || 26;
      db.profile.heightCm = toStoredCm(document.getElementById('prof-height').value) || 178;
      db.profile.currentWeightKg = toStoredKg(document.getElementById('prof-weight').value) || 75;
      db.profile.targetWeightKg = toStoredKg(document.getElementById('prof-target-weight').value) || 78;
      db.profile.goal = document.getElementById('prof-goal').value;
      db.profile.level = document.getElementById('prof-level').value;
      db.profile.scheduleTime = document.getElementById('prof-schedule-time').value;
      saveDB();
      // Recalculate nutrition after profile update
      initNutrition();
      
      // Set up real-time profile change listeners
      setupNutritionProfileListeners();
      
      renderProfileTab();
      showToast('Profile & fitness goals updated!', 'success');
    }

    async function handleAvatarUpload(e) {
      const file = e.target.files?.[0];
      if (!file) return;
      db.profile.avatar = await compressImageFile(file, 300, 0.8);
      saveDB();
      renderProfileTab();
      showToast('Profile photo updated!', 'success');
    }

    function toggleReminderSetting(val) {
      db.settings.reminders = val;
      saveDB();
      showToast(val ? 'Workout reminders enabled.' : 'Workout reminders muted.', 'info');
    }

    function confirmDestructiveAction(scope) {
      const labels = {
        workouts: 'Reset Workout History (deletes all logged sessions)',
        measurements: 'Reset Body Measurements (deletes all weight & tape logs)',
        photos: 'Delete Progress Photos (permanently removes all private photos)',
        all: 'Reset All Application Data (restores clean empty state)'
      };
      openModal(`
        <div class="space-y-4">
          <div class="flex items-center gap-2 text-rose-500">
            <i data-lucide="alert-octagon" class="w-6 h-6"></i>
            <h3 class="text-lg font-extrabold">Confirm Destructive Action</h3>
          </div>
          <p class="text-sm text-gray-400">You are about to execute: <strong class="text-white">${labels[scope]}</strong>. This action cannot be undone.</p>
          <div class="flex justify-end gap-2 pt-2">
            <button onclick="closeModal()" class="px-4 py-2 rounded-full bg-gray-100 dark:bg-charcoal-800 text-xs font-bold">Cancel</button>
            <button onclick="executeDestructiveReset('${scope}')" class="px-5 py-2 rounded-full bg-rose-600 text-white text-xs font-bold">Yes, Confirm Delete</button>
          </div>
        </div>
      `);
    }

    function executeDestructiveReset(scope) {
      if (scope === 'workouts') {
        db.workouts = [];
        db.activeSession = null;
      } else if (scope === 'measurements') {
        db.measurements = [];
      } else if (scope === 'photos') {
        db.photos = [];
        PhotoVault.clear().catch(err => console.error(err));
        videoGenerationState.generatedUrl = null;
      } else if (scope === 'all') {
        PhotoVault.clear().catch(err => console.error(err));
        localStorage.removeItem(DB_KEY);
        db = structuredClone(DEFAULT_DB);
      }
      saveDB();
      closeModal();
      applyThemeAndUnits();
      switchTab('dashboard');
      showToast('Requested data has been permanently cleared.', 'info');
    }

    /*************************************************************************
     * 15. OPTIONAL DEMO DATA LOADER (For Quick Evaluation)
     *************************************************************************/
    function loadDemoData() {
      generateWorkoutPlan(false);
      saveDraftPlan();

      const dMinus = (days) => {
        const d = new Date();
        d.setDate(d.getDate() - days);
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      };

      db.workouts = [
        {
          id: 'demo_w1', title: 'Upper Body A (Push Focus)', date: dMinus(5), status: 'completed', durationMin: 54, exercisesCompleted: 4, totalSets: 14, totalVolumeKg: 4280, prs: [],
          exercises: [
            { name: 'Barbell Bench Press', sets: [{ weightKg: 80, reps: 8, completed: true }, { weightKg: 85, reps: 6, completed: true }] },
            { name: 'Incline Dumbbell Press', sets: [{ weightKg: 30, reps: 10, completed: true }] }
          ]
        },
        {
          id: 'demo_w2', title: 'Lower Body A (Quad & Core)', date: dMinus(3), status: 'completed', durationMin: 61, exercisesCompleted: 4, totalSets: 15, totalVolumeKg: 6150, prs: [],
          exercises: [
            { name: 'Barbell Back Squat', sets: [{ weightKg: 110, reps: 8, completed: true }, { weightKg: 120, reps: 6, completed: true }] },
            { name: 'Romanian Deadlift (RDL)', sets: [{ weightKg: 100, reps: 8, completed: true }] }
          ]
        },
        {
          id: 'demo_w3', title: 'Upper Body B (Pull & Arms)', date: dMinus(1), status: 'completed', durationMin: 52, exercisesCompleted: 5, totalSets: 16, totalVolumeKg: 4890, prs: [{ name: 'Bent-Over Barbell Row', weightKg: 75 }],
          exercises: [
            { name: 'Bent-Over Barbell Row', sets: [{ weightKg: 75, reps: 8, completed: true }] },
            { name: 'Wide-Grip Lat Pulldown', sets: [{ weightKg: 65, reps: 10, completed: true }] }
          ]
        }
      ];

      db.measurements = [
        { id: 'dm_1', date: dMinus(28), weightKg: 74.0, bodyFat: 15.2, chestCm: 100.5, armsCm: 37.5, waistCm: 80.5, thighsCm: 57.0, shouldersCm: 116.5, calvesCm: 37.5 },
        { id: 'dm_2', date: dMinus(14), weightKg: 74.8, bodyFat: 14.8, chestCm: 101.2, armsCm: 38.0, waistCm: 79.8, thighsCm: 57.6, shouldersCm: 117.2, calvesCm: 37.8 },
        { id: 'dm_3', date: dMinus(1), weightKg: 75.5, bodyFat: 14.3, chestCm: 102.0, armsCm: 38.5, waistCm: 79.0, thighsCm: 58.2, shouldersCm: 118.0, calvesCm: 38.0 }
      ];

      saveDB();
      switchTab('dashboard');
      showToast('Sample training logs, plan, and measurements loaded!', 'success');
    }

    /*************************************************************************
     * 16. INITIALIZE APPLICATION ON LOAD
     *************************************************************************/
    /*************************************************************************
     * NUTRITION WIRING (profile -> nutrition.js -> every [data-nut] element)
     *************************************************************************/
    let nutritionListenersBound = false;

    // Profile form has no activity field; map the training level to an activity multiplier.
    const LEVEL_TO_ACTIVITY = {
      Beginner: 'lightly_active',
      Intermediate: 'moderately_active',
      Advanced: 'very_active'
    };

    // Values are written to every element with data-nut="<key>", so the Profile
    // card and Dashboard overview always show the same numbers.
    const NUTRITION_WARNING_TEXT = {
      carb_floor_exceeds_target: 'Minimum carbs do not fit inside this calorie target, so the macros total more than it. Your target is unchanged. Consider a less aggressive goal, and review it with a dietitian.',
      macros_do_not_match_target: 'The macros do not add up exactly to the calorie target.',
      below_safe_calorie_floor: 'This target is below the commonly recommended minimum for your profile. Please review it with a doctor or dietitian before following it.'
    };

    function setNutWarnings(messages) {
      document.querySelectorAll('[data-nut-warnings]').forEach(el => {
        el.textContent = messages.join(' ');
        el.classList.toggle('hidden', messages.length === 0);
      });
    }

    function setNut(key, value) {
      document.querySelectorAll(`[data-nut="${key}"]`).forEach(el => { el.textContent = value; });
    }

    function setNutBar(key, percent) {
      const pct = Math.max(0, Math.min(100, Math.round(percent)));
      document.querySelectorAll(`[data-nut-bar="${key}"]`).forEach(el => { el.style.width = `${pct}%`; });
    }

    function readNutritionSliderValues() {
      return {
        proteinFactor: parseFloat(document.getElementById('protein-factor-num')?.value),
        fatFactor: parseFloat(document.getElementById('fat-factor-num')?.value)
      };
    }

    function initNutrition() {
      if (typeof wegogymNutrition === 'undefined') {
        console.error('nutrition.js did not load; nutrition targets were not calculated.');
        return;
      }

      const p = db.profile;
      const result = wegogymNutrition.calculateNutrition({
        age: p.age,
        sex: p.sex || 'male',
        heightCm: p.heightCm,
        currentWeightKg: p.currentWeightKg,
        activityLevel: LEVEL_TO_ACTIVITY[p.level] || 'moderately_active',
        fitnessGoal: p.goal,
        ...readNutritionSliderValues()
      });

      if (result.error) {
        setNutWarnings([result.message]);
        return;
      }

      setNutWarnings((result.warnings || []).map(code => NUTRITION_WARNING_TEXT[code] || code));

      const kcal = result.dailyCalories;
      const { protein, carbs, fat } = result;
      const adj = result.calorieAdjustment;
      const adjText = adj > 0 ? `+${adj}% surplus` : adj < 0 ? `${adj}% deficit` : 'At maintenance';

      const proteinPct = (protein * 4 / kcal) * 100;
      const carbsPct = (carbs * 4 / kcal) * 100;
      const fatPct = (fat * 9 / kcal) * 100;

      setNut('kcal', kcal);
      setNut('protein', protein);
      setNut('carbs', carbs);
      setNut('fat', fat);
      setNut('bmr', result.bmr);
      setNut('tdee', result.tdee);
      setNut('goal-name', p.goal || 'Maintenance');
      setNut('adj-text', adjText);
      setNut('protein-pct', Math.round(proteinPct));
      setNut('carbs-pct', Math.round(carbsPct));
      setNut('fat-pct', Math.round(fatPct));

      setNutBar('protein', proteinPct);
      setNutBar('carbs', carbsPct);
      setNutBar('fat', fatPct);
    }

    function setupNutritionProfileListeners() {
      if (nutritionListenersBound) return;
      nutritionListenersBound = true;

      const pairs = [
        { slider: 'protein-factor-slider', num: 'protein-factor-num', display: 'protein-factor-display', digits: 1, unit: 'g/kg' },
        { slider: 'fat-factor-slider', num: 'fat-factor-num', display: 'fat-factor-display', digits: 2, unit: 'g/kg' }
      ];

      pairs.forEach(({ slider, num, display, digits, unit }) => {
        const s = document.getElementById(slider);
        const n = document.getElementById(num);
        if (!s || !n) return;

        const onChange = (src) => {
          const v = parseFloat(src.value);
          if (!Number.isFinite(v)) return;
          s.value = v;
          n.value = v;
          const label = document.getElementById(display);
          if (label) label.textContent = `${v.toFixed(digits)} ${unit}`;
          initNutrition();
        };

        s.addEventListener('input', () => onChange(s));
        n.addEventListener('input', () => onChange(n));
      });
    }

    /*************************************************************************
     * 17. UNIVERSAL STYLE HOOKS
     * Every visible interface element receives both a reusable type class
     * (for example .ui-button or .ui-select) and its own unique class
     * (for example .ui-button-0042). This includes rendered/dynamic content.
     *************************************************************************/
    let styleHookSequence = 0;
    let styleHookObserver = null;

    const STYLE_HOOK_ROLES = {
      HTML: 'root', BODY: 'page',
      BUTTON: 'button', A: 'link',
      INPUT: 'input', SELECT: 'select', OPTION: 'option', TEXTAREA: 'textarea',
      LABEL: 'label', FORM: 'form',
      H1: 'heading', H2: 'heading', H3: 'heading', H4: 'heading', H5: 'heading', H6: 'heading',
      P: 'text', SPAN: 'text-inline', SMALL: 'text-small', STRONG: 'text-strong', B: 'text-bold',
      DIV: 'container', SECTION: 'section', ARTICLE: 'article', HEADER: 'header', FOOTER: 'footer',
      ASIDE: 'aside', NAV: 'navigation',
      UL: 'list', OL: 'list', LI: 'list-item',
      TABLE: 'table', THEAD: 'table-head', TBODY: 'table-body', TR: 'table-row', TH: 'table-header', TD: 'table-cell',
      DETAILS: 'details', SUMMARY: 'summary',
      IMG: 'image', SVG: 'icon', I: 'icon', CANVAS: 'canvas', VIDEO: 'video',
      FIGURE: 'figure', FIGCAPTION: 'caption', HR: 'divider'
    };

    const STYLE_HOOK_IGNORED_TAGS = new Set(['SCRIPT', 'STYLE', 'LINK', 'META', 'TITLE', 'NOSCRIPT', 'TEMPLATE']);

    function assignStyleHook(element) {
      if (!(element instanceof Element) || STYLE_HOOK_IGNORED_TAGS.has(element.tagName)) return;
      if (element.dataset.uiHook) return;

      const role = STYLE_HOOK_ROLES[element.tagName] || 'element';
      const sequence = String(++styleHookSequence).padStart(4, '0');
      const uniqueClass = `ui-${role}-${sequence}`;

      // data-ui-hook is a convenient inspector label; the two CSS classes are the
      // actual hooks to use for restyling. The unique class never repeats in a page.
      element.dataset.uiHook = uniqueClass;
      element.classList.add('ui-element', `ui-${role}`, uniqueClass);
    }

    function assignStyleHooks(root = document) {
      const elements = [];
      if (root instanceof Element) elements.push(root);
      if (root.querySelectorAll) elements.push(...root.querySelectorAll('*'));
      elements.forEach(assignStyleHook);
    }

    function initializeStyleHooks() {
      if (styleHookObserver) return;
      assignStyleHooks(document);
      styleHookObserver = new MutationObserver(mutations => {
        mutations.forEach(mutation => {
          mutation.addedNodes.forEach(node => {
            if (node.nodeType === Node.ELEMENT_NODE) assignStyleHooks(node);
          });
        });
      });
      styleHookObserver.observe(document.body, { childList: true, subtree: true });
      window.refreshStyleHooks = () => assignStyleHooks(document);
    }

    function ensureTabFooters() {
      document.querySelectorAll('.tab-section').forEach(section => {
        if (Array.from(section.children).some(child => child.classList.contains('app-credit-footer'))) return;
        const footer = document.createElement('footer');
        footer.className = 'app-credit-footer';
        footer.innerHTML = '<span>Designed & developed by Mohit Singh Mahra</span><span>weGogym Athletic OS</span>';
        section.appendChild(footer);
      });
    }

    window.addEventListener('DOMContentLoaded', async () => {
      await hydratePhotos();
      applyThemeAndUnits();
      renderNavigation();
      initNutrition();
      setupNutritionProfileListeners();
      switchTab('dashboard');
      setTimeout(() => { if (activeTab === 'dashboard') renderDashboard(); }, 0);
      ensureTabFooters();
      initializeStyleHooks();
      updateInstallControls();
      refreshChartThemes();
    });