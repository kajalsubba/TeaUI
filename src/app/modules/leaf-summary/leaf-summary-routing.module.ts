import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LeafSummaryComponent } from './leaf-summary.component';
import { StgSummaryComponent } from './components/stg-summary/stg-summary.component';
import { SupplierSummaryComponent } from './components/supplier-summary/supplier-summary.component';
import { SaleSummaryComponent } from './components/sale-summary/sale-summary.component';

const routes: Routes = [
  { path: '', redirectTo: '', pathMatch: 'full' },
  {path:'', component: LeafSummaryComponent, children:[
    {path:'', redirectTo: 'stg-summary', pathMatch: 'full'},
    {path:'stg-summary', component: StgSummaryComponent},
    {path:'supplier-summary', component: SupplierSummaryComponent},
    {path:'sale-summary', component: SaleSummaryComponent}
  ]}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LeafSummaryRoutingModule { }
