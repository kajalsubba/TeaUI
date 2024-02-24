import { DatePipe, formatDate } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ToastrService } from 'ngx-toastr';
import { Subject, Subscription, takeUntil } from 'rxjs';
import { HelperService } from 'src/app/core/services/helper.service';
import { AutoCompleteService } from 'src/app/modules/collection/services/auto-complete.service';
import { IGetSale } from 'src/app/modules/collectionApprove/interfaces/isale-save';
import { StgApproveService } from 'src/app/modules/collectionApprove/services/stg-approve.service';
import { IGetFactory } from 'src/app/modules/masters/interfaces/IFactory';
import { IGetFactoryAccount } from 'src/app/modules/masters/interfaces/IFactoryAccount';
import { IGetGrade } from 'src/app/modules/masters/interfaces/IGrade';

@Component({
  selector: 'app-sale-history',
  templateUrl: './sale-history.component.html',
  styleUrls: ['./sale-history.component.scss'],
})
export class SaleHistoryComponent {
  displayedColumns: string[] = [
    'SaleId',
    'SaleDate',
    'FactoryName',
    'AccountName',
    'VehicleNo',
    'FieldWeight',
    'FineLeaf',
    'ChallanWeight',
    'Rate',
    'GrossAmount',
    'Incentive',
   'IncentiveAmount',
   'FinalAmount',
    'Remarks',
    'TypeName',
    'actions',
  ];

  dataSource = new MatTableDataSource<any>();
  filteredData: any[] = [];
  columns: { columnDef: string; header: string }[] = [
    { columnDef: 'SaleId', header: 'Sale Id' },
    //   { columnDef: 'SaleDate', header: 'Sale Date' },
    { columnDef: 'FactoryName', header: 'Factory Name' },
    { columnDef: 'AccountName', header: 'Account Name' },
    { columnDef: 'VehicleNo', header: 'Vehicle No' },
    { columnDef: 'FineLeaf', header: 'Fine Leaf (%)' },
    { columnDef: 'Rate', header: 'Rate' },
    { columnDef: 'Incentive', header: 'Incentive' },
    // { columnDef: 'IncentiveAmount', header: 'Incentive Amount' },
    //  { columnDef: 'FinalAmount', header: 'Final Amount' },
    { columnDef: 'Remarks', header: 'Remarks' },
    { columnDef: 'TypeName', header: 'Sale Type' },
  ];

  loginDetails: any;
  SaleForm!: FormGroup;
  private destroy$ = new Subject<void>();
  vehicleNumbers: any[] = [];
  minToDate!: any;
  private subscriptions: Subscription[] = [];
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  factoryNames: any[]=[];
  accountNames: any[]=[];
  AccountList:any=[];
  saleTypeList:any;
  

  constructor(
    private helper: HelperService,
    private datePipe: DatePipe,
    private toastr: ToastrService,
    private autocompleteService: AutoCompleteService,
    private fb: FormBuilder,
    private saleService: StgApproveService
  ) {
    // this.SaleForm = this.fb.group({
    //   fromDate: [new Date(), Validators.required],
    //   toDate: [new Date(), [Validators.required]],
    //   VehicleNo: [''],
    //   FactoryName:['']
    // });
  }

  ngOnInit(): void {
    this.loginDetails = this.helper.getItem('loginDetails');
    this.SaleForm = this.fb.group({
      fromDate: [new Date(), Validators.required],
      toDate: [new Date(), [Validators.required]],
      VehicleNo: [''],
      FactoryName:[''],
      FactoryId:[null],
      AccountName:[''],
      AccountId:[null],
      SaleTypeId:[null]
    });
    this.loadVehicleNumbers();
    this.loadFactoryNames();
    this.loadAccountNames();
    this.GetSaleType();
  }
  search() {
    this.GetSaleDeatils(
      formatDate(this.SaleForm.value.fromDate, 'yyyy-MM-dd', 'en-US'),
      formatDate(this.SaleForm.value.toDate, 'yyyy-MM-dd', 'en-US')
    );
  }

  getTotalCost(columnName: string): number {
    return this.dataSource.filteredData.reduce(
      (acc, curr) => acc + curr[columnName],
      0
    );
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  // Autocomplete function
  filterVehicleNumbers(value: string): any {
    const filterValue = value.toLowerCase();
    return this.vehicleNumbers.filter((x: any) =>
      x?.VehicleNo?.toLowerCase()?.includes(filterValue)
    );
  }

  filterFactoryNames(value: string): any {
    const filterValue = value.toLowerCase();
    return this.factoryNames.filter((x: any) =>
      x?.FactoryName?.toLowerCase()?.includes(filterValue)
    );
  }

  filterAccountNames(value: string): any {
    const filterValue = value.toLowerCase();
    return this.accountNames.filter((x: any) =>
      x?.AccountName?.toLowerCase()?.includes(filterValue)
    );
  }

  GetSaleType(){
   
    const services = this.saleService.GetSaleType().subscribe((res:any)=>{
      this.saleTypeList= res.SaleTypes;
    });
    this.subscriptions.push(services);
  }

  async loadVehicleNumbers() {
    try {
      const bodyData: IGetGrade = {
        TenantId: this.loginDetails.TenantId,
      };

      const res: any = await this.autocompleteService
        .GetVehicleNumbers(bodyData)
        .pipe(takeUntil(this.destroy$))
        .toPromise();

      this.vehicleNumbers = res.VehicleDetails;
    } catch (error) {
      console.error('Error:', error);
      this.toastr.error('Something went wrong.', 'ERROR');
    }
  }

  async loadFactoryNames() {
    try {
      const bodyData: IGetFactory = {
        TenantId: this.loginDetails.TenantId,
        IsClientView:false
      };

      const res: any = await this.autocompleteService
        .GetFactoryNames(bodyData)
        .pipe(takeUntil(this.destroy$))
        .toPromise();

      this.factoryNames = res.FactoryDetails;
    } catch (error) {
      console.error('Error:', error);
      this.toastr.error('Something went wrong.', 'ERROR');
    }
  }

  async loadAccountNames() {
    try {
      const bodyData: IGetFactoryAccount = {
        TenantId: this.loginDetails.TenantId,
      };

      const res: any = await this.autocompleteService
        .GetAccountNames(bodyData)
        .pipe(takeUntil(this.destroy$))
        .toPromise();

      this.AccountList = res.AccountDetails;
    } catch (error) {
      console.error('Error:', error);
      this.toastr.error('Something went wrong.', 'ERROR');
    }
  }
  displayWithFn(value: string): string {
    return value || '';
  }
  GetSaleDeatils(FromDate: any, ToDate: any) {
    const currentDate = new Date();
    let bodyData: IGetSale = {
      FromDate:
        FromDate == null
          ? formatDate(currentDate, 'yyyy-MM-dd', 'en-US')
          : FromDate,
      ToDate:
        ToDate == null
          ? formatDate(currentDate, 'yyyy-MM-dd', 'en-US')
          : ToDate,
          VehicleNo:this.SaleForm.value.VehicleNo,
          FactoryId:this.SaleForm.value.FactoryId,
          AccountId:this.SaleForm.value.AccountId,
          SaleTypeId:this.SaleForm.value.SaleTypeId,
      TenantId: this.loginDetails.TenantId,
      //  VehicleNo:this.dateRangeForm.value.VehicleNo,
    };
    const categoryListService = this.saleService
      .GetSaleDetails(bodyData)
      .subscribe((res: any) => {
        // console.log(res);
        this.dataSource.data = res.SaleDetails;
      });
    this.subscriptions.push(categoryListService);
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  VehicleInput(value: string) {
    let newVal = value.toUpperCase();
    this.SaleForm.controls['VehicleNo'].setValue(newVal);
  }

  selectFactory(factory: any) {
    this.SaleForm.controls['FactoryId'].setValue(factory?.FactoryId);
    this.accountNames=   this.AccountList.filter((x:any)=> x.FactoryId==factory.FactoryId)
  }

  selectAccount(account: any) {
    this.SaleForm.controls['AccountId'].setValue(account?.AccountId);
  }

  fromDateChange(event: MatDatepickerInputEvent<Date>): void {
    this.SaleForm.controls['toDate'].setValue(null);
    this.minToDate = event.value;
  }

  editItem(row: any) {}

  deleteItem(row: any) {}
}
