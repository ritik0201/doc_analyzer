import * as mammoth from 'mammoth';
import * as pdfjsLib from 'pdfjs-dist';

// Configure pdfjs worker locally via Vite asset import
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

/**
 * Format bytes to readable size
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Extract text from PDF file
 */
const extractTextFromPDF = async (file) => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let fullText = '';
    const pageCount = pdf.numPages;

    for (let i = 1; i <= pageCount; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map(item => item.str).join(' ');
      fullText += `--- Page ${i} ---\n` + pageText + '\n\n';
    }

    return {
      textContent: fullText.trim(),
      pageCount
    };
  } catch (err) {
    console.warn('PDF text extraction warning, falling back to document base64:', err);
    return {
      textContent: `[PDF Document: ${file.name}. Raw binary content passed to Gemini Multimodal engine for analysis.]`,
      pageCount: null
    };
  }
};

/**
 * Extract text from DOCX file using Mammoth
 */
const extractTextFromDocx = async (file) => {
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });
  return {
    textContent: result.value || '',
    pageCount: null
  };
};

/**
 * Extract text from plain text formats (.txt, .md, .csv, .json, .log)
 */
const extractTextFromTxt = async (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      resolve({
        textContent: e.target.result || '',
        pageCount: null
      });
    };
    reader.onerror = (err) => reject(err);
    reader.readAsText(file);
  });
};

/**
 * Convert file to Base64 string
 */
const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64String = reader.result.split(',')[1];
      resolve(base64String);
    };
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
};

/**
 * Main parser entry point
 */
export const parseDocument = async (file) => {
  const fileName = file.name;
  const fileSize = file.size;
  const fileExt = fileName.split('.').pop().toLowerCase();
  
  let textContent = '';
  let pageCount = null;
  let mimeType = file.type || 'text/plain';

  try {
    if (fileExt === 'pdf') {
      mimeType = 'application/pdf';
      const pdfResult = await extractTextFromPDF(file);
      textContent = pdfResult.textContent;
      pageCount = pdfResult.pageCount;
    } else if (fileExt === 'docx' || fileExt === 'doc') {
      mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      const docxResult = await extractTextFromDocx(file);
      textContent = docxResult.textContent;
    } else if (['txt', 'md', 'csv', 'json', 'log', 'rtf'].includes(fileExt)) {
      mimeType = 'text/plain';
      const txtResult = await extractTextFromTxt(file);
      textContent = txtResult.textContent;
    } else {
      // Fallback text reader
      const txtResult = await extractTextFromTxt(file);
      textContent = txtResult.textContent;
    }

    const base64Content = await fileToBase64(file);
    const wordCount = textContent.trim() ? textContent.trim().split(/\s+/).length : 0;
    const charCount = textContent.length;

    return {
      id: Date.now() + '-' + Math.random().toString(36).substring(2, 9),
      fileName,
      fileType: fileExt.toUpperCase(),
      fileSize: formatFileSize(fileSize),
      rawSizeBytes: fileSize,
      textContent,
      base64Content,
      mimeType,
      pageCount,
      wordCount,
      charCount,
      uploadedAt: new Date().toLocaleTimeString()
    };
  } catch (error) {
    console.error("Error parsing document:", error);
    throw new Error(`Failed to parse ${fileName}: ${error.message}`);
  }
};
