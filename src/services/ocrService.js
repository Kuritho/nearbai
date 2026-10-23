import Tesseract from 'tesseract.js';

export async function runOCR(file) {
  const { data } = await Tesseract.recognize(file, 'eng', {
    logger: (m) => console.log(m.status, Math.round(m.progress * 100) + '%'),
  });
  return data.text;
}