// Dynamic script loaders
const loadScript = (id, src) => {
  return new Promise((resolve, reject) => {
    if (document.getElementById(id)) {
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.id = id;
    script.src = src;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
    document.head.appendChild(script);
  });
};

const loadPdfJs = async () => {
  if (window.pdfjsLib) return window.pdfjsLib;

  // Load the main pdf.js script
  await loadScript(
    "pdfjs-lib-script",
    "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.min.js"
  );

  // Set the worker source path
  if (window.pdfjsLib) {
    window.pdfjsLib.GlobalWorkerOptions.workerSrc =
      "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js";
  } else {
    throw new Error("PDF.js library was loaded but is not available on window object.");
  }

  return window.pdfjsLib;
};

const loadMammoth = async () => {
  if (window.mammoth) return window.mammoth;

  await loadScript(
    "mammoth-script",
    "https://cdnjs.cloudflare.com/ajax/libs/mammoth/1.6.0/mammoth.browser.min.js"
  );

  if (!window.mammoth) {
    throw new Error("Mammoth library was loaded but is not available on window object.");
  }

  return window.mammoth;
};

/**
 * Extracts text content from a PDF file using pdf.js client-side
 * @param {File} file 
 * @returns {Promise<string>}
 */
const extractTextFromPdf = async (file) => {
  const pdfjs = await loadPdfJs();
  const arrayBuffer = await file.arrayBuffer();
  
  const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
  const pdf = await loadingTask.promise;
  
  let extractedText = "";
  
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items.map((item) => item.str).join(" ");
    extractedText += pageText + "\n";
  }
  
  if (!extractedText.trim()) {
    throw new Error(
      "The PDF appears to be empty or scanned (image-based). Only text-based PDFs are supported."
    );
  }
  
  return extractedText;
};

/**
 * Extracts text content from a DOCX file using mammoth.js client-side
 * @param {File} file 
 * @returns {Promise<string>}
 */
const extractTextFromDocx = async (file) => {
  const mammoth = await loadMammoth();
  const arrayBuffer = await file.arrayBuffer();
  
  const result = await mammoth.extractRawText({ arrayBuffer });
  const extractedText = result.value;
  
  if (!extractedText.trim()) {
    throw new Error("The DOCX file appears to be empty.");
  }
  
  return extractedText;
};

/**
 * High-level extraction function that detects file type and routes appropriately
 * @param {File} file 
 * @returns {Promise<string>}
 */
export const extractTextFromFile = async (file) => {
  if (!file) throw new Error("No file provided");

  const fileName = file.name.toLowerCase();
  
  if (fileName.endsWith(".pdf") || file.type === "application/pdf") {
    return await extractTextFromPdf(file);
  } else if (
    fileName.endsWith(".docx") || 
    file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    return await extractTextFromDocx(file);
  } else {
    throw new Error("Unsupported file type. Please upload a PDF or DOCX file.");
  }
};
