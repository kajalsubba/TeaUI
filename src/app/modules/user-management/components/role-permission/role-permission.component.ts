import { Component, OnInit } from '@angular/core';
import { RoleService } from '../../services/role.service';
import { IGetRole } from '../../interfaces/irole';
import { HelperService } from 'src/app/core/services/helper.service';
import { Subject, Subscription, catchError, takeUntil } from 'rxjs';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { IGetRolePermission, ISaveRolePermission } from '../../interfaces/irole-permission';
import { RolePersmissionService } from '../../services/role-persmission.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-role-permission',
  templateUrl: './role-permission.component.html',
  styleUrls: ['./role-permission.component.scss']
})
export class RolePermissionComponent implements OnInit {

  RoleList:any[]=[];
  loginDetails: any;
  private destroy$ = new Subject<void>();
  private subscriptions: Subscription[] = [];
  displayedColumns: string[] = ['MasterModuleName', 'SubModuleName', 'HideModule', 'SaveData', 'EditData', 'ViewData', 'DeleteData', 'Upload'];
  rolePermissionForm!:FormGroup;
  dataSource = new MatTableDataSource<any>();

  constructor(
    private roleService: RoleService,
    private helperService: HelperService,
    private fb:FormBuilder,
    private toastr: ToastrService,
    private rolePermissionService:RolePersmissionService
  ){}

  ngOnInit(): void {
      this.loginDetails = this.helperService.getItem('loginDetails');
      this.GetRoleList();
      this.rolePermissionForm = this.fb.group({
        RoleId:[null,Validators.required]
      });
   //   this.getRolePermission()
  }

  GetRoleList() {
    let bodyData: IGetRole = {
      TenantId: this.loginDetails.TenantId,
    };
    const roleListService = this.roleService
      .GetRole(bodyData)
      .subscribe((res: any) => {
        this.RoleList = res.RoleDetails
      });
    this.subscriptions.push(roleListService);
  }
  GetRolePermission()
  {
    if (this.rolePermissionForm.invalid) {
      this.rolePermissionForm.markAllAsTouched();
      return;
    }
    this.getRolePermission()
  }
  getRolePermission() {
    let bodyData: IGetRolePermission = {
      TenantId: this.loginDetails.TenantId,
      RoleId:this.rolePermissionForm.value.RoleId
    };
    const rolePermissionService = this.roleService
      .GetRolePermission(bodyData)
      .subscribe((res: any) => {
        this.dataSource.data = res.RolePermission;
        
      });
    this.subscriptions.push(rolePermissionService);
  }

  updateMenuAccess(){
    if (this.rolePermissionForm.invalid) {
      this.rolePermissionForm.markAllAsTouched();
      return;
    }
    const PermissionObjects: any[] = [];
   
    this.dataSource.data.forEach((selectedItem) => {
      // Create the selected object based on the selected item
      
      const selectedObject = {
        UserRoleId:this.rolePermissionForm.value.RoleId,
        DeleteData: selectedItem.DeleteData??false,
        EditData: selectedItem.EditData??false,
        HideModule: selectedItem.HideModule??false,
        MasterModuleName: selectedItem.MasterModuleName,
        SaveData: selectedItem.SaveData??false,
        SubModuleId: selectedItem.SubModuleId,
        SubModuleName: selectedItem.SubModuleName,
        Upload: selectedItem.Upload??false,
        ViewData: selectedItem.ViewData??false,
        TenantId:this.loginDetails.TenantId,
      //  CollectionId: selectedItem.CollectionId, // Assuming CollectionId is present in your data
      //  Rate: selectedItem.Rate, // Assuming Status is present in your data
      };
      // Push the selected object to the array
      PermissionObjects.push(selectedObject);
      // Calculate totals
    
    });

    const data:ISaveRolePermission={

      TenantId:this.loginDetails.TenantId,
      CreatedBy:this.loginDetails.UserId,
      PermissionLists:PermissionObjects
    }


    this.SaveRolePermission(data);
    
  }

  SaveRolePermission(data:any)
  {
    this.rolePermissionService
    .SaveRolePermission(data)
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
    
    });
  }

  onSelectionChange(event:any)
  {
    this.getRolePermission();
  }

}
