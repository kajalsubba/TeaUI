import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MastersComponent } from './masters.component';
import { CategoryComponent } from './components/category/category.component';
import { ClientComponent } from './components/client/client.component';
import { GradeComponent } from './components/grade/grade.component';
import { FactoryComponent } from './components/factory/factory.component';
import { FactoryAccountComponent } from './components/factory-account/factory-account.component';
import { CompanyComponent } from './components/company/company.component';
import { PaymentTypeComponent } from './components/payment-type/payment-type.component';

const routes: Routes = [
  { path: '', redirectTo: '', pathMatch: 'full' },
  {path:'', component: MastersComponent, children:[
    {path:'', redirectTo: 'category', pathMatch: 'full'},
    {path:'category', component: CategoryComponent},
    {path:'client', component: ClientComponent},
    {path:'grade', component: GradeComponent},
    {path:'paymentType', component: PaymentTypeComponent},
    {path:'factory', component: FactoryComponent},
    {path:'factory-account', component: FactoryAccountComponent},
    {path:'company', component: CompanyComponent},
  ]}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MastersRoutingModule { }
