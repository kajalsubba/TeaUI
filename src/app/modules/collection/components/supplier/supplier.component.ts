import { DatePipe, formatDate } from '@angular/common';
import {
  AfterViewInit,
  Component,
  HostListener,
  OnInit,
  ViewChild,
} from '@angular/core';
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
import { ISupplierSelect } from '../../interfaces/isupplier';
import { SupplierService } from '../../services/supplier.service';
import { ImageViewerComponent } from 'src/app/shared/components/image-viewer/image-viewer.component';

@Component({
  selector: 'app-supplier',
  templateUrl: './supplier.component.html',
  styleUrls: ['./supplier.component.scss'],
})
export class SupplierComponent implements OnInit {
  displayedColumns: string[] = [
    'CollectionId',
    'CollectionDate',
    'ClientName',
    'VehicleNo',
    'FactoryName',
    'AccountName',
    'FineLeaf',
    'ChallanWeight',
    'Rate',
    'GrossAmount',
    'Remarks',
    'TripName',
    'Status',
    'actions',
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
    { columnDef: 'TripName', header: 'TripName ' },
    // { columnDef: 'Status', header: 'Status ' }
  ];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  private subscriptions: Subscription[] = [];
  loginDetails: any;
  dateRangeForm!: FormGroup;
  minToDate!: any;
  vehicleNumbers: any[] = [];
  TripList: any[] = [];
  private destroy$ = new Subject<void>();
  selectedRowIndex: number = -1;

  constructor(
    private dialog: MatDialog,
    private toastr: ToastrService,
    private helper: HelperService,
    private datePipe: DatePipe,
    private autocompleteService: AutoCompleteService,
    private fb: FormBuilder,
    private stgService: StgService,
    private supplierService: SupplierService
  ) { }

  ngOnInit(): void {
    this.loginDetails = this.helper.getItem('loginDetails');
    this.dateRangeForm = this.fb.group({
      fromDate: [new Date(), Validators.required],
      toDate: [new Date(), [Validators.required]],
      VehicleNo: [''],
      TripId: [''],
    });
    // this.dataSource.data = this.dummyData;

    // this.GetSupplierList(null,null);
    this.loadVehicleNumbers();
    this.GeTript();
  }

  ngAfterViewInit() {
    console.log(this.loginDetails);

    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  GetSupplierList() {
    const currentDate = new Date();
    let bodyData: ISupplierSelect = {
      FromDate:formatDate(this.dateRangeForm.value.fromDate, 'yyyy-MM-dd', 'en-US'),
      ToDate:formatDate(this.dateRangeForm.value.toDate, 'yyyy-MM-dd', 'en-US'),
      TenantId: this.loginDetails.TenantId,
      VehicleNo: this.dateRangeForm.value.VehicleNo,
      ClientId:0,
      Status: '',
      TripId: 0,
      CreatedBy:
        this.loginDetails.LoginType == 'Client' ? this.loginDetails.UserId : 0,
    };
    const categoryListService = this.supplierService
      .GetSupplierData(bodyData)
      .subscribe((res: any) => {
        // console.log(res);
        this.dataSource.data = res.SupplierDetails;
      });
    this.subscriptions.push(categoryListService);
  }

  addSupplier() {
    const dialogRef = this.dialog.open(AddEditSupplierComponent, {
      width: '80%',
      data: {
        title: 'Leaf Entry Form',
        buttonName: 'Save',
      },
      disableClose: true,
    });
    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
  
        this.GetSupplierList();

      }
    });
  }

  editItem(element: any) {
    const dialogRef = this.dialog.open(AddEditSupplierComponent, {
      width: '80%',
      data: {
        title: 'Update Supplier',
        buttonName: 'Update',
        value: element,
      },
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        this.GetSupplierList();

      }
    });
  }

  deleteItem(element: any) { }

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

  search() {
  
    this.GetSupplierList();
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

  setStatus(status: string, row: any) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '30%',
      data: {
        title: 'Confirmation',
        message: `Do you want to make the status as <b [ngClass]="{
          'text-danger': status === 'Rejected',
          'text-warning': status === 'Pending',
          'text-success': status === 'Approved'
        }">${status}</b> ?`,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        row.status = status;
      }
    });
  }

  getTotalCost(columnName: string): number {
    // return this.dataSource.filteredData.reduce(
    //   (acc, curr) => acc + curr[columnName],
    //   0
    // );
    return this.dataSource.filteredData.filter((x: any) => x.Status != 'Rejected').reduce((acc, curr) => acc + curr[columnName], 0);
 
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

  // Autocomplete function
  filterVehicleNumbers(value: string): any {
    const filterValue = value.toLowerCase();
    return this.vehicleNumbers.filter((x: any) =>
      x?.VehicleNo?.toLowerCase()?.includes(filterValue)
    );
  }

  displayWithFn(value: string): string {
    return value || '';
  }

  VehicleInput(value: string) {
    let newVal = value.toUpperCase();
    this.dateRangeForm.controls['VehicleNo'].setValue(newVal);
  }
  openImage(imageUrl: any) {
    const dialogRef = this.dialog.open(ImageViewerComponent, {
      width: '80vw',
      height: '95%',
      disableClose: true,
      data: {
        title: 'Image Viewer',
        imageUrl: imageUrl,
      },
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
}
