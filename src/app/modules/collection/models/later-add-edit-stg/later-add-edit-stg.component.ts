import { Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { Subject, Subscription, catchError, takeUntil } from 'rxjs';
import { IGetGrade } from 'src/app/modules/masters/interfaces/IGrade';
import { environment } from 'src/environments/environment';
import { IGetTeaClient, ILaterStg, IStg } from '../../interfaces/istg';
import { IGetFactory } from 'src/app/modules/masters/interfaces/IFactory';
import { DatePipe, formatDate } from '@angular/common';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { HelperService } from 'src/app/core/services/helper.service';
import { ToastrService } from 'ngx-toastr';
import { StgService } from '../../services/stg.service';
import { AutoCompleteService } from '../../services/auto-complete.service';
import { GradeService } from 'src/app/modules/masters/services/grade.service';

@Component({
  selector: 'app-later-add-edit-stg',
  templateUrl: './later-add-edit-stg.component.html',
  styleUrls: ['./later-add-edit-stg.component.scss']
})
export class LaterAddEditStgComponent implements OnInit {
  isSubmitting = false;
  stgForm!: FormGroup;
  private destroy$ = new Subject<void>();
  @ViewChild('clientName') ClientNoInput!: ElementRef;
  currentDate: Date = new Date();
  vehicleNumbers: any[] = [];
  loginDetails: any;
  ClientNames: any[] = [];
  GradeList: any[] = [];
  TripList: any[] = [];
  myDatepipe!: any;
  addData: any = null;
  statusList: string[] = ['Pending', 'Rejected', 'Approved']
  private subscriptions: Subscription[] = [];

  constructor(
    @Inject(MAT_DIALOG_DATA) public dialogData: any,
    public dialogRef: MatDialogRef<LaterAddEditStgComponent>,
    private fb: FormBuilder,
    private helper: HelperService,
    private toastr: ToastrService,
    private stgService: StgService,
    private autocompleteService: AutoCompleteService,
    private gradeService: GradeService,
    private datepipe: DatePipe
  ) { }

  async ngOnInit() {
    this.loginDetails = this.helper.getItem('loginDetails');
    this.stgForm = this.fb.group({
      CollectionDate: [new Date()],
      ApproveId: [],
      VehicleNo: ['', Validators.required],
      ClientName: ['', Validators.required],
      ClientId: ['', Validators.required],
      FirstWeight: [0, Validators.required],
      WetLeaf: [0],
      LongLeaf: [0],
      Deduction: [0],
      FinalWeight: [0],
      GradeId: ['', Validators.required],
      Rate: [0],
      Remarks: [''],
      Status: ['Pending'],
      TripId: ['', Validators.required]
    });
    await this.loadClientNames();
    await this.loadVehicleNumbers();
    this.getFactoryDate();
    this.getGradeList();
    this.GeTript();

    if (this.dialogData.value) {
      //  console.log(this.dialogData, 'this.dialogData');

      this.stgForm.controls['CollectionDate'].setValue(formatDate(this.dialogData.value.SaleDate, 'yyyy-MM-dd', 'en-US'));
      //   this.stgForm.get('date').patchValue(new Date('2/14/2021')));

      this.stgForm.controls['ClientName'].setValue(this.dialogData.value.ClientName);
      this.stgForm.controls['ClientId'].setValue(this.dialogData.value.ClientId);
      this.stgForm.controls['VehicleNo'].setValue(this.dialogData.value.VehicleNo);
      this.stgForm.controls['ApproveId'].setValue(this.dialogData.approveId);

    }
  }

  FirstWeightInput(value: any) {
    //console.log(value);
    this.CalculateFinalWeight();
  }

  LongLeafInput(value: any) {
    this.calculateDeductionAndFinalWeight();
  }

  WetLeafInput(value: any) {
    this.calculateDeductionAndFinalWeight();
  }

  CalculateFinalWeight() {
    const FirstWeight = this.stgForm.value.FirstWeight || 0;
    const WetLeafPercentage = (this.stgForm.value.WetLeaf || 0) / 100;
    const LongLeafPercentage = (this.stgForm.value.LongLeaf || 0) / 100;

    // Calculate WetLeaf and LongLeaf in kg
    const WetLeaf = FirstWeight * WetLeafPercentage;
    const LongLeaf = FirstWeight * LongLeafPercentage;

    // Deduction is the sum of WetLeaf and LongLeaf
    const Deduction = Math.round(WetLeaf + LongLeaf);

    // Calculate final weight in kg
    const FinalWeight = Math.round(FirstWeight - Deduction);

    // Update the form control
    this.stgForm.controls['Deduction'].setValue(Deduction);
    this.stgForm.controls['FinalWeight'].setValue(FinalWeight);
  }

  calculateDeductionAndFinalWeight() {
    const FirstWeight = this.stgForm.value.FirstWeight || 0;
    const WetLeafPercentage = (this.stgForm.value.WetLeaf || 0) / 100;
    const LongLeafPercentage = (this.stgForm.value.LongLeaf || 0) / 100;

    // Calculate WetLeaf and LongLeaf in kg
    const WetLeaf = FirstWeight * WetLeafPercentage;
    const LongLeaf = FirstWeight * LongLeafPercentage;

    // Deduction is the sum of WetLeaf and LongLeaf
    const Deduction = Math.round(WetLeaf + LongLeaf);

    // Update the form controls
    this.stgForm.controls['Deduction'].setValue(Deduction);
    this.CalculateFinalWeight();
  }




  onSubmit() {


    if (this.stgForm.invalid || this.stgForm.value.ClientId == 0) {
      this.stgForm.markAllAsTouched();
      return;
    }
    // if(this.dialogData.buttonName == "Save"){
    const data: ILaterStg = {
      CollectionId: this.dialogData?.value?.CollectionId ? this.dialogData?.value?.CollectionId : 0,
      ApproveId: this.dialogData?.approveId,
      CollectionDate: formatDate(this.stgForm.value.CollectionDate, 'dd/MM/yyyy', 'en-IN'),
      // CollDate:formatDate(this.stgForm.value.CollectionDate, 'yyyy-MM-dd', 'en-US'),
      VehicleNo: this.stgForm.value.VehicleNo,
      ClientId: this.stgForm.value.ClientId,
      ClientName: this.stgForm.value.ClientName,
      FirstWeight: this.stgForm.value.FirstWeight,
      WetLeaf: this.stgForm.value.WetLeaf,
      WetLeafKg: Math.round((this.stgForm.value.FirstWeight * this.stgForm.value.WetLeaf) / 100),
      LongLeaf: this.stgForm.value.LongLeaf,
      LongLeafKg: Math.round((this.stgForm.value.FirstWeight * this.stgForm.value.LongLeaf) / 100),
      Deduction: this.stgForm.value.Deduction,
      FinalWeight: this.stgForm.value.FinalWeight,
      Rate: this.stgForm.value.Rate,
      GrossAmount: 0,
      TripId: this.stgForm.value.TripId,
      GradeId: this.stgForm.value.GradeId,
      Remarks: this.stgForm.value.Remarks,
      Status: this.stgForm.value.Status,
      TenantId: this.loginDetails.TenantId,
      CreatedBy: this.loginDetails.UserId

    }
    this.isSubmitting = true;
    // this.SaveStgtData(data);
    this.addData = data;
    //  this.helper.setItem('AddLaterSTGData', data);
    this.dialogRef.close(this.addData);
  }


  SaveStgtData(clientBody: IStg) {
    this.stgService.SaveStg(clientBody)
      .pipe(
        takeUntil(this.destroy$),
        catchError(error => {
          this.isSubmitting = false;
          console.error('Error:', error);
          this.toastr.error('An error occurred', 'ERROR');
          throw error;
        })
      )
      .subscribe((res: any) => {
        if (res.Id == 0) {
          this.toastr.warning(res.Message, 'Warning');
        }
        else {
          this.toastr.success(res.Message, 'SUCCESS');
        }
        if (this.dialogData.buttonName == "Update") {
          this.dialogRef.close(true);
        }
        this.dialogRef.close(true);

        this.ClientNoInput.nativeElement.focus();
        this.CleanFormControl();
        this.isSubmitting = false;
      });
  }
  getFactoryDate() {
    let bodyData: IGetFactory = {
      TenantId: this.loginDetails.TenantId,
      IsClientView: false
    }
  }

  CleanFormControl() {
    const formControls = [
      'ClientName',
      'ClientId',
      'FirstWeight',
      'WetLeaf',
      'LongLeaf',
      'Deduction',
      'FinalWeight',
      'Rate',
      'Remarks',
      'GradeId'
    ];

    formControls.forEach(control => {
      this.stgForm.controls[control].reset();
    });
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

  async loadClientNames() {
    try {
      const bodyData: IGetTeaClient = {
        TenantId: this.loginDetails.TenantId,
        Category: 'STG'

      };

      const res: any = await this.autocompleteService.GetClientNames(bodyData)
        .pipe(takeUntil(this.destroy$))
        .toPromise();
      this.ClientNames = res.ClientDetails.filter((x: any) => !this.dialogData.clientList.includes(x.ClientId));

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

  // Autocomplete function
  filterClientNames(value: string): any[] {

    const filterValue = value.toLowerCase();
    return this.ClientNames.filter((x: any) => x?.ClientName?.toLowerCase()?.includes(filterValue));
  }

  displayWithFn(value: string): string {
    return value || '';
  }

  getGradeList() {
    let bodyData: IGetGrade = {
      TenantId: this.loginDetails.TenantId
    }

    const gradeGetService = this.gradeService.GetGrade(bodyData).subscribe((res: any) => {
      this.GradeList = res.GradeDetails
    });

    this.subscriptions.push(gradeGetService);

  }

  GeTript() {


    const gradeGetService = this.stgService.GetTrip().subscribe((res: any) => {
      this.TripList = res.TripDetails;
      this.stgForm.controls['TripId'].setValue(this.TripList[0].TripId);
    });

    this.subscriptions.push(gradeGetService);

  }




  ngOnDestroy(): void {
    this.subscriptions.forEach((sub) => {
      sub.unsubscribe();
    })
    this.dialogRef.close(this.addData);
  }

  selectClient(client: any) {
    if (client == '') {
      this.stgForm.controls['ClientId'].reset();
    }


    if (!environment.production) {

      console.log(client.ClientId, 'Client');
    }


    this.stgForm.controls['ClientId'].setValue(client?.ClientId);
  }

  VehicleInput(value: string) {
    let newVal = value.toUpperCase();
    this.stgForm.controls['VehicleNo'].setValue(newVal);
  }

}
