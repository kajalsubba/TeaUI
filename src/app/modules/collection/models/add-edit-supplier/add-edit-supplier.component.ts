import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { HelperService } from 'src/app/core/services/helper.service';
import { IGetGrade } from 'src/app/modules/masters/interfaces/IGrade';
import { AutoCompleteService } from '../../services/auto-complete.service';
import { DatePipe } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';
import { IGetFactoryAccount } from 'src/app/modules/masters/interfaces/IFactoryAccount';
import { ImageViewerComponent } from 'src/app/shared/components/image-viewer/image-viewer.component';

@Component({
  selector: 'app-add-edit-supplier',
  templateUrl: './add-edit-supplier.component.html',
  styleUrls: ['./add-edit-supplier.component.scss'],
})
export class AddEditSupplierComponent implements OnInit {
  supplierForm!: FormGroup;
  imageUrl: any | ArrayBuffer | null = null;
  ClientNames: any[] = [];
  private destroy$ = new Subject<void>();
  loginDetails: any;
  accountNames: any[] = [];
  TranscationTypeList: any[] = [
    {
      TransactionName: 'Transaction 1',
      TransactionId: 1,
    },
    {
      TransactionName: 'Transaction 2',
      TransactionId: 2,
    },
    {
      TransactionName: 'Transaction 3',
      TransactionId: 3,
    },
  ];
  FilteredTranscationType: any[] = [];
  vehicleNumbers: any[] = [];
  filteredFactory: any[]=[];
  FactoryList: any[]=[];

  constructor(
    @Inject(MAT_DIALOG_DATA) public dialogData: any,
    public dialogRef: MatDialogRef<AddEditSupplierComponent>,
    private fb: FormBuilder,
    private helper: HelperService,
    private toastr: ToastrService,
    private autocompleteService: AutoCompleteService,
    private dialog: MatDialog,
    private datepipe: DatePipe
  ) {}

  async ngOnInit() {
    this.loginDetails = this.helper.getItem('loginDetails');
    this.supplierForm = this.fb.group({
      TransactDate: [new Date()],
      ClientName: ['', Validators.required],
      ClientId: [null],
      BuyerName: ['', Validators.required],
      AccountName: ['', Validators.required],
      FactoryName: ['', Validators.required],
      AccountId: [null],
      TransactionType: ['', Validators.required],
      VehicleNo: ['', Validators.required],
      FineLeaf: [null, Validators.required],
      ChallanWeight: [0, Validators.required],
      Rate: [0, Validators.required],
      GrossAmount: [0, Validators.required],
    });
    await this.loadClientNames();
    await this.loadAccountNames();
    await this.loadVehicleNumbers();
    this.FilteredTranscationType = this.TranscationTypeList;
  }

  async loadClientNames() {
    try {
      const bodyData: IGetGrade = {
        TenantId: this.loginDetails.TenantId,
      };

      const res: any = await this.autocompleteService
        .GetClientNames(bodyData)
        .pipe(takeUntil(this.destroy$))
        .toPromise();

      this.ClientNames = res.ClientDetails;
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

      const res: any = await this.autocompleteService
        .GetAccountNames(bodyData)
        .pipe(takeUntil(this.destroy$))
        .toPromise();

      this.accountNames = res.AccountDetails;
    } catch (error) {
      console.error('Error:', error);
      this.toastr.error('Something went wrong.', 'ERROR');
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

  SelectFactory(e:any)
{
  this.filteredFactory =   this.FactoryList.filter((x:any)=> x.FactoryId==e)
  
}

filterFactory(value: string) {
  const filterValue = value.toLowerCase();
  this.filteredFactory = this.FactoryList.filter((buyer:any) => buyer.FactoryName.toLowerCase().includes(filterValue));
}

  // Autocomplete function
  filterClientNames(value: string): any[] {
    const filterValue = value.toLowerCase();
    // console.log(this.ClientNames.filter((number:any) => number.toLowerCase().includes(filterValue)),'Clinet');
    return this.ClientNames.filter((x: any) =>
      x?.ClientName?.toLowerCase()?.includes(filterValue)
    );
  }

  filterTransactionType(value: string) {
    const filterValue = value.toLowerCase();
    this.FilteredTranscationType = this.TranscationTypeList.filter((x: any) =>
      x?.TransactionName?.toLowerCase()?.includes(filterValue)
    );
  }

  filterAccountNames(value: string): any {
    const filterValue = value.toLowerCase();
    return this.accountNames.filter((x: any) =>
      x?.AccountName?.toLowerCase()?.includes(filterValue)
    );
  }

  // Autocomplete function
  filterVehicleNumbers(value: string): any {
    const filterValue = value.toLowerCase();
    return this.vehicleNumbers.filter((x: any) =>
      x?.VehicleNo?.toLowerCase()?.includes(filterValue)
    );
  }

  displayWithFn(value: string): string {
    return value || '';
  }

  selectClient(client: any) {
    this.supplierForm.controls['ClientId'].setValue(client?.ClientId);
  }

  selectAccount(account: any) {
    this.supplierForm.controls['AccountId'].setValue(account?.AccountId);
  }

  VehicleInput(value: string) {
    let newVal = value.toUpperCase();
    this.supplierForm.controls['VehicleNo'].setValue(newVal);
  }

  FineLeafInput(value: any) {}

  ChallanWeightInput(value: any) {
    this.calculateGrossAmount();
  }
  RateInput(value: any) {
    this.calculateGrossAmount();
  }
  private calculateGrossAmount() {
    const challanWeight = this.supplierForm.controls['ChallanWeight'].value;
    const rate = this.supplierForm.controls['Rate'].value;
    const grossAmount = challanWeight * rate;
    this.supplierForm.controls['GrossAmount'].setValue(grossAmount.toFixed(2));
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

  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    // Read the file as a data URL
    const reader = new FileReader();
    reader.onload = (e) => {
      this.imageUrl = e.target?.result;
    };
    reader.readAsDataURL(file);
  }

  openImage(imageUrl:any){
    const dialogRef = this.dialog.open(ImageViewerComponent, {
      width:"80vw",
      height:"95%",
      disableClose:true,
      data:{
        title:"Image Viewer",
        imageUrl:imageUrl
      }
    })
  }

  onSubmit() {}
}
