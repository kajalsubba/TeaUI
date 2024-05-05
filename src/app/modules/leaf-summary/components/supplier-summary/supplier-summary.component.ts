import { DatePipe, formatDate } from '@angular/common';
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
import { SupplierSummaryService } from '../../services/supplier-summary.service';
import { ISupplierSummary } from '../../interfaces/isupplier-summary';

@Component({
  selector: 'app-supplier-summary',
  templateUrl: './supplier-summary.component.html',
  styleUrls: ['./supplier-summary.component.scss']
})
export class SupplierSummaryComponent implements OnInit {

  displayedColumns: string[] = [
    'ClientName',
    'ChallanWeight',
    'Rate',
    'GrossAmount',
    'LessCommison',
    'GreenLeafCess',
    'FinalAmount'
  ];

  dataSource = new _MatTableDataSource<any>();

  filteredData: any[] = [];
  columns: { columnDef: string; header: string }[] = [
    { columnDef: 'ClientName', header: 'Client Name' },
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
  supplierSummary!: FormGroup;
  minToDate!: any;
  ClientNames: any[] = [];
 // clientList: any[] = [];
  selectedRowIndex: number = -1;
  AverageRate: number = 0;
  constructor(
    private dialog: MatDialog,
    private toastr: ToastrService,
    private helper: HelperService,
    private datePipe: DatePipe,
    private fb: FormBuilder,
    private autocompleteService: AutoCompleteService,
    private summaryService: SupplierSummaryService
  ) { }

  async ngOnInit() {
    this.loginDetails = this.helper.getItem('loginDetails');
    this.supplierSummary = this.fb.group({
      fromDate: [new Date(), Validators.required],
      toDate: [new Date(), Validators.required],
      ClientId: [0],
      ClientName: ['']
    });
    await this.loadClientNames();
  }

  displayWithFn(value: string): string {
    return value || '';
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

      //  this.clientList = res.ClientDetails;
      this.ClientNames = res.ClientDetails;


    } catch (error) {
      console.error('Error:', error);
      this.toastr.error('Something went wrong.', 'ERROR');
    }
  }
  getTotal(columnName: string): number {
    return this.dataSource.filteredData.reduce(
      (acc, curr) => acc + curr[columnName],
      0
    );
  }

  filterClientNames(value: string): any[] {

    const filterValue = value.toLowerCase();
    return this.ClientNames.filter((x: any) => x?.ClientName?.toLowerCase()?.includes(filterValue));
  }
  ngAfterViewInit() {

    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  selectClient(client: any) {
    if (client == '') {
      this.supplierSummary.controls['ClientId'].reset();
    }
    console.log(client.ClientId, 'Client');

    this.supplierSummary.controls['ClientId'].setValue(client?.ClientId);
  }

  async search() {

    if (this.supplierSummary.invalid) {
      this.supplierSummary.markAllAsTouched();
      return;
    }
    await this.GetSummary();
    const grossAmount: number = this.getTotal('GrossAmount');
    const challanWeight: number = this.getTotal('ChallanWeight');
    this.AverageRate=grossAmount/challanWeight;
  }
  onInputChange(event: Event) {
    const input = event.target as HTMLInputElement;
    // Do something when input changes
    if (input.value == '') {

      this.supplierSummary.controls['ClientId'].reset();

    }

  }

  async GetSummary() {
    try {
      const bodyData: ISupplierSummary = {
        FromDate: formatDate(this.supplierSummary.value.fromDate, 'yyyy-MM-dd', 'en-US'),
        ToDate: formatDate(this.supplierSummary.value.toDate, 'yyyy-MM-dd', 'en-US'),
        ClientId: this.supplierSummary.value.ClientId ?? 0,
        TenantId: this.loginDetails.TenantId

      };
      const res: any = await this.summaryService.GetSupplierSummary(bodyData).toPromise();
      const { SupplierSummary } = res;

      this.dataSource.data = SupplierSummary;


    } catch (error) {
      console.error('Error:', error);
      this.toastr.error('Something went wrong.', 'ERROR');
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
   // this.supplierSummary.controls['toDate'].setValue(null);
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
  editItem(e: any) {

  }

}
