import { Injectable } from '@angular/core';
import * as XLSX from 'xlsx';

@Injectable({
  providedIn: 'root'
})
export class ExcelExportService {

  constructor() { }

  exportToExcel(tableId: string, fileName: string): void {
    //   const ws: XLSX.WorkSheet = XLSX.utils.table_to_sheet(
    //     document.getElementById(tableId)
    //   );
    //   const wb: XLSX.WorkBook = XLSX.utils.book_new();
    //   XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    //   XLSX.writeFile(wb, fileName + '.xlsx');

    const tableElement = document.getElementById(tableId);
    if (!tableElement) {
      console.error(`Table with ID ${tableId} not found.`);
      return;
    }

    // Convert the table to a worksheet with raw option to prevent automatic type detection
    const ws: XLSX.WorkSheet = XLSX.utils.table_to_sheet(tableElement, { raw: true });

    // Explicitly convert date columns to strings (if necessary)
    // Adjust this part if you need specific handling for certain columns
    // Here, I'm assuming all cells should be treated as strings
    Object.keys(ws).forEach((cellAddress) => {
      const cell = ws[cellAddress];
      if (cell && cell.v) {
        // Convert all cell values to strings
        cell.v = String(cell.v);
        cell.t = 's'; // Set the cell type to string
      }
    });

    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    XLSX.writeFile(wb, fileName + '.xlsx');
  }
}
