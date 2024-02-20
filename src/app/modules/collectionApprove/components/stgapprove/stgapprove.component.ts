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
import { SaleEntryComponent } from 'src/app/shared/components/sale-entry/sale-entry.component';

@Component({
  selector: 'app-stgapprove',
  templateUrl: './stgapprove.component.html',
  styleUrls: ['./stgapprove.component.scss'],
})
export class StgapproveComponent implements OnInit, AfterViewInit {
  displayedColumns: string[] = [
    'select',
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
    'TripName',
    'Status',
  ];
  //  dataList:any=[];
  dataSource = new MatTableDataSource<any>();
  selection = new SelectionModel<any>(true, []);
  filteredData: any[] = [];
  columns: { columnDef: string; header: string }[] = [
    // { columnDef: 'CollectionDate', header: 'Collection Date' },
    { columnDef: 'VehicleNo', header: 'Vehicle NO.' },
    { columnDef: 'ClientName', header: 'Client Name' },
    // { columnDef: 'FirstWeight', header: 'First Weight(Kg)' },
    { columnDef: 'WetLeaf', header: 'Wet Leaf (%)' },
    //{ columnDef: 'WetLeafKg', header: 'Wet Leaf (KG)' },
    { columnDef: 'LongLeaf', header: 'Long Leaf (%)' },
    //    { columnDef: 'LongLeafKg', header: 'Long Leaf (KG)' },
    // { columnDef: 'Deduction', header: 'Deduction' },
    // { columnDef: 'FinalWeight', header: 'Final Weight' },
    { columnDef: 'GradeName', header: 'Grade' },
    { columnDef: 'Rate', header: 'Rate' },
    { columnDef: 'GrossAmount', header: 'Gross Amount' },
    // { columnDef: 'Status', header: 'Status' },
    { columnDef: 'Remarks', header: 'Remarks' },
    { columnDef: 'TripName', header: 'Trip' },
  ];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  private subscriptions: Subscription[] = [];
  private destroy$ = new Subject<void>();
  loginDetails: any;
  dateRangeForm!: FormGroup;
  minToDate!: any;
  vehicleNumbers: any[] = [];
  TripList: any[] = [];

  constructor(
    private dialog: MatDialog,
    private toastr: ToastrService,
    private helper: HelperService,
    private datePipe: DatePipe,
    private fb: FormBuilder,
    private autocompleteService: AutoCompleteService,
    private stgService: StgService,
    private stgapproveService: StgApproveService
  ) {}

  async ngOnInit() {
    this.loginDetails = this.helper.getItem('loginDetails');
    this.dateRangeForm = this.fb.group({
      fromDate: [new Date(), Validators.required],
      VehicleNo: ['', Validators.required],
      VehicleId: [''],
      TripId:[null]
    });
    // this.dataSource.data = this.dummyData;
    await this.loadVehicleNumbers();
    this.GeTript();
    // this.GetStgList(null,null);
  }

  selectVehicle(number: any) {
    this.dateRangeForm.controls['VehicleId'].setValue(number?.VehicleId);
  }

  GetStgList(FromDate: any, ToDate: any) {
    
    const currentDate = new Date();
    let bodyData: IStgSelect = {
      FromDate:
        FromDate == null
          ? formatDate(currentDate, 'yyyy-MM-dd', 'en-US')
          : FromDate,
      ToDate:
        ToDate == null
          ? formatDate(currentDate, 'yyyy-MM-dd', 'en-US')
          : FromDate,
      TenantId: this.loginDetails.TenantId,
      VehicleNo: this.dateRangeForm.value.VehicleNo,
      Status: '',
      TripId:this.dateRangeForm.value.TripId,
    };
    const categoryListService = this.stgService
      .GetStg(bodyData)
      .subscribe((res: any) => {
        //  console.log(res,'approve');
        //  const result=res.STGDetails.filter((x:any)=>x.Status=='Pending');
        this.dataSource.data = res.STGDetails.filter(
          (x: any) => x.Status == 'Pending'
        );
        this.dataSource.data.forEach((row) => this.selection.select(row));
      });
    this.subscriptions.push(categoryListService);
  }

  ngAfterViewInit() {
    console.log(this.loginDetails);

    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  search() {
    this.selection.clear();
    if (this.dateRangeForm.invalid) {
      this.dateRangeForm.markAllAsTouched();
      return;
    }

    this.GetStgList(
      formatDate(this.dateRangeForm.value.fromDate, 'yyyy-MM-dd', 'en-US'),
      formatDate(this.dateRangeForm.value.fromDate, 'yyyy-MM-dd', 'en-US')
    );
  }

  clearFilter() {}

  fromDateChange(e: any) {}

  editItem(e: any) {}

  deleteItem(e: any) {}

  setStatus(e: any) {}

  approveEntry() {
   
    const selectedObjects: any[] = [];
    const selectedObjects1: any[] = [];
    var ApproveList: any[] = [];

    let totalFirstWeight = 0;
    let totalWetLeaf = 0;
    let totalLongLeaf = 0;
    let totalDeduction = 0;
    let totalFinalWeight = 0;

    // Iterate through the selected items
    this.selection.selected.forEach((selectedItem) => {
      // Create the selected object based on the selected item
      
      const selectedObject = {
        IsApprove: true, // Set the IsApprove property to true
        CollectionId: selectedItem.CollectionId, // Assuming CollectionId is present in your data
        Status: selectedItem.Status, // Assuming Status is present in your data
      };
      // Push the selected object to the array
      selectedObjects.push(selectedObject);
      // Calculate totals
      totalFirstWeight += selectedItem.FirstWeight;
      totalWetLeaf += selectedItem.WetLeafKg;
      totalLongLeaf += selectedItem.LongLeafKg;
      totalDeduction += selectedItem.Deduction;
      totalFinalWeight += selectedItem.FinalWeight;
    });

    this.dataSource.data.forEach((selectedItem) => {
      // Create the selected object based on the selected item
      const selectedObject1 = {
        IsApprove: false, // Set the IsApprove property to true
        CollectionId: selectedItem.CollectionId, // Assuming CollectionId is present in your data
        Status: selectedItem.Status, // Assuming Status is present in your data
      };
      // Push the selected object to the array
      selectedObjects1.push(selectedObject1);
    });
    let result = selectedObjects1.filter(
      (o1) => !selectedObjects.some((o2) => o1.CollectionId === o2.CollectionId)
    );
    ApproveList = [...selectedObjects, ...result];

    // Log the array of selected objects

    // Create the data object to be saved
    let data: IstgApprove = {
      TotalFirstWeight: totalFirstWeight,
      TotalWetLeaf: totalWetLeaf,
      TotalLongLeaf: totalLongLeaf,
      TotalDeduction: totalDeduction,
      TotalFinalWeight: totalFinalWeight,
      TenantId: this.loginDetails.TenantId,
      CreatedBy: this.loginDetails.UserId,
      ApproveList: ApproveList,
    };

    //console.log(data, "Data to save");
    //this.dataList=this.dataSource.data;
    // Perform any additional actions with the data object as needed
    if (this.dataSource.data.length > 0) {
      this.SaveStgtData(data);
    }
  }

  SaveStgtData(clientBody: IstgApprove) {
    this.stgapproveService
      .SaveStgApprove(clientBody)
      .pipe(
        takeUntil(this.destroy$),
        catchError((error) => {
          console.error('Error:', error);
          this.toastr.error('An error occurred', 'ERROR');
          throw error;
        })
      )
      .subscribe((res: any) => {
         this.saleEntry(res, this.selection.selected);
     
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
        TenantId: this.loginDetails.TenantId,
      };

      const res: any = await this.autocompleteService
        .GetVehicleNumbers(bodyData)
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
    return this.vehicleNumbers.filter((x: any) =>
      x?.VehicleNo?.toLowerCase()?.includes(filterValue)
    );
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
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${
      row.position + 1
    }`;
  }

  VehicleInput(value: string) {
    let newVal = value.toUpperCase();
    this.dateRangeForm.controls['VehicleNo'].setValue(newVal);
  }

  getTotalCost(columnName: string): number {
    return this.selection.selected.reduce(
      (acc, curr) => acc + curr[columnName],
      0
    );
  }

  saleEntry(response: any, approveData: any) {
    const dialogRef = this.dialog.open(SaleEntryComponent, {
      width: '90vw',
      height: '95%',
      disableClose: true,
      data: {
        title: 'Sale Entry Form-STG',
        approveId: response.Id,
        approveData: approveData,
        VehicleNo: this.dateRangeForm.value.VehicleNo,
        VehicleId: this.dateRangeForm.value.VehicleId,
        CollectionDate: this.dateRangeForm.value.fromDate,
        saleTypeId: 1,
      },
    });
    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        this.GetStgList(   formatDate(this.dateRangeForm.value.fromDate, 'yyyy-MM-dd', 'en-US'),   formatDate(this.dateRangeForm.value.fromDate, 'yyyy-MM-dd', 'en-US'));
        this.selection = new SelectionModel<any>(true, []);
      }
    });
  }

  GeTript() {
    const gradeGetService = this.stgService.GetTrip().subscribe((res: any) => {
      this.TripList = res.TripDetails;
      this.dateRangeForm.controls['TripId'].setValue(this.TripList[0].TripId);
    });

    this.subscriptions.push(gradeGetService);
  }
}
