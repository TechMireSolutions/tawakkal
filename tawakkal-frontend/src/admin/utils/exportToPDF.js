import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatDate } from './formatters';

/**
 * Generic utility to export a table to PDF
 * 
 * @param {string} title - The title of the PDF document
 * @param {string} filename - The name of the downloaded file (without .pdf)
 * @param {Array<string>} headers - Array of column headers
 * @param {Array<Array<any>>} data - 2D Array of table rows
 */
export const exportToPDF = (title, filename, headers, data) => {
  const doc = new jsPDF();
  
  // Add title
  doc.setFontSize(18);
  doc.text(title, 14, 22);
  
  // Add generation date
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Generated on: ${formatDate(new Date())}`, 14, 30);
  
  // Add table
  autoTable(doc, {
    startY: 36,
    head: [headers],
    body: data,
    theme: 'grid',
    styles: {
      fontSize: 9,
      cellPadding: 3,
    },
    headStyles: {
      fillColor: [212, 175, 55], // Gold color matching the admin panel
      textColor: [255, 255, 255],
      fontStyle: 'bold',
    },
    alternateRowStyles: {
      fillColor: [250, 250, 248], // Ivory color
    },
  });
  
  // Save the PDF
  doc.save(`${filename}-${new Date().toISOString().split('T')[0]}.pdf`);
};
