import { DatePipe, formatDate } from '@angular/common';
import { Component, HostListener, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatOptionSelectionChange } from '@angular/material/core';
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
import { StgSummaryService } from '../../services/stg-summary.service';
import { IStgSummary } from '../../interfaces/istg-summary';
import { PdfExportService } from 'src/app/shared/services/pdf-export.service';

@Component({
  selector: 'app-stg-summary',
  templateUrl: './stg-summary.component.html',
  styleUrls: ['./stg-summary.component.scss']
})
export class StgSummaryComponent implements OnInit {
  displayedColumns: string[] = [
    'ClientName',
    'FirstWeight',
    'Deduction',
    'FinalWeight',
    'Rate',
    'GrossAmount',
    'Incentive',
    'Transporting',
    'GreenLeafCess',
    'FinalAmount'
  ];

  dataSource = new _MatTableDataSource<any>();

  filteredData: any[] = [];
  columns: { columnDef: string; header: string }[] = [
    { columnDef: 'ClientName', header: 'Client Name' },
  
  ]


  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  private subscriptions: Subscription[] = [];
  private destroy$ = new Subject<void>();
  loginDetails: any;
  StgSummaryForm!: FormGroup;
  minToDate!: any;
  ClientNames: any[] = [];
  selectedRowIndex: number = -1;
  AverageRate: number = 0;

  constructor(
    private dialog: MatDialog,
    private toastr: ToastrService,
    private helper: HelperService,
    private datePipe: DatePipe,
    private fb: FormBuilder,
    private autocompleteService: AutoCompleteService,
    private summartService: StgSummaryService,
    private pdfService: PdfExportService
  ) { }

  async ngOnInit() {
    this.loginDetails = this.helper.getItem('loginDetails');
    this.StgSummaryForm = this.fb.group({
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
        Category: 'STG'

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

  selectClient(client: any) {
    if (client == '') {
      this.StgSummaryForm.controls['ClientId'].reset();
    }

    this.StgSummaryForm.controls['ClientId'].setValue(client?.ClientId);
  }

  async search() {

    if (this.StgSummaryForm.invalid) {
      this.StgSummaryForm.markAllAsTouched();
      return;
    }
    await this.GetSummary();

    const grossAmount: number = this.getTotal('GrossAmount');
    const finalWeight: number = this.getTotal('FinalWeight');
    this.AverageRate=grossAmount/finalWeight;
  }

  onInputChange(event: Event) {
    const input = event.target as HTMLInputElement;
    // Do something when input changes
    if (input.value == '') {

      this.StgSummaryForm.controls['ClientId'].reset();

    }

  }

  async GetSummary() {
    try {
      const bodyData: IStgSummary = {
        FromDate: formatDate(this.StgSummaryForm.value.fromDate, 'yyyy-MM-dd', 'en-US'),
        ToDate: formatDate(this.StgSummaryForm.value.toDate, 'yyyy-MM-dd', 'en-US'),
        ClientId: this.StgSummaryForm.value.ClientId ?? 0,
        TenantId: this.loginDetails.TenantId

      };
      const res: any = await this.summartService.GetStgSummary(bodyData).toPromise();
      const { StgSummary } = res;

      this.dataSource.data = StgSummary;


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
    this.StgSummaryForm.controls['toDate'].setValue(null);
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

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  downloadPdf(){
    this.pdfService.ggeneratePDF(this.dataSource.data, 'STG_SUMMARY');
  }
}
