import { Component, OnInit } from '@angular/core';
import { RoleService } from '../../services/role.service';
import { IGetRole } from '../../interfaces/irole';
import { HelperService } from 'src/app/core/services/helper.service';
import { Subscription } from 'rxjs';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';

@Component({
  selector: 'app-role-permission',
  templateUrl: './role-permission.component.html',
  styleUrls: ['./role-permission.component.scss']
})
export class RolePermissionComponent implements OnInit {

  RoleList:any[]=[];
  loginDetails: any;
  private subscriptions: Subscription[] = [];
  displayedColumns: string[] = ['MasterModuleName', 'SubModuleName', 'HideModule', 'SaveData', 'EditData', 'ViewData', 'DeleteData', 'Upload'];
  rolePermissionForm!:FormGroup;
  dataSource = new MatTableDataSource<any>();

  constructor(
    private roleService: RoleService,
    private helperService: HelperService,
    private fb:FormBuilder
  ){}

  ngOnInit(): void {
      this.loginDetails = this.helperService.getItem('loginDetails');
      this.GetRoleList();
      this.rolePermissionForm = this.fb.group({
        RoleId:[null]
      });
      this.getRolePermission()
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

  getRolePermission() {
    let bodyData: IGetRole = {
      TenantId: this.loginDetails.TenantId,
    };
    const rolePermissionService = this.roleService
      .GetRolePermission(bodyData)
      .subscribe((res: any) => {
        this.dataSource.data = res.RolePermission;
        
      });
    this.subscriptions.push(rolePermissionService);
  }

  updateMenuAccess(){
    console.log(this.dataSource.data);
    
  }

}
