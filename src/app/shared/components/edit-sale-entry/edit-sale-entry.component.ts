import { Component, HostListener, Inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ToastrService } from 'ngx-toastr';
import { Subject, Subscription, catchError, takeUntil } from 'rxjs';
import { HelperService } from 'src/app/core/services/helper.service';
import { AutoCompleteService } from 'src/app/modules/collection/services/auto-complete.service';
import { StgApproveService } from 'src/app/modules/collectionApprove/services/stg-approve.service';
import { FactoryAccountService } from 'src/app/modules/masters/services/factory-account.service';
import { FactoryService } from 'src/app/modules/masters/services/factory.service';
import { environment } from 'src/environments/environment';
import { SaleService } from '../../services/sale.service';
import { IGetGrade } from 'src/app/modules/masters/interfaces/IGrade';
import { ISaleStg } from '../../interfaces/isale-stg';
import { IGetFactory } from 'src/app/modules/masters/interfaces/IFactory';
import { ILaterStgEntry, ILaterStgList, IStgSaleSave } from 'src/app/modules/collectionApprove/interfaces/isale-save';
import { formatDate } from '@angular/common';
import { LaterAddEditStgComponent } from 'src/app/modules/collection/models/later-add-edit-stg/later-add-edit-stg.component';

@Component({
  selector: 'app-edit-sale-entry',
  templateUrl: './edit-sale-entry.component.html',
  styleUrls: ['./edit-sale-entry.component.scss']
})
export class EditSaleEntryComponent implements OnInit {
  saleEntryForm!: FormGroup;
  IsApprove: boolean = false;
  AccountList: any = [];
  FactoryList: any = [];
  AddLateralStgData: any = [];
  filteredFactory: any = [];
  filteredAccounts: any = [];
  vehicleNumbers: any[] = [];
  ClientList: any = [];
  private destroy$ = new Subject<void>();
  loginDetails: any;
  private subscriptions: Subscription[] = [];
  selectedRowIndex: number = -1;

  displayedColumns: string[] = [
    'serialNumber',
    'CollectionDate',
    // 'ClientId',
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
    { columnDef: 'ClientName', header: 'Client Name' },
    // { columnDef: 'ClientId', header: 'Client Id' },
    { columnDef: 'WetLeaf', header: 'Wet Leaf (%)' },
    { columnDef: 'LongLeaf', header: 'Long Leaf (%)' },
  ];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    public dialogRef: MatDialogRef<EditSaleEntryComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder,
    private helper: HelperService,
    private toastr: ToastrService,
    private autocompleteService: AutoCompleteService,
    private factoryService: FactoryService,
    private accountService: FactoryAccountService,
    private stgapproveService: StgApproveService,
    private saleService: SaleService,
    private dialog: MatDialog
  ) { }

  async ngOnInit() {
    this.loginDetails = this.helper.getItem('loginDetails');

    this.dataSource.data = this.data.approveData;
    this.saleEntryForm = this.fb.group({
      SaleId: [],
      ApproveId: [],
      SaleDate: [new Date()],
      FactoryName: ['', Validators.required],
      AccountId: ['', Validators.required],
      VehicleNo: [''],
      VehicleId: [],
      FieldCollectionWeight: [0],
      FineLeaf: [0],
      ChallanWeight: ['', Validators.required],
      Rate: [0],
      Incentive: [0],
      GrossAmount: [0],
      Remarks: [''],
      SaleTypeId: [],
    });


    this.saleEntryForm.controls['ChallanWeight'].valueChanges.subscribe(() => {
      this.calculateGrossAmount();
    });

    this.saleEntryForm.controls['Rate'].valueChanges.subscribe(() => {
      this.calculateGrossAmount();
    });

    this.saleEntryForm.controls['Incentive'].valueChanges.subscribe(() => {
      this.calculateGrossAmount();
    });

    await this.loadVehicleNumbers();
    await this.GetFactoryList();
    await this.GetFactoryAccountList();

    this.saleEntryForm.controls['FieldCollectionWeight'].setValue(
      this.getTotalCost('FinalWeight')
    );

    this.saleEntryForm.controls['VehicleNo'].setValue(this.data.VehicleNo);
    this.saleEntryForm.controls['VehicleId'].setValue(this.data.VehicleId);
    this.saleEntryForm.controls['SaleDate'].setValue(
      new Date(this.data.CollectionDate)
    );
    // this.saleEntryForm.controls['FactoryName'].setValue(this.data.stgData.FactoryId);

    // this.filteredAccounts = this.AccountList.filter(
    //   (x: any) => x.FactoryId == this.data.stgData.FactoryId
    // );
    // this.saleEntryForm.controls['AccountId'].setValue(this.data.stgData.AccountId);


    if (this.data.isEdit) {
      this.saleEntryForm.controls['SaleId'].setValue(this.data.stgData.SaleId);
      this.saleEntryForm.controls['SaleDate'].setValue(
        new Date(this.data.stgData.CollectionDate)
      );
      this.saleEntryForm.controls['FactoryName'].setValue(this.data.stgData.FactoryId);

      this.filteredAccounts = this.AccountList.filter(
        (x: any) => x.FactoryId == this.data.stgData.FactoryId
      );
      this.saleEntryForm.controls['AccountId'].setValue(this.data.stgData.AccountId);
      this.saleEntryForm.controls['ChallanWeight'].setValue(this.data.stgData.ChallanWeight);
      this.saleEntryForm.controls['FineLeaf'].setValue(this.data.stgData.FineLeaf);
      this.saleEntryForm.controls['Rate'].setValue(this.data.stgData.Rate);
      this.saleEntryForm.controls['Incentive'].setValue(this.data.stgData.Incentive);
      this.saleEntryForm.controls['GrossAmount'].setValue(this.data.stgData.GrossAmount);
      this.saleEntryForm.controls['Remarks'].setValue(this.data.stgData.Remarks);
      if (this.data.stgData.TypeName == 'STG') {
        await this.GetSaleStgData(this.data.stgData.ApproveId);
      }
      else {
        await this.GetSaleSupplierData(this.data.stgData.ApproveId);
      }
      this.saleEntryForm.controls['FieldCollectionWeight'].setValue(
        this.getTotalCost('FinalWeight')
      );
    }
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

  async GetSaleStgData(ApproveId: any) {
    try {
      const bodyData: ISaleStg = {
        TenantId: this.loginDetails.TenantId,
        ApproveId: ApproveId
      };

      const res: any = await this.saleService
        .GetSaleStgData(bodyData)
        .pipe(takeUntil(this.destroy$))
        .toPromise();

      this.dataSource.data = res.SaleStgData;
      res.SaleStgData.forEach((element: any) => {
        this.ClientList.push(element.ClientId);
      });

      console.log(this.ClientList, 'this.ClientList');

    } catch (error) {
      console.error('Error:', error);
      this.toastr.error('Something went wrong.', 'ERROR');
    }
  }

  async GetSaleSupplierData(ApproveId: any) {
    try {
      const bodyData: ISaleStg = {
        TenantId: this.loginDetails.TenantId,
        ApproveId: ApproveId
      };

      const res: any = await this.saleService
        .GetSaleSupplierData(bodyData)
        .pipe(takeUntil(this.destroy$))
        .toPromise();

      this.dataSource.data = res.SaleSupplierData;
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

  onFocusOutEvent(event: any) {

    if (this.saleEntryForm.value.ChallanWeight < this.saleEntryForm.value.FieldCollectionWeight) {
      this.setValidation('Remarks');
    }
    else {
      this.clearEmailValidation('Remarks')

    }

  }

  clearEmailValidation(controlName: string) {
    this.saleEntryForm.get(controlName)?.clearValidators();
    this.saleEntryForm.get(controlName)?.updateValueAndValidity();
  }

  SaleEntry() {
    this.IsApprove = true;
    if (this.saleEntryForm.invalid) {
      this.saleEntryForm.markAllAsTouched();
      return;
    }
  
    if (this.data.stgData.TypeName == 'STG') {
      const selectedObjects1: any[] = [];
      this.AddLateralStgData.forEach((keys: any, index: any) => {
        // Create the selected object based on the selected item
        const selectedObject1: ILaterStgList = {
          ClientId: keys[0].ClientId,
          FirstWeight: keys[0].FirstWeight,
          WetLeaf: keys[0].WetLeaf,
          LongLeaf: keys[0].LongLeaf,
          Deduction: keys[0].Deduction,
          FinalWeight: keys[0].FinalWeight,
          Rate: keys[0].Rate,
          GradeId: keys[0].GradeId,
          Remarks: keys[0].Remarks,
          TripId: keys[0].TripId,
          TenantId: this.loginDetails.TenantId
        }
        // Push the selected object to the array
        selectedObjects1.push(selectedObject1);
      });

      console.log(selectedObjects1, 'selectedObjects1');
      let lateralData: ILaterStgEntry = {
        SaleId: this.data.stgData.SaleId,
        AccountId: this.saleEntryForm.value.AccountId,
        ApproveId: this.data.stgData.ApproveId,
        CollectionDate: formatDate(this.saleEntryForm.value.SaleDate, 'yyyy-MM-dd', 'en-US'),
        VehicleNo: this.data.stgData.VehicleNo ?? "",
        TotalFirstWeight: this.data.stgData.TotalFirstWeight ?? 0,
        TotalWetLeaf: this.data.stgData.TotalWetLeaf ?? 0,
        TotalLongLeaf: this.data.stgData.TotalLongLeaf ?? 0,
        TotalDeduction: this.data.stgData.TotalDeduction ?? 0,
        TotalFinalWeight: this.saleEntryForm.value.FieldCollectionWeight ?? 0,
        FineLeaf: Number(this.saleEntryForm.value.FineLeaf) ?? 0,
        ChallanWeight: this.saleEntryForm.value.ChallanWeight ?? 0,
        Rate: this.saleEntryForm.value.Rate ?? 0,
        Incentive: this.saleEntryForm.value.Incentive ?? 0,
        GrossAmount: Number(this.saleEntryForm.value.GrossAmount) ?? 0,
        Remarks: this.saleEntryForm.value.Remarks,
        lateralStgLists: selectedObjects1 ?? [],
        TenantId: this.loginDetails.TenantId,
        CreatedBy: this.loginDetails.UserId,
      }
      console.log(lateralData, 'lateralData');

      this.SaveLateralSTGData(lateralData);
    }
    else {
      let data: IStgSaleSave = {
        SaleId: this.data?.isEdit ? this.data.stgData.SaleId : 0,
        TotalFirstWeight: this.data.stgData.TotalFirstWeight ?? 0,
        TotalWetLeaf: this.data.stgData.TotalWetLeaf ?? 0,
        TotalLongLeaf: this.data.stgData.TotalLongLeaf ?? 0,
        TotalDeduction: this.data.stgData.TotalDeduction ?? 0,
        TotalFinalWeight: this.data.stgData.TotalFinalWeight ?? 0,

        ApproveList: this.data.stgData.ApproveList ?? [],
        SaleDate: formatDate(
          this.saleEntryForm.value.SaleDate,
          'yyyy-MM-dd',
          'en-US'
        ),
        AccountId: this.saleEntryForm.value.AccountId,
        VehicleId: this.saleEntryForm.value.VehicleId,
        FieldCollectionWeight: this.saleEntryForm.value.FieldCollectionWeight,
        FineLeaf: this.saleEntryForm.value.FineLeaf,
        ChallanWeight: this.saleEntryForm.value.ChallanWeight,
        Rate: this.saleEntryForm.value.Rate,
        Incentive: this.saleEntryForm.value.Incentive,
        GrossAmount: this.saleEntryForm.value.GrossAmount,
        Remarks: this.saleEntryForm.value.Remarks,
        SaleTypeId: this.data.saleTypeId,
        TenantId: this.loginDetails.TenantId,
        CreatedBy: this.loginDetails.UserId,
      };
      this.SaveSaleData(data);
    }
  }

  SaveSaleData(clientBody: IStgSaleSave) {
    this.stgapproveService
      .SaveStgSaleData(clientBody)
      .pipe(
        takeUntil(this.destroy$),
        catchError((error) => {
          console.error('Error:', error);
          this.toastr.error('An error occurred', 'ERROR');
          throw error;
        })
      )
      .subscribe((res: any) => {

        this.toastr.success(res.Message, 'SUCCESS');
        this.IsApprove = false;
        this.dialogRef.close(true);
    
      });
  }
  SaveLateralSTGData(clientBody: ILaterStgEntry) {
    this.stgapproveService
      .SaveLateralSTGData(clientBody)
      .pipe(
        takeUntil(this.destroy$),
        catchError((error) => {
          console.error('Error:', error);
          this.toastr.error('An error occurred', 'ERROR');
          throw error;
        })
      )
      .subscribe((res: any) => {

        this.toastr.success(res.Message, 'SUCCESS');
        this.IsApprove = false;
        this.dialogRef.close(true);
      });
  }



  setValidation(controlName: string) {
    this.saleEntryForm.get(controlName)?.setValidators([Validators.required]);
    this.saleEntryForm.get(controlName)?.updateValueAndValidity();
  }

  selectVehicle(number: any) {
    this.saleEntryForm.controls['VehicleId'].setValue(number?.VehicleId);
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
      //  this.filteredAccounts=res.AccountDetails;
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
    this.saleEntryForm.controls['VehicleNo'].setValue(newVal);
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

    if (!environment.production) {

      console.log(charCode);
    }

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
    const challanWeight = this.saleEntryForm.controls['ChallanWeight'].value;
    const rate = this.saleEntryForm.controls['Rate'].value;
    const incentive = this.saleEntryForm.controls['Incentive'].value;
    const grossAmount = challanWeight * (rate + incentive);
    this.saleEntryForm.controls['GrossAmount'].setValue(grossAmount.toFixed(2));
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

  addSaleEntry() {
    const dialogRef = this.dialog.open(LaterAddEditStgComponent, {
      width: '80%',
      data: {
        title: 'Add STG Entry',
        buttonName: 'Save',
        value: this.saleEntryForm.value,
        approveId: this.data.stgData.ApproveId,
        clientList: this.ClientList
      },
      disableClose: true,
    });
    dialogRef.afterClosed().subscribe((result: any) => {
      if (result != null) {

        //   const AddDataList:any = this.helper.getItem('AddLaterSTGData');
        const AddStgObjects: any[] = [];
        AddStgObjects.push(result);
        this.AddLateralStgData.push(AddStgObjects);
        this.dataSource.data = [...this.dataSource.data, ...AddStgObjects];
        this.saleEntryForm.controls['FieldCollectionWeight'].setValue(
          this.getTotalCost('FinalWeight')
        );
        // this.saleEntryForm.controls['ChallanWeight'].setValue(
        //   this.getTotalCost('FinalWeight')
        // );
        // console.log(this.AddLateralStgData, 'AddLateralStgData');
      }
    });
  }
}