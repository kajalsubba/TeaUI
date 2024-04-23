import { DatePipe, formatDate, registerLocaleData } from '@angular/common';
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
import { IGetseasonAdvance } from 'src/app/modules/accounts/interfaces/iseason-advance';
import { SeasonAdvanceService } from 'src/app/modules/accounts/services/season-advance.service';
import { IGetTeaClient } from 'src/app/modules/collection/interfaces/istg';
import { AutoCompleteService } from 'src/app/modules/collection/services/auto-complete.service';
import { IGetCategory } from 'src/app/modules/masters/interfaces/ICategory';
import { CategoryService } from 'src/app/modules/masters/services/category.service';
import enIN from '@angular/common/locales/en-IN';
registerLocaleData(enIN);
@Component({
  selector: 'app-season-advance-history',
  templateUrl: './season-advance-history.component.html',
  styleUrls: ['./season-advance-history.component.scss']
})
export class SeasonAdvanceHistoryComponent implements OnInit {

  displayedColumns: string[] = [
    'AdvancedDate',
    'PaySource',
    'ClientName',
    'Amount',
    'Remarks'
  ];

  dataSource = new _MatTableDataSource<any>();

  filteredData: any[] = [];
  columns: { columnDef: string; header: string }[] = [
    { columnDef: 'AdvancedDate', header: 'Date' },
    { columnDef: 'ClientName', header: 'Client Name' },
    { columnDef: 'PaySource', header: 'Category' },
    { columnDef: 'Remarks', header: 'Remarks' }

  ];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  private subscriptions: Subscription[] = [];
  private destroy$ = new Subject<void>();
  loginDetails: any;
  SeasonAdvanceForm!: FormGroup;
  minToDate!: any;
  ClientNames: any[] = [];
  clientList: any[] = [];
  selectedRowIndex: number = -1;
  categoryList: any[] = [];
  constructor(
    private dialog: MatDialog,
    private toastr: ToastrService,
    private helper: HelperService,
    private datePipe: DatePipe,
    private fb: FormBuilder,
    private autocompleteService: AutoCompleteService,
    private advanceService: SeasonAdvanceService,
    private categoryService: CategoryService
    // private stgService: StgService,
    //   private stgapproveService: StgApproveService,
    // private supplierApproveService: SupplierapproveService
  ) { }

  async ngOnInit() {
    this.loginDetails = this.helper.getItem('loginDetails');
    this.SeasonAdvanceForm = this.fb.group({
      fromDate: [new Date(), Validators.required],
      toDate: [new Date(), Validators.required],
      ClientId: [0],
      ClientName: [''],
      CategoryId: ['', Validators.required],
      CategoryName: ['']
    });

    await this.getCategoryList();
    await this.loadClientNames();
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
  async selectCategory(event: MatOptionSelectionChange, category: any) {

    if (event.source.selected) {
      this.SeasonAdvanceForm.controls['ClientId'].reset();
      this.SeasonAdvanceForm.controls['ClientName'].reset();
      this.SeasonAdvanceForm.controls['CategoryName'].setValue(category?.CategoryName);
      if (category == '') {
        this.ClientNames = this.clientList;
      }
      else {
        var dataList = this.clientList.filter((x: any) => x.CategoryName.toLowerCase() == this.SeasonAdvanceForm.value.CategoryName.toLowerCase() || x.CategoryName.toLowerCase() == 'Both'.toLowerCase())
        this.ClientNames = dataList;
      }

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
  GetSeasonAdvanceData(FromDate: any, ToDate: any) {
    const currentDate = new Date();
    let bodyData: IGetseasonAdvance = {
      FromDate:
        FromDate == null
          ? formatDate(currentDate, 'yyyy-MM-dd', 'en-US')
          : FromDate,
      ToDate:
        ToDate == null
          ? formatDate(currentDate, 'yyyy-MM-dd', 'en-US')
          : ToDate,
      TenantId: this.loginDetails.TenantId,
      ClientCategory: this.SeasonAdvanceForm.value.CategoryName ?? '',
      ClientId: this.SeasonAdvanceForm.value.ClientId ?? 0

    };
    console.log(bodyData, 'bodyData bodyData');

    const categoryListService = this.advanceService
      .GetSeasonAdvance(bodyData)
      .subscribe((res: any) => {
        // console.log(res);
        this.dataSource.data = res.SeasonDetails;
      });
    this.subscriptions.push(categoryListService);
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
      this.SeasonAdvanceForm.controls['ClientId'].reset();
    }
    console.log(client.ClientId, 'Client');

    this.SeasonAdvanceForm.controls['ClientId'].setValue(client?.ClientId);
  }

  search() {

    if (this.SeasonAdvanceForm.invalid) {
      this.SeasonAdvanceForm.markAllAsTouched();
      return;
    }
    this.GetSeasonAdvanceData(formatDate(this.SeasonAdvanceForm.value.fromDate, 'yyyy-MM-dd', 'en-US'), formatDate(this.SeasonAdvanceForm.value.toDate, 'yyyy-MM-dd', 'en-US'));

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
    this.SeasonAdvanceForm.controls['toDate'].setValue(null);
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

}
