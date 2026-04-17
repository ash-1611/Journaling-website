/**
 * Seed script — inserts sample exercises into MongoDB.
 * Run with:  node backend/seedExercises.js   (from project root)
 *        or: node seedExercises.js            (from inside /backend)
 */
require('dotenv').config();
const mongoose = require('mongoose');
const Exercise = require('./models/Exercise');

const EXERCISES = [
  // ── Stretching ────────────────────────────────────────────────────────────
  {
    title: 'Neck & Shoulder Release',
    category: 'stretching',
    description: 'Gently release built-up tension in your neck and shoulders with slow, mindful movements.',
    duration: 3,
    difficulty: 'easy',
    steps: [
      'Sit or stand tall with your spine long.',
      'Slowly drop your right ear toward your right shoulder and hold for 5 breaths.',
      'Gently roll your chin to your chest and pause.',
      'Lift your left ear toward your left shoulder and hold for 5 breaths.',
      'Return to centre, roll both shoulders back 5 times.',
    ],
    benefits: ['Reduces neck stiffness', 'Relieves tension headaches', 'Improves posture'],
  },
  {
    title: 'Full Body Morning Stretch',
    category: 'stretching',
    description: 'A head-to-toe stretch sequence to wake up your whole body and invite calm energy.',
    duration: 5,
    difficulty: 'easy',
    steps: [
      'Start lying on your back, reach arms overhead and point toes — full body stretch for 10 seconds.',
      'Hug both knees to your chest and rock side to side.',
      'Twist gently: drop knees to the right, arms wide. Hold 30 s. Repeat left.',
      'Come to standing. Forward fold, hang heavy for 5 breaths.',
      'Rise slowly, roll shoulders back, take 3 deep breaths.',
    ],
    benefits: ['Increases flexibility', 'Boosts circulation', 'Eases morning stiffness'],
  },
  {
    title: 'Hip & Lower Back Relief',
    category: 'stretching',
    description: 'Target the hips and lower back — common areas of stored stress and tension.',
    duration: 4,
    difficulty: 'easy',
    steps: [
      'Lie on your back, cross right ankle over left thigh (figure-4 shape).',
      'Flex your right foot and gently push your right knee away.',
      'Option: lift both legs toward chest for a deeper stretch. Hold 30 s.',
      'Switch sides.',
      'Finish with knees swaying side to side for 1 minute.',
    ],
    benefits: ['Releases hip flexors', 'Eases lower back pain', 'Calms the nervous system'],
  },

  // ── Breathing ─────────────────────────────────────────────────────────────
  {
    title: 'Box Breathing',
    category: 'breathing',
    description: 'A structured 4-count breath used by athletes and therapists to rapidly reduce anxiety.',
    duration: 4,
    difficulty: 'easy',
    steps: [
      'Sit upright with your feet flat on the floor.',
      'Exhale completely through your mouth.',
      'Inhale through your nose for a count of 4.',
      'Hold your breath for a count of 4.',
      'Exhale slowly through your mouth for a count of 4.',
      'Hold empty for a count of 4.',
      'Repeat the cycle 4–6 times.',
    ],
    benefits: ['Reduces anxiety immediately', 'Lowers heart rate', 'Sharpens focus'],
  },
  {
    title: '4-7-8 Relaxation Breath',
    category: 'breathing',
    description: 'Dr. Andrew Weil\'s natural tranquiliser for the nervous system.',
    duration: 3,
    difficulty: 'easy',
    steps: [
      'Place the tip of your tongue against the ridge behind your upper front teeth.',
      'Exhale completely through your mouth, making a whoosh sound.',
      'Close your mouth and inhale quietly through your nose for 4 counts.',
      'Hold your breath for 7 counts.',
      'Exhale through your mouth, making a whoosh sound, for 8 counts.',
      'Repeat the cycle 3 more times.',
    ],
    benefits: ['Promotes sleep', 'Manages stress response', 'Reduces food cravings'],
  },
  {
    title: 'Diaphragmatic Breathing',
    category: 'breathing',
    description: 'Belly breathing that activates the parasympathetic nervous system for deep calm.',
    duration: 5,
    difficulty: 'easy',
    steps: [
      'Lie on your back or sit comfortably.',
      'Place one hand on your chest, one on your belly.',
      'Breathe in through your nose — feel your belly rise while your chest stays still.',
      'Exhale slowly through pursed lips — feel your belly fall.',
      'Continue for 5–10 minutes at your own pace.',
    ],
    benefits: ['Activates rest-and-digest response', 'Lowers blood pressure', 'Reduces muscle tension'],
  },

  // ── Morning Movement ───────────────────────────────────────────────────────
  {
    title: 'Gentle Yoga Flow',
    category: 'morning',
    description: 'A soft, slow yoga sequence suitable for all levels — no experience needed.',
    duration: 6,
    difficulty: 'easy',
    steps: [
      'Start in Child\'s Pose — breathe here for 5 breaths.',
      'Come to hands and knees; flow through 5 rounds of Cat-Cow.',
      'Press into Downward Dog — pedal heels gently for 5 breaths.',
      'Walk feet to hands, hang in Forward Fold for 5 breaths.',
      'Roll up slowly, reach arms wide into Warrior II on each side for 3 breaths.',
      'Return to Mountain Pose, close your eyes, notice how you feel.',
    ],
    benefits: ['Builds body awareness', 'Strengthens and lengthens', 'Sets a mindful tone for the day'],
  },
  {
    title: 'Light Mobility Routine',
    category: 'morning',
    description: 'Joint-friendly movements to get your body flowing and your mind clear.',
    duration: 5,
    difficulty: 'easy',
    steps: [
      'Stand tall — slowly roll your head in a half-circle, 5 times each direction.',
      'Arm circles: 10 forward, 10 backward.',
      'Hip circles: hands on hips, draw large circles 10 times each way.',
      'Ankle circles: lift one foot, rotate the ankle 10 times each direction. Swap.',
      'March on the spot for 1 minute, swinging your arms naturally.',
    ],
    benefits: ['Lubricates joints', 'Improves range of motion', 'Energises without strain'],
  },
  {
    title: 'Mindful Walk in Place',
    category: 'morning',
    description: 'A grounded, meditative walk — without going anywhere — to anchor body and breath.',
    duration: 5,
    difficulty: 'easy',
    steps: [
      'Stand with feet hip-width apart, arms relaxed at sides.',
      'Begin lifting and lowering each foot slowly, as if walking through honey.',
      'Match your breath: inhale for 3 steps, exhale for 3 steps.',
      'Notice the feeling of each foot leaving and touching the floor.',
      'Gradually increase the pace for 1 minute, then slow back down.',
      'Finish standing still; close your eyes and feel the weight in your feet.',
    ],
    benefits: ['Grounds racing thoughts', 'Gentle cardiovascular activation', 'Builds present-moment awareness'],
  },
];

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('MongoDB connected ✓');
  console.log('🌱  Seeding exercises…');

  // Remove existing exercises first (idempotent re-runs)
  await Exercise.deleteMany({});
  console.log('   Cleared existing exercises.');

  const inserted = await Exercise.insertMany(EXERCISES);
  console.log(`   Inserted ${inserted.length} exercises:`);
  inserted.forEach(e => console.log(`     • [${e.category}] ${e.title}`));

  console.log('\n✅  Seed complete.');
  await mongoose.connection.close();
  process.exit(0);
}

seed().catch(err => {
  console.error('Seed failed:', err);
  process.exit(1);
});
