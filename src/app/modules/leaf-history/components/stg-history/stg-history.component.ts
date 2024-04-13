import { DatePipe, formatDate } from '@angular/common';
import { Component, HostListener, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ToastrService } from 'ngx-toastr';
import { Subject, Subscription, takeUntil } from 'rxjs';
import { HelperService } from 'src/app/core/services/helper.service';
import { IGetTeaClient, IStgSelect } from 'src/app/modules/collection/interfaces/istg';
import { AutoCompleteService } from 'src/app/modules/collection/services/auto-complete.service';
import { StgService } from 'src/app/modules/collection/services/stg.service';
import { IGetGrade } from 'src/app/modules/masters/interfaces/IGrade';

@Component({
  selector: 'app-stg-history',
  templateUrl: './stg-history.component.html',
  styleUrls: ['./stg-history.component.scss']
})
export class StgHistoryComponent {
  displayedColumns: string[] = [
    'CollectionDate',
    'VehicleNo',
    'ClientName',
    'GradeName',
    'FirstWeight',
    'WetLeaf',
    'WetLeafKg',
    'LongLeaf',
    'LongLeafKg',
    'Deduction',
    'FinalWeight',
    'Rate',
    'GrossAmount',
    'Remarks',
    'Status',
  ];

  dataSource = new MatTableDataSource<any>();
  filteredData: any[] = [];
  columns: { columnDef: string; header: string }[] = [
    // { columnDef: 'CollectionDate', header: 'Collection Date' },
    { columnDef: 'VehicleNo', header: 'Vehicle NO.' },
    { columnDef: 'ClientName', header: 'Client Name' },
    { columnDef: 'GradeName', header: 'Grade' },
    { columnDef: 'WetLeaf', header: 'Wet Leaf (%)' },
    // { columnDef: 'WetLeafKg', header: 'Wet Leaf (KG) ' },
    { columnDef: 'LongLeaf', header: 'Long Leaf (%)' },
    // { columnDef: 'LongLeafKg', header: 'Long Leaf (KG)' },
    //  { columnDef: 'Grade', header: 'Grade' },
 
    { columnDef: 'Rate', header: 'Rate' },
    { columnDef: 'GrossAmount', header: 'Gross Amount' },
    { columnDef: 'Remarks', header: 'Remarks' },
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

  private destroy$ = new Subject<void>();

  constructor(
    private helper: HelperService,
    private datePipe: DatePipe,
    private toastr: ToastrService,
    private autocompleteService: AutoCompleteService,
    private fb: FormBuilder,
    private stgService: StgService,
  ) { }

 async ngOnInit(){
    this.loginDetails = this.helper.getItem('loginDetails');
    this.dateRangeForm = this.fb.group({
      fromDate: [new Date(), Validators.required],
      toDate: [new Date(), [Validators.required]],
     // VehicleNo: [''],
      ClientName:[],
      ClientId: [0],
      Status: ['']
    });
   // this.loadVehicleNumbers();
    await this.loadClientNames();
  }

  ngAfterViewInit() {


    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
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
  selectClient(client: any) {
    if (client == '') {
      this.dateRangeForm.controls['ClientId'].reset();
    }

    this.dateRangeForm.controls['ClientId'].setValue(client?.ClientId);
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
  fromDateChange(event: MatDatepickerInputEvent<Date>): void {
    this.dateRangeForm.controls['toDate'].setValue(null);
    this.minToDate = event.value
  }

  clearFilter() {
    this.dateRangeForm.controls['fromDate'].setValue(null);
    this.dateRangeForm.controls['toDate'].setValue(null);
    this.dataSource.data = this.dataSource.data;
  }

  search() {

    this.GetStgList();

  }
  onInputChange(event: Event) {
    const input = event.target as HTMLInputElement;
    // Do something when input changes
    console.log(input.value, 'presss');
    if (input.value == '') {
     
      this.dateRangeForm.controls['ClientId'].reset();
  

    }

  }

  filterClientNames(value: string): any[] {

    const filterValue = value.toLowerCase();
    return this.ClientNames.filter((x: any) => x?.ClientName?.toLowerCase()?.includes(filterValue));
  }

  GetStgList() {


    const bodyData: IStgSelect = {
      FromDate: formatDate(this.dateRangeForm.value.fromDate, 'yyyy-MM-dd', 'en-US'),
      ToDate: formatDate(this.dateRangeForm.value.toDate, 'yyyy-MM-dd', 'en-US'),
      TenantId: this.loginDetails.TenantId,
      VehicleNo: '',
      Status: this.dateRangeForm.value.Status == 'All' ? '' : this.dateRangeForm.value.Status,
      TripId: 0,
      ClientId:this.dateRangeForm.value.ClientId,
      CreatedBy: this.loginDetails.UserId,
    }
    const categoryListService = this.stgService.GetStg(bodyData).subscribe((res: any) => {
      // console.log(res);
      this.dataSource.data = res.STGDetails;
    });
    this.subscriptions.push(categoryListService);
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

  getTotal(columnName: string): number {
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
