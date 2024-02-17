import { formatDate } from '@angular/common';
import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ToastrService } from 'ngx-toastr';
import { Subject, Subscription, catchError, map, startWith, takeUntil } from 'rxjs';
import { HelperService } from 'src/app/core/services/helper.service';
import { AutoCompleteService } from 'src/app/modules/collection/services/auto-complete.service';
import { IsaleSave } from 'src/app/modules/collectionApprove/interfaces/isale-save';
import { StgApproveService } from 'src/app/modules/collectionApprove/services/stg-approve.service';
import { IGetFactory } from 'src/app/modules/masters/interfaces/IFactory';
import { IGetGrade } from 'src/app/modules/masters/interfaces/IGrade';
import { FactoryAccountService } from 'src/app/modules/masters/services/factory-account.service';
import { FactoryService } from 'src/app/modules/masters/services/factory.service';

@Component({
  selector: 'app-sale-entry',
  templateUrl: './sale-entry.component.html',
  styleUrls: ['./sale-entry.component.scss']
})
export class SaleEntryComponent implements OnInit {

  saleEntryForm!:FormGroup;

  AccountList:any=[];
  FactoryList:any=[];
  filteredFactory:any=[];
  filteredAccounts :any=[];
  vehicleNumbers: any[]=[];
  private destroy$ = new Subject<void>();
  loginDetails: any;
  private subscriptions: Subscription[] = [];

  displayedColumns: string[] = [
    'CollectionDate',
    'VehicleNo',
    'ClientName',
    'FirstWeight',
    'WetLeaf',
    'WetLeafKg',
    'LongLeaf',
    'LongLeafKg',
    'Deduction',
    'FinalWeight'

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
    public dialogRef: MatDialogRef<SaleEntryComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb:FormBuilder,
    private helper:HelperService,
    private toastr:ToastrService,
    private autocompleteService: AutoCompleteService,
    private factoryService:FactoryService,
    private accountService:FactoryAccountService,
    private stgapproveService:StgApproveService
  ){}

  async ngOnInit() {
    this.loginDetails = this.helper.getItem('loginDetails');
    
    this.dataSource.data = this.data.approveData;
      this.saleEntryForm = this.fb.group({
        SaleId:[],
        ApproveId:[],
        SaleDate:[new Date()],
        FactoryName:['',Validators.required],
        AccountId:['',Validators.required],
        VehicleNo:[''],
        VehicleId:[],
     //   AccountName:[''],
     FieldCollectionWeight:[0],
     //   SaleDate:[new Date()],
     FineLeaf:[0],
     ChallanWeight:[0,Validators.required],
        Rate:[0],
        Incentive:[0],
        GrossAmount:[0],
        Remarks:[''],
        SaleTypeId:[]
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
      this.saleEntryForm.controls['FieldCollectionWeight'].setValue(this.getTotalCost('FinalWeight'));

      this.saleEntryForm.controls["VehicleNo"].setValue(this.data.VehicleNo);
      this.saleEntryForm.controls["VehicleId"].setValue(this.data.VehicleId);
      await this.loadVehicleNumbers();
      await this.GetFactoryList();
      await this.GetFactoryAccountList();
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
  async GetFactoryList() {
    try {
        const bodyData: IGetFactory = {
            TenantId: this.loginDetails.TenantId
        };

        const res: any = await this.factoryService.GetFactory(bodyData)
            .pipe(takeUntil(this.destroy$))
            .toPromise();

        this.FactoryList = res.FactoryDetails;
        this.filteredFactory=res.FactoryDetails;
        console.log( this.FactoryList ,' this.FactoryList ');
  

    } catch (error) {
        console.error('Error:', error);
        this.toastr.error('Something went wrong.', 'ERROR');
    }
}
SaleEntry()
{

  if(this.saleEntryForm.invalid){
    this.saleEntryForm.markAllAsTouched();
    return;
  }
// Create the data object to be saved
let data: IsaleSave = {
  SaleId: 0,
  ApproveId: this.data.approveId,
  SaleDate: formatDate(this.saleEntryForm.value.SaleDate, 'yyyy-MM-dd', 'en-US'),
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
  CreatedBy: this.loginDetails.UserId

};

console.log(data,'save sale data');

this.SaveSaleData(data);

}

SaveSaleData(clientBody: IsaleSave) {
  this.stgapproveService.SaveSale(clientBody)
      .pipe(
          takeUntil(this.destroy$),
          catchError(error => {
              console.error('Error:', error);
              this.toastr.error('An error occurred', 'ERROR');
              throw error;
          })
      )
      .subscribe((res: any) => {
          //console.log(res);
         this.toastr.success(res.Message, 'SUCCESS');
         this.dialogRef.close(true)
         
        
      
   
      });
}


selectVehicle(number:any)
{
  this.saleEntryForm.controls['VehicleId'].setValue(number?.VehicleId);
}

async GetFactoryAccountList() {
  try {
      const bodyData: IGetFactory = {
          TenantId: this.loginDetails.TenantId
      };

      const res: any = await this.accountService.GetFactoryAccount(bodyData)
          .pipe(takeUntil(this.destroy$))
          .toPromise();

      this.AccountList = res.AccountDetails;
    //  this.filteredAccounts=res.AccountDetails;
    

  } catch (error) {
      console.error('Error:', error);
      this.toastr.error('Something went wrong.', 'ERROR');
  }
}
SelectFactory(e:any)
{
  this.filteredAccounts=   this.AccountList.filter((x:any)=> x.FactoryId==e)
  
}
filterVehicleNumbers(value: string): any {
  const filterValue = value.toLowerCase();
  return this.vehicleNumbers.filter((x:any) => x?.VehicleNo?.toLowerCase()?.includes(filterValue));
}

displayWithFn(value: string): string {
  return value || '';
}

VehicleInput(value:string){
  let newVal = value.toUpperCase();
  this.saleEntryForm.controls['VehicleNo'].setValue(newVal);
}

  filterBuyers(value: string) {
    const filterValue = value.toLowerCase();
    this.filteredFactory = this.FactoryList.filter((buyer:any) => buyer.FactoryName.toLowerCase().includes(filterValue));
  }
  filterAccounts(value: string) {
    const filterValue = value.toLowerCase();
    this.filteredAccounts = this.AccountList.filter((account:any) => account.AccountName.toLowerCase().includes(filterValue));
  }

  getTotalCost(columnName: string): number {
    return this.dataSource.filteredData.reduce((acc, curr) => acc + curr[columnName], 0);
  }

  restrictInput(event: KeyboardEvent) {
    const charCode = event.charCode;
    console.log(charCode);
    if(charCode >= 48 && charCode <= 57){
      return true;
    }else{
      return false;
    }
}

ChallanWeightChange(value:any){
  this.calculateGrossAmount();
}
RateChange(value:any){
  this.calculateGrossAmount();
}
IncentiveChange(value:any){
  this.calculateGrossAmount();
}

private calculateGrossAmount() {
  const challanWeight = this.saleEntryForm.controls['ChallanWeight'].value;
  const rate = this.saleEntryForm.controls['Rate'].value;
  const incentive = this.saleEntryForm.controls['Incentive'].value;
  const grossAmount = challanWeight * (rate + incentive);
  this.saleEntryForm.controls['GrossAmount'].setValue(grossAmount.toFixed(2));
}


}
