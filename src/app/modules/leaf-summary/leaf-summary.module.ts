import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';

import { LeafSummaryRoutingModule } from './leaf-summary-routing.module';
import { LeafSummaryComponent } from './leaf-summary.component';
import { MatSelectModule } from '@angular/material/select';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE, MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MAT_MOMENT_DATE_ADAPTER_OPTIONS, MomentDateAdapter } from '@angular/material-moment-adapter';
import { StgSummaryComponent } from './components/stg-summary/stg-summary.component';
import { SupplierSummaryComponent } from './components/supplier-summary/supplier-summary.component';
import { SaleSummaryComponent } from './components/sale-summary/sale-summary.component';

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
    LeafSummaryComponent,
    StgSummaryComponent,
    SupplierSummaryComponent,
    SaleSummaryComponent
  ],
  imports: [
    LeafSummaryRoutingModule,
    CommonModule,
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
    MatAutocompleteModule
  ],
  providers : [
    DatePipe,
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS],
    },
    {provide: MAT_DATE_FORMATS, useValue: MY_FORMATS},
  ]
})
export class LeafSummaryModule { }
