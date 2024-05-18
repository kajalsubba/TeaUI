import { AfterViewInit, Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { HelperService } from 'src/app/core/services/helper.service';

@Component({
  selector: 'app-edit-rate',
  templateUrl: './edit-rate.component.html',
  styleUrls: ['./edit-rate.component.scss']
})
export class EditRateComponent implements OnInit, AfterViewInit {


  RateForm!: FormGroup;
  loginDetails: any;

  constructor(
    @Inject(MAT_DIALOG_DATA) public dialogData: any,
    public dialogRef: MatDialogRef<EditRateComponent>,
    private formBuilder: FormBuilder,
    //  private roleService:RoleService,
    private helper: HelperService,
    private toastr: ToastrService
  ) { }

  ngAfterViewInit(): void {

  }

  ngOnInit(): void {
    this.loginDetails = this.helper.getItem('loginDetails')
    this.RateForm = this.formBuilder.group({
      Rate: [0, Validators.required],

    });
    if (this.dialogData.value) {
      this.RateForm.controls['Rate'].setValue(this.dialogData.value.Rate);
      // this.RoleForm.controls['RoleDescription'].setValue(this.dialogData.value.RoleDescription);
    }
  }




  onSubmit() {
    if (this.RateForm.invalid) {
      this.RateForm.markAllAsTouched();
      return;
    } else {

      
      this.dialogData.value.Rate = this.RateForm.value.Rate;
      this.dialogRef.close(this.dialogData.value,)

    }
  }
}

