import { DatePipe, formatDate, registerLocaleData } from '@angular/common';
import { Component, HostListener, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ToastrService } from 'ngx-toastr';
import { Subject, Subscription, catchError, takeUntil } from 'rxjs';
import { HelperService } from 'src/app/core/services/helper.service';
import { IGetTeaClient } from 'src/app/modules/collection/interfaces/istg';
import { AutoCompleteService } from 'src/app/modules/collection/services/auto-complete.service';
import { IGetFactory, IGetSaleFactory, IGetSaleRateFixFactory } from 'src/app/modules/masters/interfaces/IFactory';
import { IGetFactoryAccount } from 'src/app/modules/masters/interfaces/IFactoryAccount';
import { IGetGrade } from 'src/app/modules/masters/interfaces/IGrade';
import { ClientService } from 'src/app/modules/masters/services/client.service';
import { GradeService } from 'src/app/modules/masters/services/grade.service';
import { ISaveSaleRate, IsaleRateFix } from '../../interfaces/isale-rate-fix';
import { SaleRateFixService } from '../../services/sale-rate-fix.service';
import { ConfirmDialogComponent } from 'src/app/shared/components/confirm-dialog/confirm-dialog.component';
import enIN from '@angular/common/locales/en-IN';
import { EditRateComponent } from '../../models/edit-rate/edit-rate.component';
import { EditSaleRateComponent } from '../../models/edit-sale-rate/edit-sale-rate.component';
import { environment } from 'src/environments/environment';
import { NotificationDataService } from 'src/app/modules/layout/services/notification-data.service';
import { IGetNotifications } from 'src/app/modules/layout/interfaces/iget-notifications';
import { StgApproveService } from 'src/app/modules/collectionApprove/services/stg-approve.service';
import { ActivatedRoute } from '@angular/router';
registerLocaleData(enIN);
@Component({
  selector: 'app-sale-rate-fix',
  templateUrl: './sale-rate-fix.component.html',
  styleUrls: ['./sale-rate-fix.component.scss'],
})
export class SaleRateFixComponent implements OnInit {
  displayedColumns: string[] = [
    //  'SaleId',
    'SaleDate',
    'FactoryName',
    'AccountName',
    //  'VehicleNo',
    // 'FieldWeight',
    'FineLeaf',
    'ChallanWeight',
    'Rate',
    'GrossAmount',
    'Incentive',
    'IncentiveAmount',
    'FinalAmount',
    'actions',
    //'TypeName',
  ];

  dataSource = new MatTableDataSource<any>();
  filteredData: any[] = [];
  columns: { columnDef: string; header: string }[] = [
    { columnDef: 'SaleId', header: 'Sale Id' },
    { columnDef: 'FactoryName', header: 'Factory Name' },
    { columnDef: 'AccountName', header: 'Account Name' },
    { columnDef: 'FineLeaf', header: 'Fine Leaf (%)' },
    { columnDef: 'Incentive', header: 'Incentive' },

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
  accountNames: any[] = [];
  AccountList: any[] = [];
  factoryNames: any[] = [];
  moduleId!: any;
  minDate!: any;
  displayName!: any;
  constructor(
    private dialog: MatDialog,
    private toastr: ToastrService,
    private helper: HelperService,
    private datePipe: DatePipe,
    private gradeService: GradeService,
    private autoCompleteService: AutoCompleteService,
    private fb: FormBuilder,
    private rateFixService: SaleRateFixService,
    private notificationDataService: NotificationDataService,
    private saleService: StgApproveService,
    private route: ActivatedRoute
  ) { }

  async ngOnInit() {
    debugger
    this.route.queryParams.subscribe(params => {
      this.moduleId = params['moduleId']; // '+' converts string to number
      this.minDate = params['minDate'];
      this.displayName = params['displayName'];
    });
    this.loginDetails = this.helper.getItem('loginDetails');
    this.dateRangeForm = this.fb.group({
      fromDate: [new Date(), Validators.required],
      toDate: [new Date(), [Validators.required]],
      Rate: [''],
      FineLeaf: [''],
      Incentive: [''],
      FactoryName: [''],
      FactoryId: [0],
      AccountName: [''],
      AccountId: [0],
    });
    await this.loadAccountNames();
    this.dateRangeForm.controls['Incentive'].disable({ onlySelf: true });

    if (this.minDate) {
      this.dateRangeForm.controls['fromDate'].setValue(new Date(this.minDate));
    }
    await this.loadSaleFactoryNames();
    if (this.moduleId != null) {
      this.dateRangeForm.controls['FactoryId'].setValue(this.moduleId);
      this.dateRangeForm.controls['FactoryName'].setValue(this.displayName);
    }
  }

  RateChange(event: any) {
    const value = event.target.value;
    if (value == 0 || value == '') {
      this.dateRangeForm.controls['Incentive'].disable({ onlySelf: true });
    }
    else {
      this.dateRangeForm.controls['Incentive'].enable({ onlySelf: true });
    }
  }

  ngAfterViewInit() {


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
    //  this.dateRangeForm.controls['toDate'].setValue(null);
    this.minToDate = event.value;
  }

  async GetFactory(event: MatDatepickerInputEvent<Date>) {
    await this.loadSaleFactoryNames();
    this.dateRangeForm.get('FactoryName')?.setValue('');

  }

  GetSaleData(FromDate: any, ToDate: any) {
    const currentDate = new Date();
    let bodyData: IsaleRateFix = {
      FromDate: FromDate == null ? formatDate(currentDate, 'yyyy-MM-dd', 'en-US') : FromDate,
      ToDate: ToDate == null ? formatDate(currentDate, 'yyyy-MM-dd', 'en-US') : ToDate,
      TenantId: this.loginDetails.TenantId,
      FactoryId: this.dateRangeForm.value.FactoryName == '' ? 0 : this.dateRangeForm.value.FactoryId,
      AccountId: this.dateRangeForm.value.AccountName == '' ? 0 : this.dateRangeForm.value.AccountId,
      FineLeaf: this.dateRangeForm.value.FineLeaf

    }
    const categoryListService = this.rateFixService.GetSaleRateFixData(bodyData).subscribe((res: any) => {

      this.dataSource.data = res.SaleRateData;
    });
    this.subscriptions.push(categoryListService);
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
    return this.ClientNames.filter((x: any) =>
      x?.ClientName?.toLowerCase()?.includes(filterValue)
    );
  }

  displayWithFn(value: string): string {
    return value || '';
  }

  selectClient(client: any) {
    this.dateRangeForm.controls['ClientId'].setValue(client?.ClientId);
  }
  Search() {
    this.GetSaleData(formatDate(this.dateRangeForm.value.fromDate, 'yyyy-MM-dd', 'en-US'), formatDate(this.dateRangeForm.value.toDate, 'yyyy-MM-dd', 'en-US'));

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

  // async loadFactoryNames() {
  //   try {
  //     const bodyData: IGetFactory = {
  //       TenantId: this.loginDetails.TenantId,
  //       IsClientView: false
  //     };

  //     const res: any = await this.autoCompleteService
  //       .GetFactoryNames(bodyData)
  //       .pipe(takeUntil(this.destroy$))
  //       .toPromise();

  //     this.factoryNames = res.FactoryDetails;
  //   } catch (error) {
  //     console.error('Error:', error);
  //     this.toastr.error('Something went wrong.', 'ERROR');
  //   }
  // }

  async loadSaleFactoryNames() {
    debugger
    try {
      const bodyData: IGetSaleRateFixFactory = {
        TenantId: this.loginDetails.TenantId,
        FromDate: formatDate(this.dateRangeForm.value.fromDate, 'yyyy-MM-dd', 'en-US'),
        ToDate: formatDate(this.dateRangeForm.value.toDate, 'yyyy-MM-dd', 'en-US'),
        IsClientView: false
      };

      const res: any = await this.saleService
        .GetSaleRateFixFactoryDetails(bodyData)
        .pipe(takeUntil(this.destroy$))
        .toPromise();

      this.factoryNames = res.FactoryList;
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

      this.AccountList = res.AccountDetails;
    } catch (error) {
      console.error('Error:', error);
      this.toastr.error('Something went wrong.', 'ERROR');
    }
  }

  selectFactory(factory: any) {
    this.dateRangeForm.controls['FactoryId'].setValue(factory?.FactoryId);
    this.accountNames = this.AccountList.filter((x: any) => x.FactoryId == factory.FactoryId)
  }

  onInputChange(event: Event) {
    const input = event.target as HTMLInputElement;
    // Do something when input changes

    if (input.value == '') {
      this.accountNames = [];
      this.dateRangeForm.controls['AccountName'].reset();
      this.dateRangeForm.controls['AccountId'].reset();
      this.dateRangeForm.controls["FineLeaf"].reset();

    }

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

  clearform() {

    this.dateRangeForm.controls["FactoryId"].reset();
    this.dateRangeForm.controls["FactoryName"].reset();
    this.dateRangeForm.controls["AccountId"].reset();
    this.dateRangeForm.controls["AccountName"].reset();
    this.dateRangeForm.controls["Rate"].reset();
    this.dateRangeForm.controls["Incentive"].reset();
    this.dateRangeForm.controls["FineLeaf"].reset();
  }

  RateAssign() {
    this.dataSource.data.forEach((keys: any, val: any) => {
      keys.Rate = this.dateRangeForm.value.Rate == '' ? 0 : this.dateRangeForm.value.Rate,
        keys.GrossAmount = Number(keys.ChallanWeight * this.dateRangeForm.value.Rate).toFixed(2),
        keys.Incentive = this.dateRangeForm.value.Incentive ?? 0,
        keys.IncentiveAmount = Number(keys.ChallanWeight * (this.dateRangeForm.value.Incentive ?? 0)).toFixed(2),
        keys.FinalAmount = Number(Number(keys.ChallanWeight * this.dateRangeForm.value.Rate) + Number(keys.ChallanWeight * this.dateRangeForm.value.Incentive)).toFixed(2)

    });
    this.dateRangeForm.controls["Rate"].reset();
    this.dateRangeForm.controls["Incentive"].reset();
    this.dateRangeForm.controls["FineLeaf"].reset();
  }

  FixRate() {

    const rateObjects: any[] = [];
    this.dataSource.data.forEach((selectedItem) => {
      // Create the selected object based on the selected item

      const selectedObject = {
        SaleId: selectedItem.SaleId, // Assuming CollectionId is present in your data
        Rate: selectedItem.Rate, // Assuming Status is present in your data
        Incentive: selectedItem.Incentive
      };
      // Push the selected object to the array
      rateObjects.push(selectedObject);
      // Calculate totals

    });

    let data: ISaveSaleRate = {

      TenantId: this.loginDetails.TenantId,
      CreatedBy: this.loginDetails.UserId,
      RateData: rateObjects,
    };


    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '30vw',
      minWidth: '25vw',
      disableClose: true,
      data: {
        title: 'Confirm Action',
        message: 'Do you want to Confirm !',
        data: data,

      },
    });
    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        this.SaveRateFixData(data);


      }
    });
  }

  SaveRateFixData(data: any) {
    this.rateFixService
      .SaveSaleRateFixData(data)
      .pipe(
        takeUntil(this.destroy$),
        catchError((error) => {
          console.error('Error:', error);
          this.toastr.error('An error occurred', 'ERROR');
          throw error;
        })
      )
      .subscribe((res: any) => {

        this.toastr.success(res.Message, "SUCCESS");
        this.clearform();
        this.GetSaleData(formatDate(this.dateRangeForm.value.fromDate, 'yyyy-MM-dd', 'en-US'), formatDate(this.dateRangeForm.value.toDate, 'yyyy-MM-dd', 'en-US'));
        this.RefreshNotifications();
      });
  }


  RefreshNotifications(): void {
    const data: IGetNotifications = {
      TenantId: this.loginDetails.TenantId,
    };
    this.notificationDataService.getNotificationData(data);
  }

  EditRate(element: any) {
    const dialogRef = this.dialog.open(EditSaleRateComponent, {
      width: window.innerWidth <= 1024 ? '40%' : '30%',
      data: {
        title: element.SaleDate + ' - ' + element.FactoryName + ' (' + element.FineLeaf + '%)',
        buttonName: 'Update',
        value: element,
      },
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        if (!environment.production) {

        }
        //  this.GetPaymentData();
        this.dataSource.data.forEach(item => {
          // Replace 'someCondition' with your actual condition
          if (item.SaleId == result.SaleId) {
            // Update the necessary fields

            item.Rate = result.Rate ?? 0;
            item.Incentive = result.Incentive ?? 0;
          }
        });
        this.dataSource.data = [...this.dataSource.data];
        this.dataSource.data.forEach((keys: any, val: any) => {
          //     keys.Rate = this.dateRangeForm.value.Rate == '' ? 0 : this.dateRangeForm.value.Rate,
          keys.GrossAmount = Number(keys.ChallanWeight * keys.Rate).toFixed(2),

            keys.IncentiveAmount = Number(keys.ChallanWeight * keys.Incentive).toFixed(2),
            keys.FinalAmount = Number(Number(keys.ChallanWeight * keys.Rate) + Number(keys.ChallanWeight * keys.Incentive)).toFixed(2)


          // keys.Incentive = this.dateRangeForm.value.Incentive ?? 0,
          // keys.IncentiveAmount = Number(keys.ChallanWeight * this.dateRangeForm.value.Incentive ?? 0).toFixed(2),
          // keys.FinalAmount = Number(Number(keys.ChallanWeight * this.dateRangeForm.value.Rate) + Number(keys.ChallanWeight * this.dateRangeForm.value.Incentive)).toFixed(2)

        });
      }
    });


  }
}
