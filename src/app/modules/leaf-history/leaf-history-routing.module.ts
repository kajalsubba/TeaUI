import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LeafHistoryComponent } from './leaf-history.component';
import { StgHistoryComponent } from './components/stg-history/stg-history.component';
import { SupplierHistoryComponent } from './components/supplier-history/supplier-history.component';
import { SaleHistoryComponent } from './components/sale-history/sale-history.component';

const routes: Routes = [
  { path: '', redirectTo: '', pathMatch: 'full' },
  {path:'', component: LeafHistoryComponent, children:[
    {path:'', redirectTo: 'stg-history', pathMatch: 'full'},
    {path:'stg-history', component: StgHistoryComponent},
    {path:'supplier-history', component: SupplierHistoryComponent},
    {path:'sale-history', component: SaleHistoryComponent},
  ]}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LeafHistoryRoutingModule { }
