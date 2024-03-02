import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RateFixComponent } from './rate-fix.component';
import { StgRateFixComponent } from './components/stg-rate-fix/stg-rate-fix.component';
import { SupplierRateFixComponent } from './components/supplier-rate-fix/supplier-rate-fix.component';
import { SaleRateFixComponent } from './components/sale-rate-fix/sale-rate-fix.component';

const routes: Routes = [
  {
    path: '',
    component: RateFixComponent,
    children: [
      { path: '', redirectTo: 'stg-rate-fix', pathMatch: 'full' },
      { path: 'stg-rate-fix', component: StgRateFixComponent },
      { path: 'supplier-rate-fix', component: SupplierRateFixComponent },
      { path: 'sale-rate-fix', component: SaleRateFixComponent },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class RateFixRoutingModule {}
