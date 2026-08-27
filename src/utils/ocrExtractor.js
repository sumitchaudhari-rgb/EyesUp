import { createWorker } from 'tesseract.js';
import { cleanRawText, splitIntoSentences } from './textCleaner';

/**
 * Pre-processes an image file on canvas to optimize OCR text recognition:
 * - Resizes if excessively large to prevent memory crashes
 * - Converts to high-contrast grayscale
 * - Normalizes lighting variations
 */
export async function preprocessImage(imageSource) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';

    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        // Scale image within reasonable boundaries (max 2400px wide for optimal OCR)
        let width = img.width;
        let height = img.height;
        const maxDim = 2400;

        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        canvas.width = width;
        canvas.height = height;

        // Draw image
        ctx.drawImage(img, 0, 0, width, height);

        // Apply grayscale & contrast enhancement
        const imageData = ctx.getImageData(0, 0, width, height);
        const data = imageData.data;

        for (let i = 0; i < data.length; i += 4) {
          // Standard luminosity weights: 0.299 R + 0.587 G + 0.114 B
          const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;

          // Simple dynamic thresholding / contrast stretch
          const contrast = 1.25;
          const factor = (259 * (contrast * 255 + 255)) / (255 * (259 - contrast * 255));
          const adjusted = factor * (gray - 128) + 128;
          const clamped = Math.min(255, Math.max(0, adjusted));

          data[i] = clamped;
          data[i + 1] = clamped;
          data[i + 2] = clamped;
        }

        ctx.putImageData(imageData, 0, 0);
        resolve(canvas.toDataURL('image/png'));
      } catch (err) {
        // If canvas processing fails, fallback to original source
        console.warn("Canvas pre-processing warning, falling back to raw image:", err);
        resolve(imageSource);
      }
    };

    img.onerror = (err) => reject(new Error("Unable to load image file for OCR."));

    if (imageSource instanceof Blob || imageSource instanceof File) {
      img.src = URL.createObjectURL(imageSource);
    } else {
      img.src = imageSource;
    }
  });
}

/**
 * Extracts text from an image or photo using Tesseract.js OCR
 * @param {File|Blob|string} imageFile - Image file or URL
 * @param {Function} onProgress - Progress callback ({ stage, percent })
 * @returns {Promise<{ title: string, totalPages: number, sentences: string[], rawText: string, confidence: number }>}
 */
export async function extractTextFromImage(imageFile, onProgress = () => {}) {
  let worker = null;
  try {
    onProgress({ stage: 'Pre-processing photo & optimizing contrast...', percent: 15 });
    const processedImageData = await preprocessImage(imageFile);

    onProgress({ stage: 'Initializing in-browser OCR engine...', percent: 30 });

    worker = await createWorker('eng', 1, {
      logger: (m) => {
        if (m.status === 'recognizing text') {
          const ocrProgress = Math.round(35 + m.progress * 55);
          onProgress({ 
            stage: `Reading text from photo (${Math.round(m.progress * 100)}%)...`, 
            percent: ocrProgress 
          });
        }
      }
    });

    onProgress({ stage: 'Extracting words and characters...', percent: 90 });
    const ret = await worker.recognize(processedImageData);
    
    await worker.terminate();
    worker = null;

    const rawText = ret.data.text || '';
    const confidence = ret.data.confidence || 0;

    const cleanedText = cleanRawText(rawText);
    const sentences = splitIntoSentences(cleanedText);

    if (sentences.length === 0 || cleanedText.length < 10) {
      throw new Error("LOW_CONFIDENCE_OCR");
    }

    onProgress({ stage: 'Finished reading photo!', percent: 100 });

    const fileName = imageFile.name || 'Photo Scan';

    return {
      title: fileName,
      totalPages: 1,
      sentences: sentences,
      rawText: cleanedText,
      confidence: Math.round(confidence),
      sourceType: 'image'
    };
  } catch (error) {
    if (worker) {
      try { await worker.terminate(); } catch (e) {}
    }
    console.error("OCR Extraction error:", error);
    if (error.message === "LOW_CONFIDENCE_OCR") {
      throw new Error("Could not detect clear text in this photo. Please ensure good lighting and snap directly over the page.");
    }
    throw new Error(error.message || "Failed to process photo OCR.");
  }
}
