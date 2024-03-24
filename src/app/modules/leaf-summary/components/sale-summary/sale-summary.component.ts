import { DatePipe } from '@angular/common';
import { Component, HostListener, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { _MatTableDataSource } from '@angular/material/table';
import { ToastrService } from 'ngx-toastr';
import { Subject, Subscription, takeUntil } from 'rxjs';
import { HelperService } from 'src/app/core/services/helper.service';
import { IGetTeaClient } from 'src/app/modules/collection/interfaces/istg';
import { AutoCompleteService } from 'src/app/modules/collection/services/auto-complete.service';
import { IGetFactory } from 'src/app/modules/masters/interfaces/IFactory';
import { FactoryAccountService } from 'src/app/modules/masters/services/factory-account.service';
import { FactoryService } from 'src/app/modules/masters/services/factory.service';

@Component({
  selector: 'app-sale-summary',
  templateUrl: './sale-summary.component.html',
  styleUrls: ['./sale-summary.component.scss']
})
export class SaleSummaryComponent implements OnInit {

  displayedColumns: string[] = [
    'Factory',
    'AccountName',
    'ChallanWeight',
    'AverageRate',
    'Amount',
    'IncAmount',
    'FinalAmount'
  ];

  dataSource = new _MatTableDataSource<any>();

  filteredData: any[] = [];
  columns: { columnDef: string; header: string }[] = [
    { columnDef: 'Factory', header: 'Factory' },
    { columnDef: 'AccountName', header: 'Account Name' },
    // { columnDef: 'Collection', header: 'Collection' },
    // { columnDef: 'Reject', header: 'Reject' },
    // { columnDef: 'Final', header: 'Final' },
    // { columnDef: 'Average', header: 'Average' },
    // { columnDef: 'Amount', header: 'Amount' },
    // { columnDef: 'IncAmount', header: 'Inc. Amount' },
    // { columnDef: 'Transporting', header: 'Transporting' },
    // { columnDef: 'CessAmount', header: 'Cess Amount' },
    // { columnDef: 'FinalAmount', header: 'Final Amount' }
]


  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  private subscriptions: Subscription[] = [];
  private destroy$ = new Subject<void>();
  loginDetails: any;
  saleSummary!: FormGroup;
  minToDate!: any;
  ClientNames: any[] = [];
  clientList: any[] = [];
  selectedRowIndex: number = -1;
  FactoryList: any[]=[];
  filteredFactory: any[]=[];
  filteredAccounts: any[]=[];
  AccountList: any[]=[];
  constructor(
    private dialog: MatDialog,
    private toastr: ToastrService,
    private helper: HelperService,
    private datePipe: DatePipe,
    private factoryService: FactoryService,
    private accountService: FactoryAccountService,
    private fb: FormBuilder,
    private autocompleteService: AutoCompleteService,
  ) { }

  async ngOnInit() {
    this.loginDetails = this.helper.getItem('loginDetails');
    this.saleSummary = this.fb.group({
      fromDate: [new Date(), Validators.required],
      toDate: [new Date(), Validators.required],
      FactoryName: [''],
      AccountId: [''],
    });
    await this.GetFactoryList();
    await this.GetFactoryAccountList();
  }

  displayWithFn(value: string): string {
    return value || '';
  }

  // async loadClientNames() {
  //   try {
  //     const bodyData: IGetTeaClient = {
  //       TenantId: this.loginDetails.TenantId,
  //       Category: ''

  //     };

  //     const res: any = await this.autocompleteService.GetClientNames(bodyData)
  //       .pipe(takeUntil(this.destroy$))
  //       .toPromise();

  //     this.clientList = res.ClientDetails;
  //     this.ClientNames = res.ClientDetails;


  //   } catch (error) {
  //     console.error('Error:', error);
  //     this.toastr.error('Something went wrong.', 'ERROR');
  //   }
  // }
  getTotal(columnName: string): number {
    return this.dataSource.filteredData.reduce(
      (acc, curr) => acc + curr[columnName],
      0
    );
  }

  // filterClientNames(value: string): any[] {

  //   const filterValue = value.toLowerCase();
  //   return this.ClientNames.filter((x: any) => x?.ClientName?.toLowerCase()?.includes(filterValue));
  // }
  ngAfterViewInit() {

    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  // selectClient(client: any) {
  //   if (client == '') {
  //     this.saleSummary.controls['ClientId'].reset();
  //   }
  //   console.log(client.ClientId, 'Client');

  //   this.saleSummary.controls['ClientId'].setValue(client?.ClientId);
  // }

  search() {

    if (this.saleSummary.invalid) {
      this.saleSummary.markAllAsTouched();
      return;
    }
  }
  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }
  selectRow(row: any, index: number) {
    this.selectedRowIndex = index; // Set the selected row index
  }
  fromDateChange(event: MatDatepickerInputEvent<Date>): void {
    this.saleSummary.controls['toDate'].setValue(null);
    this.minToDate = event.value;
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

  async GetFactoryList() {
    try {
      const bodyData: IGetFactory = {
        TenantId: this.loginDetails.TenantId,
        IsClientView: false,
      };

      const res: any = await this.factoryService
        .GetFactory(bodyData)
        .pipe(takeUntil(this.destroy$))
        .toPromise();

      this.FactoryList = res.FactoryDetails;
      this.filteredFactory = res.FactoryDetails;
    } catch (error) {
      console.error('Error:', error);
      this.toastr.error('Something went wrong.', 'ERROR');
    }
  }

  async GetFactoryAccountList() {
    try {
      const bodyData: IGetFactory = {
        TenantId: this.loginDetails.TenantId,
        IsClientView: false,
      };

      const res: any = await this.accountService
        .GetFactoryAccount(bodyData)
        .pipe(takeUntil(this.destroy$))
        .toPromise();

      this.AccountList = res.AccountDetails;
      this.filteredAccounts = res.AccountDetails;
    } catch (error) {
      console.error('Error:', error);
      this.toastr.error('Something went wrong.', 'ERROR');
    }
  }

  filterBuyers(value: string) {
    const filterValue = value.toLowerCase();
    this.filteredFactory = this.FactoryList.filter((buyer: any) =>
      buyer.FactoryName.toLowerCase().includes(filterValue)
    );
  }

  SelectFactory(e: any) {
    this.filteredAccounts = this.AccountList.filter(
      (x: any) => x.FactoryId == e
    );
  }

  filterAccounts(value: string) {
    const filterValue = value.toLowerCase();
    this.filteredAccounts = this.AccountList.filter((account: any) =>
      account.AccountName.toLowerCase().includes(filterValue)
    );
  }

}
