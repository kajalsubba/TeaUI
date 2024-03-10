import { formatDate } from '@angular/common';
import {
  Component,
  HostListener,
  Inject,
  OnInit,
  ViewChild,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ToastrService } from 'ngx-toastr';
import {
  Subject,
  Subscription,
  catchError,
  map,
  startWith,
  takeUntil,
} from 'rxjs';
import { HelperService } from 'src/app/core/services/helper.service';
import { AutoCompleteService } from 'src/app/modules/collection/services/auto-complete.service';
import { IStgSaleSave, IsaleSave } from 'src/app/modules/collectionApprove/interfaces/isale-save';
import { StgApproveService } from 'src/app/modules/collectionApprove/services/stg-approve.service';
import { IGetFactory } from 'src/app/modules/masters/interfaces/IFactory';
import { IGetGrade } from 'src/app/modules/masters/interfaces/IGrade';
import { FactoryAccountService } from 'src/app/modules/masters/services/factory-account.service';
import { FactoryService } from 'src/app/modules/masters/services/factory.service';

@Component({
  selector: 'app-sale-approve',
  templateUrl: './sale-approve.component.html',
  styleUrls: ['./sale-approve.component.scss']
})
export class SaleApproveComponent implements OnInit {
  saleApproveForm!: FormGroup;

  AccountList: any = [];
  FactoryList: any = [];
  filteredFactory: any = [];
  filteredAccounts: any = [];
  vehicleNumbers: any[] = [];
  private destroy$ = new Subject<void>();
  loginDetails: any;
  private subscriptions: Subscription[] = [];
  selectedRowIndex: number = -1;

  displayedColumns: string[] = [
    'serialNumber',
    'CollectionDate',
    'VehicleNo',
    'ClientName',
    'FirstWeight',
    'WetLeaf',
    'WetLeafKg',
    'LongLeaf',
    'LongLeafKg',
    'Deduction',
    'FinalWeight',
  ];

  dataSource = new MatTableDataSource<any>();
  filteredData: any[] = [];
  columns: { columnDef: string; header: string }[] = [
    { columnDef: 'VehicleNo', header: 'Vehicle NO.' },
    { columnDef: 'ClientName', header: 'Client Name' },
    { columnDef: 'WetLeaf', header: 'Wet Leaf (%)' },

    { columnDef: 'LongLeaf', header: 'Long Leaf (%)' },
  ];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private fb: FormBuilder,
    private helper: HelperService,
    private toastr: ToastrService,
    private autocompleteService: AutoCompleteService,
    private factoryService: FactoryService,
    private accountService: FactoryAccountService,
    private stgapproveService: StgApproveService
  ) {}

  async ngOnInit() {
    this.loginDetails = this.helper.getItem('loginDetails');

    // this.dataSource.data = this.data.approveData;
    this.saleApproveForm = this.fb.group({
      SaleId: [],
      ApproveId: [],
      SaleDate: [new Date()],
      FactoryName: ['', Validators.required],
      AccountId: ['', Validators.required],
      VehicleNo: [''],
      VehicleId: [],
      //   AccountName:[''],
      FieldCollectionWeight: [0],
      //   SaleDate:[new Date()],
      FineLeaf: [0],
      ChallanWeight: ['', Validators.required],
      Rate: [0],
      Incentive: [0],
      GrossAmount: [0],
      Remarks: [''],
      SaleTypeId: [],
    });

 
    this.saleApproveForm.controls['ChallanWeight'].valueChanges.subscribe(() => {
      this.calculateGrossAmount();
    });

    this.saleApproveForm.controls['Rate'].valueChanges.subscribe(() => {
      this.calculateGrossAmount();
    });

    this.saleApproveForm.controls['Incentive'].valueChanges.subscribe(() => {
      this.calculateGrossAmount();
    });

     await this.loadVehicleNumbers();
    await this.GetFactoryList();
    await this.GetFactoryAccountList();

    this.saleApproveForm.controls['FieldCollectionWeight'].setValue(
      this.getTotalCost('FinalWeight')
    );
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



  selectVehicle(number: any) {
    this.saleApproveForm.controls['VehicleId'].setValue(number?.VehicleId);
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
       this.filteredAccounts=res.AccountDetails;
    } catch (error) {
      console.error('Error:', error);
      this.toastr.error('Something went wrong.', 'ERROR');
    }
  }
  SelectFactory(e: any) {
    this.filteredAccounts = this.AccountList.filter(
      (x: any) => x.FactoryId == e
    );
  }
  filterVehicleNumbers(value: string): any {
    const filterValue = value.toLowerCase();
    return this.vehicleNumbers.filter((x: any) =>
      x?.VehicleNo?.toLowerCase()?.includes(filterValue)
    );
  }

  displayWithFn(value: string): string {
    return value || '';
  }

  VehicleInput(value: string) {
    let newVal = value.toUpperCase();
    this.saleApproveForm.controls['VehicleNo'].setValue(newVal);
  }

  filterBuyers(value: string) {
    const filterValue = value.toLowerCase();
    this.filteredFactory = this.FactoryList.filter((buyer: any) =>
      buyer.FactoryName.toLowerCase().includes(filterValue)
    );
  }
  filterAccounts(value: string) {
    const filterValue = value.toLowerCase();
    this.filteredAccounts = this.AccountList.filter((account: any) =>
      account.AccountName.toLowerCase().includes(filterValue)
    );
  }

  getTotalCost(columnName: string): number {
    return this.dataSource.filteredData.reduce(
      (acc, curr) => acc + curr[columnName],
      0
    );
  }

  restrictInput(event: KeyboardEvent) {
    const charCode = event.charCode;
    console.log(charCode);
    if (charCode >= 48 && charCode <= 57) {
      return true;
    } else {
      return false;
    }
  }

  ChallanWeightChange(value: any) {
    this.calculateGrossAmount();
  }
  RateChange(value: any) {
    this.calculateGrossAmount();
  }
  IncentiveChange(value: any) {
    this.calculateGrossAmount();
  }

  private calculateGrossAmount() {
    const challanWeight = this.saleApproveForm.controls['ChallanWeight'].value;
    const rate = this.saleApproveForm.controls['Rate'].value;
    const incentive = this.saleApproveForm.controls['Incentive'].value;
    const grossAmount = challanWeight * (rate + incentive);
    this.saleApproveForm.controls['GrossAmount'].setValue(grossAmount.toFixed(2));
  }

  selectRow(row: any, index: number) {
    this.selectedRowIndex = index; // Set the selected row index
  }

  @HostListener('document:keydown', ['$event'])
  handleKeyboardNavigation(event: KeyboardEvent) {
    event.stopPropagation();
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

  saleApprove(){
    if(this.saleApproveForm.invalid){
      this.saleApproveForm.markAllAsTouched();
    }
  }

}
