import { DatePipe, formatDate, registerLocaleData } from '@angular/common';
import { Component, HostListener, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ToastrService } from 'ngx-toastr';
import { ReplaySubject, Subject, Subscription, takeUntil } from 'rxjs';
import { HelperService } from 'src/app/core/services/helper.service';
import { AutoCompleteService } from 'src/app/modules/collection/services/auto-complete.service';
import { IGetSale } from 'src/app/modules/collectionApprove/interfaces/isale-save';
import { StgApproveService } from 'src/app/modules/collectionApprove/services/stg-approve.service';
import { IFactoryFilter, IGetFactory, IGetSaleFactory } from 'src/app/modules/masters/interfaces/IFactory';
import { IAccountFilter, IGetFactoryAccount } from 'src/app/modules/masters/interfaces/IFactoryAccount';
import { IGetGrade } from 'src/app/modules/masters/interfaces/IGrade';
import { EditSaleEntryComponent } from 'src/app/shared/components/edit-sale-entry/edit-sale-entry.component';
import enIN from '@angular/common/locales/en-IN';
import { ExcelExportService } from '../../../../shared/services/excel-export.service';
import { MatSelect } from '@angular/material/select';
registerLocaleData(enIN);
@Component({
  selector: 'app-sale-history',
  templateUrl: './sale-history.component.html',
  styleUrls: ['./sale-history.component.scss'],
})
export class SaleHistoryComponent {
  displayedColumns: string[] = [
    'SaleId',
    'SaleDate',
    'FactoryName',
    'AccountName',
    'VehicleNo',
    'FieldWeight',
    'FineLeaf',
    'ChallanWeight',
    'Rate',
    'GrossAmount',
    'Incentive',
    'IncentiveAmount',
    'FinalAmount',
    'Remarks',
    'TypeName',
    'actions',
  ];

  @ViewChild('singleSelect', { static: true }) singleSelect!: MatSelect;
  public filteredFactory: ReplaySubject<IFactoryFilter[]> = new ReplaySubject<IFactoryFilter[]>(1);
  public filteredAccounts: ReplaySubject<IAccountFilter[]> = new ReplaySubject<IAccountFilter[]>(1);


  dataSource = new MatTableDataSource<any>();
  filteredData: any[] = [];
  columns: { columnDef: string; header: string }[] = [
    { columnDef: 'SaleId', header: 'Sale Id' },
    { columnDef: 'FactoryName', header: 'Factory Name' },
    { columnDef: 'AccountName', header: 'Account Name' },
    { columnDef: 'Incentive', header: 'Incentive (%)' },
    { columnDef: 'Remarks', header: 'Remarks' },
    { columnDef: 'TypeName', header: 'Sale Type' },
  ];

  loginDetails: any;
  SaleForm!: FormGroup;
  private destroy$ = new Subject<void>();
  vehicleNumbers: any[] = [];
  minToDate!: any;
  SaleStatementValidate: boolean = false;
  SaleStatementErrorMsg: string = '';
  private subscriptions: Subscription[] = [];
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  factoryNames: any[] = [];
  accountNames: any[] = [];
  AccountList: any = [];
  saleTypeList: any;
  selectedRowIndex: number = -1;
  AverageRate: number = 0;
  filteredFactories: any[] = [];
  TotalVehicleCount: number = 0;
  constructor(
    private helper: HelperService,
    private datePipe: DatePipe,
    private toastr: ToastrService,
    private autocompleteService: AutoCompleteService,
    private fb: FormBuilder,
    private excelService: ExcelExportService,
    private saleService: StgApproveService,
    private dialog: MatDialog,

  ) {

  }

  async ngOnInit() {
    this.loginDetails = this.helper.getItem('loginDetails');
    this.SaleForm = this.fb.group({
      fromDate: [new Date(), Validators.required],
      toDate: [new Date(), [Validators.required]],
      VehicleNo: [''],
      FactoryName: [''],
      FactoryId: [null],
      AccountName: [''],
      FineLeaf: [''],
      AccountId: [null],
      SaleTypeId: [null],
      FactoryFilterCrtl: [''],
      AccountFilterCrtl: ['']
    });

    await this.loadSaleFactoryNames();
    await this.loadAccountNames();
    this.GetSaleType();

    this.filteredFactory.next(this.factoryNames.slice());

    this.SaleForm.controls["FactoryFilterCrtl"].valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.filteredFactoryData();
      });


  }

  selectFactory(factory: any) {

    // debugger
    // if (factory) {
    //   this.SaleForm.controls['FactoryName'].setValue(factory);
    //    this.SaleForm.controls['FactoryFilterCrtl'].setValue(''); // Clear the filter value
    //     //this.filteredFactory.setValue('');
    // }this.SaleForm.value.AccountName.AccountId ?? 0,

    // this.SaleForm.controls['FactoryId'].setValue(factory?.FactoryId);
    console.log(factory, 'factory');
    // if (factory == undefined) {
    //   this.SaleForm.controls["AccountId"].setValue(0);
    // }

    this.accountNames = this.AccountList.filter((x: any) => x.FactoryId == factory.value.FactoryId);
    //console.log(this.accountNames,'accountNames');
    this.filteredAccounts.next(this.accountNames.slice());

    this.SaleForm.controls["AccountFilterCrtl"].valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.filteredAccountsData();
      });
  }

  private filteredFactoryData() {
    // debugger
    if (!this.factoryNames) {
      return;
    }
    // get the search keyword
    let search = this.SaleForm.controls["FactoryFilterCrtl"].value;
    if (!search) {
      this.filteredFactory.next(this.factoryNames.slice());
      return;
    } else {
      search = search.toLowerCase();
    }
    // filter the banks
    this.filteredFactory.next(
      this.factoryNames.filter(x => x.FactoryName.toLowerCase().indexOf(search) > -1)
    );
  }

  private filteredAccountsData() {
    if (!this.accountNames) {
      return;
    }
    let search = this.SaleForm.controls["FactoryFilterCrtl"].value;
    if (!search) {
      this.filteredAccounts.next(this.accountNames.slice());
      return;
    } else {
      search = search.toLowerCase();
    }
    this.filteredAccounts.next(
      this.accountNames.filter((x: any) => x.AccountName.toLowerCase().indexOf(search) > -1)
    );
  }

  search() {
    this.GetSaleDeatils();
  }

  getTotalCost(columnName: string): number {
    return this.dataSource.filteredData.reduce(
      (acc, curr) => acc + curr[columnName],
      0
    );
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  // Autocomplete function
  filterVehicleNumbers(value: string): any {
    const filterValue = value.toLowerCase();
    return this.vehicleNumbers.filter((x: any) =>
      x?.VehicleNo?.toLowerCase()?.includes(filterValue)
    );
  }
  setValidation(controlName: string) {
    this.SaleForm.get(controlName)?.setValidators([Validators.required]);
    this.SaleForm.get(controlName)?.updateValueAndValidity();
  }
  clearalidation(controlName: string) {
    this.SaleForm.get(controlName)?.clearValidators();
    this.SaleForm.get(controlName)?.updateValueAndValidity();
  }

  print() {
    //debugger
    if (this.SaleForm.value.FactoryName == '' || this.SaleForm.value.FactoryName == null) {
      this.setValidation('FactoryName');
      this.SaleStatementValidate = true;
      this.SaleStatementErrorMsg = 'Select Factory!'
      return
    }
    else {
      this.clearalidation('FactoryName')
      this.SaleStatementValidate = false;
      this.SaleStatementErrorMsg = ''

    }

    if (this.SaleForm.value.AccountName == '' || this.SaleForm.value.AccountName == null) {
      this.setValidation('AccountName');

      this.SaleStatementValidate = true;
      this.SaleStatementErrorMsg = 'Select Account!'
      return
    }
    else {
      this.clearalidation('AccountName')
      this.SaleStatementValidate = false;
      this.SaleStatementErrorMsg = ''
    }


    let bodyData: IGetSale = {

      FromDate: formatDate(this.SaleForm.value.fromDate, 'yyyy-MM-dd', 'en-US'),
      ToDate: formatDate(this.SaleForm.value.toDate, 'yyyy-MM-dd', 'en-US'),
      VehicleNo: '',
      FactoryId: this.SaleForm.value.FactoryName?.FactoryId ?? 0,
      //  AccountId: this.SaleForm.value.AccountId ?? 0,
      AccountId: this.SaleForm.value.AccountName.AccountId ?? 0,
      FineLeaf: '',
      SaleTypeId: 0,
      TenantId: this.loginDetails.TenantId,
    };

    const categoryListService = this.saleService
      .SaleStatementPrint(bodyData)
      .subscribe((response: Blob) => {
        const blobUrl = URL.createObjectURL(response);

        // Open PDF in a new browser tab
        window.open(blobUrl, '_blank');
      });
    this.subscriptions.push(categoryListService);
  }


  filterFactoryNames(value: string): any {

    const filterValue = value.toLowerCase();
    console.log(filterValue, 'filterValue');

    return this.factoryNames.filter((x: any) =>
      x?.FactoryName?.toLowerCase()?.includes(filterValue)
    );


  }

  filterAccountNames(value: string): any {
    const filterValue = value.toLowerCase();
    return this.accountNames.filter((x: any) =>
      x?.AccountName?.toLowerCase()?.includes(filterValue)
    );
  }

  GetSaleType() {

    const services = this.saleService.GetSaleType().subscribe((res: any) => {
      this.saleTypeList = res.SaleTypes;
    });
    this.subscriptions.push(services);
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

  async loadFactoryNames() {
    try {
      const bodyData: IGetFactory = {
        TenantId: this.loginDetails.TenantId,
        IsClientView: false
      };

      const res: any = await this.autocompleteService
        .GetFactoryNames(bodyData)
        .pipe(takeUntil(this.destroy$))
        .toPromise();

      this.factoryNames = res.FactoryDetails;
    } catch (error) {
      console.error('Error:', error);
      this.toastr.error('Something went wrong.', 'ERROR');
    }
  }

  async loadSaleFactoryNames() {
    debugger
    try {
      const bodyData: IGetSaleFactory = {
        TenantId: this.loginDetails.TenantId,
        FromDate: formatDate(this.SaleForm.value.fromDate, 'yyyy-MM-dd', 'en-US'),
        ToDate: formatDate(this.SaleForm.value.toDate, 'yyyy-MM-dd', 'en-US'),
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

  async loadAccountNames() {
    try {
      const bodyData: IGetFactoryAccount = {
        TenantId: this.loginDetails.TenantId,
      };

      const res: any = await this.autocompleteService
        .GetAccountNames(bodyData)
        .pipe(takeUntil(this.destroy$))
        .toPromise();

      this.AccountList = res.AccountDetails;
    } catch (error) {
      console.error('Error:', error);
      this.toastr.error('Something went wrong.', 'ERROR');
    }
  }
  displayWithFn(value: string): string {
    return value || '';
  }
  GetSaleDeatils() {
    const currentDate = new Date();
    let bodyData: IGetSale = {
      FromDate: formatDate(this.SaleForm.value.fromDate, 'yyyy-MM-dd', 'en-US'),
      ToDate: formatDate(this.SaleForm.value.toDate, 'yyyy-MM-dd', 'en-US'),
      VehicleNo: this.SaleForm.value.VehicleNo,
      FactoryId: this.SaleForm.value.FactoryName?.FactoryId ?? 0,
      AccountId: this.SaleForm.value.FactoryName?.FactoryId == undefined ? 0 : this.SaleForm.value.AccountName?.AccountId,
      FineLeaf: this.SaleForm.value.FineLeaf ?? '',
      SaleTypeId: this.SaleForm.value.SaleTypeId ?? 0,
      TenantId: this.loginDetails.TenantId,

    };

   // console.log(bodyData, 'salefilter');

    const categoryListService = this.saleService
      .GetSaleDetails(bodyData)
      .subscribe((res: any) => {

        this.dataSource.data = res.SaleDetails;


        const grossAmount: number = this.getTotalCost('GrossAmount');
        const finalWeight: number = this.getTotalCost('ChallanWeight');
        this.AverageRate = grossAmount / finalWeight;


        const uniqueCategories = this.dataSource.data.map(leaf => leaf.VehicleNo).length;

        this.TotalVehicleCount = uniqueCategories;
      });
    this.subscriptions.push(categoryListService);
  }

  onInputChange(event: string) {
    //   const input = event.target as HTMLInputElement;
    this.filteredFactories = this.filterFactoryNames(event);

    console.log(event, 'presss');
    if (event == '') {
      this.accountNames = [];
      this.SaleForm.controls['FactoryId'].reset();
      this.SaleForm.controls['FactoryName'].reset();
      this.SaleForm.controls['AccountName'].reset();
      this.SaleForm.controls['AccountId'].reset();
      this.SaleForm.controls["SaleTypeId"].reset();
      this.SaleForm.controls["FineLeaf"].reset();
    }

  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
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
  VehicleInput(value: string) {
    let newVal = value.toUpperCase();
    this.SaleForm.controls['VehicleNo'].setValue(newVal);
  }



  selectAccount(account: any) {
    debugger
    console.log(account?.AccountId, 'factory?.AccountId');
    this.SaleForm.controls['AccountId'].setValue(account?.AccountId);
  }

  fromDateChange(event: MatDatepickerInputEvent<Date>): void {
    //  this.SaleForm.controls['toDate'].setValue(null);
    this.minToDate = event.value;
  }

  async GetFactory(event: MatDatepickerInputEvent<Date>) {
    await this.loadSaleFactoryNames();
    this.filteredFactory.next(this.factoryNames.slice());

    this.SaleForm.controls["FactoryFilterCrtl"].valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.filteredFactoryData();
      });

  }

  editItem(row: any) {


    const dialogRef = this.dialog.open(EditSaleEntryComponent, {
      width: '90vw',
      height: '95%',
      minWidth: '90vw',
      disableClose: true,
      data: {
        title: 'Sale Edit Form-' + row.TypeName,
        stgData: row,
        approveData: null,
        isEdit: true,
        VehicleNo: row.VehicleNo,
        VehicleId: row.VehicleId,
        CollectionDate: row.CollectionDate,
        FactoryName: row.FactoryName,
        FactoryId: row.FactoryId,
        AccountId: row.AccountId,
        ChallanWeight: row.ChallanWeight,
        saleTypeId: row.SaleTypeId,
      },
    });
    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        this.GetSaleDeatils();
      }
    });
  }

  addStgItem(row: any) { }

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
  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
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

        this.excelService.exportToExcel('material-table', 'Sale History');
      } else {
        console.error("Table element not found or not an HTML table.");
      }
    } else {
      this.toastr.warning("NO DATA TO EXPORT", "WARNING");
    }
  }
}
