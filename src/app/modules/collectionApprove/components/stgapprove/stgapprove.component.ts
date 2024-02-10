import { SelectionModel } from '@angular/cdk/collections';
import { DatePipe, formatDate } from '@angular/common';
import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
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
  selector: 'app-stgapprove',
  templateUrl: './stgapprove.component.html',
  styleUrls: ['./stgapprove.component.scss']
})
export class StgapproveComponent implements OnInit,  AfterViewInit {

  displayedColumns: string[] = [
    'select',
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
  selection = new SelectionModel<any>(true, []);
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
      Status: 'Pending',
    },
    {
      CollectionDate: '2022-01-02',
      VehicleNo: 'ABC1234',
      ClientName: 'Client 2',
      FirstWeight: 100,
      WetLeaf: 20,
      LongLeaf: 30,
      Deduction: 5,
      FinalWeight: 85,
      Grade: 'A',
      Rate: 10,
      Remarks: 'Sample Remark 1',
      Status: 'Reject',
    },
    {
      CollectionDate: '2022-01-03',
      VehicleNo: 'ABC1235',
      ClientName: 'Client 3',
      FirstWeight: 100,
      WetLeaf: 20,
      LongLeaf: 30,
      Deduction: 5,
      FinalWeight: 85,
      Grade: 'A',
      Rate: 10,
      Remarks: 'Sample Remark 1',
      Status: 'Approved',
    },
  ];
  

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  private subscriptions: Subscription[] = [];
  private destroy$ = new Subject<void>();
  loginDetails: any;
  dateRangeForm!: FormGroup;
  minToDate!: any;
  vehicleNumbers: any[]=[];

  constructor(
    private dialog: MatDialog,
    private toastr: ToastrService,
    private helper: HelperService,
    private datePipe: DatePipe,
    private fb:FormBuilder,
    private autocompleteService: AutoCompleteService,
    private stgService:StgService,
  ) {}

  async ngOnInit() {
    this.loginDetails = this.helper.getItem('loginDetails');
    this.dateRangeForm = this.fb.group({
      fromDate: [null, Validators.required],
      VehicleNo:['']
    });
    this.dataSource.data = this.dummyData;
    await this.loadVehicleNumbers();
    // this.GetStgList(null,null);
 
  }
  GetStgList(FromDate:any,ToDate:any){
    const currentDate = new Date();
    let bodyData:IStgSelect = {
      FromDate:FromDate==null?formatDate(currentDate, 'yyyy-MM-dd', 'en-US'): FromDate,
      ToDate:ToDate==null?formatDate(currentDate, 'yyyy-MM-dd', 'en-US'): FromDate,
      TenantId:this.loginDetails.TenantId
    }
    const categoryListService = this.stgService.GetStg(bodyData).subscribe((res:any)=>{
     // console.log(res);
      this.dataSource.data = res.STGDetails;
    });
    this.subscriptions.push(categoryListService);
  }

  
  ngAfterViewInit() {
    console.log(this.loginDetails);
    
    
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  search()
  {

  }

  clearFilter()
  {

  }

  fromDateChange(e:any)
  {

  }

  editItem(e:any)
  {

  }

  deleteItem(e:any)
  {

  }

  setStatus(e:any)
  {

  }

  approveEntry() {
    // Iterate through the selected items
    this.selection.selected.forEach(selectedItem => {
      // Find the index of the selected item in the dummyData array
      const index = this.dummyData.findIndex(item => item === selectedItem);
      // Update the Status property of the selected item to 'Approved'
      this.dummyData[index].Status = 'Approved';
    });
    // Clear the selection after updating the statuses
    this.selection.clear();
    this.GetStgList,this.dataSource.data = this.dummyData;
  }
  

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
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

filterVehicleNumbers(value: string): any {
  const filterValue = value.toLowerCase();
  return this.vehicleNumbers.filter((x:any) => x?.VehicleNo?.toLowerCase()?.includes(filterValue));
}

displayWithFn(value: string): string {
  return value || '';
}

isAllSelected() {
  const numSelected = this.selection.selected.length;
  const numRows = this.dataSource.data.length;
  return numSelected === numRows;
}

/** Selects all rows if they are not all selected; otherwise clear selection. */
toggleAllRows() {
  if (this.isAllSelected()) {
    this.selection.clear();
    return;
  }

  this.selection.select(...this.dataSource.data);
}

/** The label for the checkbox on the passed row */
checkboxLabel(row?: any): string {
  if (!row) {
    return `${this.isAllSelected() ? 'deselect' : 'select'} all`;
  }
  return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.position + 1}`;
}

}
