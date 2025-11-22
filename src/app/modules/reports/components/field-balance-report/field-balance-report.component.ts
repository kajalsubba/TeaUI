import { Component, HostListener, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Subject, Subscription, takeUntil } from 'rxjs';
import { ISeasonAdvance } from '../../interfaces/ireports';
import { HelperService } from 'src/app/core/services/helper.service';

import { ToastrService } from 'ngx-toastr';
import { ExcelExportService } from 'src/app/shared/services/excel-export.service';
import { ReportsServiceService } from '../../services/reports-service.service';
import { RecoveryComponent } from '../../modal/recovery/recovery.component';
import { MatDialog } from '@angular/material/dialog';
import { CategoryService } from 'src/app/modules/masters/services/category.service';
import { IGetCategory } from 'src/app/modules/masters/interfaces/ICategory';
import { IPrint } from 'src/app/modules/leaf-history/interfaces/istgbill-history';
import { SuppilerHistoryService } from 'src/app/modules/leaf-history/services/suppiler-history.service';
import { StgBillService } from 'src/app/modules/leaf-history/services/stg-bill.service';

@Component({
  selector: 'app-field-balance-report',
  templateUrl: './field-balance-report.component.html',
  styleUrls: ['./field-balance-report.component.scss']
})
export class FieldBalanceReportComponent {

  displayedColumns: string[] = [
    'ClientId',
    'ClientName',
    'Amount',
    'actions'

  ];
  dataSource = new MatTableDataSource<any>();
  filteredData: any[] = [];
  columns: { columnDef: string; header: string }[] = [

    { columnDef: 'ClientId', header: 'Client Id' },
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
  CategotyList: any[] = [];
  ReportTypeList: string[] = ['Season Advance', 'Field Balance']

  constructor(
    private dialog: MatDialog,
    private helper: HelperService,
    private toastr: ToastrService,
    private fb: FormBuilder,
    private excelService: ExcelExportService,
    private reportService: ReportsServiceService,
    private categoryService: CategoryService,
    private supplierbillService: SuppilerHistoryService,
    private stgbillService: StgBillService,

  ) { }

  async ngOnInit() {
    this.loginDetails = this.helper.getItem('loginDetails');
    this.FieldBalanceForm = this.fb.group({
      ReportType: ['', Validators.required],
      CategoryId: ['', Validators.required],
      CategoryName: [''],
    });
    this.getCategoryList();
  }


  onCategoryChange(categoryId: number): void {
    const selected = this.CategotyList.find(cat => cat.CategoryId === categoryId);
    if (selected) {
      this.FieldBalanceForm.patchValue({
        CategoryName: selected.CategoryName
      });
    } else {
      this.FieldBalanceForm.patchValue({
        CategoryName: ''
      });
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
    debugger
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
      Category: this.FieldBalanceForm.value.CategoryName

    }
    const categoryListService = this.reportService.GetSeasonAdvanceReport(bodyData).subscribe((res: any) => {

      this.dataSource.data = res.GetAdvance;


    });
    this.subscriptions.push(categoryListService);
  }

  GetFieldBalance() {
    const bodyData: ISeasonAdvance = {
      TenantId: this.loginDetails.TenantId,
      Category: this.FieldBalanceForm.value.CategoryName

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
  async getCategoryList() {
    try {
      const categoryBody: IGetCategory = {
        TenantId: this.loginDetails.TenantId
      };

      const res: any = await this.categoryService.getCategory(categoryBody)
        .pipe(takeUntil(this.destroy$))
        .toPromise();

      this.CategotyList = res.CategoryDetails.filter((x: any) => x.CategoryName != 'Both');


    } catch (error) {
      console.error('Error:', error);
      this.toastr.error('Something went wrong.', 'ERROR');
    }
  }


  lastBill(row: any): void {
    if (row.BillId == 0) {
      this.toastr.error("Bill is not found!", "Error");
      return;
    }
    const bodyData: IPrint = {
      TenantId: this.loginDetails.TenantId,
      BillNo: row.BillId
    };

    let printObservable;

    switch (row.Category) {
      case 'STG':
        printObservable = this.stgbillService.PrintBill(bodyData);
        break;
      case 'Supplier':
        printObservable = this.supplierbillService.PrintBill(bodyData);
        break;
      default:
        console.warn('Unknown category:', row.Category);
        return;
    }

    const subscription = printObservable.subscribe((response: Blob) => {
      const blobUrl = URL.createObjectURL(response);
      window.open(blobUrl, '_blank');
    });

    this.subscriptions.push(subscription);
  }


  // lastBill(row: any) {
  //   let bodyData: IPrint = {

  //     TenantId: this.loginDetails.TenantId,
  //     BillNo: row.BillId

  //   };
  //   if (row.Category == 'STG') {
  //     const categoryListService1 = this.stgbillService.PrintBill
  //       (bodyData)
  //       .subscribe((response: Blob) => {
  //         const blobUrl = URL.createObjectURL(response);

  //         // Open PDF in a new browser tab
  //         window.open(blobUrl, '_blank');
  //       });
  //     this.subscriptions.push(categoryListService1);

  //   }
  //   else if (row.Category == 'Supplier') {
  //     const categoryListService = this.supplierbillService
  //       .PrintBill(bodyData)
  //       .subscribe((response: Blob) => {
  //         const blobUrl = URL.createObjectURL(response);

  //         window.open(blobUrl, '_blank');
  //       });
  //     this.subscriptions.push(categoryListService);

  //   }
  // }

  recoveryItem(row: any) {
    console.log(row, 'row')
    const dialogRef = this.dialog.open(RecoveryComponent, {
      width: window.innerWidth <= 1024 ? '40%' : '30%',
      data: {
        title: 'Recovery Form',
        buttonName: 'Recover',
        value: row,
        categoryId: this.FieldBalanceForm.get('CategoryId')?.value
      },
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        this.search();

      }
    });
  }
}

