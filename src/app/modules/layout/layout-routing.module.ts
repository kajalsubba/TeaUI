import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LayoutComponent } from './layout.component';
import { DashboardComponent } from '../dashboard/dashboard.component';

const routes: Routes = [
  { path: '', redirectTo: '', pathMatch: 'full' },
  {path:'', component: LayoutComponent, children:[
    {path:'', redirectTo: 'dashboard', pathMatch: 'full'},
    {path:'dashboard', component: DashboardComponent},
    {path:'master', loadChildren: () => import('../masters/masters.module').then(m => m.MastersModule)},
    {path:'leafEntry', loadChildren: () => import('../collection/collection.module').then(m => m.CollectionModule)},
    {path:'user-management', loadChildren: () => import('../user-management/user-management.module').then(m => m.UserManagementModule)},
  ]}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LayoutRoutingModule { }
