import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UserManagementComponent } from './user-management.component';
import { UserComponent } from './components/user/user.component';
import { RoleComponent } from './components/role/role.component';
import { RolePermissionComponent } from './components/role-permission/role-permission.component';
import { ChangePasswordComponent } from './components/change-password/change-password.component';

const routes: Routes = [
  { path: '', redirectTo: '', pathMatch: 'full' },
  {path:'', component: UserManagementComponent, children:[
    {path:'', redirectTo: 'user', pathMatch: 'full'},
    {path:'user', component: UserComponent},
    {path:'role', component: RoleComponent},
    {path:'role-permission', component: RolePermissionComponent},
    {path:'change-password', component: ChangePasswordComponent},
  ]}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UserManagementRoutingModule { }
