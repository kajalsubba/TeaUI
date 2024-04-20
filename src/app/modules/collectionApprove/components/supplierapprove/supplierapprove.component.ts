import { SelectionModel } from '@angular/cdk/collections';
import { DatePipe, formatDate } from '@angular/common';
import { AfterViewInit, Component, HostListener, OnInit, ViewChild } from '@angular/core';
import { Subject, Subscription, catchError, takeUntil } from 'rxjs';
import { IGetGrade } from 'src/app/modules/masters/interfaces/IGrade';
import { _MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { HelperService } from 'src/app/core/services/helper.service';
import { AutoCompleteService } from 'src/app/modules/collection/services/auto-complete.service';
import { StgService } from 'src/app/modules/collection/services/stg.service';
import { StgApproveService } from '../../services/stg-approve.service';
import { IStgSelect } from 'src/app/modules/collection/interfaces/istg';
import { SupplierService } from 'src/app/modules/collection/services/supplier.service';
import { SupplierapproveService } from '../../services/supplierapprove.service';
import { ImageViewerComponent } from 'src/app/shared/components/image-viewer/image-viewer.component';
import { ISupplierVehicle, IsupplierApprove } from '../../interfaces/isupplier-approve';
import { ConfirmDialogComponent } from 'src/app/shared/components/confirm-dialog/confirm-dialog.component';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import { IDefaultData } from 'src/app/modules/collection/interfaces/isupplier';
import { ConfirmDialogRemarksComponent } from 'src/app/shared/components/confirm-dialog-remarks/confirm-dialog-remarks.component';

@Component({
  selector: 'app-supplierapprove',
  templateUrl: './supplierapprove.component.html',
  styleUrls: ['./supplierapprove.component.scss']
})
export class SupplierapproveComponent implements OnInit, AfterViewInit {
  displayedColumns: string[] = [
    // 'select',
    'actions',
    'CollectionDate',
    'VehicleNo',
    'ClientName',
    'FactoryName',
    'AccountName',
    'FineLeaf',
    'ChallanWeight',
    'Rate',
    'GrossAmount',
    'Remarks',
    // 'TripName',
    'CreatedBy',
    'CreatedDate',
    'Status'
  ];
  //  dataList:any=[];
  dataSource = new _MatTableDataSource<any>();
  selection = new SelectionModel<any>(true, []);
  filteredData: any[] = [];
  columns: { columnDef: string; header: string }[] = [
    { columnDef: 'CollectionDate', header: 'Collection Date' },
    { columnDef: 'VehicleNo', header: 'Vehicle NO.' },
    { columnDef: 'ClientName', header: 'Client Name' },
    { columnDef: 'FactoryName', header: 'Factory Name' },

    { columnDef: 'AccountName', header: 'Account Name' },

    { columnDef: 'FineLeaf', header: 'Fine Leaf (%)' },
    //  { columnDef: 'ChallanWeight', header: 'Challan Weight' },
    { columnDef: 'Rate', header: 'Rate' },
    { columnDef: 'GrossAmount', header: 'Gross Amount' },
    // { columnDef: 'Status', header: 'Status' },
    { columnDef: 'Remarks', header: 'Remarks' },
    //    { columnDef: 'TripName', header: 'Trip' },
    { columnDef: 'CreatedBy', header: 'Created By' },
    { columnDef: 'CreatedDate', header: 'Created Date' },
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
  selectedRowIndex: number = -1;
  constructor(
    private dialog: MatDialog,
    private toastr: ToastrService,
    private helper: HelperService,
    private datePipe: DatePipe,
    private fb: FormBuilder,
    // private autocompleteService: AutoCompleteService,
    private supplierService: SupplierService,
    private stgService: StgService,
    private stgapproveService: StgApproveService,
    private supplierApproveService: SupplierapproveService
  ) { }

  async ngOnInit() {
    this.loginDetails = this.helper.getItem('loginDetails');
    this.dateRangeForm = this.fb.group({
      fromDate: [new Date(), Validators.required],
      VehicleNo: [''],
      VehicleId: [''],
      TripId: [null]
    });

    await this.loadVehicleNumbers(formatDate(this.dateRangeForm.value.fromDate, 'yyyy-MM-dd', 'en-US'));
    this.GeTript();
    this.GetSupplierDefaultList();
  }

  selectVehicle(number: any) {
    this.dateRangeForm.controls['VehicleId'].setValue(number?.VehicleId);
  }

  GetSupplierDefaultList() {
    const currentDate = new Date();
    let bodyData: IDefaultData = {

      TenantId: this.loginDetails.TenantId,

      CreatedBy: 0
    };
    const supplierService = this.supplierService
      .GetSupplierDefaultData(bodyData)
      .subscribe((res: any) => {
        //  console.log(res,'approve');
        //  const result=res.STGDetails.filter((x:any)=>x.Status=='Pending');
        this.dataSource.data = res.SupplierDefaultData;
        this.dataSource.data.forEach((row) => this.selection.select(row));
      });
    this.subscriptions.push(supplierService);
  }

  GetSupplierList() {
    this.selection.clear()
    const currentDate = new Date();
    let bodyData: IStgSelect = {
      FromDate: formatDate(this.dateRangeForm.value.fromDate, 'yyyy-MM-dd', 'en-US'),
      ToDate: formatDate(this.dateRangeForm.value.fromDate, 'yyyy-MM-dd', 'en-US'),
      TenantId: this.loginDetails.TenantId,
      VehicleNo: this.dateRangeForm.value.VehicleNo,
      Status: 'Pending',
      ClientId: 0,
      TripId: this.dateRangeForm.value.TripId,
      CreatedBy: 0
    };
    const categoryListService = this.supplierService
      .GetSupplierData(bodyData)
      .subscribe((res: any) => {
        //  console.log(res,'approve');
        //  const result=res.STGDetails.filter((x:any)=>x.Status=='Pending');
        this.dataSource.data = res.SupplierDetails.filter(
          (x: any) => x.Status == 'Pending'
        );
        this.dataSource.data.forEach((row) => this.selection.select(row));
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
      return;
    }

    this.GetSupplierList();
  }

  clearFilter() { }

  async fromDateChange(event: MatDatepickerInputEvent<Date>) {

    await this.loadVehicleNumbers(this.datePipe.transform(event.value, 'yyyy-MM-dd'));
    // alert(this.datePipe.transform(event.value, 'yyyy-MM-dd'));

  }

  editItem(e: any) { }

  deleteItem(e: any) { }

  setStatus(e: any) { }



  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }
  RejectClick(row: any) {
    this.SaveFuntion(row, 'Reject');
  }

  ApproveClick(row: any) {
    this.SaveFuntion(row, 'Approve');
  }


  SaveFuntion(row: any, saleStatus: any) {
    let data: IsupplierApprove = {
      CollectionId: row.CollectionId,
      SaleStatus: saleStatus,
      CollectionDate: formatDate(row.CollDate, 'yyyy-MM-dd', 'en-US'),
      AccountId: row.AccountId,
      VehicleId: row.VehicleId,
      FineLeaf: row.FineLeaf,
      ChallanWeight: row.ChallanWeight,
      SaleTypeId: 2,
      TenantId: this.loginDetails.TenantId,
      CreatedBy: this.loginDetails.UserId
    };

    const dialogRef = this.dialog.open(ConfirmDialogRemarksComponent, {
      width: '30vw',
      minWidth: '25vw',
      disableClose: true,
      data: {
        title: 'Confirm Action',
        message: 'Do you want to Confirm !',
        data: data,

      },
    });
    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        this.SaveApproveData(data);


      }
    });


  }
  SaveApproveData(clientBody: IsupplierApprove) {
    this.supplierApproveService
      .SaveSupplierApprove(clientBody)
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
        // this.GetSupplierList(formatDate(this.dateRangeForm.value.fromDate, 'yyyy-MM-dd', 'en-US'),
        //   formatDate(this.dateRangeForm.value.fromDate, 'yyyy-MM-dd', 'en-US'));
        this.GetSupplierDefaultList();
      });
  }


  async loadVehicleNumbers(CollectionDate: any) {
    try {
      const bodyData: ISupplierVehicle = {
        FromDate: CollectionDate,
        TenantId: this.loginDetails.TenantId,
      };

      const res: any = await this.supplierApproveService
        .GetVehicleNumbers(bodyData)
        .pipe(takeUntil(this.destroy$))
        .toPromise();

      this.vehicleNumbers = res.SupplierVehicleData;
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

  // saleEntry(response: any, approveData: any) {
  //   const dialogRef = this.dialog.open(SaleEntryComponent, {
  //     width: '90vw',
  //     height: '95%',
  //     minWidth:'90vw',
  //     disableClose: true,
  //     data: {
  //       title: 'Sale Entry Form-SUPPLIER',
  //       approveId: response.Id,
  //       approveData: approveData,
  //       VehicleNo: this.dateRangeForm.value.VehicleNo,
  //       VehicleId: this.dateRangeForm.value.VehicleId,
  //       CollectionDate: this.dateRangeForm.value.fromDate,
  //       FactoryName:this.selection?.selected[0]?.FactoryName,
  //       FactoryId:this.selection?.selected[0]?.FactoryId,
  //       AccountId:this.selection?.selected[0]?.AccountId,
  //       ChallanWeight:this.selection?.selected[0]?.ChallanWeight,
  //       saleTypeId: 2,
  //     },
  //   });
  //   dialogRef.afterClosed().subscribe((result: any) => {
  //     if (result) {
  //       this.GetStgList(   formatDate(this.dateRangeForm.value.fromDate, 'yyyy-MM-dd', 'en-US'),   formatDate(this.dateRangeForm.value.fromDate, 'yyyy-MM-dd', 'en-US'));
  //       this.selection = new SelectionModel<any>(true, []);
  //     }
  //   });
  // }

  GeTript() {
    const gradeGetService = this.stgService.GetTrip().subscribe((res: any) => {
      this.TripList = res.TripDetails;
      this.dateRangeForm.controls['TripId'].setValue(this.TripList[0].TripId);
    });

    this.subscriptions.push(gradeGetService);
  }
  openImage(imageUrl: any) {
    const dialogRef = this.dialog.open(ImageViewerComponent, {
      width: "80vw",
      height: "95%",
      disableClose: true,
      data: {
        title: "Image Viewer",
        imageUrl: imageUrl
      }
    })
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
}
