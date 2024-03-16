import { DatePipe, formatDate } from '@angular/common';
import { AfterViewInit, Component, HostListener, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
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
import { IGetseasonAdvance } from '../../interfaces/iseason-advance';
import { SeasonAdvanceService } from '../../services/season-advance.service';
import { EditAddSeasonAdvanceComponent } from '../../models/edit-add-season-advance/edit-add-season-advance.component';
import { StgApproveService } from 'src/app/modules/collectionApprove/services/stg-approve.service';

@Component({
  selector: 'app-season-advance',
  templateUrl: './season-advance.component.html',
  styleUrls: ['./season-advance.component.scss']
})
export class SeasonAdvanceComponent implements OnInit, AfterViewInit {

  displayedColumns: string[] = [
    'AdvancedDate',
    'ClientCategory',
    'ClientName',
    'Amount',
    'actions'

  ];

  dataSource = new _MatTableDataSource<any>();
  filteredData: any[] = [];
  columns: { columnDef: string; header: string }[] = [
    { columnDef: 'AdvancedDate', header: 'Date' },
    { columnDef: 'ClientName', header: 'Client Name' },
    { columnDef: 'ClientCategory', header: 'Client Category' },
  //  { columnDef: 'Amount', header: 'Amount' }

  ];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  private subscriptions: Subscription[] = [];
  private destroy$ = new Subject<void>();
  loginDetails: any;
  SeasonAdvanceForm!: FormGroup;
  minToDate!: any;
  ClientNames: any[] = [];
  selectedRowIndex: number = -1;
  saleTypeList: any[]=[];

  constructor(
    private dialog: MatDialog,
    private toastr: ToastrService,
    private helper: HelperService,
    private datePipe: DatePipe,
    private fb: FormBuilder,
    private autocompleteService: AutoCompleteService,
    private advanceService: SeasonAdvanceService,
    private saleService: StgApproveService,
    // private stgService: StgService,
    //   private stgapproveService: StgApproveService,
    // private supplierApproveService: SupplierapproveService
  ) { }

  async ngOnInit() {
    this.loginDetails = this.helper.getItem('loginDetails');
    this.SeasonAdvanceForm = this.fb.group({
      fromDate: [new Date(), Validators.required],
      toDate: [new Date(), Validators.required],
      ClientId: [''],
      ClientName: [''],
      SaleTypeId: [''],

    });

    //  await this.loadVehicleNumbers(formatDate(this.dateRangeForm.value.fromDate, 'yyyy-MM-dd', 'en-US'));
    await this.loadClientNames();
    this.GetSaleType()
    
    // this.GetSupplierDefaultList();
  }

  GetSaleType() {

    const services = this.saleService.GetSaleType().subscribe((res: any) => {
      this.saleTypeList = res.SaleTypes;
    });
    this.subscriptions.push(services);
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

      this.ClientNames = res.ClientDetails;


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
      TenantId: this.loginDetails.TenantId

    };
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

  AddSeasonAdvance() {
    const dialogRef = this.dialog.open(EditAddSeasonAdvanceComponent, {
      width: '30%',
      data: {
        title: 'Add Season Advance Entry',
        buttonName: 'Save',
      },
      disableClose: true,
    });
    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        this.GetSeasonAdvanceData(formatDate(this.SeasonAdvanceForm.value.fromDate, 'yyyy-MM-dd', 'en-US'), formatDate(this.SeasonAdvanceForm.value.toDate, 'yyyy-MM-dd', 'en-US'));
   
      }
    });
  }
  selectClient(client: any) {
    if (client == '') {
      this.SeasonAdvanceForm.controls['ClientId'].reset();
    }
    console.log(client.ClientId, 'Client');

    this.SeasonAdvanceForm.controls['ClientId'].setValue(client?.ClientId);
  }

  search() {

    // if (this.SeasonAdvanceForm.invalid) {
    //   this.SeasonAdvanceForm.markAllAsTouched();
    //   return;
    // }

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
  editItem(e:any)
  {

  }

}
