import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { HelperService } from 'src/app/core/services/helper.service';
import { AutoCompleteService } from '../../services/auto-complete.service';
import { FactoryService } from 'src/app/modules/masters/services/factory.service';
import { IGetFactory } from 'src/app/modules/masters/interfaces/IFactory';

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

  constructor(
    @Inject(MAT_DIALOG_DATA) public dialogData: any,
    public dialogRef: MatDialogRef<AddEditStgComponent>,
    private fb:FormBuilder,
    private helper:HelperService,
    private toastr:ToastrService,
    private autocompleteService: AutoCompleteService,
    private factoryService:FactoryService
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
        deduction:[0, Validators.required],
        finalWeight:[0, Validators.required],
        grade:['', Validators.required],
        rate:['', Validators.required],
        remarks:['', Validators.required],
      });
      this.loadVehicleNumbers();
      this.getFactoryDate();
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

  // Autocomplete function
  filterVehicleNumbers(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.vehicleNumbers.filter(number => number.toLowerCase().includes(filterValue));
  }

  displayWithFn(value: string): string {
    return value || '';
  }


}
