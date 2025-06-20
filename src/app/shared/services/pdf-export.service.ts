import { Injectable } from '@angular/core';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

@Injectable({
  providedIn: 'root'
})
export class PdfExportService {

  constructor() { }

  ggeneratePDF(data: any[], fileName: string) {
    const doc = new jsPDF('l', 'mm', 'a3');
    const headers = Object.keys(data[0]);
    const tableData = [];

    // Format data for autotable
    for (const item of data) {
      const row = [];
      for (const key of headers) {
        row.push(item[key].toString()); // Convert values to string
      }
      tableData.push(row);
    }

    // Use autoTable function from jspdf-autotable
    autoTable(doc, {
      head: [headers],
      body: tableData,
      styles: {
        fontSize: 8 // Decrease font size to 8 points
      }
    });

    doc.save(`${fileName}.pdf`);
  }
}
