import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UserManagementComponent } from './user-management.component';
import { UserComponent } from './components/user/user.component';
import { RoleComponent } from './components/role/role.component';

const routes: Routes = [
  { path: '', redirectTo: '', pathMatch: 'full' },
  {path:'', component: UserManagementComponent, children:[
    {path:'', redirectTo: 'user', pathMatch: 'full'},
    {path:'user', component: UserComponent},
    {path:'role', component: RoleComponent},
  ]}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UserManagementRoutingModule { }
