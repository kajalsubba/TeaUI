import { DatePipe, formatDate, registerLocaleData } from '@angular/common';
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
import { IGetGrade } from 'src/app/modules/masters/interfaces/IGrade';
import { ClientService } from 'src/app/modules/masters/services/client.service';
import { GradeService } from 'src/app/modules/masters/services/grade.service';
import { StgRateFixService } from '../../services/stg-rate-fix.service';
import { ISaveStgRate, IStgRateFix } from '../../interfaces/istg-rate-fix';
import { ConfirmDialogComponent } from 'src/app/shared/components/confirm-dialog/confirm-dialog.component';
import enIN from '@angular/common/locales/en-IN';
registerLocaleData(enIN);
@Component({
  selector: 'app-stg-rate-fix',
  templateUrl: './stg-rate-fix.component.html',
  styleUrls: ['./stg-rate-fix.component.scss'],
})
export class StgRateFixComponent implements OnInit {
  displayedColumns: string[] = [
  //  'CollectionId',
    'CollectionDate',
    'GradeName',
 //   'VehicleNo',
    'ClientName',
  //  'FirstWeight',
  //  'WetLeaf',
   // 'LongLeaf',
   // 'Deduction',
    'FinalWeight',

    'Rate',
    'GrossAmount',
    'Remarks'

  ];

  dataSource = new MatTableDataSource<any>();
  filteredData: any[] = [];
  columns: { columnDef: string; header: string }[] = [
   //  { columnDef: 'CollectionId', header: 'CollectionId ' },
   // { columnDef: 'CollectionDate', header: 'Collection Date' },
    { columnDef: 'GradeName', header: 'Grade' },

    //{ columnDef: 'VehicleNo', header: 'Vehicle No' },
    { columnDef: 'ClientName', header: 'Client Name' },
    //{ columnDef: 'FirstWeight', header: 'First Weight ' },
   // { columnDef: 'WetLeaf', header: 'Wet Leaf (%)' },
   // { columnDef: 'LongLeaf', header: 'Long Leaf (%)' },
   // { columnDef: 'Deduction', header: 'Deduction (KG)' },
  //  { columnDef: 'FinalWeight', header: 'Final Weight (KG)' },
     { columnDef: 'Rate', header: 'Rate' },
   //{ columnDef: 'GrossAmount', header: 'Gross Amount' },
    { columnDef: 'Remarks', header: 'Remarks' },
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

  constructor(
    private dialog: MatDialog,
    private toastr: ToastrService,
    private helper: HelperService,
    private datePipe: DatePipe,
    private gradeService: GradeService,
    private autoCompleteService: AutoCompleteService,
    private fb: FormBuilder,
    private rateFixService:StgRateFixService
  ) {}

  async ngOnInit() {
    this.loginDetails = this.helper.getItem('loginDetails');
    this.dateRangeForm = this.fb.group({
      fromDate: [new Date(), Validators.required],
      toDate: [new Date(), [Validators.required]],
      GradeId: [null],
      ClientId: [0],
      ClientName: [''],
      Rate: [''],
    });
    await this.loadClientNames();
    this.GetGrade();
  }

  onSelectionChange(e:any)
  {
 this.clearform()
  }
  clearform()
  {

  this.dateRangeForm.controls["ClientId"].reset();
  this.dateRangeForm.controls["ClientName"].reset();
  this.dateRangeForm.controls["Rate"].reset();
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
   // this.dateRangeForm.controls['toDate'].setValue(null);
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

  // getTotalCost(columnName: string): number {
  //   return this.dataSource.filteredData.reduce(
  //     (acc, curr) => acc + curr[columnName],
  //     0
  //   );
  // }

  getTotalCost(columnName: string): number {
    if (!this.dataSource.filteredData || this.dataSource.filteredData.length === 0) {
      return 0;
    }
  
    const columnValues: number[] = this.dataSource.filteredData
      .map(item => +item[columnName])
      .filter(value => typeof value === 'number');
  
    return columnValues.reduce((acc, curr) => acc + (curr as number), 0);
  }

  GetGrade() {
    let data: IGetGrade = {
      TenantId: this.loginDetails.TenantId,
    };
    const gradeGetService = this.gradeService
      .GetGrade(data)
      .subscribe((res: any) => {
        this.GradeList = res.GradeDetails;
        // this.GradeList.push({
        //   GradeId:0,
        //   GradeName:"All"
        // })
      });

    this.subscriptions.push(gradeGetService);
  }
  filterClientNames(value: string): any[] {
    if (value=='')
    {
      this.dateRangeForm.controls['ClientId'].reset();
    }

    const filterValue = value.toLowerCase();
    // console.log(this.ClientNames.filter((number:any) => number.toLowerCase().includes(filterValue)),'Clinet');
    return this.ClientNames.filter((x: any) =>
      x?.ClientName?.toLowerCase()?.includes(filterValue)
    );
  }

  displayWithFn(value: string): string {
    return value || '';
  }

  selectClient(client: any) {
  
    this.dateRangeForm.controls['ClientId'].setValue(client?.ClientId);
  }
  Search()
  {
   
    this.GetStgData( formatDate(this.dateRangeForm.value.fromDate, 'yyyy-MM-dd', 'en-US'), formatDate(this.dateRangeForm.value.toDate, 'yyyy-MM-dd', 'en-US'));
 
  }

  GetStgData(FromDate:any,ToDate:any){
    const currentDate = new Date();
    let bodyData:IStgRateFix = {
      FromDate:FromDate==null?formatDate(currentDate, 'yyyy-MM-dd', 'en-US'): FromDate,
      ToDate:ToDate==null?formatDate(currentDate, 'yyyy-MM-dd', 'en-US'): ToDate,
      TenantId:this.loginDetails.TenantId,
      ClientId:this.dateRangeForm.value.ClientId,
      GradeId: this.dateRangeForm.value.GradeId
   
    }
    const categoryListService = this.rateFixService.GetStgRateFixData(bodyData).subscribe((res:any)=>{
   
      this.dataSource.data = res.StgRateData;
    });
    this.subscriptions.push(categoryListService);
  }

  async loadClientNames() {
    try {
      const bodyData: IGetTeaClient = {
        TenantId: this.loginDetails.TenantId,
        Category: 'STG',
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

  RateAssign()
  {
    this.dataSource.data.forEach((keys:any,val:any) => {
      keys.Rate=this.dateRangeForm.value.Rate
     keys.GrossAmount=Number(keys.FinalWeight*this.dateRangeForm.value.Rate).toFixed(2)
    });
    this.getTotalCost('GrossAmount')
    console.log(this.dataSource.data);
    
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

    let data: ISaveStgRate = {
      
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
        this.SaveStgRateFixData(data);
      

      }
    });

   
  }

  SaveStgRateFixData(data:any)
  {
    this.rateFixService
    .SavetgRateFixData(data)
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
      this.GetStgData(this.dateRangeForm.value.fromDate.format('yyyy-MM-DD'),this.dateRangeForm.value.toDate.format('yyyy-MM-DD'));
 
    });
  }
}
