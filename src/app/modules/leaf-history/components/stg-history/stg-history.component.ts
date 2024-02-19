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
import { IStgSelect } from 'src/app/modules/collection/interfaces/istg';
import { AutoCompleteService } from 'src/app/modules/collection/services/auto-complete.service';
import { StgService } from 'src/app/modules/collection/services/stg.service';
import { IGetGrade } from 'src/app/modules/masters/interfaces/IGrade';

@Component({
  selector: 'app-stg-history',
  templateUrl: './stg-history.component.html',
  styleUrls: ['./stg-history.component.scss']
})
export class StgHistoryComponent {
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
  ) {}

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

  ngAfterViewInit() {

    
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  deleteItem(element: any) {}

  convertDate(date: any): string {
    const parsedDate = new Date(date);
    return this.datePipe.transform(parsedDate, 'dd-MM-yyyy') || '';
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

  clearFilter(){
    this.dateRangeForm.controls['fromDate'].setValue(null);
    this.dateRangeForm.controls['toDate'].setValue(null);
    this.dataSource.data = this.dataSource.data;
  }

  search(){

    const currentDate = new Date();
 
    const fromDate =this.dateRangeForm.value.fromDate==null? formatDate(currentDate, 'yyyy-MM-dd', 'en-US'): this.dateRangeForm.value.fromDate.format('yyyy-MM-DD');
    const toDate =this.dateRangeForm.value.toDate==null? formatDate(currentDate, 'yyyy-MM-dd', 'en-US'):  this.dateRangeForm.value.toDate.format('yyyy-MM-DD');
  
    this.GetStgList(fromDate,toDate);
  }

  GetStgList(FromDate:any,ToDate:any){
    const currentDate = new Date();
    let bodyData:IStgSelect = {
      FromDate:FromDate==null?formatDate(currentDate, 'yyyy-MM-dd', 'en-US'): FromDate,
      ToDate:ToDate==null?formatDate(currentDate, 'yyyy-MM-dd', 'en-US'): ToDate,
      TenantId:this.loginDetails.TenantId,
      VehicleNo:this.dateRangeForm.value.VehicleNo,
      Status: this.dateRangeForm.value.Status=='All'?'':this.dateRangeForm.value.Status,
      TripId:0
    }
    const categoryListService = this.stgService.GetStg(bodyData).subscribe((res:any)=>{
     // console.log(res);
      this.dataSource.data = res.STGDetails;
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
