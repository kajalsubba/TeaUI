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
    'GrossAmount',
    'Remarks',
    'TripName',
    'CreatedBy',
    'CreatedDate',
    'Status',
    'actions'
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
    { columnDef: 'CreatedBy', header: 'Created By' },
    { columnDef: 'CreatedDate', header: 'Created DateTime' },
    // { columnDef: 'Status', header: 'Status ' }
  ];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  private subscriptions: Subscription[] = [];
  loginDetails: any;
  dateRangeForm!: FormGroup;
  ClientNames: any[] = [];
  minToDate!: any;
  vehicleNumbers: any[] = [];
  statusList: string[] = ['All', 'Pending', 'Rejected', 'Approved']
  selectedRowIndex: number = -1;
  factoryNames: any[] = [];
  private destroy$ = new Subject<void>();
  UserList: any[]=[];

  constructor(
    private dialog: MatDialog,
    private helper: HelperService,
    private datePipe: DatePipe,
    private toastr: ToastrService,
    private autocompleteService: AutoCompleteService,
    private fb: FormBuilder,
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
      UserId:[0],
      FactoryName:[''],
      FactoryId: [0],
    });

    await this.loadClientNames();
    await this.GetUserList();
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
  GetFactory  (event: MatDatepickerInputEvent<Date>): void {
    this.loadSaleFactoryNames();
  }

  async loadSaleFactoryNames() {
    try {
      const bodyData: IGetSaleFactory = {
        TenantId: this.loginDetails.TenantId,
        FromDate: formatDate(this.dateRangeForm.value.fromDate, 'yyyy-MM-dd', 'en-US'),
        ToDate:formatDate(this.dateRangeForm.value.toDate, 'yyyy-MM-dd', 'en-US'),
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
    this.dateRangeForm.controls['toDate'].setValue(null);
    this.minToDate = event.value
  }

  GetSupplierList() {

    let bodyData: ISupplierSelect = {
      FromDate: formatDate(this.dateRangeForm.value.fromDate, 'yyyy-MM-dd', 'en-US'),
      ToDate: formatDate(this.dateRangeForm.value.toDate, 'yyyy-MM-dd', 'en-US'),
      TenantId: this.loginDetails.TenantId,
      VehicleNo: '',
      ClientId:this.dateRangeForm.value.ClientId,
      Status: this.dateRangeForm.value.Status == 'All' ? '' : this.dateRangeForm.value.Status,
      TripId: 0, 
      FactoryId:this.dateRangeForm.value.FactoryId,
      CreatedBy: this.loginDetails.LoginType == 'Client' || this.loginDetails.RoleName != 'Admin'? this.loginDetails.UserId : this.dateRangeForm.value.UserId,
    }
    const categoryListService = this.supplierService.GetSupplierData(bodyData).subscribe((res: any) => {
      // console.log(res);
      this.dataSource.data = res.SupplierDetails;
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

}
