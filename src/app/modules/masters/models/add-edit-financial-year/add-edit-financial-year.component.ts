import { AfterViewInit, Component, Inject, OnInit } from '@angular/core';
import { FinancialYearService } from '../../services/financial-year.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { HelperService } from 'src/app/core/services/helper.service';
import { ToastrService } from 'ngx-toastr';
import { IFinancialYear } from '../../interfaces/ICategory';

@Component({
  selector: 'app-add-edit-financial-year',
  templateUrl: './add-edit-financial-year.component.html',
  styleUrls: ['./add-edit-financial-year.component.scss']
})
export class AddEditFinancialYearComponent implements OnInit, AfterViewInit {

  financialYearForm!: FormGroup;
  loginDetails: any;

  constructor(
    @Inject(MAT_DIALOG_DATA) public dialogData: any,
    public dialogRef: MatDialogRef<AddEditFinancialYearComponent>,
    private formBuilder: FormBuilder,
    private FinancialYearService: FinancialYearService,
    private helper: HelperService,
    private toastr: ToastrService
  ) { }

  ngAfterViewInit(): void {

  }

  ngOnInit(): void {
    this.loginDetails = this.helper.getItem('loginDetails')
    this.financialYearForm = this.formBuilder.group({
      financialYear: ['', Validators.required],
    });
    if (this.dialogData.value) {
      this.financialYearForm.controls['financialYear'].setValue(this.dialogData.value.financialYear);
    }
  }

  onSubmit() {
    if (this.financialYearForm.invalid) {
      this.financialYearForm.markAllAsTouched();
      return;
    } else {
      let bodyData: IFinancialYear = {
        FinancialYearId: this.dialogData?.value?.CategoryId ? this.dialogData?.value?.CategoryId : 0,
        FinancialYear: this.financialYearForm.value.financialYear,
        TenantId: this.loginDetails.TenantId,
        CreatedBy: this.loginDetails.UserId
      }
      const saveCategory = this.FinancialYearService.SaveFinancialYear(bodyData).subscribe((res: any) => {
        if (res.Id == 0) {
          this.toastr.error(res.Message, "Exists");
        } else {
          this.toastr.success(res.Message, "SUCCESS");
        }
        this.dialogRef.close(true)
      })
    }
  }

}
