import { Injectable } from '@angular/core';
import * as XLSX from 'xlsx';

@Injectable({
  providedIn: 'root'
})
export class ExcelExportService {

  constructor() { }

  exportToExcel(tableId: string, fileName: string): void {


    const tableElement = document.getElementById(tableId);
    if (!tableElement) {
      console.error(`Table with ID ${tableId} not found.`);
      return;
    }

    // Convert the table to a worksheet with raw option to prevent automatic type detection
    const ws: XLSX.WorkSheet = XLSX.utils.table_to_sheet(tableElement, { raw: true });

    // Iterate through each cell in the worksheet
    Object.keys(ws).forEach((cellAddress) => {
      const cell = ws[cellAddress];
      if (cell && cell.v) {
        // Check if the cell value is numeric
        if (!isNaN(cell.v)) {
          // Convert numeric value to number format
          cell.v = Number(cell.v);
          cell.t = 'n'; // Set cell type to number
        } else {
          // Convert all other cell values to strings
          cell.v = String(cell.v);
          cell.t = 's'; // Set cell type to string
        }
      }
    });

    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    XLSX.writeFile(wb, fileName + '.xlsx');
  }
}
