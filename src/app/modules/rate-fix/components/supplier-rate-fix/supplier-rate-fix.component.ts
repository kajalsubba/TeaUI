import { DatePipe } from '@angular/common';
import { Component, HostListener, OnInit, ViewChild } from '@angular/core';
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
import { AutoCompleteService } from 'src/app/modules/collection/services/auto-complete.service';
import { IGetFactory } from 'src/app/modules/masters/interfaces/IFactory';
import { IGetFactoryAccount } from 'src/app/modules/masters/interfaces/IFactoryAccount';
import { IGetGrade } from 'src/app/modules/masters/interfaces/IGrade';
import { ClientService } from 'src/app/modules/masters/services/client.service';
import { GradeService } from 'src/app/modules/masters/services/grade.service';

@Component({
  selector: 'app-supplier-rate-fix',
  templateUrl: './supplier-rate-fix.component.html',
  styleUrls: ['./supplier-rate-fix.component.scss'],
})
export class SupplierRateFixComponent implements OnInit {
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
    //'actions'
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
  GradeList: any[] = [];
  private destroy$ = new Subject<void>();
  selectedRowIndex: number = -1;
  ClientList: any[] = [];
  ClientNames: any[] = [];
  factoryNames: any[]=[];
  AccountList: any[]=[];
  accountNames: any[]=[];

  constructor(
    private dialog: MatDialog,
    private toastr: ToastrService,
    private helper: HelperService,
    private datePipe: DatePipe,
    private gradeService: GradeService,
    private autoCompleteService: AutoCompleteService,
    private fb: FormBuilder
  ) {}

  async ngOnInit() {
    this.loginDetails = this.helper.getItem('loginDetails');
    this.dateRangeForm = this.fb.group({
      fromDate: [new Date(), Validators.required],
      toDate: [new Date(), [Validators.required]],
      ClientId: [''],
      ClientName: [''],
      Rate: [''],
      AccountName:[''],
      AccountId:[''],
      FactoryName:[''],
      FactoryId:[''],
    });
    await this.loadClientNames();
    await this.loadAccountNames();
    await this.loadFactoryNames();
    this.GetGrade();
  }

  ngAfterViewInit() {
    console.log(this.loginDetails);

    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

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

  getTotalCost(columnName: string): number {
    return this.dataSource.filteredData.reduce(
      (acc, curr) => +acc + (+curr[columnName]),
      0
    );
  }

  GetGrade() {
    let data: IGetGrade = {
      TenantId: this.loginDetails.TenantId,
    };
    const gradeGetService = this.gradeService
      .GetGrade(data)
      .subscribe((res: any) => {
        this.GradeList = res.GradeDetails;
      });

    this.subscriptions.push(gradeGetService);
  }
  filterClientNames(value: string): any[] {
    const filterValue = value.toLowerCase();
    // console.log(this.ClientNames.filter((number:any) => number.toLowerCase().includes(filterValue)),'Clinet');
    return this.ClientNames.filter((x: any) =>
      x?.ClientName?.toLowerCase()?.includes(filterValue)
    );
  }

  async loadFactoryNames() {
    try {
      const bodyData: IGetFactory = {
        TenantId: this.loginDetails.TenantId,
        IsClientView:false
      };

      const res: any = await this.autoCompleteService
        .GetFactoryNames(bodyData)
        .pipe(takeUntil(this.destroy$))
        .toPromise();

      this.factoryNames = res.FactoryDetails;
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

      const res: any = await this.autoCompleteService
        .GetAccountNames(bodyData)
        .pipe(takeUntil(this.destroy$))
        .toPromise();

      this.accountNames = res.AccountDetails;
    } catch (error) {
      console.error('Error:', error);
      this.toastr.error('Something went wrong.', 'ERROR');
    }
  }

  selectFactory(factory: any) {
    this.dateRangeForm.controls['FactoryId'].setValue(factory?.FactoryId);
    // this.accountNames =   this.AccountList.filter((x:any)=> x.FactoryId==factory.FactoryId)
  }

  selectAccount(account: any) {
    this.dateRangeForm.controls['AccountId'].setValue(account?.AccountId);
  }

  filterFactoryNames(value: string): any {
    const filterValue = value.toLowerCase();
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


  displayWithFn(value: string): string {
    return value || '';
  }

  selectClient(client: any) {
    this.dateRangeForm.controls['ClientId'].setValue(client?.ClientId);
  }

  async loadClientNames() {
    try {
      const bodyData: IGetTeaClient = {
        TenantId: this.loginDetails.TenantId,
        Category: 'Supplier',
      };

      const res: any = await this.autoCompleteService
        .GetClientNames(bodyData)
        .pipe(takeUntil(this.destroy$))
        .toPromise();

      this.ClientNames = res.ClientDetails;
    } catch (error) {
      console.error('Error:', error);
      this.toastr.error('Something went wrong.', 'ERROR');
    }
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
