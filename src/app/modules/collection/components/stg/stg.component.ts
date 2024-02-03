import { DatePipe } from '@angular/common';
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
    'status',
    'actions'
  ];
  dummyData = [
    {
      CollectionDate: '2022-01-01',
      VehicleNo: 'ABC123',
      ClientName: 'Client 1',
      FirstWeight: 100,
      WetLeaf: 20,
      LongLeaf: 30,
      Deduction: 5,
      FinalWeight: 85,
      Grade: 'A',
      Rate: 10,
      Remarks: 'Sample Remark 1',
      status:'Pending'
    },
  ];
  dataSource = new MatTableDataSource<any>(this.dummyData);
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
    private fb:FormBuilder
  ) {}

  ngOnInit(): void {
    this.dateRangeForm = this.fb.group({
      fromDate: [null, Validators.required],
      toDate: [null, [Validators.required]]
    });
  }

  ngAfterViewInit() {
    console.log(this.loginDetails);
    
    
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  addEntry() {
    const dialogRef = this.dialog.open(AddEditStgComponent, {
      width: '80%',
      data: {
        title: 'Add Entry',
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
    return this.datePipe.transform(parsedDate, 'dd-MMM-yyyy') || '';
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
    this.dataSource.data = this.dummyData;
  }

  search(): void {
    const fromDate = this.dateRangeForm.value.fromDate;
    const toDate = this.dateRangeForm.value.toDate;

    // Filter the data based on the date range
    this.filteredData = this.dummyData.filter((item) => {
      const collectionDate = new Date(item.CollectionDate);
      return collectionDate >= fromDate && collectionDate <= toDate;
    });

    // Update the dataSource with the filtered data
    this.dataSource.data = this.filteredData;
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
