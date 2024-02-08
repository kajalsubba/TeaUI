import { AfterViewInit, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { HelperService } from 'src/app/core/services/helper.service';
import { CompanyService } from '../../services/company.service';
import { ICompany, IGetCompany } from '../../interfaces/icompany';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-company',
  templateUrl: './company.component.html',
  styleUrls: ['./company.component.scss']
})
export class CompanyComponent implements OnInit, AfterViewInit   {


  CompanyForm!: FormGroup;
  loginDetails:any;
  private subscriptions: Subscription[] = [];
  constructor(    
    private formBuilder:FormBuilder,
    private companyService:CompanyService,
    private helper:HelperService,
    private toastr:ToastrService) {}

  ngAfterViewInit(): void {
    
  }

  ngOnInit(): void {
    this.loginDetails = this.helper.getItem('loginDetails')
    this.CompanyForm = this.formBuilder.group({
      CompanyId:[],
      CompanyName: ['', Validators.required],
      CompanyLogo:[''],
      Email:[''],
      ContactNo:[''],
      CompanyDetails:['']
    });

    this.GetCompany();
    
  }

  GetCompany() {
    let bodyData: IGetCompany = {
      TenantId: this.loginDetails.TenantId,
    };
    const GetService = this.companyService
      .GetCompany(bodyData)
      .subscribe((res: any) => {
           console.log(res,'res');
   
    this.CompanyForm.patchValue(res.CompanyDetails[0]);
  //  this.CompanyForm.controls['CompanyName'].setValue(res.CompanyDetails[0].CompanyName);
      });
    this.subscriptions.push(GetService);
  }
  onSubmit()
  {
    if(this.CompanyForm.invalid){
      this.CompanyForm.markAllAsTouched();
      return;
    }else{
      let bodyData:ICompany = {
        CompanyId:this.CompanyForm?.value?.CompanyId? this.CompanyForm?.value?.CompanyId : 0,
        CompanyName:this.CompanyForm.value.CompanyName,
        CompanyLogo:this.CompanyForm.value.CompanyLogo,
        ContactNo:this.CompanyForm.value.ContactNo,
        UserEmail:this.CompanyForm.value.Email,
        CompanyDetails:this.CompanyForm.value.CompanyDetails,
        TenantId:this.loginDetails.TenantId,
        CreatedBy:this.loginDetails.UserId,
     
      }
      const saveCategory = this.companyService.SaveComapany(bodyData).subscribe((res:any)=>{
       
        // if(res.Id == 0){
        //   this.toastr.error(res.Message, "Exists");
        // }else{
          this.toastr.success(res.Message, "SUCCESS");
     //   }
        
      })
    }
  }

}
