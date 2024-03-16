import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SeasonAdvanceComponent } from './components/season-advance/season-advance.component';
import { PaymentsComponent } from './components/payments/payments.component';
import { AccountsComponent } from './accounts.component';

const routes: Routes = [
  {path:'', component: AccountsComponent, children:[
    {path:'', redirectTo: 'seasonAdvance', pathMatch: 'full'},
    {path:'seasonAdvance', component: SeasonAdvanceComponent},
    {path:'payment', component: PaymentsComponent},
  ]}
];


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AccountsRoutingModule { }
