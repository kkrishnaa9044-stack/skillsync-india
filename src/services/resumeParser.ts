import * as pdfjsLib from 'pdfjs-dist';
import mammoth from 'mammoth';

// Set worker path for pdfjs
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString();

export interface ParsedResume {
  text: string;
  fileName: string;
  fileSize: number;
  fileType: string;
}

export async function extractTextFromFile(file: File): Promise<string> {
  const ext = file.name.split('.').pop()?.toLowerCase();
  if (!ext) throw new Error('Unable to determine file type.');

  if (ext === 'txt') {
    return await file.text();
  }

  if (ext === 'pdf') {
    return await extractTextFromPdf(file);
  }

  if (ext === 'docx') {
    return await extractTextFromDocx(file);
  }

  if (ext === 'doc') {
    throw new Error('Legacy .doc files are not supported. Please convert to .docx or .pdf.');
  }

  throw new Error(`Unsupported file type: .${ext}. Please upload a PDF, DOCX, or TXT file.`);
}

async function extractTextFromPdf(file: File): Promise<string> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let fullText = '';

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const pageText = content.items
        .map((item: unknown) => {
          if (typeof item === 'object' && item !== null && 'str' in item) {
            return (item as { str: string }).str;
          }
          return '';
        })
        .join(' ');
      fullText += pageText + '\n';
    }

    if (fullText.trim().length < 10) {
      throw new Error('We couldn\'t extract enough text from this PDF. It may be a scanned image. Please upload a text-based PDF.');
    }

    return fullText;
  } catch (err) {
    if (err instanceof Error && err.message.includes('scanned')) throw err;
    throw new Error('Failed to read the PDF file. Please ensure it is a valid, text-based PDF.');
  }
}

async function extractTextFromDocx(file: File): Promise<string> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    if (!result.value || result.value.trim().length < 10) {
      throw new Error('We couldn\'t extract enough text from this DOCX file. Please ensure it contains selectable text.');
    }
    return result.value;
  } catch {
    throw new Error('Failed to read the DOCX file. Please ensure it is a valid Word document.');
  }
}

export function validateFile(file: File): string | null {
  const maxSize = 10 * 1024 * 1024; // 10 MB
  if (file.size > maxSize) {
    return 'File is too large. Maximum size is 10 MB.';
  }
  const ext = file.name.split('.').pop()?.toLowerCase();
  if (!ext || !['pdf', 'docx', 'txt'].includes(ext)) {
    return 'Unsupported file type. Please upload a PDF, DOCX, or TXT file.';
  }
  return null;
}
