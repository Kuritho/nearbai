import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export async function downloadReceipt(element, fileName = 'receipt.pdf') {
  const canvas = await html2canvas(element, { scale: 2, backgroundColor: '#fff' });
  const imgData = canvas.toDataURL('image/png');
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
  pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
  pdf.save(fileName);
}