import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LeafHistoryComponent } from './leaf-history.component';
import { StgHistoryComponent } from './components/stg-history/stg-history.component';
import { SupplierHistoryComponent } from './components/supplier-history/supplier-history.component';

const routes: Routes = [
  { path: '', redirectTo: '', pathMatch: 'full' },
  {path:'', component: LeafHistoryComponent, children:[
    {path:'', redirectTo: 'stg-history', pathMatch: 'full'},
    {path:'stg-history', component: StgHistoryComponent},
    {path:'supplier-history', component: SupplierHistoryComponent},
  ]}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LeafHistoryRoutingModule { }
