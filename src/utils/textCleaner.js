/**
 * Intelligent Text Cleaning & Sentence Splitting Utility for EyesUp
 * Handles line breaks, hyphenated words across lines, abbreviations, and punctuation dictation.
 */

const ABBREVIATIONS = [
  'dr', 'mr', 'mrs', 'ms', 'prof', 'sr', 'jr',
  'vs', 'etc', 'e.g', 'i.e', 'fig', 'eq', 'no',
  'approx', 'dept', 'univ', 'vol', 'jan', 'feb',
  'mar', 'apr', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'
];

/**
 * Cleans up raw OCR / PDF text:
 * - Fixes hyphenated line breaks (e.g. "syn-\napic" -> "synaptic")
 * - Normalizes unicode quotes
 * - Collapses line breaks into natural continuous spaces
 */
export function cleanRawText(raw) {
  if (!raw || typeof raw !== 'string') return '';

  return raw
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/\u00A0/g, ' ')
    // Fix words split across line breaks with hyphens
    .replace(/(\b\w+)-\s*[\r\n]+\s*(\w+\b)/g, '$1$2')
    // Replace all line breaks with clean space
    .replace(/[\r\n]+/g, ' ')
    .replace(/[ \t]+/g, ' ')
    .trim();
}

/**
 * Splits cleaned text into continuous sentences
 */
export function splitIntoSentences(text) {
  if (!text) return [];

  const cleaned = cleanRawText(text);
  if (!cleaned) return [];

  let safeText = cleaned.replace(/(\d)\.(\d)/g, '$1__DOT__$2');

  ABBREVIATIONS.forEach(abbr => {
    const regex = new RegExp(`\\b(${abbr})\\.(\\s+)`, 'gi');
    safeText = safeText.replace(regex, '$1__ABBRDOT__$2');
  });

  const rawSegments = safeText.split(/(?<=[.!?])\s+(?=[A-Z0-9"“'‘])/);
  const sentences = [];

  for (let segment of rawSegments) {
    let restored = segment
      .replace(/__DOT__/g, '.')
      .replace(/__ABBRDOT__/g, '.')
      .trim();

    if (restored.length > 2 && /[a-zA-Z0-9]/.test(restored)) {
      sentences.push(restored);
    }
  }

  if (sentences.length === 0 && cleaned.length > 0) {
    return [cleaned];
  }

  return sentences;
}

/**
 * Converts punctuation symbols in a word or sentence into spoken words for dictation.
 */
export function articulatePunctuation(text) {
  if (!text || typeof text !== 'string') return '';

  return text
    .replace(/^["“]/g, 'open quote ')
    .replace(/["”]$/g, ' close quote')
    .replace(/["“”]/g, ' quote ')
    .replace(/\(/g, ' open bracket ')
    .replace(/\)/g, ' close bracket ')
    .replace(/\[/g, ' open square bracket ')
    .replace(/\]/g, ' close square bracket ')
    .replace(/;/g, ' semicolon ')
    .replace(/:/g, ' colon ')
    .replace(/,/g, ' comma ')
    .replace(/\?/g, ' question mark ')
    .replace(/!/g, ' exclamation mark ')
    .replace(/[-—–]/g, ' dash ')
    .replace(/\.(?=\s|$)/g, ' full stop ')
    .replace(/\//g, ' slash ')
    .replace(/\s+/g, ' ')
    .trim();
}
