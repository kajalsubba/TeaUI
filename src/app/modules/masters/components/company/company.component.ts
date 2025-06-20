import { AfterViewInit, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { HelperService } from 'src/app/core/services/helper.service';
import { CompanyService } from '../../services/company.service';
import { ICompany, IGetCompany } from '../../interfaces/icompany';
import { Subscription } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { ImageViewerComponent } from 'src/app/shared/components/image-viewer/image-viewer.component';

@Component({
  selector: 'app-company',
  templateUrl: './company.component.html',
  styleUrls: ['./company.component.scss']
})
export class CompanyComponent implements OnInit, AfterViewInit   {


  CompanyForm!: FormGroup;
  loginDetails:any;
  private subscriptions: Subscription[] = [];
  imageUrl: any | ArrayBuffer | null = null;

  FileData:any;
  constructor(    
    private formBuilder:FormBuilder,
    private companyService:CompanyService,
    private helper:HelperService,
    private dialog:MatDialog,
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
    this.imageUrl =res.CompanyDetails[0].CompanyLogo;
  //  this.CompanyForm.controls['CompanyName'].setValue(res.CompanyDetails[0].CompanyName);
      });
    this.subscriptions.push(GetService);
  }
  // convertImageUrlToBlob() {
  //   const imageUrl = 'https://example.com/image.jpg'; // Replace with your image URL

  //   this.http.get(imageUrl, { responseType: 'blob' }).subscribe((blob: Blob) => {
  //     const file: File = new File([blob], 'image.jpg', { type: 'image/jpeg' });
  //     console.log('File created from image URL:', file);
  //     // You can now use the 'file' object for further processing, like uploading it to a server
  //   }, (error:any) => {
  //     console.error('Error downloading image:', error);
  //   });
  // }

  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    // Read the file as a data URL
    const reader = new FileReader();
    reader.onload = (e) => {
      this.imageUrl = e.target?.result;
    };
    reader.readAsDataURL(file);

    this.FileData=file;
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
      const saveCategory = this.companyService.SaveComapany(bodyData,this.FileData).subscribe((res:any)=>{
       
        // if(res.Id == 0){
        //   this.toastr.error(res.Message, "Exists");
        // }else{
          this.toastr.success(res.Message, "SUCCESS");
     //   }
        
      })
    }
  }

  openImage(imageUrl:any){
    const dialogRef = this.dialog.open(ImageViewerComponent, {
      width:"80vw",
      height:"95%",
      disableClose:true,
      data:{
        title:"Image Viewer",
        imageUrl:imageUrl
      }
    })
  }

}
