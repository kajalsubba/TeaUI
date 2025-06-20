import { Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { HelperService } from 'src/app/core/services/helper.service';
import { IGetGrade } from 'src/app/modules/masters/interfaces/IGrade';
import { AutoCompleteService } from '../../services/auto-complete.service';
import { DatePipe, formatDate } from '@angular/common';
import { ReplaySubject, Subject, Subscription, takeUntil } from 'rxjs';
import { IGetFactoryAccount } from 'src/app/modules/masters/interfaces/IFactoryAccount';
import { ImageViewerComponent } from 'src/app/shared/components/image-viewer/image-viewer.component';
import { IGetFactory } from 'src/app/modules/masters/interfaces/IFactory';
import { StgService } from '../../services/stg.service';
import { ISupplier, IUploadChallan } from '../../interfaces/isupplier';
import { SupplierService } from '../../services/supplier.service';
import { IGetTeaClient } from '../../interfaces/istg';
import { MatSelect } from '@angular/material/select';
import { IClient } from 'src/app/modules/bill-generate/interfaces/iget-stg-bill';


@Component({
  selector: 'app-add-edit-supplier',
  templateUrl: './add-edit-supplier.component.html',
  styleUrls: ['./add-edit-supplier.component.scss'],
})
export class AddEditSupplierComponent implements OnInit {
  today: Date = new Date();
  isSubmitting = false;
  supplierForm!: FormGroup;
  imageUrl: any | ArrayBuffer | null = null;
  ClientNames: any[] = [];
  private destroy$ = new Subject<void>();
  loginDetails: any;
  accountNames: any[] = [];
  AccountList: any = [];
  FilteredTranscationType: any[] = [];
  vehicleNumbers: any[] = [];
  filteredFactory: any[] = [];
  FactoryList: any[] = [];
  statusList: string[] = ['Pending', 'Rejected', 'Approved']
  TripList: any[] = [];
  @ViewChild('CollectDate') CollDateInput!: ElementRef;
  @ViewChild('VehicleNo') VehicleNoInput!: ElementRef;
  private subscriptions: Subscription[] = [];
  FileData: any;
  @ViewChild('singleSelect', { static: true }) singleSelect!: MatSelect;
  public filteredClients: ReplaySubject<IClient[]> = new ReplaySubject<IClient[]>(1);
  @ViewChild('ClientName') ClientNoInput!: ElementRef;
  constructor(
    @Inject(MAT_DIALOG_DATA) public dialogData: any,
    public dialogRef: MatDialogRef<AddEditSupplierComponent>,
    private fb: FormBuilder,
    private helper: HelperService,
    private toastr: ToastrService,
    private autocompleteService: AutoCompleteService,
    private dialog: MatDialog,
    private stgService: StgService,
    private datepipe: DatePipe,
    private supplierService: SupplierService
  ) { }

  async ngOnInit() {
    this.loginDetails = this.helper.getItem('loginDetails');

    //  var dd = this.dialogData.value;
    this.supplierForm = this.fb.group({
      CollectionDate: [new Date()],
      ClientName: ['', Validators.required],
      ClientId: [0, Validators.required],
      AccountName: ['', Validators.required],
      FactoryName: ['', Validators.required],
      AccountId: [0, Validators.required],
      VehicleNo: ['', Validators.required],
      FineLeaf: [null],
      ChallanWeight: [0, Validators.required],
      Rate: [0],
      GrossAmount: [0],
      Status: ['Pending'],
      TripId: ['', Validators.required],
      ChallanImage: ['', this.loginDetails.LoginType == 'Client' && this.dialogData.value?.imageUrl == '' ? Validators.required : ''],
      Remarks: [],
      ClienFilterCrtl: ['']
    });
    await this.loadClientNames();
    await this.loadFactoryNames();
    await this.loadAccountNames();
    await this.loadVehicleNumbers();
    await this.GeTript();
    if (this.loginDetails.LoginType == 'Client') {
      // this.supplierForm.controls['ClientName'].setValue(this.loginDetails.ClientName);
      // this.supplierForm.controls['ClientId'].setValue(this.loginDetails.ClientId);

      const selectedClient = { ClientName: this.loginDetails.ClientName, ClientId: this.loginDetails.ClientId }; // Example selected client
      this.supplierForm.patchValue({
        ClientName: selectedClient.ClientId,
      });

      this.supplierForm.controls['ClientName'].disable({ onlySelf: true });
      this.supplierForm.controls['Rate'].disable({ onlySelf: true });
    }
    //  this.FilteredTranscationType = this.TranscationTypeList;

    if (this.dialogData.value) {
      // debugger
      //  console.log(this.dialogData.value, 'this.dialogData.value');
      this.SelectFactory(this.dialogData.value.FactoryId);
      // ClientId: this.supplierForm.value.ClientName?.ClientId ?? 0,
      this.supplierForm.controls['CollectionDate'].setValue(new Date(this.dialogData.value.CollDate));
      this.supplierForm.controls['ClientName'].setValue(this.dialogData.value.ClientId);
      this.supplierForm.controls['ClientId'].setValue(this.dialogData.value.ClientId);

      // const selectedClient = { ClientName: this.dialogData.value.ClientName, ClientId: this.dialogData.value.ClientId }; // Example selected client
      // this.supplierForm.patchValue({
      //   ClientName: selectedClient.ClientId,
      // });
      this.supplierForm.controls['VehicleNo'].setValue(this.dialogData.value.VehicleNo);
      this.supplierForm.controls['FactoryName'].setValue(this.dialogData.value.FactoryId);
      this.supplierForm.controls['AccountName'].setValue(this.dialogData.value.AccountName);
      this.supplierForm.controls['AccountId'].setValue(this.dialogData.value.AccountId);

      this.supplierForm.controls['FineLeaf'].setValue(this.dialogData.value.FineLeaf);
      this.supplierForm.controls['ChallanWeight'].setValue(this.dialogData.value.ChallanWeight);
      this.supplierForm.controls['Rate'].setValue(this.dialogData.value.Rate);
      this.supplierForm.controls['GrossAmount'].setValue(this.dialogData.value.GrossAmount);

      this.supplierForm.controls['Remarks'].setValue(this.dialogData.value.Remarks);
      this.supplierForm.controls['Status'].setValue(this.dialogData.value.Status);
      console.log(this.dialogData.value.TripId, 'this.dialogData.value.TripId');

      this.supplierForm.controls['TripId'].setValue(this.dialogData.value.TripId);
      if (this.loginDetails.LoginType == 'Client') {
        this.imageUrl = this.dialogData.value.imageUrl;
      }


    }

    // load the initial bank list
    this.filteredClients.next(this.ClientNames.slice());

    // // listen for search field value changes
    this.supplierForm.controls["ClienFilterCrtl"].valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.filteredClientsData();
      });
  }

  private filteredClientsData() {
    // debugger
    if (!this.ClientNames) {
      return;
    }
    // get the search keyword
    let search = this.supplierForm.controls["ClienFilterCrtl"].value;
    if (!search) {
      this.filteredClients.next(this.ClientNames.slice());
      return;
    } else {
      search = search.toLowerCase();
    }
    // filter the banks
    this.filteredClients.next(
      this.ClientNames.filter(x => x.ClientName.toLowerCase().indexOf(search) > -1)
    );
  }

  CleanFormControl() {


    this.supplierForm.controls['FactoryName'].reset()
    this.supplierForm.controls['AccountId'].reset()
    this.supplierForm.controls['AccountName'].reset()
    this.supplierForm.controls['VehicleNo'].reset()
    this.supplierForm.controls['FineLeaf'].reset()

    this.supplierForm.controls['ChallanWeight'].reset()
    this.supplierForm.controls['Rate'].reset()

    this.supplierForm.controls['GrossAmount'].reset()
    this.supplierForm.controls['Remarks'].reset()
    this.supplierForm.controls['ChallanImage'].reset()
  }


  async loadClientNames() {
    try {
      const bodyData: IGetTeaClient = {
        TenantId: this.loginDetails.TenantId,
        Category: 'Supplier'

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


  async GeTript() {
    try {

      const res: any = await this.stgService
        .GetTrip()
        .pipe(takeUntil(this.destroy$))
        .toPromise();

      this.TripList = res.TripDetails;
      this.supplierForm.controls['TripId'].setValue(this.TripList[0].TripId);
    } catch (error) {
      console.error('Error:', error);
      this.toastr.error('Something went wrong.', 'ERROR');
    }
  }
  // GeTript() {

  //   const gradeGetService = this.stgService.GetTrip().subscribe((res: any) => {
  //     this.TripList = res.TripDetails;
  //     this.supplierForm.controls['TripId'].setValue(this.TripList[0].TripId);
  //   });



  // }
  async loadAccountNames() {
    try {
      const bodyData: IGetFactoryAccount = {
        TenantId: this.loginDetails.TenantId,
      };

      const res: any = await this.autocompleteService
        .GetAccountNames(bodyData)
        .pipe(takeUntil(this.destroy$))
        .toPromise();

      this.AccountList = res.AccountDetails;
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

  async loadFactoryNames() {
    try {
      const bodyData: IGetFactory = {
        TenantId: this.loginDetails.TenantId,
        IsClientView: this.loginDetails.LoginType == 'Client' ? true : false
      };

      const res: any = await this.autocompleteService
        .GetFactoryNames(bodyData)
        .pipe(takeUntil(this.destroy$))
        .toPromise();

      this.filteredFactory = res.FactoryDetails;
      this.FactoryList = res.FactoryDetails;
    } catch (error) {
      console.error('Error:', error);
      this.toastr.error('Something went wrong.', 'ERROR');
    }
  }
  SelectFactory(e: any) {
    this.supplierForm.controls['AccountName'].reset();
    this.supplierForm.controls['AccountId'].reset();
    this.accountNames = this.AccountList.filter((x: any) => x.FactoryId == e)

  }

  filterFactory(value: string) {
    debugger
    const filterValue = value.toLowerCase();
    this.filteredFactory = this.FactoryList.filter((buyer: any) => buyer.FactoryName.toLowerCase().includes(filterValue));
  }

  // Autocomplete function
  filterClientNames(value: string): any[] {
    const filterValue = value.toLowerCase();
    // console.log(this.ClientNames.filter((number:any) => number.toLowerCase().includes(filterValue)),'Clinet');
    return this.ClientNames.filter((x: any) =>
      x?.ClientName?.toLowerCase()?.includes(filterValue)
    );
  }

  // filterTransactionType(value: string) {
  //   const filterValue = value.toLowerCase();
  //   this.FilteredTranscationType = this.TranscationTypeList.filter((x: any) =>
  //     x?.TransactionName?.toLowerCase()?.includes(filterValue)
  //   );
  // }

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


  FineLeafInput(value: any) { }

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
    this.FileData = file;
  }

  openImage(imageUrl: any) {
    const dialogRef = this.dialog.open(ImageViewerComponent, {
      width: "80vw",
      height: "95%",
      disableClose: true,
      data: {
        title: "Image Viewer",
        imageUrl: imageUrl
      }
    })
  }

  async onSubmit() {
    debugger

    if (this.supplierForm.invalid) {
      this.supplierForm.markAllAsTouched();
      return;
    }
    //  console.log(this.supplierForm.value, ' this.supplierForm.value');

    let data: ISupplier = {
      CollectionId: this.dialogData?.value?.CollectionId ? this.dialogData?.value?.CollectionId : 0,
      CollectionDate: formatDate(this.supplierForm.value.CollectionDate, 'yyyy-MM-dd', 'en-US'),
      VehicleNo: this.supplierForm.value.VehicleNo,
      ClientId: this.supplierForm.value.ClientName ?? 0,
      AccountId: this.supplierForm.value.AccountId,
      FineLeaf: this.supplierForm.value.FineLeaf,
      ChallanWeight: this.supplierForm.value.ChallanWeight,
      Rate: this.supplierForm.value.Rate ?? 0,
      GrossAmount: this.supplierForm.value.GrossAmount,
      TripId: this.supplierForm.value.TripId,

      Remarks: this.supplierForm.value.Remarks,
      Status: this.supplierForm.value.Status,
      TenantId: this.loginDetails.TenantId,
      CreatedBy: this.loginDetails.UserId

    }
    // console.log(data, 'data');
    // return
    this.isSubmitting = true;
    var CollId = await this.SaveSupplier(data);

    if (this.loginDetails.LoginType == 'Client') {

      if (this.FileData != undefined) {
        this.uploadChallan(CollId.Id)
      }
      else {
        if (CollId.Id == 0) {
          this.toastr.warning(CollId.Message, "Warning");
        }
        else {
          this.toastr.success(CollId.Message, "SUCCESS");
        }
      }
      this.isSubmitting = false;
    }
    else {
      if (CollId.Id == 0) {
        this.toastr.warning(CollId.Message, "Warning");
      }
      else {
        this.toastr.success(CollId.Message, "SUCCESS");
      }
      this.CollDateInput.nativeElement.focus();
      this.CleanFormControl();

      this.supplierForm.controls['ClientName'].reset()
      this.supplierForm.controls['ClientId'].reset(0);
      this.isSubmitting = false;
      //  this.dialogRef.close(true);
    }

  }



  uploadChallan(CollectionId: any) {

    if (this.supplierForm.invalid) {
      this.supplierForm.markAllAsTouched();
      return;
    }
    let bodyData: IUploadChallan = {

      TenantId: this.loginDetails.TenantId,
      CollectionId: CollectionId

    }

    const saveCategory = this.supplierService.UploadChallan(bodyData, this.FileData).subscribe((res: any) => {
      this.toastr.success(res.Message, "SUCCESS");

      this.CleanFormControl();
      this.imageUrl = null;
      this.VehicleNoInput.nativeElement.focus();
      this.isSubmitting = false;
    })

  }

  async SaveSupplier(bodyData: ISupplier) {
    try {

      const res: any = await this.supplierService.SaveSupplier(bodyData)
        .pipe(takeUntil(this.destroy$))
        .toPromise();

      //  this.toastr.success(res.Message, 'SUCCESS');
      return res;

    } catch (error) {
      this.isSubmitting = false;
      console.error('Error:', error);
      this.toastr.error('Something went wrong.', 'ERROR');
    }
  }


  ngOnDestroy(): void {
    this.subscriptions.forEach((sub) => {
      sub.unsubscribe();
    })
    this.dialogRef.close(true);
  }
}
