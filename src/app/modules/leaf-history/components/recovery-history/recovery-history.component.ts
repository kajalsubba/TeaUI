import { formatDate } from '@angular/common';
import { Component, HostListener, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatOptionSelectionChange } from '@angular/material/core';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { _MatTableDataSource } from '@angular/material/table';
import { ToastrService } from 'ngx-toastr';
import { Subject, Subscription, takeUntil } from 'rxjs';
import { HelperService } from 'src/app/core/services/helper.service';
import { IGetTeaClient } from 'src/app/modules/collection/interfaces/istg';
import { AutoCompleteService } from 'src/app/modules/collection/services/auto-complete.service';
import { IGetCategory } from 'src/app/modules/masters/interfaces/ICategory';
import { CategoryService } from 'src/app/modules/masters/services/category.service';
import { RecoveryFilterRequest } from 'src/app/modules/reports/interfaces/irecovery';
import { RecoveryService } from 'src/app/modules/reports/services/recovery.service';
import { ExcelExportService } from 'src/app/shared/services/excel-export.service';

@Component({
  selector: 'app-recovery-history',
  templateUrl: './recovery-history.component.html',
  styleUrls: ['./recovery-history.component.scss']
})
export class RecoveryHistoryComponent implements OnInit {
  today: Date = new Date();
  displayedColumns: string[] = [
    'RecoveryId',
    'RecoveryDate',
    'ClientName',
    'CategoryName',
    'RecoveryType',
    'FieldBalance',
    'RecoveryAmount',
    'CurrentFieldBalance',
    'Narration'

  ];

  dataSource = new _MatTableDataSource<any>();
  filteredData: any[] = [];
  columns: { columnDef: string; header: string }[] = [
    { columnDef: 'RecoveryId', header: 'Recovery Id' },
    { columnDef: 'RecoveryDate', header: 'Recovery Date' },
    { columnDef: 'ClientName', header: 'Client' },
    { columnDef: 'CategoryName', header: 'Category' },
    { columnDef: 'RecoveryType', header: 'RecoveryType' },
    // { columnDef: 'FieldBalance', header: 'Field Balance' },
    // { columnDef: 'RecoveryAmount', header: 'Amount' },
    { columnDef: 'Narration', header: 'Narration' },
  ];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  private subscriptions: Subscription[] = [];
  private destroy$ = new Subject<void>();
  loginDetails: any;
  RecoveryForm!: FormGroup;
  minToDate!: any;
  ClientNames: any[] = [];
  selectedRowIndex: number = -1;
  clientList: any[] = [];
  categoryList: any[] = [];

  ReportTypeList: string[] = ['Season Advance', 'Field Balance']

  constructor(
    private dialog: MatDialog,
    private toastr: ToastrService,
    private helper: HelperService,
    private fb: FormBuilder,
    private excelService: ExcelExportService,
    private autocompleteService: AutoCompleteService,
    private categoryService: CategoryService,
    private recoveryService: RecoveryService,
  ) { }

  async ngOnInit() {
    this.loginDetails = this.helper.getItem('loginDetails');
    this.RecoveryForm = this.fb.group({
      fromDate: [new Date(), Validators.required],
      toDate: [new Date(), Validators.required],
      ClientId: [0],
      ClientName: [''],
      CategoryId: ['', Validators.required],
      CategoryName: [''],
      ReportType: ['', Validators.required],
    });

    await this.getCategoryList();
    await this.loadClientNames();

  }

  GetRecoveryData() {
    let bodyData: RecoveryFilterRequest = {
      FromDate: formatDate(this.RecoveryForm.value.fromDate, 'yyyy-MM-dd', 'en-US'),
      ToDate: formatDate(this.RecoveryForm.value.toDate, 'yyyy-MM-dd', 'en-US'),
      TenantId: this.loginDetails.TenantId,
      CategoryId: this.RecoveryForm.value.CategoryId ?? '',
      ClientId: this.RecoveryForm.value.ClientId ?? 0,
      RecovertType: this.RecoveryForm.value.ReportType ?? '',
      CreatedBy: this.loginDetails.UserId,

    };

    // console.log(bodyData, 'bodyData');
    // return

    const categoryListService = this.recoveryService
      .GetRecovery(bodyData)
      .subscribe((res: any) => {

        this.dataSource.data = res.RecoveryDetails;
      });
    this.subscriptions.push(categoryListService);
  }


  async selectCategory(event: MatOptionSelectionChange, category: any) {
    if (event.source.selected) {
      this.RecoveryForm.controls['ClientId'].reset();
      this.RecoveryForm.controls['ClientName'].reset();
      this.RecoveryForm.controls['CategoryName'].setValue(category?.CategoryName);

      if (!category) {
        this.ClientNames = this.clientList;
      } else {
        const dataList = this.clientList.filter((x: any) =>
          x.CategoryName.toLowerCase() === this.RecoveryForm.value.CategoryName.toLowerCase() ||
          x.CategoryName.toLowerCase() === 'both'
        );
        this.ClientNames = dataList;
      }
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

      this.categoryList = res.CategoryDetails.filter((x: any) => x.CategoryName != 'Both');


    } catch (error) {
      console.error('Error:', error);
      this.toastr.error('Something went wrong.', 'ERROR');
    }
  }
  displayWithFn(value: string): string {
    return value || '';
  }

  async loadClientNames() {
    try {
      const bodyData: IGetTeaClient = {
        TenantId: this.loginDetails.TenantId,
        Category: ''

      };

      const res: any = await this.autocompleteService.GetClientNames(bodyData)
        .pipe(takeUntil(this.destroy$))
        .toPromise();

      this.clientList = res.ClientDetails;


    } catch (error) {
      console.error('Error:', error);
      this.toastr.error('Something went wrong.', 'ERROR');
    }
  }
  getTotal(columnName: string): number {
    return this.dataSource.filteredData.reduce(
      (acc, curr) => acc + curr[columnName],
      0
    );
  }



  filterClientNames(value: string): any[] {

    const filterValue = value.toLowerCase();
    return this.ClientNames.filter((x: any) => x?.ClientName?.toLowerCase()?.includes(filterValue));
  }
  ngAfterViewInit() {

    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }
  selectClient(client: any) {
    if (client == '') {
      this.RecoveryForm.controls['ClientId'].reset();
    }

    this.RecoveryForm.controls['ClientId'].setValue(client?.ClientId);
  }

  search() {
    if (this.RecoveryForm.invalid) {
      this.RecoveryForm.markAllAsTouched();
      return;
    }
    this.GetRecoveryData();


  }
  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }
  selectRow(row: any, index: number) {
    this.selectedRowIndex = index; // Set the selected row index
  }
  fromDateChange(event: MatDatepickerInputEvent<Date>): void {
    //  this.RecoveryForm.controls['toDate'].setValue(null);
    this.minToDate = event.value;
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
  editItem(e: any) {

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

        this.excelService.exportToExcel('material-table', 'Payment History');
      } else {
        console.error("Table element not found or not an HTML table.");
      }
    } else {
      this.toastr.warning("NO DATA TO EXPORT", "WARNING");
    }
  }

}
