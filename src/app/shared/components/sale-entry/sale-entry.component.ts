import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ToastrService } from 'ngx-toastr';
import { Subject, map, startWith, takeUntil } from 'rxjs';
import { HelperService } from 'src/app/core/services/helper.service';
import { AutoCompleteService } from 'src/app/modules/collection/services/auto-complete.service';
import { IGetGrade } from 'src/app/modules/masters/interfaces/IGrade';

@Component({
  selector: 'app-sale-entry',
  templateUrl: './sale-entry.component.html',
  styleUrls: ['./sale-entry.component.scss']
})
export class SaleEntryComponent implements OnInit {

  saleEntryForm!:FormGroup;
  buyers = [
    { value: 'buyer1', viewValue: 'Buyer 1' },
    { value: 'buyer2', viewValue: 'Buyer 2' },
    { value: 'buyer3', viewValue: 'Buyer 3' }
  ];
  filteredBuyers = this.buyers;
  accounts = [
    { value: 'account1', viewValue: 'Account 1' },
    { value: 'account2', viewValue: 'Account 2' },
    { value: 'account3', viewValue: 'Account 3' }
  ];
  filteredAccounts = this.accounts;
  vehicleNumbers: any[]=[];
  private destroy$ = new Subject<void>();
  loginDetails: any;

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
    'FinalWeight',
    'GradeName',
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
    { columnDef: 'WetLeaf', header: 'Wet Leaf (%)' },
   // { columnDef: 'WetLeafKg', header: 'Wet Leaf (KG) ' },
    { columnDef: 'LongLeaf', header: 'Long Leaf (%)' },
   // { columnDef: 'LongLeafKg', header: 'Long Leaf (KG)' },
  //  { columnDef: 'Grade', header: 'Grade' },
    { columnDef: 'GradeName', header: 'Grade' },
    { columnDef: 'Rate', header: 'Rate' },
    { columnDef: 'GrossAmount', header: 'Gross Amount' },
    { columnDef: 'Remarks', header: 'Remarks' },
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
  ){}

  async ngOnInit() {
    this.loginDetails = this.helper.getItem('loginDetails');
    this.dataSource.data = this.data.approveData;
      this.saleEntryForm = this.fb.group({
        StartDate:[new Date()],
        BuyerName:[''],
        VehicleNo:[''],
        AccountName:[''],
        FinalCollection:[0],
        SaleDate:[new Date()],
        FineLeaf:[0],
        ChallanWeight:[0],
        Rate:[0],
        GrossAmount:[0],
        Incentive:[0],
        Remarks:[''],
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
      this.saleEntryForm.controls['FinalCollection'].setValue(this.getTotalCost('FinalWeight'));
      await this.loadVehicleNumbers();
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
    this.filteredBuyers = this.buyers.filter(buyer => buyer.viewValue.toLowerCase().includes(filterValue));
  }
  filterAccounts(value: string) {
    const filterValue = value.toLowerCase();
    this.filteredAccounts = this.accounts.filter(account => account.viewValue.toLowerCase().includes(filterValue));
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
  this.saleEntryForm.controls['GrossAmount'].setValue(Math.round(grossAmount));
}


}
