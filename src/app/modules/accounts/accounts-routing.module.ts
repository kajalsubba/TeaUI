import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SeasonAdvanceComponent } from './components/season-advance/season-advance.component';
import { PaymentsComponent } from './components/payments/payments.component';
import { AccountsComponent } from './accounts.component';
import { WalletCreationComponent } from './components/wallet-creation/wallet-creation.component';
import { WalletPaymentbyuserComponent } from './components/wallet-paymentbyuser/wallet-paymentbyuser.component';
import { PettyCashbookComponent } from './components/petty-cashbook/petty-cashbook.component';

const routes: Routes = [
  {path:'', component: AccountsComponent, children:[
    {path:'', redirectTo: 'seasonAdvance', pathMatch: 'full'},
    {path:'seasonAdvance', component: SeasonAdvanceComponent},
    {path:'payment', component: PaymentsComponent},
    {path:'wallet-creation',component:WalletCreationComponent},
    {path:'wallet-payment-user',component:WalletPaymentbyuserComponent},
    {path:'petty-cashbook',component:PettyCashbookComponent}
  ]}
];


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AccountsRoutingModule { }
