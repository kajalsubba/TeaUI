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
import { ISupplierSelect } from 'src/app/modules/collection/interfaces/isupplier';
import { AutoCompleteService } from 'src/app/modules/collection/services/auto-complete.service';
import { StgService } from 'src/app/modules/collection/services/stg.service';
import { SupplierService } from 'src/app/modules/collection/services/supplier.service';
import { IGetGrade } from 'src/app/modules/masters/interfaces/IGrade';

@Component({
  selector: 'app-supplier-history',
  templateUrl: './supplier-history.component.html',
  styleUrls: ['./supplier-history.component.scss']
})
export class SupplierHistoryComponent {

  displayedColumns: string[] = [
    'CollectionDate',
    'VehicleNo',
    'ClientName',
    'FirstWeight',
    'WetLeaf',
    'WetLeafKg',
    'LongLeaf',
    'LongLeafKg',
    'Deduction',
    'FinalWeight',
    'GradeName',
    'Rate',
    'GrossAmount',
    'Remarks',
    'Status',
  ];
 
  dataSource = new MatTableDataSource<any>();
  filteredData: any[] = [];
  columns: { columnDef: string; header: string }[] = [
    // { columnDef: 'CollectionDate', header: 'Collection Date' },
    { columnDef: 'VehicleNo', header: 'Vehicle NO.' },
    { columnDef: 'ClientName', header: 'Client Name' },
    { columnDef: 'WetLeaf', header: 'Wet Leaf (%)' },
   // { columnDef: 'WetLeafKg', header: 'Wet Leaf (KG) ' },
    { columnDef: 'LongLeaf', header: 'Long Leaf (%)' },
   // { columnDef: 'LongLeafKg', header: 'Long Leaf (KG)' },
  //  { columnDef: 'Grade', header: 'Grade' },
    { columnDef: 'GradeName', header: 'Grade' },
    { columnDef: 'Rate', header: 'Rate' },
    { columnDef: 'GrossAmount', header: 'Gross Amount' },
    { columnDef: 'Remarks', header: 'Remarks' },
  ];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  private subscriptions: Subscription[] = [];
  loginDetails: any;
  dateRangeForm!: FormGroup;
  minToDate!: any;
  vehicleNumbers: any[]=[];
  statusList:string[]=['All','Pending', 'Rejected','Approved']

  private destroy$ = new Subject<void>();

  constructor(
    private helper: HelperService,
    private datePipe: DatePipe,
    private toastr:ToastrService,
    private autocompleteService: AutoCompleteService,
    private fb:FormBuilder,
    private stgService:StgService,
    private supplierService:SupplierService

  ) {   }

  ngOnInit(): void {
    this.loginDetails = this.helper.getItem('loginDetails');
    this.dateRangeForm = this.fb.group({
      fromDate: [new Date(), Validators.required],
      toDate: [new Date(), [Validators.required]],
      VehicleNo:[''],
      Status:['']
    });
    this.loadVehicleNumbers();
 
  }
  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  fromDateChange(event: MatDatepickerInputEvent<Date>): void {
    this.dateRangeForm.controls['toDate'].setValue(null);
    this.minToDate = event.value
  }

  GetSupplierList(FromDate:any,ToDate:any){
    const currentDate = new Date();
    let bodyData:ISupplierSelect = {
      FromDate:FromDate==null?formatDate(currentDate, 'yyyy-MM-dd', 'en-US'): FromDate,
      ToDate:ToDate==null?formatDate(currentDate, 'yyyy-MM-dd', 'en-US'): ToDate,
      TenantId:this.loginDetails.TenantId,
      VehicleNo:this.dateRangeForm.value.VehicleNo,
      Status: this.dateRangeForm.value.Status=='All'?'':this.dateRangeForm.value.Status,
      TripId:0
    }
    const categoryListService = this.supplierService.GetSupplierData(bodyData).subscribe((res:any)=>{
     // console.log(res);
      this.dataSource.data = res.SupplierDetails;
    });
    this.subscriptions.push(categoryListService);
  }


  search(){

    const currentDate = new Date();
 
    const fromDate =this.dateRangeForm.value.fromDate==null? formatDate(currentDate, 'yyyy-MM-dd', 'en-US'): this.dateRangeForm.value.fromDate.format('yyyy-MM-DD');
    const toDate =this.dateRangeForm.value.toDate==null? formatDate(currentDate, 'yyyy-MM-dd', 'en-US'):  this.dateRangeForm.value.toDate.format('yyyy-MM-DD');
  
   this.GetSupplierList(fromDate,toDate);
  }
  getTotalCost(columnName: string): number {
    return this.dataSource.filteredData.reduce((acc, curr) => acc + curr[columnName], 0);
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

 // Autocomplete function
 filterVehicleNumbers(value: string): any {
  const filterValue = value.toLowerCase();
  return this.vehicleNumbers.filter((x:any) => x?.VehicleNo?.toLowerCase()?.includes(filterValue));
}

displayWithFn(value: string): string {
  return value || '';
}

VehicleInput(value:string){
  let newVal = value.toUpperCase();
  this.dateRangeForm.controls['VehicleNo'].setValue(newVal);
}

}
