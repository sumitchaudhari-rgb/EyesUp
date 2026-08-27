import CryptoJS from 'crypto-js';

// Secret salt used for HMAC-SHA256 signature verification between frontend and backend
const APP_HMAC_SALT = 'EyesUp-Dictation-App-SecureToken-2026-v1';

/**
 * Generates an HMAC-SHA256 signature and timestamp for API request authentication.
 * Protects serverless endpoints against unauthorized scraping and replay attacks.
 * 
 * @param {string} text 
 * @param {string} voice 
 * @returns {{ timestamp: number, signature: string }}
 */
export function generateApiToken(text, voice) {
  const timestamp = Date.now();
  const rawMessage = `${text.trim()}|${voice}|${timestamp}`;
  const signature = CryptoJS.HmacSHA256(rawMessage, APP_HMAC_SALT).toString(CryptoJS.enc.Hex);

  return {
    timestamp,
    signature
  };
}
