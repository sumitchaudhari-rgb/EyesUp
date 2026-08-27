import * as pdfjsLib from 'pdfjs-dist';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import { cleanRawText, splitIntoSentences } from './textCleaner';

// Configure bundled local PDF.js worker (100% offline & local)
if (typeof window !== 'undefined') {
  try {
    pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;
  } catch (e) {
    console.warn("Could not set local PDF worker URL, using fallback:", e);
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.js`;
  }
}

/**
 * Extracts text and sentences from a PDF file using PDF.js
 */
export async function extractTextFromPDF(file, onProgress = () => {}) {
  try {
    onProgress({ stage: 'Loading PDF Document...', percent: 10 });
    
    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({ 
      data: arrayBuffer,
      useWorkerFetch: true,
      isEvalSupported: false,
      useSystemFonts: true
    });
    
    const pdfDoc = await loadingTask.promise;
    
    const totalPages = pdfDoc.numPages;
    let fullRawText = '';
    const pageTexts = [];

    for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
      const pagePercent = Math.round(15 + (pageNum / totalPages) * 75);
      onProgress({ 
        stage: `Extracting page ${pageNum} of ${totalPages}...`, 
        percent: pagePercent,
        current: pageNum,
        total: totalPages
      });

      const page = await pdfDoc.getPage(pageNum);
      const textContent = await page.getTextContent();
      
      let lastY;
      let pageString = '';

      for (const item of textContent.items) {
        if ('str' in item) {
          if (lastY !== undefined && Math.abs(item.transform[5] - lastY) > 5) {
            pageString += '\n' + item.str;
          } else {
            pageString += (pageString.endsWith(' ') || item.str.startsWith(' ') ? '' : ' ') + item.str;
          }
          lastY = item.transform[5];
        }
      }

      pageTexts.push(pageString);
      fullRawText += pageString + ' ';
    }

    onProgress({ stage: 'Structuring and segmenting sentences...', percent: 95 });

    const cleanedText = cleanRawText(fullRawText);
    const sentences = splitIntoSentences(cleanedText);

    if (sentences.length === 0 || cleanedText.length < 20) {
      throw new Error("SCANNED_PDF_DETECTED");
    }

    onProgress({ stage: 'Extraction Complete!', percent: 100 });

    return {
      title: file.name,
      totalPages: totalPages,
      sentences: sentences,
      rawText: cleanedText,
      sourceType: 'pdf'
    };
  } catch (error) {
    if (error.message === "SCANNED_PDF_DETECTED") {
      throw error;
    }
    console.error("PDF Extraction error:", error);
    throw new Error(`Failed to parse PDF: ${error.message || 'Corrupted or unsupported format'}`);
  }
}

/**
 * Renders a specific page of a PDF to an HTML canvas
 */
export async function renderPdfPageToCanvas(pdfData, pageNum = 1, scale = 1.5) {
  const loadingTask = pdfjsLib.getDocument({ data: pdfData });
  const pdfDoc = await loadingTask.promise;
  const page = await pdfDoc.getPage(pageNum);
  
  const viewport = page.getViewport({ scale });
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  canvas.height = viewport.height;
  canvas.width = viewport.width;

  await page.render({
    canvasContext: context,
    viewport: viewport
  }).promise;

  return canvas;
}
