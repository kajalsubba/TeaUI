import { DatePipe, formatDate } from '@angular/common';
import { Component, HostListener, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ToastrService } from 'ngx-toastr';
import { Subject, Subscription, catchError, takeUntil } from 'rxjs';
import { HelperService } from 'src/app/core/services/helper.service';
import { IGetTeaClient } from 'src/app/modules/collection/interfaces/istg';
import { AutoCompleteService } from 'src/app/modules/collection/services/auto-complete.service';
import { IGetFactory } from 'src/app/modules/masters/interfaces/IFactory';
import { IGetFactoryAccount } from 'src/app/modules/masters/interfaces/IFactoryAccount';
import { IGetGrade } from 'src/app/modules/masters/interfaces/IGrade';
import { ClientService } from 'src/app/modules/masters/services/client.service';
import { GradeService } from 'src/app/modules/masters/services/grade.service';
import { ISaveSupplierRate, IsupplierRateFix } from '../../interfaces/isupplier-rate-fix';
import { IsupplierRateFixService } from '../../services/isupplier-rate-fix.service';
import { ConfirmDialogComponent } from 'src/app/shared/components/confirm-dialog/confirm-dialog.component';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-supplier-rate-fix',
  templateUrl: './supplier-rate-fix.component.html',
  styleUrls: ['./supplier-rate-fix.component.scss'],
})
export class SupplierRateFixComponent implements OnInit {
  displayedColumns: string[] = [
   // 'CollectionId',
    'CollectionDate',
    'ClientName',
   // 'VehicleNo',
    'FactoryName',
    'AccountName',
    'FineLeaf',
    'ChallanWeight',
    'Rate',
    'GrossAmount',
    'Remarks',
   // 'TripName',
   // 'Status',
    //'actions'
  ];

  dataSource = new MatTableDataSource<any>();
  filteredData: any[] = [];
  columns: { columnDef: string; header: string }[] = [
    { columnDef: 'CollectionId', header: 'Id ' },
    // { columnDef: 'CollectionDate', header: 'CollectionDate Date' },
    { columnDef: 'ClientName', header: 'Client Name' },
    { columnDef: 'VehicleNo', header: 'Vehicle No' },
    { columnDef: 'FactoryName', header: 'Factory' },
    { columnDef: 'AccountName', header: 'Account Name' },
    { columnDef: 'FineLeaf', header: 'Fine Leaf' },
    // { columnDef: 'ChallanWeight', header: 'Challan Weight' },
    { columnDef: 'Rate', header: 'Rate' },
    { columnDef: 'Remarks', header: 'Remark' },
 //   { columnDef: 'TripName', header: 'TripName ' },
    // { columnDef: 'Status', header: 'Status ' }
  ];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  private subscriptions: Subscription[] = [];
  loginDetails: any;
  dateRangeForm!: FormGroup;
  minToDate!: any;
  vehicleNumbers: any[] = [];
  GradeList: any[] = [];
  private destroy$ = new Subject<void>();
  selectedRowIndex: number = -1;
  ClientList: any[] = [];
  ClientNames: any[] = [];
  factoryNames: any[]=[];
  AccountList: any[]=[];
  accountNames: any[]=[];
 

  constructor(
    private dialog: MatDialog,
    private toastr: ToastrService,
    private helper: HelperService,
    private datePipe: DatePipe,
    private gradeService: GradeService,
    private autoCompleteService: AutoCompleteService,
    private fb: FormBuilder,
    private rateFixService:IsupplierRateFixService
  ) {}

  async ngOnInit() {
    this.loginDetails = this.helper.getItem('loginDetails');
    this.dateRangeForm = this.fb.group({
      fromDate: [new Date(), Validators.required],
      toDate: [new Date(), [Validators.required]],
      ClientId: [0],
      ClientName: [''],
      Rate: [''],
      AccountName:[''],
      AccountId:[0],
      FactoryName:[''],
      FactoryId:[0],
    });
    await this.loadClientNames();

    await this.loadFactoryNames();
    await this.loadAccountNames();
 //   this.GetGrade();
  }

  ngAfterViewInit() {

    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

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
    this.minToDate = event.value;
  }

  clearFilter() {
    this.dateRangeForm.controls['fromDate'].setValue(null);
    this.dateRangeForm.controls['toDate'].setValue(null);
    this.dataSource.data = this.dataSource.data;
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
    return this.dataSource.filteredData.reduce(
      (acc, curr) => +acc + (+curr[columnName]),
      0
    );
  }

  GetGrade() {
    let data: IGetGrade = {
      TenantId: this.loginDetails.TenantId,
    };
    const gradeGetService = this.gradeService
      .GetGrade(data)
      .subscribe((res: any) => {
        this.GradeList = res.GradeDetails;
      });

    this.subscriptions.push(gradeGetService);
  }
  filterClientNames(value: string): any[] {
    const filterValue = value.toLowerCase();
    return this.ClientNames.filter((x: any) =>
      x?.ClientName?.toLowerCase()?.includes(filterValue)
    );
  }

  async loadFactoryNames() {
    try {
      const bodyData: IGetFactory = {
        TenantId: this.loginDetails.TenantId,
        IsClientView:false
      };

      const res: any = await this.autoCompleteService
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

      const res: any = await this.autoCompleteService
        .GetAccountNames(bodyData)
        .pipe(takeUntil(this.destroy$))
        .toPromise();

      this.AccountList = res.AccountDetails;
    } catch (error) {
      console.error('Error:', error);
      this.toastr.error('Something went wrong.', 'ERROR');
    }
  }

  selectFactory(factory: any) {
    
    this.dateRangeForm.controls['FactoryId'].setValue(factory?.FactoryId);
     this.accountNames =   this.AccountList.filter((x:any)=> x.FactoryId==factory.FactoryId)
  }

  selectAccount(account: any) {
    this.dateRangeForm.controls['AccountId'].setValue(account?.AccountId);
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


  displayWithFn(value: string): string {
    return value || '';
  }

  selectClient(client: any) {
    if (client.ClientName=='')
    {
      this.dateRangeForm.controls['ClientId'].reset();
    }
    else
    {
    this.dateRangeForm.controls['ClientId'].setValue(client?.ClientId);
    }
  }

  async loadClientNames() {
    try {
      const bodyData: IGetTeaClient = {
        TenantId: this.loginDetails.TenantId,
        Category: 'Supplier',
      };

      const res: any = await this.autoCompleteService
        .GetClientNames(bodyData)
        .pipe(takeUntil(this.destroy$))
        .toPromise();

      this.ClientNames = res.ClientDetails;
    } catch (error) {
      console.error('Error:', error);
      this.toastr.error('Something went wrong.', 'ERROR');
    }
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
  Search()
  {
    this.GetSupplierData( formatDate(this.dateRangeForm.value.fromDate, 'yyyy-MM-dd', 'en-US'), formatDate(this.dateRangeForm.value.toDate, 'yyyy-MM-dd', 'en-US'));
 
  }

  onInputChange(event: Event) {
    const input = event.target as HTMLInputElement;
    // Do something when input changes
    if (!environment.production) {

      console.log(input.value,'presss');
    }
   
    if(input.value=='')
    {
      this.accountNames=[];
      this.dateRangeForm.controls['AccountName'].reset();
      this.dateRangeForm.controls['AccountId'].reset();
    }
   
  }

  GetSupplierData(FromDate:any,ToDate:any){
    const currentDate = new Date();
    let bodyData:IsupplierRateFix = {
      FromDate:FromDate==null?formatDate(currentDate, 'yyyy-MM-dd', 'en-US'): FromDate,
      ToDate:ToDate==null?formatDate(currentDate, 'yyyy-MM-dd', 'en-US'): ToDate,
      TenantId:this.loginDetails.TenantId,
      ClientId:this.dateRangeForm.value.ClientName==''?0:this.dateRangeForm.value.ClientId,
      FactoryId: this.dateRangeForm.value.FactoryName==''?0:this.dateRangeForm.value.FactoryId,
      AccountId:this.dateRangeForm.value.AccountName==''?0:this.dateRangeForm.value.AccountId,
   
    }
    const categoryListService = this.rateFixService.GetSupplierRateFixData(bodyData).subscribe((res:any)=>{
     // console.log(res);
      this.dataSource.data = res.SupplierRateData;
    });
    this.subscriptions.push(categoryListService);
  }

  RateAssign()
  {
    this.dataSource.data.forEach((keys:any,val:any) => {
      keys.Rate=this.dateRangeForm.value.Rate
     keys.GrossAmount=Number(keys.ChallanWeight*this.dateRangeForm.value.Rate).toFixed(2)
    });
    this.dateRangeForm.controls["Rate"].reset();
  }

  FixRate()
  {

    const rateObjects: any[] = [];
    this.dataSource.data.forEach((selectedItem) => {
      // Create the selected object based on the selected item
      
      const selectedObject = {
        CollectionId: selectedItem.CollectionId, // Assuming CollectionId is present in your data
        Rate: selectedItem.Rate, // Assuming Status is present in your data
      };
      // Push the selected object to the array
      rateObjects.push(selectedObject);
      // Calculate totals
    
    });

    let data: ISaveSupplierRate = {
      
      TenantId: this.loginDetails.TenantId,
      CreatedBy: this.loginDetails.UserId,
      RateData: rateObjects,
    };

  
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '30vw',
      minWidth:'25vw',
      disableClose: true,
      data: {
        title: 'Confirm Action',
        message: 'Do you want to Confirm !',
        data: data,
   
      },
    });
    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        this.SaveRateFixData(data);
      

      }
    });


  }

  SaveRateFixData(data:any)
  {
    this.rateFixService
    .SaveSupplierRateFixData(data)
    .pipe(
      takeUntil(this.destroy$),
      catchError((error) => {
        console.error('Error:', error);
        this.toastr.error('An error occurred', 'ERROR');
        throw error;
      })
    )
    .subscribe((res: any) => {
      
      this.toastr.success(res.Message, "SUCCESS");
      this.clearform();
      this.GetSupplierData( formatDate(this.dateRangeForm.value.fromDate, 'yyyy-MM-dd', 'en-US'), formatDate(this.dateRangeForm.value.toDate, 'yyyy-MM-dd', 'en-US'));
 
    });
}

clearform()
{

this.dateRangeForm.controls["ClientId"].reset();
this.dateRangeForm.controls["ClientName"].reset();
this.dateRangeForm.controls["FactoryId"].reset();
this.dateRangeForm.controls["FactoryName"].reset();
this.dateRangeForm.controls["AccountId"].reset();
this.dateRangeForm.controls["AccountName"].reset();
this.dateRangeForm.controls["Rate"].reset();
}
}
