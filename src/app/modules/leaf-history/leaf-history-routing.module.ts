import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LeafHistoryComponent } from './leaf-history.component';
import { StgHistoryComponent } from './components/stg-history/stg-history.component';
import { SupplierHistoryComponent } from './components/supplier-history/supplier-history.component';
import { SaleHistoryComponent } from './components/sale-history/sale-history.component';
import { SeasonAdvanceHistoryComponent } from './components/season-advance-history/season-advance-history.component';
import { PaymentHistoryComponent } from './components/payment-history/payment-history.component';
import { StgBillHistoryComponent } from './components/stg-bill-history/stg-bill-history.component';
import { SupplierBillHistoryComponent } from './components/supplier-bill-history/supplier-bill-history.component';
import { SmartHistoryComponent } from './components/smart-history/smart-history.component';
import { WalletHistoryComponent } from './components/wallet-history/wallet-history.component';

const routes: Routes = [
  { path: '', redirectTo: '', pathMatch: 'full' },
  {
    path: '', component: LeafHistoryComponent, children: [
      { path: '', redirectTo: 'stg-history', pathMatch: 'full' },
      { path: 'stg-history', component: StgHistoryComponent },
      { path: 'supplier-history', component: SupplierHistoryComponent },
      { path: 'sale-history', component: SaleHistoryComponent },
      { path: 'season-advance-history', component: SeasonAdvanceHistoryComponent },
      { path: 'payment-history', component: PaymentHistoryComponent },
      { path: 'stg-bill-history', component: StgBillHistoryComponent },
      { path: 'supplier-bill-history', component: SupplierBillHistoryComponent },
      { path: 'smart-history', component: SmartHistoryComponent },
      { path: 'wallet-history', component: WalletHistoryComponent },

    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LeafHistoryRoutingModule { }
