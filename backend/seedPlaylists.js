/**
 * seedPlaylists.js
 * Run with:  node backend/seedPlaylists.js
 *
 * Seeds the MongoDB Playlist collection with 6 default playlists.
 * Audio files are expected at backend/public/music/<filename>.mp3
 * The script works even when the .mp3 files are absent –
 * the audioUrl is simply stored as a path for later use.
 */

const path    = require('path');
const dotenv  = require('dotenv');
dotenv.config({ path: path.join(__dirname, '.env') });

const mongoose = require('mongoose');
const Playlist = require('./models/Playlist');

// ── Seed data ──────────────────────────────────────────────────────────────────
const playlists = [
  {
    title:         'Deep Focus',
    category:      'Focus',
    description:   'Binaural beats and ambient tones to keep you in a flow state.',
    coverGradient: 'linear-gradient(135deg, #4A90E2 0%, #7BB8F8 100%)',
    emoji:         '🎯',
    duration:      '45 min',
    moodTag:       'Calm & Focused',
    songs: [
      {
        title:     'Alpha Binaural Beats',
        artist:    'Mindful Sounds',
        audioUrl:  '/music/focus.mp3',
        duration:  '8:00',
        coverImage: '',
      },
      {
        title:     'Ambient Flow',
        artist:    'Deep Work Studio',
        audioUrl:  '/music/ambient.mp3',
        duration:  '7:30',
        coverImage: '',
      },
      {
        title:     'Crystal Clear Mind',
        artist:    'Focus Lab',
        audioUrl:  '/music/focus.mp3',
        duration:  '6:45',
        coverImage: '',
      },
      {
        title:     'Theta Waves',
        artist:    'Brainwave Audio',
        audioUrl:  '/music/ambient.mp3',
        duration:  '9:15',
        coverImage: '',
      },
    ],
  },
  {
    title:         'Soft Relaxation',
    category:      'Relax',
    description:   'Gentle piano melodies to help you unwind and release tension.',
    coverGradient: 'linear-gradient(135deg, #C8A8E9 0%, #EDD8FF 100%)',
    emoji:         '☁️',
    duration:      '38 min',
    moodTag:       'Peaceful',
    songs: [
      {
        title:     'Piano Lullaby',
        artist:    'Soft Keys',
        audioUrl:  '/music/piano.mp3',
        duration:  '4:30',
        coverImage: '',
      },
      {
        title:     'Gentle Breeze',
        artist:    'Calm Studio',
        audioUrl:  '/music/piano.mp3',
        duration:  '5:10',
        coverImage: '',
      },
      {
        title:     'Warmth in C',
        artist:    'Keys & Strings',
        audioUrl:  '/music/piano.mp3',
        duration:  '4:55',
        coverImage: '',
      },
      {
        title:     'Sunday Morning',
        artist:    'Soft Keys',
        audioUrl:  '/music/piano.mp3',
        duration:  '5:30',
        coverImage: '',
      },
    ],
  },
  {
    title:         'Night Rain & Calm',
    category:      'Sleep',
    description:   'Rain sounds and deep-sleep music to help you drift off peacefully.',
    coverGradient: 'linear-gradient(135deg, #6C5CE7 0%, #2D3436 100%)',
    emoji:         '🌙',
    duration:      '60 min',
    moodTag:       'Sleepy',
    songs: [
      {
        title:     'Rainy Night',
        artist:    'Nature Sounds',
        audioUrl:  '/music/rain.mp3',
        duration:  '10:00',
        coverImage: '',
      },
      {
        title:     'Storm in the Distance',
        artist:    'Nature Sounds',
        audioUrl:  '/music/rain.mp3',
        duration:  '12:00',
        coverImage: '',
      },
      {
        title:     'Deep Sleep Tones',
        artist:    'Sleep Lab',
        audioUrl:  '/music/rain.mp3',
        duration:  '15:00',
        coverImage: '',
      },
      {
        title:     'Delta Waves',
        artist:    'Brainwave Audio',
        audioUrl:  '/music/rain.mp3',
        duration:  '20:00',
        coverImage: '',
      },
    ],
  },
  {
    title:         'Anxiety Relief',
    category:      'Anxiety Relief',
    description:   'Soft piano and ambient textures crafted to soothe anxious minds.',
    coverGradient: 'linear-gradient(135deg, #7FB069 0%, #B8E6A0 100%)',
    emoji:         '🌿',
    duration:      '30 min',
    moodTag:       'Grounded',
    songs: [
      {
        title:     '478 Breathing Tone',
        artist:    'Calm Mind Studio',
        audioUrl:  '/music/piano.mp3',
        duration:  '5:00',
        coverImage: '',
      },
      {
        title:     'Safe Space',
        artist:    'Mindful Audio',
        audioUrl:  '/music/ambient.mp3',
        duration:  '6:30',
        coverImage: '',
      },
      {
        title:     'Ground & Release',
        artist:    'Calm Mind Studio',
        audioUrl:  '/music/piano.mp3',
        duration:  '7:00',
        coverImage: '',
      },
      {
        title:     'Morning Mist',
        artist:    'Nature Sounds',
        audioUrl:  '/music/rain.mp3',
        duration:  '8:30',
        coverImage: '',
      },
    ],
  },
  {
    title:         'Morning Energy',
    category:      'Energy',
    description:   'Uplifting acoustic tracks to start your day with positive energy.',
    coverGradient: 'linear-gradient(135deg, #F39C12 0%, #FDD58C 100%)',
    emoji:         '🌅',
    duration:      '25 min',
    moodTag:       'Energized',
    songs: [
      {
        title:     'Rise & Shine',
        artist:    'Acoustic Sessions',
        audioUrl:  '/music/focus.mp3',
        duration:  '3:30',
        coverImage: '',
      },
      {
        title:     'Good Vibes Only',
        artist:    'Sunrise Beats',
        audioUrl:  '/music/focus.mp3',
        duration:  '3:45',
        coverImage: '',
      },
      {
        title:     'Golden Hour',
        artist:    'Acoustic Sessions',
        audioUrl:  '/music/focus.mp3',
        duration:  '4:00',
        coverImage: '',
      },
      {
        title:     'Momentum',
        artist:    'Sunrise Beats',
        audioUrl:  '/music/focus.mp3',
        duration:  '4:15',
        coverImage: '',
      },
    ],
  },
  {
    title:         'Meditation Bowls',
    category:      'Meditation',
    description:   'Tibetan singing bowls and deep drones for mindful meditation.',
    coverGradient: 'linear-gradient(135deg, #FF6B6B 0%, #FFB4A2 100%)',
    emoji:         '🪷',
    duration:      '50 min',
    moodTag:       'Centered',
    songs: [
      {
        title:     'Opening Bowl',
        artist:    'Sacred Sounds',
        audioUrl:  '/music/meditation.mp3',
        duration:  '8:00',
        coverImage: '',
      },
      {
        title:     'Third Eye Frequency',
        artist:    'Tibetan Masters',
        audioUrl:  '/music/meditation.mp3',
        duration:  '10:00',
        coverImage: '',
      },
      {
        title:     'Chakra Cleanse',
        artist:    'Sacred Sounds',
        audioUrl:  '/music/meditation.mp3',
        duration:  '12:00',
        coverImage: '',
      },
      {
        title:     'Deep Silence',
        artist:    'Tibetan Masters',
        audioUrl:  '/music/meditation.mp3',
        duration:  '15:00',
        coverImage: '',
      },
    ],
  },
];

// ── Runner ─────────────────────────────────────────────────────────────────────
async function seed() {
  try {
    const uri = process.env.MONGO_URI;
    if (!uri) {
      console.error('❌  MONGO_URI is not set in .env');
      process.exit(1);
    }

    await mongoose.connect(uri);
    console.log('✅  Connected to MongoDB');

    // Wipe existing playlists so we can re-seed cleanly
    await Playlist.deleteMany({});
    console.log('🗑   Cleared existing playlists');

    const inserted = await Playlist.insertMany(playlists);
    console.log(`🌱  Seeded ${inserted.length} playlists:`);
    inserted.forEach(p =>
      console.log(`    • [${p.category}] ${p.title}  (${p.numberOfTracks} tracks)`)
    );

    await mongoose.disconnect();
    console.log('👋  Disconnected. Done!');
    process.exit(0);
  } catch (err) {
    console.error('❌  Seed failed:', err.message);
    process.exit(1);
  }
}

seed();
