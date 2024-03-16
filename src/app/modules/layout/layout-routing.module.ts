import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LayoutComponent } from './layout.component';
import { DashboardComponent } from '../dashboard/dashboard.component';
import { AuthGuard, AuthService } from 'src/app/auth/services/auth.service';

const routes: Routes = [
  { path: '', redirectTo: '', pathMatch: 'full' },
  {path:'', component: LayoutComponent, canActivate:[AuthGuard], children:[
    {path:'', redirectTo: 'dashboard', pathMatch: 'full'},
    {path:'dashboard', component: DashboardComponent},
    {path:'master', loadChildren: () => import('../masters/masters.module').then(m => m.MastersModule)},
    {path:'leafEntry', loadChildren: () => import('../collection/collection.module').then(m => m.CollectionModule)},
    {path:'LeafApprove', loadChildren: () => import('../collectionApprove/collection-approve.module').then(m => m.CollectionApproveModule)},
    {path:'rate-fix', loadChildren: () => import('../rate-fix/rate-fix.module').then(m => m.RateFixModule)},
    {path:'Accounts', loadChildren: () => import('../accounts/accounts.module').then(m => m.AccountsModule)},
    {path:'LeafHistory', loadChildren: () => import('../leaf-history/leaf-history.module').then(m => m.LeafHistoryModule)},
    {path:'user-management', loadChildren: () => import('../user-management/user-management.module').then(m => m.UserManagementModule)},
    {path:'super-admin', loadChildren: () => import('../super-admin/super-admin.module').then(m => m.SuperAdminModule)},
  ]}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LayoutRoutingModule { }
