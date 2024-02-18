import { DatePipe, formatDate } from '@angular/common';
import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ToastrService } from 'ngx-toastr';
import { Subject, Subscription, takeUntil } from 'rxjs';
import { HelperService } from 'src/app/core/services/helper.service';
import { AddEditStgComponent } from '../../models/add-edit-stg/add-edit-stg.component';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import { ConfirmDialogComponent } from 'src/app/shared/components/confirm-dialog/confirm-dialog.component';
import { IStgSelect } from '../../interfaces/istg';
import { StgService } from '../../services/stg.service';
import { AutoCompleteService } from '../../services/auto-complete.service';
import { IGetGrade } from 'src/app/modules/masters/interfaces/IGrade';
import { AddEditSupplierComponent } from '../../models/add-edit-supplier/add-edit-supplier.component';

@Component({
  selector: 'app-supplier',
  templateUrl: './supplier.component.html',
  styleUrls: ['./supplier.component.scss']
})
export class SupplierComponent implements OnInit {
  displayedColumns: string[] = [
    'TransactDate',
    'ClientName',
    'ClientId',
    'BuyerName',
    'AccountName',
    'TranscationType',
    'VehicleNo',
    'FineLeaf',
    'ChallanWeight',
    'Rate',
    'GrossAmount',
    'OwnerName',
    'actions'
  ];
  dummyData = [
    {
      TransactDate: '18/02/2024',
      ClientName: 'John Doe',
      ClientId: '12345',
      BuyerName: 'Jane Smith',
      AccountName: 'XYZ Corp',
      TranscationType: 'Sale',
      VehicleNo: 'AS01B2525',
      FineLeaf: 10,
      ChallanWeight: 500,
      Rate: 50,
      GrossAmount: 5000,
      OwnerName: 'Alice',
    }
  ];
 
  dataSource = new MatTableDataSource<any>();
  filteredData: any[] = [];
  columns: { columnDef: string; header: string }[] = [
    // { columnDef: 'TransactDate', header: 'Transaction Date' },
    { columnDef: 'ClientName', header: 'Client Name' },
    { columnDef: 'ClientId', header: 'Client ID' },
    { columnDef: 'BuyerName', header: 'Buyer Name' },
    { columnDef: 'AccountName', header: 'Account Name' },
    { columnDef: 'TranscationType', header: 'Transaction Type' },
    { columnDef: 'VehicleNo', header: 'Vehicle No.' },
    { columnDef: 'FineLeaf', header: 'Fine Leaf' },
    // { columnDef: 'ChallanWeight', header: 'Challan Weight' },
    { columnDef: 'Rate', header: 'Rate' },
    // { columnDef: 'GrossAmount', header: 'Gross Amount' },
    { columnDef: 'OwnerName', header: 'Owner Name' }
];


  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  private subscriptions: Subscription[] = [];
  loginDetails: any;
  dateRangeForm!: FormGroup;
  minToDate!: any;
  vehicleNumbers: any[]=[];
  TripList:any[]=[];
  private destroy$ = new Subject<void>();

  constructor(
    private dialog: MatDialog,
    private toastr: ToastrService,
    private helper: HelperService,
    private datePipe: DatePipe,
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
      TripId:['']
    });
    this.dataSource.data = this.dummyData;
  
    this.GetSupplierList(null,null);
    this.loadVehicleNumbers();
    this.GeTript();
 
  }

  ngAfterViewInit() {
    console.log(this.loginDetails);
    
    
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }


  GetSupplierList(FromDate:any,ToDate:any){
    
  }


  addSupplier() {
    const dialogRef = this.dialog.open(AddEditSupplierComponent, {
      width: '80%',
      data: {
        title: 'Add New Supplier',
        buttonName: 'Save',
      },
      disableClose: true,
    });
    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        this.GetSupplierList(null,null);
      }
    });
  }

  editItem(element: any) {

    const dialogRef = this.dialog.open(AddEditSupplierComponent, {
      width: "80%",
      data:{
        title:"Update Supplier",
        buttonName:"Update",
        value:element
      },
      disableClose:true
    });

    dialogRef.afterClosed().subscribe((result:any)=>{
      if(result){
        this.GetSupplierList(null,null);
      }
    })
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
  //  this.GetStgList(formatDate(currentDate, 'yyyy-MM-dd', 'en-US'),formatDate(currentDate, 'yyyy-MM-dd', 'en-US'));
 
    const fromDate =this.dateRangeForm.value.fromDate==null? formatDate(currentDate, 'yyyy-MM-dd', 'en-US'):formatDate(this.dateRangeForm.value.fromDate, 'yyyy-MM-dd', 'en-US');
    const toDate =this.dateRangeForm.value.toDate==null? formatDate(currentDate, 'yyyy-MM-dd', 'en-US'):formatDate(this.dateRangeForm.value.toDate, 'yyyy-MM-dd', 'en-US')  ;

    this.GetSupplierList(fromDate,toDate);
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

  setStatus(status:string, row:any){
    console.log(row);
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '30%',
      data: {
        title: 'Confirmation',
        message: `Do you want to make the status as <b [ngClass]="{
          'text-danger': status === 'Rejected',
          'text-warning': status === 'Pending',
          'text-success': status === 'Approved'
        }">${status}</b> ?`
      }
    });
    
    
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        row.status = status;
      }
    });
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

GeTript(){
  

  const gradeGetService = this.stgService.GetTrip().subscribe((res:any)=>{
    this.TripList = res.TripDetails;
    this.dateRangeForm.controls['TripId'].setValue(this.TripList[0].TripId);
  });

  this.subscriptions.push(gradeGetService);

}
}
