import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ReportsComponent } from './reports.component';
import { GradeReportComponent } from './components/grade-report/grade-report.component';
import { ProfitAndLossComponent } from './components/profit-and-loss/profit-and-loss.component';
import { DatewiseGradeReportComponent } from './components/datewise-grade-report/datewise-grade-report.component';
import { MonthWiseCollectionReportComponent } from './components/month-wise-collection-report/month-wise-collection-report.component';
import { SalePurchaseReportComponent } from './components/sale-purchase-report/sale-purchase-report.component';
import { SalePurchasewiseReportComponent } from './components/sale-purchasewise-report/sale-purchasewise-report.component';
import { SeasonAdvanceComponent } from '../accounts/components/season-advance/season-advance.component';
import { SeasonAdvanceReportComponent } from './components/season-advance-report/season-advance-report.component';
import { FieldBalanceReportComponent } from './components/field-balance-report/field-balance-report.component';

const routes: Routes = [
  {
    path: '',
    component: ReportsComponent,
    children: [
      { path: '', redirectTo: 'grade-report', pathMatch: 'full' },
      { path: 'grade-report', component: GradeReportComponent },
      { path: 'dategrade-report', component: DatewiseGradeReportComponent },
      { path: 'profit-loss-report', component: ProfitAndLossComponent },
      { path: 'sale-purchase-report', component: SalePurchaseReportComponent },
      { path: 'month-wise-collection-report', component: MonthWiseCollectionReportComponent },
      { path: 'sale-breakup-report', component: SalePurchasewiseReportComponent },
      { path: 'season-advance-report', component: SeasonAdvanceReportComponent },
  { path: 'field-balance-report', component: FieldBalanceReportComponent }


    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ReportsRoutingModule { }
