import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserManagementComponent } from './user-management.component';
import { UserComponent } from './components/user/user.component';
import { RoleComponent } from './components/role/role.component';
import { UserManagementRoutingModule } from './user-management-routing.module';



@NgModule({
  declarations: [
    UserManagementComponent,
    UserComponent,
    RoleComponent
  ],
  imports: [
    CommonModule,
    UserManagementRoutingModule
  ]
})
export class UserManagementModule { }
