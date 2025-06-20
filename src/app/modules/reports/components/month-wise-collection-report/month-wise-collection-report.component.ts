import { registerLocaleData } from '@angular/common';
import { Component, HostListener, ViewChild } from '@angular/core';
import enIN from '@angular/common/locales/en-IN';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { Subject, Subscription } from 'rxjs';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HelperService } from 'src/app/core/services/helper.service';
import { ToastrService } from 'ngx-toastr';
import { ExcelExportService } from 'src/app/shared/services/excel-export.service';
import { IMonthWiseCollection } from '../../interfaces/ireports';
import { ReportsServiceService } from '../../services/reports-service.service';


registerLocaleData(enIN);
@Component({
  selector: 'app-month-wise-collection-report',
  templateUrl: './month-wise-collection-report.component.html',
  styleUrls: ['./month-wise-collection-report.component.scss']
})

export class MonthWiseCollectionReportComponent {
  displayedColumns: string[] = [
    'ClientName',
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
    'Total'

  ];

  dataSource = new MatTableDataSource<any>();
  filteredData: any[] = [];
  columns: { columnDef: string; header: string }[] = [

    { columnDef: 'ClientName', header: 'Client Name' },

  ];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  private subscriptions: Subscription[] = [];
  loginDetails: any;
  MonthWiseForm!: FormGroup;
  ClientNames: any[] = [];
  minToDate!: any;
  vehicleNumbers: any[] = [];
  selectedRowIndex: number = -1;
  AverageRate: number = 0;
  TotalVehicleCount: number = 0;
  private destroy$ = new Subject<void>();
  CategotyList: string[] = ['STG', 'Supplier']
  YearList: string[] = ['2024', '2025', '2026', '2027', '2028', '2029', '2030', '2031', '2032', '2033', '2034', '2035']

  constructor(
    private helper: HelperService,
    private toastr: ToastrService,
    private fb: FormBuilder,
    private excelService: ExcelExportService,
    private reportService: ReportsServiceService

  ) { }

  async ngOnInit() {
    this.loginDetails = this.helper.getItem('loginDetails');
    this.MonthWiseForm = this.fb.group({
      Year: ['', Validators.required],
      Category: ['', Validators.required],

    });

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
    if (this.MonthWiseForm.invalid) {
      this.MonthWiseForm.markAllAsTouched();
      return;
    }

    this.GetMonthWiseData();

  }


  filterClientNames(value: string): any[] {

    const filterValue = value.toLowerCase();
    return this.ClientNames.filter((x: any) => x?.ClientName?.toLowerCase()?.includes(filterValue));
  }

  GetMonthWiseData() {


    const bodyData: IMonthWiseCollection = {
      TenantId: this.loginDetails.TenantId,
      Year: this.MonthWiseForm.value.Year,
      Category: this.MonthWiseForm.value.Category

    }
    const categoryListService = this.reportService.GetMonthWiseCollectionReport(bodyData).subscribe((res: any) => {
   
      this.dataSource.data = res.MonthWiseReport;

      
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

  exportToExcel() {
    if (this.dataSource.data.length > 0) {
      // Get the table element
      const table = document.getElementById('material-table');

      if (table instanceof HTMLTableElement) { // Check if table is a HTMLTableElement
        // Remove unwanted columns
        const columnsToRemove = ['Id', 'Actions', 'Created By']; // Specify columns to remove
        columnsToRemove.forEach(col => {
          const columnIndex = Array.from(table.rows[0].cells).findIndex(cell => cell.textContent && cell.textContent.trim() === col);
          if (columnIndex !== -1) {
            Array.from(table.rows).forEach(row => {
              if (row.cells[columnIndex]) {
                row.deleteCell(columnIndex);
              }
            });
          }
        });

        this.excelService.exportToExcel('material-table', 'STG History');
      } else {
        console.error("Table element not found or not an HTML table.");
      }
    } else {
      this.toastr.warning("NO DATA TO EXPORT", "WARNING");
    }
  }

}

