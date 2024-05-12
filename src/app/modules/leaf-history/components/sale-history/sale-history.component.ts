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
import { AutoCompleteService } from 'src/app/modules/collection/services/auto-complete.service';
import { IGetSale } from 'src/app/modules/collectionApprove/interfaces/isale-save';
import { StgApproveService } from 'src/app/modules/collectionApprove/services/stg-approve.service';
import { IGetFactory, IGetSaleFactory } from 'src/app/modules/masters/interfaces/IFactory';
import { IGetFactoryAccount } from 'src/app/modules/masters/interfaces/IFactoryAccount';
import { IGetGrade } from 'src/app/modules/masters/interfaces/IGrade';
import { EditSaleEntryComponent } from 'src/app/shared/components/edit-sale-entry/edit-sale-entry.component';
import enIN from '@angular/common/locales/en-IN';
import { ExcelExportService } from '../../../../shared/services/excel-export.service';
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

  dataSource = new MatTableDataSource<any>();
  filteredData: any[] = [];
  columns: { columnDef: string; header: string }[] = [
    { columnDef: 'SaleId', header: 'Sale Id' },
    //   { columnDef: 'SaleDate', header: 'Sale Date' },
    { columnDef: 'FactoryName', header: 'Factory Name' },
    { columnDef: 'AccountName', header: 'Account Name' },
   // { columnDef: 'VehicleNo', header: 'Vehicle No' },
    { columnDef: 'FineLeaf', header: 'Fine Leaf (%)' },
   // { columnDef: 'Rate', header: 'Rate' },
    { columnDef: 'Incentive', header: 'Incentive (%)' },
    // { columnDef: 'IncentiveAmount', header: 'Incentive Amount' },
    //  { columnDef: 'FinalAmount', header: 'Final Amount' },
    { columnDef: 'Remarks', header: 'Remarks' },
    { columnDef: 'TypeName', header: 'Sale Type' },
  ];

  loginDetails: any;
  SaleForm!: FormGroup;
  private destroy$ = new Subject<void>();
  vehicleNumbers: any[] = [];
  minToDate!: any;
  private subscriptions: Subscription[] = [];
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  factoryNames: any[] = [];
  accountNames: any[] = [];
  AccountList: any = [];
  saleTypeList: any;
  selectedRowIndex: number = -1;
  AverageRate:number=0;
  TotalVehicleCount:number=0;
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

  ngOnInit(): void {
    this.loginDetails = this.helper.getItem('loginDetails');
    this.SaleForm = this.fb.group({
      fromDate: [new Date(), Validators.required],
      toDate: [new Date(), [Validators.required]],
      VehicleNo: [''],
      FactoryName: [''],
      FactoryId: [null],
      AccountName: [''],
      AccountId: [null],
      SaleTypeId: [null]
    });
    //  this.loadVehicleNumbers();
 //   this.loadFactoryNames();
    this.loadAccountNames();
    this.GetSaleType();
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

  filterFactoryNames(value: string): any {
  // if (value!="")
  //   {
    const filterValue = value.toLowerCase();
    return this.factoryNames.filter((x: any) =>
      x?.FactoryName?.toLowerCase()?.includes(filterValue)
    );
//  }
  
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
    try {
      const bodyData: IGetSaleFactory = {
        TenantId: this.loginDetails.TenantId,
        FromDate: formatDate(this.SaleForm.value.fromDate, 'yyyy-MM-dd', 'en-US'),
        ToDate:formatDate(this.SaleForm.value.toDate, 'yyyy-MM-dd', 'en-US'),
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
      FromDate:formatDate(this.SaleForm.value.fromDate, 'yyyy-MM-dd', 'en-US'),
      ToDate:formatDate(this.SaleForm.value.toDate, 'yyyy-MM-dd', 'en-US'),
      VehicleNo: this.SaleForm.value.VehicleNo,
      FactoryId: this.SaleForm.value.FactoryId??0,
      AccountId: this.SaleForm.value.AccountId??0,
      SaleTypeId: this.SaleForm.value.SaleTypeId??0,
      TenantId: this.loginDetails.TenantId,
   
    };
    const categoryListService = this.saleService
      .GetSaleDetails(bodyData)
      .subscribe((res: any) => {
        // console.log(res);
        this.dataSource.data = res.SaleDetails;

        
      const grossAmount: number = this.getTotalCost('GrossAmount');
      const finalWeight: number = this.getTotalCost('ChallanWeight');
      this.AverageRate = grossAmount / finalWeight;

      
      const uniqueCategories = this.dataSource.data.map(leaf => leaf.VehicleNo).length;

      this.TotalVehicleCount=uniqueCategories;
      });
    this.subscriptions.push(categoryListService);
  }

  onInputChange(event: Event) {
    const input = event.target as HTMLInputElement;
    // Do something when input changes
    console.log(input.value, 'presss');
    if (input.value == '') {
      this.accountNames = [];
      this.SaleForm.controls['FactoryId'].reset();
      this.SaleForm.controls['FactoryName'].reset();
      this.SaleForm.controls['AccountName'].reset();
      this.SaleForm.controls['AccountId'].reset();
      this.SaleForm.controls["SaleTypeId"].reset();

    }

  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  VehicleInput(value: string) {
    let newVal = value.toUpperCase();
    this.SaleForm.controls['VehicleNo'].setValue(newVal);
  }

  selectFactory(factory: any) {
    this.SaleForm.controls['FactoryId'].setValue(factory?.FactoryId);
    this.accountNames = this.AccountList.filter((x: any) => x.FactoryId == factory.FactoryId)
  }

  selectAccount(account: any) {
    this.SaleForm.controls['AccountId'].setValue(account?.AccountId);
  }

  fromDateChange(event: MatDatepickerInputEvent<Date>): void {
  //  this.SaleForm.controls['toDate'].setValue(null);
    this.minToDate = event.value;
  }

  GetFactory  (event: MatDatepickerInputEvent<Date>): void {
    this.loadSaleFactoryNames();
  }

  editItem(row: any) {


    const dialogRef = this.dialog.open(EditSaleEntryComponent, {
      width: '90vw',
      height: '95%',
      minWidth: '90vw',
      disableClose: true,
      data: {
        title: 'Sale Edit Form-'+row.TypeName,
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

  exportToExcel(){
    if(this.dataSource.data.length > 0){
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
