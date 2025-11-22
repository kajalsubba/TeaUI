import { Component, HostListener, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ToastrService } from 'ngx-toastr';
import { Subject, Subscription, takeUntil } from 'rxjs';
import { HelperService } from 'src/app/core/services/helper.service';
import { ExcelExportService } from 'src/app/shared/services/excel-export.service';
import { ReportsServiceService } from '../../services/reports-service.service';
import { IAnalysisReport, IMonthWiseCollection } from '../../interfaces/ireports';
import { CategoryService } from 'src/app/modules/masters/services/category.service';
import { IGetCategory } from 'src/app/modules/masters/interfaces/ICategory';
import * as ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

@Component({
  selector: 'app-analysis-report',
  templateUrl: './analysis-report.component.html',
  styleUrls: ['./analysis-report.component.scss']
})
export class AnalysisReportComponent {
  displayedColumns: string[] = [
  ];
  dataSource = new MatTableDataSource<any>();
  filteredData: any[] = [];
  columns: { columnDef: string; header: string }[] = [];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  private subscriptions: Subscription[] = [];
  loginDetails: any;
  AnalysisForm!: FormGroup;
  ClientNames: any[] = [];
  minToDate!: any;
  vehicleNumbers: any[] = [];
  financialyearList: any = [];
  selectedRowIndex: number = -1;
  AverageRate: number = 0;
  TotalVehicleCount: number = 0;
  CategotyList: string[] = ['Supplier']
  private destroy$ = new Subject<void>();
  constructor(
    private helper: HelperService,
    private toastr: ToastrService,
    private fb: FormBuilder,
    private excelService: ExcelExportService,
    private reportService: ReportsServiceService,
    private categoryService: CategoryService

  ) { }

  async ngOnInit() {
    this.loginDetails = this.helper.getItem('loginDetails');
    this.AnalysisForm = this.fb.group({
      FinancialYearId: ['', Validators.required],
      Category: ['', Validators.required],

    });

    await this.getFinancialYear();
    this.columns = this.generateSupplierColumns(this.financialyearList[0].FinancialYear);

  }

  generateSupplierColumns(financialYear: number) {
    const prevYear = financialYear - 1;
    const currYear = financialYear;
    const columns = [
      { columnDef: 'ClientName', header: 'Client Name' },
      { columnDef: 'VehicleCount', header: 'Vehicle Count' },
      { columnDef: 'CollectionDays', header: 'Collection Days' },
      { columnDef: 'ChallanWeightPrevYear', header: `Challan Weight (${prevYear})` },
      { columnDef: 'ChallanWeightCurrYear', header: `Challan Weight (${currYear})` },
      { columnDef: 'TargetWeight', header: `Commitment Weight (${currYear})` },
      { columnDef: 'TargetAchievementPercent', header: 'Target Achievement (%)' },
      { columnDef: 'RegularityScore', header: 'Regularity Score' },
      { columnDef: 'FinalScore', header: 'Final Score' },
      { columnDef: 'PerformanceStatus', header: 'Performance Status' }
    ];

    this.displayedColumns = columns.map(col => col.columnDef);

    return columns;
  }

  async getFinancialYear() {
    try {
      const categoryBody: IGetCategory = {
        TenantId: this.loginDetails.TenantId
      };

      const res: any = await this.categoryService.getFinancialYear(categoryBody)
        .pipe(takeUntil(this.destroy$))
        .toPromise();

      this.financialyearList = res.FinancialYear;
      console.log(this.financialyearList[0].FinancialYear, 'FinancialYear');


    } catch (error) {
      console.error('Error:', error);
      this.toastr.error('Something went wrong.', 'ERROR');
    }
  }
  ngAfterViewInit() {


    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  deleteItem(element: any) { }



  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }



  search() {
    if (this.AnalysisForm.invalid) {
      this.AnalysisForm.markAllAsTouched();
      return;
    }

    this.GetAnalysisData();

  }


  filterClientNames(value: string): any[] {

    const filterValue = value.toLowerCase();
    return this.ClientNames.filter((x: any) => x?.ClientName?.toLowerCase()?.includes(filterValue));
  }

  GetAnalysisData() {


    const bodyData: IAnalysisReport = {
      TenantId: this.loginDetails.TenantId,
      FinancialYearId: this.AnalysisForm.value.FinancialYearId

    }
    const categoryListService = this.reportService.GetAnalysisReport(bodyData).subscribe((res: any) => {

      this.dataSource.data = res.AnalysisReport;


    });
    this.subscriptions.push(categoryListService);
  }


  handleChange(event: any): void {
    // Your code to handle the change event
    if (event.target.checked) {
      // Checkbox is checked, do something
      console.log('Checkbox is checked');
    } else {
      // Checkbox is unchecked, do something else
      console.log('Checkbox is unchecked');
    }
  }

  getTotal(columnName: string): number {
    return this.dataSource.filteredData.filter((x: any) => x.Status != 'Rejected').reduce((acc, curr) => acc + curr[columnName], 0);

  }


  // Autocomplete function


  displayWithFn(value: string): string {
    return value || '';
  }



  selectRow(row: any, index: number) {
    this.selectedRowIndex = index; // Set the selected row index
  }

  @HostListener('document:keydown', ['$event'])
  handleKeyboardNavigation(event: KeyboardEvent) {
    if (event.key === 'ArrowDown') {
      if (this.selectedRowIndex < this.dataSource.data.length - 1) {
        this.selectedRowIndex++;
      }
    } else if (event.key === 'ArrowUp') {
      if (this.selectedRowIndex > 0) {
        this.selectedRowIndex--;
      }
    }
  }

  // exportToExcel() {
  //   if (this.dataSource.data.length > 0) {
  //     // Get the table element
  //     const table = document.getElementById('material-table');

  //     if (table instanceof HTMLTableElement) { // Check if table is a HTMLTableElement
  //       // Remove unwanted columns
  //       const columnsToRemove = ['Id', 'Actions', 'Created By']; // Specify columns to remove
  //       columnsToRemove.forEach(col => {
  //         const columnIndex = Array.from(table.rows[0].cells).findIndex(cell => cell.textContent && cell.textContent.trim() === col);
  //         if (columnIndex !== -1) {
  //           Array.from(table.rows).forEach(row => {
  //             if (row.cells[columnIndex]) {
  //               row.deleteCell(columnIndex);
  //             }
  //           });
  //         }
  //       });

  //       this.excelService.exportToExcel('material-table', 'Analysis');
  //     } else {
  //       console.error("Table element not found or not an HTML table.");
  //     }
  //   } else {
  //     this.toastr.warning("NO DATA TO EXPORT", "WARNING");
  //   }
  // }




  exportToExcel() {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('STG History');

    // Build dynamic headers
    const prevYear = this.financialyearList[0].FinancialYear - 1;
    const currYear = this.financialyearList[0].FinancialYear;

    const headers = [
      'Client Name',
      'Vehicle Count',
      'Collection Days',
      `Challan Weight (${prevYear})`,
      `Challan Weight (${currYear})`,
      `Commitment Weight (${currYear})`,
      'Target Achievement (%)',
      'Regularity Score',
      'Final Score',
      'Performance Status'
    ];

    // Add header row with bold font
    const headerRow = worksheet.addRow(headers);
    headerRow.eachCell(cell => {
      cell.font = { bold: true };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
    });

    // Add data rows
    this.dataSource.filteredData.forEach(row => {
      const dataRow = [
        row.ClientName,
        row.VehicleCount,
        row.CollectionDays,
        row.ChallanWeightPrevYear,
        row.ChallanWeightCurrYear,
        row.TargetWeight,
        `${row.TargetAchievementPercent}%`,
        row.RegularityScore,
        `${row.FinalScore}%`,
        row.PerformanceStatus
      ];

      const addedRow = worksheet.addRow(dataRow);

      // Set Target Achievement (%) as text
      const targetAchievementCell = addedRow.getCell(7);
      targetAchievementCell.numFmt = '@';

      // Set Final Score as text
      const finalScoreCell = addedRow.getCell(9);
      finalScoreCell.numFmt = '@';

      // Apply font color to Performance Status cell
      const status = row.PerformanceStatus?.toLowerCase();
      let fontColor = '000000'; // Default: Black

      switch (status) {
        case 'excellent':
          fontColor = '008000'; // Green
          break;
        case 'fair':
          fontColor = '0000FF'; // Blue
          break;
        case 'average':
          fontColor = 'FFA500'; // Orange
          break;
        case 'poor':
          fontColor = 'FF0000'; // Red
          break;
      }

      const statusCell = addedRow.getCell(10); // "Performance Status" is 10th column
      statusCell.font = {
        color: { argb: fontColor },
        bold: true
      };
    });

    // Adjust column widths automatically
    worksheet.columns.forEach(column => {
      const headerText = column.header ? column.header.toString() : '';
      column.width = Math.max(15, headerText.length + 2);
    });

    // Export the file
    workbook.xlsx.writeBuffer().then((buffer: ArrayBuffer) => {
      const blob = new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });
      saveAs(blob, `Analysis_${new Date().toISOString().slice(0, 10)}.xlsx`);
    });

  }
}


