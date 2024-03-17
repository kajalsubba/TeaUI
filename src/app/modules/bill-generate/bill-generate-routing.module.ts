import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BillGenerateComponent } from './bill-generate.component';
import { StgBillGenerateComponent } from './components/stg-bill-generate/stg-bill-generate.component';
import { SupplierBillGenerateComponent } from './components/supplier-bill-generate/supplier-bill-generate.component';

const routes: Routes = [
  {path:'', component: BillGenerateComponent, children:[
    {path:'', redirectTo: 'stg-bill', pathMatch: 'full'},
    {path:'stg-bill', component: StgBillGenerateComponent},
    {path:'supplier-bill', component: SupplierBillGenerateComponent},
  ]}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BillGenerateRoutingModule { }
