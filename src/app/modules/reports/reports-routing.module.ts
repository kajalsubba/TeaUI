import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ReportsComponent } from './reports.component';
import { GradeReportComponent } from './components/grade-report/grade-report.component';
import { ProfitAndLossComponent } from './components/profit-and-loss/profit-and-loss.component';

const routes: Routes = [
    {
      path: '',
      component: ReportsComponent,
      children: [
        { path: '', redirectTo: 'grade-report', pathMatch: 'full' },
        { path: 'grade-report', component: GradeReportComponent },
        { path: 'profit-loss-report', component: ProfitAndLossComponent }
      ],
    },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ReportsRoutingModule { }
