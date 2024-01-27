import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { HelperService } from 'src/app/core/services/helper.service';
import { AutoCompleteService } from '../../services/auto-complete.service';
import { IGetFactory } from 'src/app/modules/masters/interfaces/IFactory';
import { GradeService } from 'src/app/modules/masters/services/grade.service';
import { IGetGrade } from 'src/app/modules/masters/interfaces/IGrade';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-add-edit-stg',
  templateUrl: './add-edit-stg.component.html',
  styleUrls: ['./add-edit-stg.component.scss']
})
export class AddEditStgComponent implements OnInit {

  stgForm!:FormGroup;
  currentDate:Date = new Date();
  vehicleNumbers: string[] = [];
  loginDetails: any;
  clientNames: string[] =[];
  gradeList:any[]=[];
  private subscriptions: Subscription[] = [];

  constructor(
    @Inject(MAT_DIALOG_DATA) public dialogData: any,
    public dialogRef: MatDialogRef<AddEditStgComponent>,
    private fb:FormBuilder,
    private helper:HelperService,
    private toastr:ToastrService,
    private autocompleteService: AutoCompleteService,
    private gradeService:GradeService
  ){}

  ngOnInit(): void {
    this.loginDetails = this.helper.getItem('loginDetails');
      this.stgForm = this.fb.group({
        vehicleNo:['', Validators.required],
        factoryName:['', Validators.required],
        accountName:['', Validators.required],
        clientName:['', Validators.required],
        firstWeight:[0, Validators.required],
        wetLeaf:[0, Validators.required],
        longLeaf:[0, Validators.required],
        deduction:[0],
        finalWeight:[0],
        grade:['', Validators.required],
        rate:['', Validators.required],
        remarks:['', Validators.required],
      });
      this.loadClientNames();
      this.loadVehicleNumbers();
      this.getFactoryDate();
      this.getGradeList();
  }

  firstWeightInput(value:any){
    console.log(value);
    this.calculateFinalWeight()
  }

  longLeafInput(value:any){
    let wetLeaf = this.stgForm.value.wetLeaf;
    let longLeaf = this.stgForm.value.longLeaf;
    let deduction = longLeaf + wetLeaf;
    this.stgForm.controls['deduction'].setValue(deduction);
    this.calculateFinalWeight();
  }

  wetLeafInput(value:any){
    let wetLeaf = this.stgForm.value.wetLeaf;
    let longLeaf = this.stgForm.value.longLeaf;
    let deduction = longLeaf + wetLeaf;
    this.stgForm.controls['deduction'].setValue(deduction);
    this.calculateFinalWeight();
  }

  calculateFinalWeight(){
    let firstWeight = this.stgForm.value.firstWeight;
    let wetLeaf = this.stgForm.value.wetLeaf;
    let longLeaf = this.stgForm.value.longLeaf;
    let deduction = this.stgForm.value.deduction;

    let finalWeight = (firstWeight - (wetLeaf+longLeaf));
    this.stgForm.controls['finalWeight'].setValue(finalWeight);

  }


  onSubmit(){

  }

  getFactoryDate(){
    let bodyData:IGetFactory = {
      TenantId:this.loginDetails.TenantId
    }
  }

  private loadVehicleNumbers(): void {
    this.autocompleteService.getVehicleNumbers().subscribe(numbers => {
      this.vehicleNumbers = numbers;
    });
  }

  private loadClientNames(): void {
    this.autocompleteService.getClientNames().subscribe(client => {
      this.clientNames = client;
    });
  }

  // Autocomplete function
  filterVehicleNumbers(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.vehicleNumbers.filter(number => number.toLowerCase().includes(filterValue));
  }

  // Autocomplete function
  filterClientNames(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.clientNames.filter(client => client.toLowerCase().includes(filterValue));
  }

  displayWithFn(value: string): string {
    return value || '';
  }

  getGradeList(){
    let bodyData:IGetGrade = {
      TenantId:this.loginDetails.TenantId
    }

    const gradeGetService = this.gradeService.GetGrade(bodyData).subscribe((res:any)=>{
      this.gradeList = res.GradeDetails
    });

    this.subscriptions.push(gradeGetService);

  }

  

  ngOnDestroy(): void {
    this.subscriptions.forEach((sub)=>{
      sub.unsubscribe();
    })
}


}
