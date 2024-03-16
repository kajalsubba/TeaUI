import { DatePipe, formatDate } from '@angular/common';
import { Component, HostListener, OnInit, ViewChild } from '@angular/core';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import { AddEditPaymentComponent } from '../../models/add-edit-payment/add-edit-payment.component';
import { Subject, Subscription, takeUntil } from 'rxjs';
import { IGetTeaClient } from 'src/app/modules/collection/interfaces/istg';
import { _MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { HelperService } from 'src/app/core/services/helper.service';
import { AutoCompleteService } from 'src/app/modules/collection/services/auto-complete.service';
import { SeasonAdvanceService } from '../../services/season-advance.service';
import { StgApproveService } from 'src/app/modules/collectionApprove/services/stg-approve.service';

@Component({
  selector: 'app-payments',
  templateUrl: './payments.component.html',
  styleUrls: ['./payments.component.scss']
})
export class PaymentsComponent implements OnInit {

  displayedColumns: string[] = [
    'PaymentDate',
    'ClientCategory',
    'ClientName',
    'PaymentType',
    'Amount',
    'Narration',
    'actions'

  ];

  dataSource = new _MatTableDataSource<any>();
  filteredData: any[] = [];
  columns: { columnDef: string; header: string }[] = [
    { columnDef: 'PaymentDate', header: 'Payment Date' },
    { columnDef: 'ClientName', header: 'Client Name' },
    { columnDef: 'ClientCategory', header: 'Client Category' },
    { columnDef: 'PaymentType', header: 'Payment Type' },
    { columnDef: 'Narration', header: 'Narration' },
  //  { columnDef: 'Amount', header: 'Amount' }

  ];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  private subscriptions: Subscription[] = [];
  private destroy$ = new Subject<void>();
  loginDetails: any;
  SeasonAdvanceForm!: FormGroup;
  minToDate!: any;
  ClientNames: any[] = [];
  selectedRowIndex: number = -1;
  saleTypeList: any[]=[];

  constructor(
    private dialog: MatDialog,
    private toastr: ToastrService,
    private helper: HelperService,
    private datePipe: DatePipe,
    private fb: FormBuilder,
    private autocompleteService: AutoCompleteService,
    private advanceService: SeasonAdvanceService,
    private saleService: StgApproveService,
    // private stgService: StgService,
    //   private stgapproveService: StgApproveService,
    // private supplierApproveService: SupplierapproveService
  ) { }

  async ngOnInit() {
    this.loginDetails = this.helper.getItem('loginDetails');
    this.SeasonAdvanceForm = this.fb.group({
      fromDate: [new Date(), Validators.required],
      toDate: [new Date(), Validators.required],
      ClientId: [''],
      ClientName: [''],
      SaleTypeId: [''],

    });

    //  await this.loadVehicleNumbers(formatDate(this.dateRangeForm.value.fromDate, 'yyyy-MM-dd', 'en-US'));
    await this.loadClientNames();
    this.GetSaleType()
    
    // this.GetSupplierDefaultList();
  }

  GetSaleType() {

    const services = this.saleService.GetSaleType().subscribe((res: any) => {
      this.saleTypeList = res.SaleTypes;
    });
    this.subscriptions.push(services);
  }

  displayWithFn(value: string): string {
    return value || '';
  }

  async loadClientNames() {
    try {
      const bodyData: IGetTeaClient = {
        TenantId: this.loginDetails.TenantId,
        Category: ''

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

  AddSeasonAdvance() {
    const dialogRef = this.dialog.open(AddEditPaymentComponent, {
      width: '30%',
      data: {
        title: 'Add Payment Entry',
        buttonName: 'Save',
      },
      disableClose: true,
    });
    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {

      }
    });
  }
  selectClient(client: any) {
    if (client == '') {
      this.SeasonAdvanceForm.controls['ClientId'].reset();
    }
    console.log(client.ClientId, 'Client');

    this.SeasonAdvanceForm.controls['ClientId'].setValue(client?.ClientId);
  }

  search() {


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
    this.SeasonAdvanceForm.controls['toDate'].setValue(null);
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
  editItem(e:any)
  {

  }

}
