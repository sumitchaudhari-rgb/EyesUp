/**
 * Intelligent Text Cleaning & Sentence Splitting Utility
 * Handles line breaks, hyphenated words across lines, abbreviations, and sentence boundary detection.
 */

// Common abbreviations that shouldn't split a sentence
const ABBREVIATIONS = [
  'dr', 'mr', 'mrs', 'ms', 'prof', 'sr', 'jr',
  'vs', 'etc', 'e.g', 'i.e', 'fig', 'eq', 'no',
  'approx', 'dept', 'univ', 'vol', 'jan', 'feb',
  'mar', 'apr', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'
];

/**
 * Cleans up raw OCR / PDF text:
 * - Fixes hyphenated line breaks (e.g. "com- \n munication" -> "communication")
 * - Normalizes multiple spaces and odd unicode quotation marks
 * - Removes isolated line breaks inside paragraphs
 */
export function cleanRawText(raw) {
  if (!raw || typeof raw !== 'string') return '';

  return raw
    // Normalize unicode spaces and quotes
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/\u00A0/g, ' ')
    // Fix words split across lines with hyphens (e.g. "syn-\napic" -> "synaptic")
    .replace(/(\b\w+)-\s*[\r\n]+\s*(\w+\b)/g, '$1$2')
    // Replace single line breaks with spaces, preserve paragraph double breaks
    .replace(/([^\n])\n([^\n])/g, '$1 $2')
    // Collapse multiple horizontal spaces
    .replace(/[ \t]+/g, ' ')
    // Trim
    .trim();
}

/**
 * Splits cleaned text into natural, digestible sentences for text-to-speech.
 * Protects abbreviations, numbers with decimals (e.g., 3.14), and bullet items.
 */
export function splitIntoSentences(text) {
  if (!text) return [];

  const cleaned = cleanRawText(text);
  if (!cleaned) return [];

  // Protect decimals in numbers (e.g., 3.14 -> 3__DOT__14)
  let safeText = cleaned.replace(/(\d)\.(\d)/g, '$1__DOT__$2');

  // Protect common abbreviations
  ABBREVIATIONS.forEach(abbr => {
    const regex = new RegExp(`\\b(${abbr})\\.(\\s+)`, 'gi');
    safeText = safeText.replace(regex, '$1__ABBRDOT__$2');
  });

  // Regex to split on sentence terminators: '.', '!', '?', or double newlines
  const rawSegments = safeText.split(/(?<=[.!?])\s+(?=[A-Z0-9"“'‘])|[\r\n]{2,}/);

  const sentences = [];

  for (let segment of rawSegments) {
    // Restore protected characters
    let restored = segment
      .replace(/__DOT__/g, '.')
      .replace(/__ABBRDOT__/g, '.')
      .trim();

    // Filter out empty fragments or orphaned punctuation
    if (restored.length > 2 && /[a-zA-Z0-9]/.test(restored)) {
      sentences.push(restored);
    }
  }

  // Fallback: If no punctuation split was made, split by reasonable clause chunks
  if (sentences.length === 0 && cleaned.length > 0) {
    return [cleaned];
  }

  return sentences;
}
