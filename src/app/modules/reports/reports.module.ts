import { NgModule } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';

import { ReportsRoutingModule } from './reports-routing.module';
import { ReportsComponent } from './reports.component';
import { GradeReportComponent } from './components/grade-report/grade-report.component';
import { ProfitAndLossComponent } from './components/profit-and-loss/profit-and-loss.component';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatSortModule } from '@angular/material/sort';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE, MatNativeDateModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MAT_MOMENT_DATE_ADAPTER_OPTIONS, MomentDateAdapter } from '@angular/material-moment-adapter';
import { DatewiseGradeReportComponent } from './components/datewise-grade-report/datewise-grade-report.component';
import { SalePurchaseReportComponent } from './components/sale-purchase-report/sale-purchase-report.component';
import { MonthWiseCollectionReportComponent } from './components/month-wise-collection-report/month-wise-collection-report.component';
import { SalePurchasewiseReportComponent } from './components/sale-purchasewise-report/sale-purchasewise-report.component';
import { MatIconModule } from '@angular/material/icon';
import { SeasonAdvanceReportComponent } from './components/season-advance-report/season-advance-report.component';
import { FieldBalanceReportComponent } from './components/field-balance-report/field-balance-report.component';

export const MY_FORMATS = {
  parse: {
    dateInput: 'DD/MM/YYYY',
  },
  display: {
    dateInput: 'DD/MM/YYYY',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};
@NgModule({
  declarations: [
    ReportsComponent,
    GradeReportComponent,
    ProfitAndLossComponent,
    DatewiseGradeReportComponent,
    SalePurchaseReportComponent,
    MonthWiseCollectionReportComponent,
    SalePurchasewiseReportComponent,
    SeasonAdvanceReportComponent,
    FieldBalanceReportComponent
  ],
  imports: [
    CommonModule,
    ReportsRoutingModule,
    MatSelectModule,
    MatNativeDateModule,
    MatDatepickerModule,
    ReactiveFormsModule,
    FormsModule,
    MatTableModule, 
    MatPaginatorModule,
    MatSortModule,
    MatButtonModule,
    MatDialogModule,
    MatTooltipModule,
    MatInputModule,
    MatFormFieldModule,
    MatSlideToggleModule,
    MatAutocompleteModule,
    MatIconModule,
  ],
  providers : [
    CurrencyPipe,
    DatePipe,
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS],
    },
    {provide: MAT_DATE_FORMATS, useValue: MY_FORMATS},
  ]
})

export class ReportsModule { }
