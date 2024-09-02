import { DatePipe, formatDate, registerLocaleData } from '@angular/common';
import { Component, HostListener, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ToastrService } from 'ngx-toastr';
import { Subject, Subscription, takeUntil } from 'rxjs';
import { HelperService } from 'src/app/core/services/helper.service';
import { IGetTeaClient } from 'src/app/modules/collection/interfaces/istg';
import { ISupplierSelect } from 'src/app/modules/collection/interfaces/isupplier';
import { AddEditSupplierComponent } from 'src/app/modules/collection/models/add-edit-supplier/add-edit-supplier.component';
import { AutoCompleteService } from 'src/app/modules/collection/services/auto-complete.service';
import { StgService } from 'src/app/modules/collection/services/stg.service';
import { SupplierService } from 'src/app/modules/collection/services/supplier.service';
import { IGetGrade } from 'src/app/modules/masters/interfaces/IGrade';
import enIN from '@angular/common/locales/en-IN';
import { IGetUser } from 'src/app/modules/user-management/interfaces/iuser';
import { UserService } from 'src/app/modules/user-management/services/user.service';
import { StgApproveService } from 'src/app/modules/collectionApprove/services/stg-approve.service';
import { IGetSaleFactory } from 'src/app/modules/masters/interfaces/IFactory';
import { ExcelExportService } from '../../../../shared/services/excel-export.service';
registerLocaleData(enIN);
@Component({
  selector: 'app-supplier-history',
  templateUrl: './supplier-history.component.html',
  styleUrls: ['./supplier-history.component.scss']
})
export class SupplierHistoryComponent {

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
    'RateStatus'
 
  ];

  dataSource = new MatTableDataSource<any>();
  filteredData: any[] = [];
  columns: { columnDef: string; header: string }[] = [
    { columnDef: 'CollectionId', header: 'Id ' },
    { columnDef: 'ClientName', header: 'Client Name' },
    { columnDef: 'FactoryName', header: 'Factory' },
    { columnDef: 'AccountName', header: 'Account Name' },
    { columnDef: 'Remarks', header: 'Remark' },
    { columnDef: 'TripName', header: 'TripName ' },
    { columnDef: 'CreatedBy', header: 'Created By' },
    { columnDef: 'CreatedDate', header: 'Created DateTime' },
    { columnDef: 'ModifyBy', header: 'Modify By' },
    { columnDef: 'ModifyDate', header: 'Modify DateTime' },
    // { columnDef: 'Status', header: 'Status ' }
  ];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  private subscriptions: Subscription[] = [];
  loginDetails: any;
  dateRangeForm!: FormGroup;
  ClientNames: any[] = [];
  hideSaleRateColumn: boolean = true;
  minToDate!: any;
  AverageRate: number = 0;
  vehicleNumbers: any[] = [];
  statusList: string[] = ['All', 'Pending', 'Rejected', 'Approved']
  selectedRowIndex: number = -1;
  factoryNames: any[] = [];
  private destroy$ = new Subject<void>();
  UserList: any[] = [];
  TotalVehicleCount: number = 0;

  constructor(
    private dialog: MatDialog,
    private helper: HelperService,
    private datePipe: DatePipe,
    private toastr: ToastrService,
    private autocompleteService: AutoCompleteService,
    private fb: FormBuilder,
    private excelService: ExcelExportService,
    private stgService: StgService,
    private userService: UserService,
    private supplierService: SupplierService,
    private saleService: StgApproveService

  ) { }

  async ngOnInit() {
    this.loginDetails = this.helper.getItem('loginDetails');
    this.dateRangeForm = this.fb.group({
      fromDate: [new Date(), Validators.required],
      toDate: [new Date(), [Validators.required]],
      //  VehicleNo: [''],
      ClientName: [],
      ClientId: [0],
      Status: [''],
      UserId: [0],
      FactoryName: [''],
      FactoryId: [0],
    });

    await this.loadClientNames();
    await this.GetUserList();
    if (this.loginDetails.LoginType == 'Client') {
      this.dateRangeForm.controls['ClientName'].disable({ onlySelf: true });
      this.dateRangeForm.controls['FactoryName'].disable({ onlySelf: true });
    }
    if (this.loginDetails.LoginType == 'Client') {
      this.hideSaleRateColumn = true;
      // Remove 'SaleRate' from displayedColumns if it's hidden
      this.displayedColumns = this.displayedColumns.filter(col => col !== 'SaleRate');
      this.displayedColumns.push('GrossAmount', 'Remarks', 'TripName', 'CreatedBy', 'CreatedDate',
        'ModifyBy', 'ModifyDate', 'Status', 'actions');

    } else {
      this.hideSaleRateColumn = false;
      // Add 'SaleRate' to displayedColumns if it's not hidden
      if (!this.displayedColumns.includes('SaleRate')) {
        this.displayedColumns.push('SaleRate', 'GrossAmount', 'Remarks', 'TripName', 'CreatedBy', 'CreatedDate',
          'ModifyBy', 'ModifyDate', 'Status', 'actions');
        //  this.displayedColumns.push('SaleRate');
      }
    }

  }
  filterFactoryNames(value: string): any {
    // if (value!="")
    //   {
    const filterValue = value.toLowerCase();
    return this.factoryNames.filter((x: any) =>
      x?.FactoryName?.toLowerCase()?.includes(filterValue)
    );
    //  }

  }
  async loadClientNames() {
    try {
      const bodyData: IGetTeaClient = {
        TenantId: this.loginDetails.TenantId,
        Category: 'Supplier'

      };

      const res: any = await this.autocompleteService.GetClientNames(bodyData)
        .pipe(takeUntil(this.destroy$))
        .toPromise();


      this.ClientNames = res.ClientDetails;

    } catch (error) {
      console.error('Error:', error);
      this.toastr.error('Something went wrong.', 'ERROR');
    }
  }

  filterClientNames(value: string): any[] {

    const filterValue = value.toLowerCase();
    return this.ClientNames.filter((x: any) => x?.ClientName?.toLowerCase()?.includes(filterValue));
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  onFactoryInputChange(event: Event) {
    const input = event.target as HTMLInputElement;
    // Do something when input changes
    console.log(input.value, 'presss');
    if (input.value == '') {

      this.dateRangeForm.controls['FactoryId'].reset();
      this.dateRangeForm.controls['FactoryName'].reset();


    }

  }
  GetFactory(event: MatDatepickerInputEvent<Date>): void {
    this.loadSaleFactoryNames();
  }

  async loadSaleFactoryNames() {
    try {
      const bodyData: IGetSaleFactory = {
        TenantId: this.loginDetails.TenantId,
        FromDate: formatDate(this.dateRangeForm.value.fromDate, 'yyyy-MM-dd', 'en-US'),
        ToDate: formatDate(this.dateRangeForm.value.toDate, 'yyyy-MM-dd', 'en-US'),
      };

      const res: any = await this.saleService
        .GetSaleFactoryDetails(bodyData)
        .pipe(takeUntil(this.destroy$))
        .toPromise();

      this.factoryNames = res.SaleFactory;
    } catch (error) {
      console.error('Error:', error);
      this.toastr.error('Something went wrong.', 'ERROR');
    }
  }

  selectFactory(factory: any) {
    this.dateRangeForm.controls['FactoryId'].setValue(factory?.FactoryId);
    //this.accountNames = this.AccountList.filter((x: any) => x.FactoryId == factory.FactoryId)
  }
  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }
  selectClient(client: any) {
    if (client == '') {
      this.dateRangeForm.controls['ClientId'].reset();
    }

    this.dateRangeForm.controls['ClientId'].setValue(client?.ClientId);
  }
  onInputChange(event: Event) {
    const input = event.target as HTMLInputElement;
    // Do something when input changes
    console.log(input.value, 'presss');
    if (input.value == '') {

      this.dateRangeForm.controls['ClientId'].reset();


    }

  }
  fromDateChange(event: MatDatepickerInputEvent<Date>): void {
    // this.dateRangeForm.controls['toDate'].setValue(null);
    this.minToDate = event.value
  }

  GetSupplierList() {

    let bodyData: ISupplierSelect = {
      FromDate: formatDate(this.dateRangeForm.value.fromDate, 'yyyy-MM-dd', 'en-US'),
      ToDate: formatDate(this.dateRangeForm.value.toDate, 'yyyy-MM-dd', 'en-US'),
      TenantId: this.loginDetails.TenantId,
      VehicleNo: '',
      ClientId: this.dateRangeForm.value.ClientId,
      Status: this.dateRangeForm.value.Status == 'All' ? '' : this.dateRangeForm.value.Status,
      TripId: 0,
      FactoryId: this.dateRangeForm.value.FactoryId,
      CreatedBy: this.loginDetails.LoginType == 'Client' || this.loginDetails.RoleName != 'Admin' ? this.loginDetails.UserId : this.dateRangeForm.value.UserId,
    }
    const categoryListService = this.supplierService.GetSupplierData(bodyData).subscribe((res: any) => {
      // console.log(res);
      this.dataSource.data = res.SupplierDetails;

      const grossAmount: number = this.getTotalCost('GrossAmount');
      const finalWeight: number = this.getTotalCost('ChallanWeight');
      this.AverageRate = grossAmount / finalWeight;

      const uniqueCategories = this.dataSource.data.map(leaf => leaf.VehicleNo).length;

      this.TotalVehicleCount = uniqueCategories;
    });
    this.subscriptions.push(categoryListService);
  }

  async GetUserList() {
    let bodyData: IGetUser = {
      TenantId: this.loginDetails.TenantId,
    };
    const categoryListService = this.userService
      .GetUser(bodyData)
      .subscribe((res: any) => {
        // console.log(res);
        this.UserList = res.UserDetails;
      });
    this.subscriptions.push(categoryListService);
  }


  search() {


    this.GetSupplierList();
  }

  getTotalCost(columnName: string): number {
    return this.dataSource.filteredData.filter((x: any) => x.Status != 'Rejected').reduce((acc, curr) => acc + curr[columnName], 0);

  }

  getFineLeafAvg(columnName: string): number {
    // return this.dataSource.filteredData.filter((x: any) => x.Status != 'Rejected').reduce((acc, curr) => acc + curr[columnName], 0);
    const filteredData = this.dataSource.filteredData.filter((x: any) => x.Status != 'Rejected');

    // If there are no relevant entries, return zero
    if (filteredData.length === 0) {
      return 0;
    }

    // Sum up the values of the specified column
    const sum = filteredData.reduce((acc, curr) => acc + curr[columnName], 0);

    // Calculate the average
    const average = sum / filteredData.length;
    // Round the average to two decimal places and convert it back to a number
    const roundedAverage = Math.round(average);

    // Return the rounded average
    return roundedAverage;
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

  // Autocomplete function
  filterVehicleNumbers(value: string): any {
    const filterValue = value.toLowerCase();
    return this.vehicleNumbers.filter((x: any) => x?.VehicleNo?.toLowerCase()?.includes(filterValue));
  }

  displayWithFn(value: string): string {
    return value || '';
  }

  VehicleInput(value: string) {
    let newVal = value.toUpperCase();
    this.dateRangeForm.controls['VehicleNo'].setValue(newVal);
  }
  editItem(element?: any) {
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

  exportToExcel() {
    if (this.dataSource.data.length > 0) {
      // Get the table element
      const table = document.getElementById('material-table');

      if (table instanceof HTMLTableElement) { // Check if table is a HTMLTableElement
        // Remove unwanted columns
        const columnsToRemove = ['Id', 'Actions', 'Created By']; // Specify columns to remove
        columnsToRemove.forEach(col => {
          const columnIndex = Array.from(table.rows[0].cells).findIndex(cell => cell.textContent && cell.textContent.trim() === col);
          if (columnIndex !== -1) {
            Array.from(table.rows).forEach(row => {
              if (row.cells[columnIndex]) {
                row.deleteCell(columnIndex);
              }
            });
          }
        });

        this.excelService.exportToExcel('material-table', 'Supplier Leaf History');
      } else {
        console.error("Table element not found or not an HTML table.");
      }
    } else {
      this.toastr.warning("NO DATA TO EXPORT", "WARNING");
    }
  }


}
