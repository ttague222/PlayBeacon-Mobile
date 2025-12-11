#!/usr/bin/env node

/**
 * Download Placeholder Sounds Script
 *
 * Creates placeholder sound files organized by category.
 * Replace with real sounds from Pixabay for production.
 *
 * Usage: node scripts/download-placeholder-sounds.js
 *
 * Pixabay Search Recommendations:
 * - UI tap: "pop click", "ui click", "bubble pop"
 * - UI swipe: "whoosh soft", "light woosh"
 * - Bear celebrate: "magic sparkle", "fairy dust"
 * - Bear sad: "sad tone short"
 * - Rewards: "magic sparkle", "ascending tone", "jingle short"
 * - System: "ping soft", "chime success", "thud soft"
 */

const fs = require('fs');
const path = require('path');

const SOUNDS_DIR = path.join(__dirname, '..', 'assets', 'sounds');

// Sound files organized by category
const SOUND_STRUCTURE = {
  ui: [
    { name: 'tap.mp3', pixabay: 'Search: "pop click" or "bubble pop"' },
    { name: 'swipe.mp3', pixabay: 'Search: "whoosh soft" or "light woosh"' },
    { name: 'tab_change.mp3', pixabay: 'Search: "ui click soft"' },
    { name: 'remove.mp3', pixabay: 'Search: "pop remove" or "poof"' },
    { name: 'modal_open.mp3', pixabay: 'Search: "popup soft"' },
    { name: 'modal_close.mp3', pixabay: 'Search: "popup close"' },
    { name: 'favorite.mp3', pixabay: 'Search: "sparkle short" or "pling"' },
  ],
  bear: [
    { name: 'tailwag.mp3', pixabay: 'Search: "soft swoosh" or "swish"' },
    { name: 'pawpop.mp3', pixabay: 'Search: "cartoon pop" or "boop"' },
    { name: 'sniff.mp3', pixabay: 'Search: "sniff cartoon" or "curious sound"' },
    { name: 'celebrate.mp3', pixabay: 'Search: "magic sparkle" or "fairy dust"' },
    { name: 'sad.mp3', pixabay: 'Search: "sad tone short" or "aww"' },
    { name: 'sleep.mp3', pixabay: 'Search: "sleep puff" or "snore soft"' },
    { name: 'surprise.mp3', pixabay: 'Search: "cartoon surprise" or "boing"' },
    { name: 'earwiggle.mp3', pixabay: 'Search: "tiny sparkle" or "twinkle"' },
    { name: 'happy.mp3', pixabay: 'Search: "happy chime short"' },
  ],
  rewards: [
    { name: 'confetti.mp3', pixabay: 'Search: "magic sparkle" or "celebration"' },
    { name: 'streak.mp3', pixabay: 'Search: "ascending tone" or "level up"' },
    { name: 'daily.mp3', pixabay: 'Search: "jingle short" or "reward"' },
    { name: 'achievement.mp3', pixabay: 'Search: "achievement unlock" or "fanfare short"' },
    { name: 'xp.mp3', pixabay: 'Search: "coin collect" or "point gain"' },
  ],
  system: [
    { name: 'ping.mp3', pixabay: 'Search: "ping soft" or "notification gentle"' },
    { name: 'success.mp3', pixabay: 'Search: "chime success" or "positive"' },
    { name: 'error.mp3', pixabay: 'Search: "thud soft" or "error gentle"' },
    { name: 'loading_ambient.mp3', pixabay: 'Search: "ambient soft loop"' },
    { name: 'loading_complete.mp3', pixabay: 'Search: "complete chime"' },
    { name: 'no_results.mp3', pixabay: 'Search: "empty tone" or "nothing found"' },
  ],
};

/**
 * Minimal valid MP3 file (silent, ~0.1 seconds)
 */
const SILENT_MP3_BASE64 =
  '//uQxAAAAAANIAAAAAExBTUUzLjEwMFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV' +
  'VVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV' +
  'VVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV' +
  'VVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV' +
  'VVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV' +
  'VVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV' +
  'VVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV' +
  'VVVVVVVVVf/7kMQAA8AAADSAAAAANIAAADSAAAAVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV' +
  'VVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV' +
  'VVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV' +
  'VVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV' +
  'VVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV' +
  'VVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV' +
  'VVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV' +
  'VVVVVVVVVVVVVQ==';

function createSilentMP3(filePath) {
  const buffer = Buffer.from(SILENT_MP3_BASE64, 'base64');
  fs.writeFileSync(filePath, buffer);
}

function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

async function main() {
  console.log('🔊 Creating placeholder sound files...\n');

  ensureDir(SOUNDS_DIR);

  let created = 0;
  let skipped = 0;
  const pixabayGuide = [];

  for (const [category, sounds] of Object.entries(SOUND_STRUCTURE)) {
    const categoryDir = path.join(SOUNDS_DIR, category);
    ensureDir(categoryDir);
    console.log(`\n📁 ${category}/`);

    for (const sound of sounds) {
      const filePath = path.join(categoryDir, sound.name);

      if (fs.existsSync(filePath)) {
        console.log(`   ⏭️  ${sound.name} (exists)`);
        skipped++;
      } else {
        createSilentMP3(filePath);
        console.log(`   ✅ ${sound.name}`);
        created++;
      }

      pixabayGuide.push({
        file: `${category}/${sound.name}`,
        search: sound.pixabay,
      });
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log(`📊 Summary: ${created} created, ${skipped} skipped`);
  console.log('='.repeat(60));

  // Print Pixabay guide
  console.log(`
╔════════════════════════════════════════════════════════════╗
║           PIXABAY SOUND DOWNLOAD GUIDE                     ║
╠════════════════════════════════════════════════════════════╣
║ Visit: https://pixabay.com/sound-effects/                  ║
║ All sounds are royalty-free for commercial use             ║
╚════════════════════════════════════════════════════════════╝

Replace placeholder files with real sounds:
`);

  for (const item of pixabayGuide) {
    console.log(`📄 ${item.file}`);
    console.log(`   ${item.search}\n`);
  }

  console.log(`
💡 TIPS:
- Download MP3 format
- Keep sounds under 1 second (except ambient)
- Normalize to -6dB peak
- UI sounds should be ~100-200ms
- Bear sounds should be soft and cartoon-like
- All sounds should be child-friendly (no harsh tones)

📂 Sound files location: ${SOUNDS_DIR}
`);
}

main().catch(console.error);
