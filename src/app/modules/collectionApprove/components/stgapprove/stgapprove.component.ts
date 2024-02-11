import { SelectionModel } from '@angular/cdk/collections';
import { DatePipe, formatDate } from '@angular/common';
import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ToastrService } from 'ngx-toastr';
import { Subject, Subscription, catchError, takeUntil } from 'rxjs';
import { HelperService } from 'src/app/core/services/helper.service';
import { IStgSelect } from 'src/app/modules/collection/interfaces/istg';
import { AutoCompleteService } from 'src/app/modules/collection/services/auto-complete.service';
import { StgService } from 'src/app/modules/collection/services/stg.service';
import { IGetGrade } from 'src/app/modules/masters/interfaces/IGrade';
import { IstgApprove } from '../../interfaces/istg-approve';
import { StgApproveService } from '../../services/stg-approve.service';

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
    'GradeName',
    'Rate',
    'Remarks',
    'Status'
  ];
 
  dataSource = new MatTableDataSource<any>();
  selection = new SelectionModel<any>(true, []);
  filteredData: any[] = [];
  columns: { columnDef: string; header: string }[] = [
    // { columnDef: 'CollectionDate', header: 'Collection Date' },
    { columnDef: 'VehicleNo', header: 'Vehicle NO.' },
    { columnDef: 'ClientName', header: 'Client Name' },
    // { columnDef: 'FirstWeight', header: 'First Weight(Kg)' },
    { columnDef: 'WetLeaf', header: 'Wet Leaf' },
    { columnDef: 'LongLeaf', header: 'Long Leaf' },
    // { columnDef: 'Deduction', header: 'Deduction' },
    // { columnDef: 'FinalWeight', header: 'Final Weight' },
    { columnDef: 'GradeName', header: 'Grade' },
    { columnDef: 'Rate', header: 'Rate' },
    // { columnDef: 'Status', header: 'Status' },
    { columnDef: 'Remarks', header: 'Remarks' }
    
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
    private stgapproveService:StgApproveService
  ) {}

  async ngOnInit() {
    this.loginDetails = this.helper.getItem('loginDetails');
    this.dateRangeForm = this.fb.group({
      fromDate: [new Date(), Validators.required],
      VehicleNo:['']
    });
   // this.dataSource.data = this.dummyData;
    await this.loadVehicleNumbers();
    this.GetStgList(null,null);
 
  }
  GetStgList(FromDate:any,ToDate:any){
    const currentDate = new Date();
    let bodyData:IStgSelect = {
      FromDate:FromDate==null?formatDate(currentDate, 'yyyy-MM-dd', 'en-US'): FromDate,
      ToDate:ToDate==null?formatDate(currentDate, 'yyyy-MM-dd', 'en-US'): FromDate,
      TenantId:this.loginDetails.TenantId,
      VehicleNo: this.dateRangeForm.value.VehicleNo
    }
    const categoryListService = this.stgService.GetStg(bodyData).subscribe((res:any)=>{
      console.log(res,'approve');
      this.dataSource.data = res.STGDetails;
      this.dataSource.data.forEach(row => this.selection.select(row));
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
    this.GetStgList( this.dateRangeForm.value.fromDate.format('yyyy-MM-DD'), this.dateRangeForm.value.fromDate.format('yyyy-MM-DD'));
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
    const selectedObjects: any[] = [];
    let totalFirstWeight = 0;
    let totalDeduction = 0;
    let totalFinalWeight = 0;
    
    // Iterate through the selected items
    this.selection.selected.forEach(selectedItem => {
        // Create the selected object based on the selected item
        const selectedObject = {
            IsApprove: true, // Set the IsApprove property to true
            CollectionId: selectedItem.CollectionId, // Assuming CollectionId is present in your data
            Status: selectedItem.Status // Assuming Status is present in your data
        };
        
        // Push the selected object to the array
        selectedObjects.push(selectedObject);

        // Calculate totals
        totalFirstWeight += selectedItem.FirstWeight;
        totalDeduction += selectedItem.Deduction;
        totalFinalWeight += selectedItem.FinalWeight;
    });
    
    // Log the array of selected objects
    console.log(selectedObjects);
    
    // Create the data object to be saved
    let data: IstgApprove = {
        TotalFirstWeight: totalFirstWeight,
        TotalWetLeaf: 0,
        TotalLongLeaf: 0,
        TotalDeduction: totalDeduction,
        TotalFinalWeight: totalFinalWeight,
        TenantId: this.loginDetails.TenantId,
        CreatedBy: this.loginDetails.UserId,
        ApproveList: selectedObjects
    };

    console.log(data, "Data to save");

    // Perform any additional actions with the data object as needed
    // this.SaveStgtData(data);
    // this.GetStgList(null,null);
}
  
  SaveStgtData(clientBody: IstgApprove) {
    this.stgapproveService.SaveStgApprove(clientBody)
        .pipe(
            takeUntil(this.destroy$),
            catchError(error => {
                console.error('Error:', error);
                this.toastr.error('An error occurred', 'ERROR');
                throw error;
            })
        )
        .subscribe((res: any) => {
            //console.log(res);
            this.toastr.success(res.Message, 'SUCCESS');
        
      
       
        });
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

VehicleInput(value:string){
  let newVal = value.toUpperCase();
  this.dateRangeForm.controls['VehicleNo'].setValue(newVal);
}

getTotalCost(columnName: string): number {
  return this.selection.selected.reduce((acc, curr) => acc + curr[columnName], 0);
}

}
