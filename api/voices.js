/**
 * EyesUp — GET /api/voices
 * Returns the curated list of free Microsoft Edge Neural Indian voices.
 * No API key required.
 */

'use strict';

const INDIAN_VOICES = [
  // ── English (India) ──────────────────────────────────────────────────────
  {
    voiceURI: 'en-IN-NeerjaNeural',
    name: 'Neerja — English India',
    lang: 'en-IN',
    languageCode: 'en-IN',
    gender: 'Female',
    quality: 'Neural',
    default: true,
  },
  {
    voiceURI: 'en-IN-PrabhatNeural',
    name: 'Prabhat — English India',
    lang: 'en-IN',
    languageCode: 'en-IN',
    gender: 'Male',
    quality: 'Neural',
  },
  {
    voiceURI: 'en-IN-NeerjaExpressiveNeural',
    name: 'Neerja Expressive — English India',
    lang: 'en-IN',
    languageCode: 'en-IN',
    gender: 'Female',
    quality: 'Neural',
  },

  // ── Hindi (India) ─────────────────────────────────────────────────────────
  {
    voiceURI: 'hi-IN-SwaraNeural',
    name: 'Swara — हिंदी',
    lang: 'hi-IN',
    languageCode: 'hi-IN',
    gender: 'Female',
    quality: 'Neural',
  },
  {
    voiceURI: 'hi-IN-MadhurNeural',
    name: 'Madhur — हिंदी',
    lang: 'hi-IN',
    languageCode: 'hi-IN',
    gender: 'Male',
    quality: 'Neural',
  },

  // ── Regional Indian Languages ─────────────────────────────────────────────
  {
    voiceURI: 'ta-IN-PallaviNeural',
    name: 'Pallavi — தமிழ் (Tamil)',
    lang: 'ta-IN',
    languageCode: 'ta-IN',
    gender: 'Female',
    quality: 'Neural',
  },
  {
    voiceURI: 'te-IN-ShrutiNeural',
    name: 'Shruti — తెలుగు (Telugu)',
    lang: 'te-IN',
    languageCode: 'te-IN',
    gender: 'Female',
    quality: 'Neural',
  },
  {
    voiceURI: 'mr-IN-AarohiNeural',
    name: 'Aarohi — मराठी (Marathi)',
    lang: 'mr-IN',
    languageCode: 'mr-IN',
    gender: 'Female',
    quality: 'Neural',
  },
  {
    voiceURI: 'bn-IN-TanishaaNeural',
    name: 'Tanishaa — বাংলা (Bengali)',
    lang: 'bn-IN',
    languageCode: 'bn-IN',
    gender: 'Female',
    quality: 'Neural',
  },
  {
    voiceURI: 'kn-IN-SapnaNeural',
    name: 'Sapna — ಕನ್ನಡ (Kannada)',
    lang: 'kn-IN',
    languageCode: 'kn-IN',
    gender: 'Female',
    quality: 'Neural',
  },
];

module.exports = function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'public, max-age=86400'); // cache 24h

  if (req.method !== 'GET') return res.status(405).end();
  return res.status(200).json({ voices: INDIAN_VOICES });
};
