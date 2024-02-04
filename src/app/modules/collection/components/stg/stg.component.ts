import { DatePipe, formatDate } from '@angular/common';
import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { HelperService } from 'src/app/core/services/helper.service';
import { AddEditStgComponent } from '../../models/add-edit-stg/add-edit-stg.component';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import { ConfirmDialogComponent } from 'src/app/shared/components/confirm-dialog/confirm-dialog.component';
import { IStgSelect } from '../../interfaces/istg';
import { StgService } from '../../services/stg.service';

@Component({
  selector: 'app-stg',
  templateUrl: './stg.component.html',
  styleUrls: ['./stg.component.scss'],
})
export class StgComponent implements OnInit, AfterViewInit {
  displayedColumns: string[] = [
    'CollectionDate',
    'VehicleNo',
    'ClientName',
    'FirstWeight',
    'WetLeaf',
    'LongLeaf',
    'Deduction',
    'FinalWeight',
    'Grade',
    'Rate',
    'Remarks',
    'Status',
    'actions'
  ];
 
  dataSource = new MatTableDataSource<any>();
  filteredData: any[] = [];
  columns: { columnDef: string; header: string }[] = [
    { columnDef: 'CollectionDate', header: 'Collection Date' },
    { columnDef: 'VehicleNo', header: 'Vehicle NO.' },
    { columnDef: 'ClientName', header: 'Client Name' },
    { columnDef: 'FirstWeight', header: 'First Weight(Kg)' },
    { columnDef: 'WetLeaf', header: 'Wet Leaf' },
    { columnDef: 'LongLeaf', header: 'Long Leaf' },
    { columnDef: 'Deduction', header: 'Deduction' },
    { columnDef: 'FinalWeight', header: 'Final Weight' },
    { columnDef: 'Grade', header: 'Grade' },
    { columnDef: 'Rate', header: 'Rate' },
    { columnDef: 'Status', header: 'Status' },
    { columnDef: 'Remarks', header: 'Remarks' },
  ];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  private subscriptions: Subscription[] = [];
  loginDetails: any;
  dateRangeForm!: FormGroup;
  minToDate!: any;

  constructor(
    private dialog: MatDialog,
    private toastr: ToastrService,
    private helper: HelperService,
    private datePipe: DatePipe,
    private fb:FormBuilder,
    private stgService:StgService,
  ) {}

  ngOnInit(): void {
    this.loginDetails = this.helper.getItem('loginDetails');
    this.dateRangeForm = this.fb.group({
      fromDate: [null, Validators.required],
      toDate: [null, [Validators.required]]
    });

  
    this.GetStgList(null,null);
 
  }

  ngAfterViewInit() {
    console.log(this.loginDetails);
    
    
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }


  GetStgList(FromDate:any,ToDate:any){
    const currentDate = new Date();
    let bodyData:IStgSelect = {
      FromDate:FromDate==null?formatDate(currentDate, 'yyyy-MM-dd', 'en-US'): FromDate,
      ToDate:ToDate==null?formatDate(currentDate, 'yyyy-MM-dd', 'en-US'): ToDate,
      TenantId:this.loginDetails.TenantId
    }
    const categoryListService = this.stgService.GetStg(bodyData).subscribe((res:any)=>{
     // console.log(res);
      this.dataSource.data = res.STGDetails;
    });
    this.subscriptions.push(categoryListService);
  }


  addEntry() {
    const dialogRef = this.dialog.open(AddEditStgComponent, {
      width: '80%',
      data: {
        title: 'Add STG Entry',
        buttonName: 'Save',
      },
      disableClose: true,
    });
    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
      }
    });
  }

  editItem(element: any) {}

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
 
    const fromDate = this.dateRangeForm.value.fromDate.format('yyyy-MM-DD');
    const toDate =  this.dateRangeForm.value.toDate.format('yyyy-MM-DD');

    this.GetStgList(fromDate,toDate);
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
          'text-danger': status === 'Reject',
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

}
