import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { Subject, Subscription, takeUntil } from 'rxjs';
import { HelperService } from 'src/app/core/services/helper.service';
import { FactoryService } from '../../services/factory.service';
import { IGetFactory } from '../../interfaces/IFactory';
import { FactoryAccountService } from '../../services/factory-account.service';
import { ISaveFactoryAccount } from '../../interfaces/IFactoryAccount';

@Component({
  selector: 'app-add-edit-factory-account',
  templateUrl: './add-edit-factory-account.component.html',
  styleUrls: ['./add-edit-factory-account.component.scss']
})
export class AddEditFactoryAccountComponent {

  FactoryAccountForm!: FormGroup;
  private destroy$ = new Subject<void>();
  loginDetails: any;
  factoryList: any;
  private subscriptions: Subscription[] = [];

  constructor(
    @Inject(MAT_DIALOG_DATA) public dialogData: any,
    public dialogRef: MatDialogRef<AddEditFactoryAccountComponent>,
    private fb: FormBuilder,
    private accountService: FactoryAccountService,
    private helper: HelperService,
    private factoryService: FactoryService,
    private toastr: ToastrService

  ) { }

  async ngOnInit() {
    this.loginDetails = this.helper.getItem('loginDetails');
    this.FactoryAccountForm = this.fb.group({
      AccountName: ['', Validators.required],
      FactoryId: ['', Validators.required],
      BioMatrixNo: ['']
    });
    await this.GetFactoryList();

    if (this.dialogData.value) {
      this.FactoryAccountForm.controls['AccountName'].setValue(this.dialogData.value.AccountName);
      this.FactoryAccountForm.controls['FactoryId'].setValue(this.dialogData.value.FactoryId);
      this.FactoryAccountForm.controls['BioMatrixNo'].setValue(this.dialogData.value.BioMatrixNo);

    }
  }
  // GetFactoryList(){
  //   let bodyData:IGetFactory = {
  //     TenantId:this.loginDetails.TenantId
  //   }
  //   const GetService = this.factoryService.GetFactory(bodyData).subscribe((res:any)=>{
  //        this.factoryList= res.FactoryDetails;
  //   });
  //   this.subscriptions.push(GetService);
  // }

  async GetFactoryList() {
    try {
      const bodyData: IGetFactory = {
        TenantId: this.loginDetails.TenantId,
        IsClientView: false
      };

      const res: any = await this.factoryService.GetFactory(bodyData)
        .pipe(takeUntil(this.destroy$))
        .toPromise();

      this.factoryList = res.FactoryDetails;

      // if (this.dialogData.value) {
      //     this.clientForm.controls['CategoryId'].setValue(this.dialogData.value.CategoryId);
      // }

    } catch (error) {
      console.error('Error:', error);
      this.toastr.error('Something went wrong.', 'ERROR');
    }
  }

  onSubmit() {
    if (this.FactoryAccountForm.invalid) {
      this.FactoryAccountForm.markAllAsTouched();
      return;
    } else {
      let bodyData: ISaveFactoryAccount = {
        TenantId: this.loginDetails.TenantId,
        CreatedBy: this.loginDetails.UserId,
        AccountId: this.dialogData?.value?.AccountId ? this.dialogData?.value?.AccountId : 0,
        AccountName: this.FactoryAccountForm.value.AccountName,
        BioMatrixNo: this.FactoryAccountForm.value.BioMatrixNo,
        FactoryId: this.FactoryAccountForm.value.FactoryId,
        IsActive: true
      }
      const saveCategory = this.accountService.SaveFactoryAccount(bodyData).subscribe((res: any) => {
        // console.log(res, "Save Response");
        // if(this.dialogData.buttonName == 'Save'){
        //   this.toastr.success(res.Message, "SUCCESS");
        // }else if(this.dialogData.buttonName == "Update"){
        this.toastr.success(res.Message, "SUCCESS")
        // }
        this.dialogRef.close(true)
      })
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.dialogRef.close(true);
    this.subscriptions.forEach((sub) => {
      sub.unsubscribe();
    })
  }



}
