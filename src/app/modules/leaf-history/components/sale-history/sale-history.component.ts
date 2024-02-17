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
import { IGetGrade } from 'src/app/modules/masters/interfaces/IGrade';

@Component({
  selector: 'app-sale-history',
  templateUrl: './sale-history.component.html',
  styleUrls: ['./sale-history.component.scss']
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
    'Incentive',
    'GrossAmount',
    'Remarks',
    'TypeName',
  ];
 
  dataSource = new MatTableDataSource<any>();
  filteredData: any[] = [];
  columns: { columnDef: string; header: string }[] = [
    { columnDef: 'SaleId', header: 'Sale Id' },
 //   { columnDef: 'SaleDate', header: 'Sale Date' },
    { columnDef: 'FactoryName', header: 'FactoryName' },
    { columnDef: 'AccountName', header: 'Account Name' },
    { columnDef: 'VehicleNo', header: 'Vehicle No' },
    { columnDef: 'FineLeaf', header: 'Fine Leaf (%)' },
   // { columnDef: 'LongLeafKg', header: 'Long Leaf (KG)' },
  //  { columnDef: 'Grade', header: 'Grade' },
  //  { columnDef: 'ChallanWeight', header: 'Challa Weight' },
    { columnDef: 'Rate', header: 'Rate' },
    { columnDef: 'Incentive', header: 'Incentive' },
  //  { columnDef: 'GrossAmount', header: 'Gross Amount' },
    { columnDef: 'Remarks', header: 'Remarks' },
    { columnDef: 'TypeName', header: 'Sale Type' },
  ];

  loginDetails:any;
  SaleForm!: FormGroup;
  private destroy$ = new Subject<void>();
  vehicleNumbers: any[]=[];
  minToDate!: any;
  private subscriptions: Subscription[] = [];
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

constructor(   
  private helper: HelperService,
  private datePipe: DatePipe,
  private toastr:ToastrService,
  private autocompleteService: AutoCompleteService,
  private fb:FormBuilder,
  private saleService:StgApproveService
  ) {
    this.SaleForm = this.fb.group({
      fromDate: [new Date(), Validators.required],
      toDate: [new Date(), [Validators.required]],
      VehicleNo:[''],
    
    });
  
}

  ngOnInit(): void {
    this.loginDetails = this.helper.getItem('loginDetails');
    this.SaleForm = this.fb.group({
      fromDate: [new Date(), Validators.required],
      toDate: [new Date(), [Validators.required]],
      VehicleNo:[''],
      Status:['']
    });
    this.loadVehicleNumbers();
 
  }
  search()
  {
    this.GetSaleDeatils(formatDate(this.SaleForm.value.fromDate, 'yyyy-MM-dd', 'en-US'),formatDate(this.SaleForm.value.toDate, 'yyyy-MM-dd', 'en-US'));
  }

  getTotalCost(columnName: string): number {
    return this.dataSource.filteredData.reduce((acc, curr) => acc + curr[columnName], 0);
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
  return this.vehicleNumbers.filter((x:any) => x?.VehicleNo?.toLowerCase()?.includes(filterValue));
}

async loadVehicleNumbers() {
  try {
      const bodyData: IGetGrade = {
          TenantId: this.loginDetails.TenantId
      };

      const res: any = await this.autocompleteService.GetVehicleNumbers(bodyData)
          .pipe(takeUntil(this.destroy$))
          .toPromise();

      this.vehicleNumbers = res.VehicleDetails;


  } catch (error) {
      console.error('Error:', error);
      this.toastr.error('Something went wrong.', 'ERROR');
  }
}
displayWithFn(value: string): string {
  return value || '';
}
GetSaleDeatils(FromDate:any,ToDate:any){
  const currentDate = new Date();
  let bodyData:IGetSale = {
    FromDate:FromDate==null?formatDate(currentDate, 'yyyy-MM-dd', 'en-US'): FromDate,
    ToDate:ToDate==null?formatDate(currentDate, 'yyyy-MM-dd', 'en-US'): ToDate,
    TenantId:this.loginDetails.TenantId,
  //  VehicleNo:this.dateRangeForm.value.VehicleNo,
   
  }
  const categoryListService = this.saleService.GetSaleDetails(bodyData).subscribe((res:any)=>{
   // console.log(res);
    this.dataSource.data = res.SaleDetails;
  });
  this.subscriptions.push(categoryListService);
}


ngAfterViewInit() {

  
  this.dataSource.paginator = this.paginator;
  this.dataSource.sort = this.sort;
}


VehicleInput(value:string){
  let newVal = value.toUpperCase();
  this.SaleForm.controls['VehicleNo'].setValue(newVal);
}

fromDateChange(event: MatDatepickerInputEvent<Date>): void {
  this.SaleForm.controls['toDate'].setValue(null);
  this.minToDate = event.value
}
}
