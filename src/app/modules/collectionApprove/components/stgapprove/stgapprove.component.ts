import { SelectionModel } from '@angular/cdk/collections';
import { DatePipe, formatDate } from '@angular/common';
import { AfterViewInit, Component, HostListener, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ToastrService } from 'ngx-toastr';
import { Subject, Subscription, catchError, takeUntil } from 'rxjs';
import { HelperService } from 'src/app/core/services/helper.service';
import { IStgSelect } from 'src/app/modules/collection/interfaces/istg';
import { StgService } from 'src/app/modules/collection/services/stg.service';
import { IStgVehicle, IstgApprove } from '../../interfaces/istg-approve';
import { StgApproveService } from '../../services/stg-approve.service';
import { SaleEntryComponent } from 'src/app/shared/components/sale-entry/sale-entry.component';
import { MatCalendarCellClassFunction } from '@angular/material/datepicker';
import { NotificationDataService } from 'src/app/modules/layout/services/notification-data.service';
import { IGetNotifications } from 'src/app/modules/layout/interfaces/iget-notifications';

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
    'GradeName',
    'FirstWeight',
    'WetLeaf',
    'WetLeafKg',
    'LongLeaf',
    'LongLeafKg',
    'Deduction',
    'FinalWeight',
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

    { columnDef: 'VehicleNo', header: 'Vehicle NO.' },
    { columnDef: 'ClientName', header: 'Client Name' },
    // { columnDef: 'GradeName', header: 'Grade' },
    { columnDef: 'WetLeaf', header: 'Wet Leaf (%)' },
    { columnDef: 'LongLeaf', header: 'Long Leaf (%)' },
    { columnDef: 'Rate', header: 'Rate' },
    { columnDef: 'GrossAmount', header: 'Gross Amount' },
    { columnDef: 'Remarks', header: 'Remarks' },
    { columnDef: 'TripName', header: 'Trip' },
  ];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  private subscriptions: Subscription[] = [];
  private destroy$ = new Subject<void>();
  loginDetails: any;
  today: Date = new Date();
  dateRangeForm!: FormGroup;
  minToDate!: any;
  vehicleNumbers: any[] = [];
  TripList: any[] = [];
  selectedRowIndex: number = -1;
  CollectionDates: any[] = [];
  GradeSummary: any = "Grade Summary";
  constructor(
    private dialog: MatDialog,
    private toastr: ToastrService,
    private helper: HelperService,
    private datePipe: DatePipe,
    private fb: FormBuilder,
    //private autocompleteService: AutoCompleteService,
    private stgService: StgService,
    private stgapproveService: StgApproveService,
    private notificationDataService: NotificationDataService
  ) { }

  async ngOnInit() {
    this.loginDetails = this.helper.getItem('loginDetails');
    this.dateRangeForm = this.fb.group({
      fromDate: [new Date(), Validators.required],
      VehicleNo: ['', Validators.required],
      VehicleId: [''],
      TripId: [null]
    });
    // this.dataSource.data = this.dummyData;
    await this.loadVehicleNumbers(formatDate(this.dateRangeForm.value.fromDate, 'yyyy-MM-dd', 'en-US'));
    this.GeTript();
    this.getPendingCollectionDates();
    // this.GetStgList(null,null);
  }

  selectVehicle(number: any) {
    this.dateRangeForm.controls['VehicleId'].setValue(number?.VehicleId);
  }

  getPendingCollectionDates() {
    let data = {
      TenantId: this.loginDetails.TenantId,
    }

    const getPendingCollectionDate = this.stgapproveService.GetStgPendingDate(data).subscribe((res: any) => {
      this.CollectionDates = res.PendingDate;

      //     console.log(this.CollectionDates, 'this.CollectionDates');

    });
    this.subscriptions.push(getPendingCollectionDate)
  }
  RefreshNotifications(): void {
    const data: IGetNotifications = {
      TenantId: this.loginDetails.TenantId,
    };
    this.notificationDataService.getNotificationData(data);
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
      ClientId: 0,
      GradeId: 0,
      TripId: this.dateRangeForm.value.TripId,
      CreatedBy: 0,
    };
    const categoryListService = this.stgService
      .GetStg(bodyData)
      .subscribe((res: any) => {
        //  const result=res.STGDetails.filter((x:any)=>x.Status=='Pending');
        this.dataSource.data = res.STGDetails.filter(
          (x: any) => x.Status == 'Pending'
        );
        this.dataSource.data.forEach((row) => this.selection.select(row));

        interface GroupedData {
          [key: string]: number;
        }

        const groupedData: GroupedData = this.dataSource.data.reduce((acc, item) => {
          if (acc[item.GradeName]) {
            acc[item.GradeName] += item.FinalWeight;
          } else {
            acc[item.GradeName] = item.FinalWeight;
          }
          return acc;
        }, {} as GroupedData);

        let groupedDataString = JSON.stringify(groupedData);

        // Remove the curly braces
        groupedDataString = groupedDataString.slice(1, -1);

        // Remove the double quotes
        groupedDataString = groupedDataString.replace(/\"/g, '');
        this.GradeSummary = groupedDataString;
        console.log(groupedDataString, 'groupedDataString');
      });
    this.subscriptions.push(categoryListService);
  }


  ngAfterViewInit() {

    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  search() {
    this.selection.clear();
    if (this.dateRangeForm.invalid) {
      this.dateRangeForm.markAllAsTouched();
      this.toastr.error("Please fill the Mandatory fields !", "WARNING")
      return;
    }

    this.GetStgList(
      formatDate(this.dateRangeForm.value.fromDate, 'yyyy-MM-dd', 'en-US'),
      formatDate(this.dateRangeForm.value.fromDate, 'yyyy-MM-dd', 'en-US')
    );
  }

  clearFilter() { }

  async fromDateChange(event: any) {

    await this.loadVehicleNumbers(this.datePipe.transform(event.value, 'yyyy-MM-dd'));
  }

  editItem(e: any) { }

  deleteItem(e: any) { }

  setStatus(e: any) { }

  approveEntry() {

    debugger
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


    if (this.dataSource.data.length > 0) {
      // this.SaveStgtData(data);

      this.saleEntry(data, this.selection.selected);
    }
  }



  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  async loadVehicleNumbers(CollectionDate: any) {
    try {
      const bodyData: IStgVehicle = {
        TenantId: this.loginDetails.TenantId,
        FromDate: CollectionDate
      };

      const res: any = await this.stgapproveService
        .GetStgVehicle(bodyData)
        .pipe(takeUntil(this.destroy$))
        .toPromise();

      this.vehicleNumbers = res.StgVehicleData;
      this.dateRangeForm.controls['VehicleNo'].reset();
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
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.position + 1
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

  saleEntry(StgData: any, approveData: any) {
    debugger
    const dialogRef = this.dialog.open(SaleEntryComponent, {
      width: '90vw',
      height: '95%',
      minWidth: '90vw',
      disableClose: true,
      data: {
        title: 'Sale Entry Form-STG',
        stgData: StgData,
        approveData: approveData,
        VehicleNo: this.dateRangeForm.value.VehicleNo,
        VehicleId: this.dateRangeForm.value.VehicleId,
        CollectionDate: this.dateRangeForm.value.fromDate,
        FactoryName: this.selection.selected[0].FactoryName,
        FactoryId: approveData[0].FactoryId,
        AccountId: approveData[0].AccountId,
        ChallanWeight: approveData[0].ChallanWeight,
        FineLeaf: approveData[0].FineLeaf,
        saleTypeId: 1,
        Comments: approveData[0].Comment
      },
    });
    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        this.GetStgList(formatDate(this.dateRangeForm.value.fromDate, 'yyyy-MM-dd', 'en-US'), formatDate(this.dateRangeForm.value.fromDate, 'yyyy-MM-dd', 'en-US'));
        this.selection = new SelectionModel<any>(true, []);
        this.RefreshNotifications();
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

  dateClass: MatCalendarCellClassFunction<Date> = (cellDate) => {
    const cellDateISOString = this.datePipe.transform(cellDate, "yyyy-MM-dd");
    console.log(cellDateISOString, 'cellDateISOString');
    const isPendingDate = this.CollectionDates.some(item => item.CollectionDate == cellDateISOString);
    return isPendingDate ? 'highlight-date' : '';
  };

}
