import { Component, Inject, OnInit } from '@angular/core';
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


@Component({
  selector: 'app-add-edit-stg',
  templateUrl: './add-edit-stg.component.html',
  styleUrls: ['./add-edit-stg.component.scss']
})
export class AddEditStgComponent implements OnInit {

  stgForm!:FormGroup;
  private destroy$ = new Subject<void>();
  currentDate:Date = new Date();
  vehicleNumbers: any;
  loginDetails: any;
  ClientNames: any;
  GradeList:any[]=[];
  private subscriptions: Subscription[] = [];

  constructor(
    @Inject(MAT_DIALOG_DATA) public dialogData: any,
    public dialogRef: MatDialogRef<AddEditStgComponent>,
    private fb:FormBuilder,
    private helper:HelperService,
    private toastr:ToastrService,
    private stgService:StgService,
    private autocompleteService: AutoCompleteService,
    private gradeService:GradeService
  ){}

  async ngOnInit() {
    this.loginDetails = this.helper.getItem('loginDetails');
      this.stgForm = this.fb.group({
        CollectionDate:[new Date()],
        VehicleNo:['', Validators.required],
        ClientName:['', Validators.required],
        FirstWeight:[0, Validators.required],
        WetLeaf:[0, Validators.required],
        LongLeaf:[0, Validators.required],
        Deduction:[0],
        FinalWeight:[0],
        Grade:['', Validators.required],
        Rate:['', Validators.required],
        Remarks:['', Validators.required],
      });
     await this.loadClientNames();
     await this.loadVehicleNumbers();
      this.getFactoryDate();
      this.getGradeList();
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
    const firstWeight = this.stgForm.value.firstWeight || 0;
    const WetLeafPercentage = (this.stgForm.value.WetLeaf || 0) / 100;
    const LongLeafPercentage = (this.stgForm.value.LongLeaf || 0) / 100;
    
    // Calculate WetLeaf and LongLeaf in kg
    const WetLeaf = firstWeight * WetLeafPercentage;
    const LongLeaf = firstWeight * LongLeafPercentage;
    
    // Deduction is the sum of WetLeaf and LongLeaf
    const Deduction = Math.round(WetLeaf + LongLeaf);
    
    // Calculate final weight in kg
    const finalWeight = Math.round(firstWeight - Deduction);
    
    // Update the form control
    this.stgForm.controls['Deduction'].setValue(Deduction);
    this.stgForm.controls['finalWeight'].setValue(finalWeight);
  }
  
  calculateDeductionAndFinalWeight() {
    const firstWeight = this.stgForm.value.firstWeight || 0;
    const WetLeafPercentage = (this.stgForm.value.WetLeaf || 0) / 100;
    const LongLeafPercentage = (this.stgForm.value.LongLeaf || 0) / 100;
  
    // Calculate WetLeaf and LongLeaf in kg
    const WetLeaf = firstWeight * WetLeafPercentage;
    const LongLeaf = firstWeight * LongLeafPercentage;
    
    // Deduction is the sum of WetLeaf and LongLeaf
    const Deduction = Math.round(WetLeaf + LongLeaf);
    
    // Update the form controls
    this.stgForm.controls['Deduction'].setValue(Deduction);
    this.CalculateFinalWeight();
  }
  
  


  onSubmit(){

    if(this.stgForm.invalid){
      this.stgForm.markAllAsTouched();
      return;
    }
    // if(this.dialogData.buttonName == "Save"){
      let data:IStg = {
        CollectionId:this.dialogData?.value?.ClientId? this.dialogData?.value?.CollectionId : 0,
        CollectionDate:this.stgForm.value.CollectionDate,
        VehicleId:this.stgForm.value.VehicleId,
        ClientId:this.stgForm.value.ClientId,
        FirstWeight:this.stgForm.value.FirstWeight,
        WetLeaf:this.stgForm.value.WetLeaf,
        LongLeaf:this.stgForm.value.LongLeaf,
        Deduction:this.stgForm.value.Deduction,
        FinalWeight:this.stgForm.value.FinalWeight,
        Rate:this.stgForm.value.Rate,
        GrossAmount:this.stgForm.value.GrossAmount,
        GradeId: this.stgForm.value.GradeId,
        Remarks: this.stgForm.value.Remarks,
        Status:'Pending',
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
        
          this.stgForm.reset();
        });
}
  getFactoryDate(){
    let bodyData:IGetFactory = {
      TenantId:this.loginDetails.TenantId
    }
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
   return this.vehicleNumbers.filter((x:any) => x.VehicleNo.toLowerCase().includes(filterValue));
 }

  // Autocomplete function
  filterClientNames(value: string): string[] {
    const filterValue = value.toLowerCase();
   // console.log(this.ClientNames.filter((number:any) => number.toLowerCase().includes(filterValue)),'Clinet');
    return this.ClientNames.filter((x:any) => x.ClientName.toLowerCase().includes(filterValue));
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
}


}
