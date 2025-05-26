import { Component, HostListener, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Subscription } from 'rxjs';
import { ISeasonAdvance } from '../../interfaces/ireports';
import { HelperService } from 'src/app/core/services/helper.service';
import { Subject } from '@microsoft/signalr';
import { ToastrService } from 'ngx-toastr';
import { ExcelExportService } from 'src/app/shared/services/excel-export.service';
import { ReportsServiceService } from '../../services/reports-service.service';

@Component({
  selector: 'app-field-balance-report',
  templateUrl: './field-balance-report.component.html',
  styleUrls: ['./field-balance-report.component.scss']
})
export class FieldBalanceReportComponent {

  displayedColumns: string[] = [
    'clientid',
    'ClientName',
    'Amount'

  ];

  dataSource = new MatTableDataSource<any>();
  filteredData: any[] = [];
  columns: { columnDef: string; header: string }[] = [

    { columnDef: 'clientid', header: 'Client Id' },
    { columnDef: 'ClientName', header: 'Client Name' },
  ];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  private subscriptions: Subscription[] = [];
  loginDetails: any;
  FieldBalanceForm!: FormGroup;
  ClientNames: any[] = [];
  minToDate!: any;
  vehicleNumbers: any[] = [];
  selectedRowIndex: number = -1;
  AverageRate: number = 0;
  TotalVehicleCount: number = 0;
  private destroy$ = new Subject<void>();
  CategotyList: string[] = ['STG', 'Supplier']
  ReportTypeList: string[] = ['Season Advance', 'Field Balance']

  constructor(
    private helper: HelperService,
    private toastr: ToastrService,
    private fb: FormBuilder,
    private excelService: ExcelExportService,
    private reportService: ReportsServiceService

  ) { }

  async ngOnInit() {
    this.loginDetails = this.helper.getItem('loginDetails');
    this.FieldBalanceForm = this.fb.group({
      ReportType: ['', Validators.required],
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
    if (this.FieldBalanceForm.invalid) {
      this.FieldBalanceForm.markAllAsTouched();
      return;
    }
    if (this.FieldBalanceForm.value.ReportType == 'Season Advance') {
      this.GetSeasonAdvance();
    }
    else if (this.FieldBalanceForm.value.ReportType == 'Field Balance') {
      this.GetFieldBalance()
    }



  }
  GetSeasonAdvance() {
    const bodyData: ISeasonAdvance = {
      TenantId: this.loginDetails.TenantId,
      Category: this.FieldBalanceForm.value.Category

    }
    const categoryListService = this.reportService.GetSeasonAdvanceReport(bodyData).subscribe((res: any) => {

      this.dataSource.data = res.GetAdvance;


    });
    this.subscriptions.push(categoryListService);
  }

  GetFieldBalance() {
    const bodyData: ISeasonAdvance = {
      TenantId: this.loginDetails.TenantId,
      Category: this.FieldBalanceForm.value.Category

    }
    const categoryListService = this.reportService.GetFieldBalanceReport(bodyData).subscribe((res: any) => {

      this.dataSource.data = res.FieldBalance;


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
    return this.dataSource.filteredData.reduce(
      (acc, curr) => acc + curr[columnName],
      0
    );
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

        this.excelService.exportToExcel('material-table', 'Field Balance');
      } else {
        console.error("Table element not found or not an HTML table.");
      }
    } else {
      this.toastr.warning("NO DATA TO EXPORT", "WARNING");
    }
  }

}

