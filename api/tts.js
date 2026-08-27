/**
 * EyesUp — Edge TTS Serverless Endpoint: POST /api/tts
 * Uses msedge-tts (free Microsoft Neural voices, no API key).
 *
 * Returns: { audioBase64: string, timepoints: Array<{ markName, timeSeconds }> }
 */

'use strict';

const { MsEdgeTTS, OUTPUT_FORMAT } = require('msedge-tts');
const crypto = require('crypto');

const APP_HMAC_SALT = 'EyesUp-Dictation-App-SecureToken-2026-v1';

/**
 * Validates HMAC-SHA256 signature and checks timestamp to prevent API replay attacks.
 */
function verifySignature(text, voice, timestamp, signature) {
  if (!timestamp || !signature) return false;

  // Reject requests older than 90 seconds (prevents replay attacks)
  const now = Date.now();
  if (Math.abs(now - Number(timestamp)) > 90000) return false;

  try {
    const rawMessage = `${String(text).trim()}|${voice}|${timestamp}`;
    const expectedSig = crypto
      .createHmac('sha256', APP_HMAC_SALT)
      .update(rawMessage)
      .digest('hex');

    if (signature.length !== expectedSig.length) return false;
    return crypto.timingSafeEqual(Buffer.from(signature, 'hex'), Buffer.from(expectedSig, 'hex'));
  } catch (_e) {
    return false;
  }
}

// ── Format helpers ────────────────────────────────────────────────────────────

/** Numeric rate 1.0 → "+0%", 1.25 → "+25%", 0.75 → "-25%" */
function formatRate(rate) {
  const pct = Math.round((Number(rate) || 1.0) * 100) - 100;
  return pct >= 0 ? `+${pct}%` : `${pct}%`;
}

/** Numeric pitch 0 → "+0Hz" */
function formatPitch(pitch) {
  const hz = Math.round(Number(pitch) || 0);
  return hz >= 0 ? `+${hz}Hz` : `${hz}Hz`;
}

function escapeXml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Build SSML with prosody and optional word-pause breaks.
 * Keeps it simple — plain <prosody> wrapper around escaped text.
 */
function buildSSML(text, voice, edgeRate, edgePitch, wordPauseMs) {
  const lang = voice.startsWith('hi-') ? 'hi-IN'
    : voice.startsWith('ta-') ? 'ta-IN'
    : voice.startsWith('te-') ? 'te-IN'
    : voice.startsWith('mr-') ? 'mr-IN'
    : voice.startsWith('bn-') ? 'bn-IN'
    : voice.startsWith('kn-') ? 'kn-IN'
    : 'en-IN';

  const words = text.split(/\s+/).filter(Boolean);
  const content = words
    .map(w => wordPauseMs > 0
      ? `${escapeXml(w)}<break time="${wordPauseMs}ms"/>`
      : escapeXml(w))
    .join(' ');

  return (
    `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="${lang}">` +
    `<voice name="${voice}">` +
    `<prosody rate="${edgeRate}" pitch="${edgePitch}">${content}</prosody>` +
    `</voice></speak>`
  );
}

// ── Stream collector (handles 'end', 'close', and timeout) ────────────────────

function collectStream(audioStream, timeoutMs = 9000) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let settled = false;

    const done = (err) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      if (err) reject(err);
      else resolve(Buffer.concat(chunks));
    };

    const timer = setTimeout(
      () => done(new Error('Edge TTS stream timed out after ' + timeoutMs + 'ms')),
      timeoutMs
    );

    audioStream.on('data',  (chunk) => chunks.push(chunk));
    audioStream.on('end',   () => done(null));
    audioStream.on('close', () => done(null));
    audioStream.on('error', (err) => done(err));
  });
}

// ── Handler ───────────────────────────────────────────────────────────────────

module.exports = async function handler(req, res) {
  // Disallow non-POST methods
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Security: Prevent third-party websites from abusing your serverless endpoint
  const secFetchSite = req.headers['sec-fetch-site'];
  if (secFetchSite && secFetchSite === 'cross-site') {
    return res.status(403).json({ error: 'Access forbidden from external origins' });
  }

  const {
    text        = '',
    voice       = 'en-IN-NeerjaNeural',
    rate        = 1.0,
    pitch       = 0.0,
    wordPauseMs = 0,
    timestamp,
    signature,
  } = req.body || {};

  const cleanText = String(text).trim();
  if (!cleanText) {
    return res.status(400).json({ error: '"text" must not be empty.' });
  }

  // Cryptographic authentication check (reject unauthenticated / expired requests)
  if (!verifySignature(cleanText, voice, timestamp, signature)) {
    return res.status(401).json({ error: 'Unauthorized: Invalid or expired cryptographic signature.' });
  }

  try {
    const edgeRate  = formatRate(rate);
    const edgePitch = formatPitch(pitch);
    const ssml      = buildSSML(cleanText, voice, edgeRate, edgePitch, Number(wordPauseMs) || 0);

    console.log(`[Edge TTS] voice=${voice} rate=${edgeRate} pitch=${edgePitch} chars=${cleanText.length}`);

    const tts = new MsEdgeTTS();
    await tts.setMetadata(voice, OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3);

    const { audioStream, wordBoundaryList } = tts.toStream(ssml);

    // Collect audio with timeout
    const audioBuffer  = await collectStream(audioStream);
    const audioBase64  = audioBuffer.toString('base64');

    // Resolve word boundaries with a generous timeout (they may arrive late)
    let timepoints = [];
    try {
      const boundaries = await Promise.race([
        wordBoundaryList,
        new Promise(resolve => setTimeout(() => resolve([]), 5000))
      ]);

      if (Array.isArray(boundaries) && boundaries.length > 0) {
        timepoints = boundaries.map((wb, i) => ({
          markName:    `w${i}`,
          // Microsoft uses 100-nanosecond ticks → convert to seconds
          timeSeconds: wb.offset / 10_000_000,
        }));
      }
    } catch (_e) {
      // Word boundaries are optional — proceed without them
    }

    console.log(`[Edge TTS] OK: ${audioBuffer.length} bytes, ${timepoints.length} word timepoints`);
    return res.status(200).json({ audioBase64, timepoints });

  } catch (err) {
    console.error('[Edge TTS] Error:', err.message);

    if (err.message?.includes('429') || err.message?.toLowerCase().includes('rate')) {
      return res.status(429).json({ error: 'Microsoft TTS rate limited. Retrying shortly…' });
    }
    if (err.message?.includes('timed out')) {
      return res.status(504).json({ error: 'Edge TTS timed out. Try a shorter sentence.' });
    }

    return res.status(500).json({ error: `Edge TTS failed: ${err.message}` });
  }
};
