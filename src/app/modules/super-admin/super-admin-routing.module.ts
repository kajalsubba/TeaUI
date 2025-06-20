import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SuperAdminComponent } from './super-admin.component';
import { TenantComponent } from './components/tenant/tenant.component';
import { UserComponent } from './components/user/user.component';
import { RoleComponent } from './components/role/role.component';

const routes: Routes = [
  { path: '', redirectTo: '', pathMatch: 'full' },
  {path:'', component: SuperAdminComponent, children:[
    {path:'', redirectTo: 'tenant', pathMatch: 'full'},
    {path:'tenant', component: TenantComponent},
    {path:'user', component: UserComponent},
    {path:'role', component: RoleComponent},
  ]}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SuperAdminRoutingModule { }
