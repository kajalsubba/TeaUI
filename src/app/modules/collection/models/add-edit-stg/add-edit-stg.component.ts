import { Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { HelperService } from 'src/app/core/services/helper.service';
import { AutoCompleteService } from '../../services/auto-complete.service';
import { IGetFactory } from 'src/app/modules/masters/interfaces/IFactory';
import { GradeService } from 'src/app/modules/masters/services/grade.service';
import { IGetGrade } from 'src/app/modules/masters/interfaces/IGrade';
import { Subject, Subscription, catchError, takeUntil } from 'rxjs';
import { IStg } from '../../interfaces/istg';
import { StgService } from '../../services/stg.service';
import { DatePipe, formatDate } from '@angular/common';


@Component({
  selector: 'app-add-edit-stg',
  templateUrl: './add-edit-stg.component.html',
  styleUrls: ['./add-edit-stg.component.scss']
})
export class AddEditStgComponent implements OnInit {

  stgForm!:FormGroup;
  private destroy$ = new Subject<void>();
  @ViewChild('clientName') ClientNoInput!: ElementRef;
  currentDate:Date = new Date();
  vehicleNumbers: any[]=[];
  loginDetails: any;
  ClientNames: any[]=[];
  GradeList:any[]=[];
  myDatepipe!: any;
  statusList:string[]=['Pending', 'Rejected']

  private subscriptions: Subscription[] = [];

  constructor(
    @Inject(MAT_DIALOG_DATA) public dialogData: any,
    public dialogRef: MatDialogRef<AddEditStgComponent>,
    private fb:FormBuilder,
    private helper:HelperService,
    private toastr:ToastrService,
    private stgService:StgService,
    private autocompleteService: AutoCompleteService,
    private gradeService:GradeService,
    datepipe: DatePipe
  ){}

  async ngOnInit() {
    this.loginDetails = this.helper.getItem('loginDetails');
      this.stgForm = this.fb.group({
        CollectionDate:[new Date()],
        VehicleNo:['', Validators.required],
        ClientName:['', Validators.required],
        ClientId:['', Validators.required],
        FirstWeight:[0, Validators.required],
        WetLeaf:[0],
        LongLeaf:[0],
        Deduction:[0],
        FinalWeight:[0],
        GradeId:['', Validators.required],
        Rate:[0],
        Remarks:[''],
        Status:['Pending'],
      });
     await this.loadClientNames();
     await this.loadVehicleNumbers();
      this.getFactoryDate();
      this.getGradeList();

      if (this.dialogData.value) {
        console.log(this.dialogData,'this.dialogData');
        
        this.stgForm.controls['CollectionDate'].setValue(new Date(this.dialogData.value.CollDate));
   //   this.stgForm.get('date').patchValue(new Date('2/14/2021')));

        this.stgForm.controls['ClientName'].setValue(this.dialogData.value.ClientName);
        this.stgForm.controls['ClientId'].setValue(this.dialogData.value.ClientId);
        this.stgForm.controls['VehicleNo'].setValue(this.dialogData.value.VehicleNo);
        this.stgForm.controls['FirstWeight'].setValue(this.dialogData.value.FirstWeight);
        this.stgForm.controls['WetLeaf'].setValue(this.dialogData.value.WetLeaf);
        this.stgForm.controls['LongLeaf'].setValue(this.dialogData.value.LongLeaf);
        this.stgForm.controls['Deduction'].setValue(this.dialogData.value.Deduction);
        this.stgForm.controls['FinalWeight'].setValue(this.dialogData.value.FinalWeight);
        this.stgForm.controls['GradeId'].setValue(this.dialogData.value.GradeId);
        this.stgForm.controls['Rate'].setValue(this.dialogData.value.Rate);
        this.stgForm.controls['Remarks'].setValue(this.dialogData.value.Remarks);
        this.stgForm.controls['Status'].setValue(this.dialogData.value.Status);
      }  
  }

  FirstWeightInput(value: any) {
    console.log(value);
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
  
  


  onSubmit(){

   // console.log(moment(this.stgForm.value.CollectionDate).format('YYYY-MM-DD'),'date');
  //  const ConvertedDate = this.myDatepipe.transform(this.stgForm.value.CollectionDate, 'yyyy-MM-dd');
   // console.log(formatDate(this.stgForm.value.CollectionDate, 'yyyy-MM-dd', 'en-US'),'date');
    if(this.stgForm.invalid){
      this.stgForm.markAllAsTouched();
      return;
    }
    // if(this.dialogData.buttonName == "Save"){
      let data:IStg = {
        CollectionId:this.dialogData?.value?.ClientId? this.dialogData?.value?.CollectionId : 0,
        CollectionDate:formatDate(this.stgForm.value.CollectionDate, 'yyyy-MM-dd', 'en-US'),
        VehicleNo:this.stgForm.value.VehicleNo,
        ClientId:this.stgForm.value.ClientId,
        FirstWeight:this.stgForm.value.FirstWeight,
        WetLeaf:this.stgForm.value.WetLeaf,
        LongLeaf:this.stgForm.value.LongLeaf,
        Deduction:this.stgForm.value.Deduction,
        FinalWeight:this.stgForm.value.FinalWeight,
        Rate:this.stgForm.value.Rate,
        GrossAmount:0,
        GradeId: this.stgForm.value.GradeId,
        Remarks: this.stgForm.value.Remarks,
        Status:this.stgForm.value.Status,
        TenantId:this.loginDetails.TenantId,
        CreatedBy:this.loginDetails.UserId
      
      }
      this.SaveStgtData(data);

  }


  SaveStgtData(clientBody: IStg) {
    this.stgService.SaveStg(clientBody)
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
           if (this.dialogData.buttonName == "Update")
           {
                this.dialogRef.close(true);
           }
        
    
          this.ClientNoInput.nativeElement.focus();
        this.CleanFormControl();
       
        });
}
  getFactoryDate(){
    let bodyData:IGetFactory = {
      TenantId:this.loginDetails.TenantId
    }
  }

  CleanFormControl()
  {
   // const controlNames = ['ClientId', 'FirstWeight','WetLeaf'];
   // controlNames.map((value: string) => this.stgForm.get(value).setValue(null));
     
      // this.stgForm.reset();
      this.stgForm.controls['ClientName'].reset()
       this.stgForm.controls['ClientId'].reset()
       this.stgForm.controls['FirstWeight'].reset()
      this.stgForm.controls['WetLeaf'].reset()
      this.stgForm.controls['LongLeaf'].reset()
      this.stgForm.controls['Deduction'].reset()
      this.stgForm.controls['FinalWeight'].reset()
      this.stgForm.controls['Rate'].reset()
      this.stgForm.controls['Remarks'].reset()
      this.stgForm.controls['GradeId'].reset()
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

  // private loadClientNames(): void {
  //   this.autocompleteService.getClientNames().subscribe(client => {
  //     this.ClientNames = client;
  //   });
  // }

  async loadClientNames() {
    try {
        const bodyData: IGetGrade = {
            TenantId: this.loginDetails.TenantId
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

  // Autocomplete function
  filterVehicleNumbers(value: string): any {
   const filterValue = value.toLowerCase();
   return this.vehicleNumbers.filter((x:any) => x?.VehicleNo?.toLowerCase()?.includes(filterValue));
 }

  // Autocomplete function
  filterClientNames(value: string): any[] {
    const filterValue = value.toLowerCase();
   // console.log(this.ClientNames.filter((number:any) => number.toLowerCase().includes(filterValue)),'Clinet');
    return this.ClientNames.filter((x:any) => x?.ClientName?.toLowerCase()?.includes(filterValue));
  }

  displayWithFn(value: string): string {
    return value || '';
  }

  getGradeList(){
    let bodyData:IGetGrade = {
      TenantId:this.loginDetails.TenantId
    }

    const gradeGetService = this.gradeService.GetGrade(bodyData).subscribe((res:any)=>{
      this.GradeList = res.GradeDetails
    });

    this.subscriptions.push(gradeGetService);

  }

  

  ngOnDestroy(): void {
    this.subscriptions.forEach((sub)=>{
      sub.unsubscribe();
    })
    this.dialogRef.close(true);
}

selectClient(client: any) {
  this.stgForm.controls['ClientId'].setValue(client?.ClientId);
}

VehicleInput(value:string){
  let newVal = value.toUpperCase();
  this.stgForm.controls['VehicleNo'].setValue(newVal);
}

}
