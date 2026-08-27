/**
 * Vercel Serverless Function: /api/tts
 * Proxies requests to Google Cloud Text-to-Speech API.
 * The API key is stored securely in GOOGLE_TTS_API_KEY environment variable
 * and is never exposed to the client browser.
 */

module.exports = async function handler(req, res) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.GOOGLE_TTS_API_KEY;
  if (!apiKey) {
    return res.status(500).json({
      error: 'GOOGLE_TTS_API_KEY environment variable is not configured on this server.'
    });
  }

  const { ssml, text, voiceName, languageCode, speakingRate, pitch } = req.body;

  if ((!ssml && !text) || !voiceName || !languageCode) {
    return res.status(400).json({
      error: 'Missing required fields: (ssml or text), voiceName, languageCode'
    });
  }

  try {
    const requestBody = {
      input: ssml ? { ssml } : { text },
      voice: {
        languageCode,
        name: voiceName
      },
      audioConfig: {
        audioEncoding: 'MP3',
        speakingRate: Math.max(0.25, Math.min(4.0, Number(speakingRate) || 1.0)),
        pitch: Math.max(-20, Math.min(20, Number(pitch) || 0.0)),
        volumeGainDb: 0
      }
    };

    // Enable word-level timepoints only when SSML marks are used
    if (ssml && ssml.includes('<mark')) {
      requestBody.enableTimePointing = ['SSML_MARK'];
    }

    const ttsResponse = await fetch(
      `https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      }
    );

    const data = await ttsResponse.json();

    if (!ttsResponse.ok) {
      console.error('[EyesUp TTS] Google API error:', data?.error);
      return res.status(ttsResponse.status).json({
        error: data?.error?.message || 'Google Cloud TTS request failed'
      });
    }

    return res.status(200).json({
      audioBase64: data.audioContent,
      timepoints: data.timepoints || []
    });
  } catch (err) {
    console.error('[EyesUp TTS] Handler error:', err.message);
    return res.status(500).json({ error: 'Internal server error: ' + err.message });
  }
};
