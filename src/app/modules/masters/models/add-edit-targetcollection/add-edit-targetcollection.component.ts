import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { catchError, Subject, takeUntil } from 'rxjs';
import { HelperService } from 'src/app/core/services/helper.service';
import { CategoryService } from '../../services/category.service';
import { IGetCategory, ITargetModel } from '../../interfaces/ICategory';
import { TargetcollectionService } from '../../services/targetcollection.service';

@Component({
  selector: 'app-add-edit-targetcollection',
  templateUrl: './add-edit-targetcollection.component.html',
  styleUrls: ['./add-edit-targetcollection.component.scss']
})
export class AddEditTargetcollectionComponent implements OnInit {

  SupplierTargetForm!: FormGroup;
  loginDetails: any;
  financialyearList: any = [];

  private destroy$ = new Subject<void>();
  constructor(
    @Inject(MAT_DIALOG_DATA) public dialogData: any,
    public dialogRef: MatDialogRef<AddEditTargetcollectionComponent>,
    private fb: FormBuilder,
    private helper: HelperService,
    private categoryService: CategoryService,
    private targetService: TargetcollectionService,
    private toastr: ToastrService,

  ) { }

  async ngOnInit() {
    this.loginDetails = this.helper.getItem('loginDetails');
    this.SupplierTargetForm = this.fb.group({
      FinancialYearId: ['', Validators.required],
      TargetWeight: ['', [Validators.required]]
    })

    await this.getFinancialYear();
    // if (this.dialogData.value) {

    //   this.SupplierTargetForm.controls['ClientId'].setValue(this.dialogData.value.ClientId);

    // }
  }

  async getFinancialYear() {
    try {
      const categoryBody: IGetCategory = {
        TenantId: this.loginDetails.TenantId
      };

      const res: any = await this.categoryService.getFinancialYear(categoryBody)
        .pipe(takeUntil(this.destroy$))
        .toPromise();
      this.financialyearList = res.FinancialYear;


    } catch (error) {
      console.error('Error:', error);
      this.toastr.error('Something went wrong.', 'ERROR');
    }
  }

  onSubmit(): void {
    if (this.SupplierTargetForm.invalid) {
      this.SupplierTargetForm.markAllAsTouched();
      return;
    }

    let data: ITargetModel = {
      TargetId: 0,
      ClientId: this.dialogData.value.ClientId,
      FinancialYearId: this.SupplierTargetForm.value.FinancialYearId,
      TargetWeight: this.SupplierTargetForm.value.TargetWeight,
      TenantId: this.loginDetails.TenantId,
      CreatedBy: this.loginDetails.UserId
    };

    console.log(data, 'data');

    this.targetService
      .SaveSupplierTarget(data)
      .pipe(
        takeUntil(this.destroy$),
        catchError((error) => {
          console.error('Error:', error);
          this.toastr.error('An error occurred', 'ERROR');
          throw error;
        })
      )
      .subscribe((res: any) => {

        this.toastr.success(res.Message, "SUCCESS");
        this.SupplierTargetForm.reset();
        this.dialogRef.close(true);

      });

  }

}

