/**
 * EyesUp — Edge TTS Serverless Endpoint: POST /api/tts
 *
 * Uses Microsoft Edge TTS (msedge-tts) — free, no API key required.
 * Accepts plain text, builds SSML with word pauses, returns:
 *   { audioBase64: string, timepoints: [{ markName, timeSeconds }] }
 *
 * The response format is intentionally identical to the Google Cloud TTS
 * version so the frontend speechEngine.js requires zero changes.
 */

'use strict';

const { MsEdgeTTS, OUTPUT_FORMAT } = require('msedge-tts');

// ── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Convert numeric playback rate (0.25–2.0) to Edge TTS prosody format.
 * 1.0 → "+0%", 1.25 → "+25%", 0.75 → "-25%"
 */
function formatRate(rate) {
  const pct = Math.round((Number(rate) || 1.0) * 100) - 100;
  return pct >= 0 ? `+${pct}%` : `${pct}%`;
}

/**
 * Convert numeric pitch (semitones, −20..+20) to Edge TTS Hz format.
 * 0 → "+0Hz", 3 → "+3Hz", -2 → "-2Hz"
 */
function formatPitch(pitch) {
  const hz = Math.round(Number(pitch) || 0);
  return hz >= 0 ? `+${hz}Hz` : `${hz}Hz`;
}

/** Escape special XML characters to prevent SSML injection. */
function escapeXml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Build SSML string with prosody and optional word-pause breaks.
 * Each word is escaped and optionally followed by a <break/> tag.
 */
function buildSSML(text, voice, edgeRate, edgePitch, wordPauseMs) {
  const lang = voice.startsWith('hi-') ? 'hi-IN' : 'en-IN';
  const words = text.split(/\s+/).filter(Boolean);

  const content = words
    .map((w) => {
      const escaped = escapeXml(w);
      return wordPauseMs > 0
        ? `${escaped}<break time="${wordPauseMs}ms"/>`
        : escaped;
    })
    .join(' ');

  return [
    `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="${lang}">`,
    `  <voice name="${voice}">`,
    `    <prosody rate="${edgeRate}" pitch="${edgePitch}">`,
    `      ${content}`,
    `    </prosody>`,
    `  </voice>`,
    `</speak>`,
  ].join('\n');
}

// ── Handler ───────────────────────────────────────────────────────────────────

module.exports = async function handler(req, res) {
  // CORS headers for local development
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const {
    text = '',
    voice = 'en-IN-NeerjaNeural',
    rate = 1.0,
    pitch = 0.0,
    wordPauseMs = 0,
  } = req.body || {};

  const cleanText = String(text).trim();
  if (!cleanText) {
    return res.status(400).json({ error: '"text" field is required and must not be empty.' });
  }

  try {
    const edgeRate = formatRate(rate);
    const edgePitch = formatPitch(pitch);
    const ssml = buildSSML(cleanText, voice, edgeRate, edgePitch, Number(wordPauseMs) || 0);

    const tts = new MsEdgeTTS();
    await tts.setMetadata(voice, OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3);

    const { audioStream, wordBoundaryList } = tts.toStream(ssml);

    // Collect audio chunks from stream
    const chunks = [];
    await new Promise((resolve, reject) => {
      audioStream.on('data', (chunk) => chunks.push(chunk));
      audioStream.on('close', resolve);
      audioStream.on('error', reject);
    });

    const audioBase64 = Buffer.concat(chunks).toString('base64');

    // Resolve word boundary timings (100-ns ticks → seconds)
    let timepoints = [];
    try {
      const boundaries = await wordBoundaryList;
      if (Array.isArray(boundaries)) {
        timepoints = boundaries.map((wb, i) => ({
          markName: `w${i}`,
          // Microsoft returns offset in 100-nanosecond units (ticks)
          timeSeconds: wb.offset / 10_000_000,
        }));
      }
    } catch (_e) {
      // Word boundaries are optional; continue without them
    }

    return res.status(200).json({ audioBase64, timepoints });
  } catch (err) {
    console.error('[Edge TTS] Synthesis error:', err.message);

    // Surface rate-limit or network errors clearly
    if (err.message?.includes('429') || err.message?.toLowerCase().includes('rate')) {
      return res.status(429).json({ error: 'Edge TTS rate limited. Please try again in a moment.' });
    }

    return res.status(500).json({ error: `Speech synthesis failed: ${err.message}` });
  }
};
