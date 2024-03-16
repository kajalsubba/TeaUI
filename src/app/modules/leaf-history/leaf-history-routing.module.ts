import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LeafHistoryComponent } from './leaf-history.component';
import { StgHistoryComponent } from './components/stg-history/stg-history.component';
import { SupplierHistoryComponent } from './components/supplier-history/supplier-history.component';
import { SaleHistoryComponent } from './components/sale-history/sale-history.component';
import { SeasonAdvanceHistoryComponent } from './components/season-advance-history/season-advance-history.component';
import { PaymentHistoryComponent } from './components/payment-history/payment-history.component';

const routes: Routes = [
  { path: '', redirectTo: '', pathMatch: 'full' },
  {path:'', component: LeafHistoryComponent, children:[
    {path:'', redirectTo: 'stg-history', pathMatch: 'full'},
    {path:'stg-history', component: StgHistoryComponent},
    {path:'supplier-history', component: SupplierHistoryComponent},
    {path:'sale-history', component: SaleHistoryComponent},
    {path:'season-advance-history', component: SeasonAdvanceHistoryComponent},
    {path:'payment-history', component: PaymentHistoryComponent},
  ]}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LeafHistoryRoutingModule { }
