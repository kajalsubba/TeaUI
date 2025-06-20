import { NgModule } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { LeafHistoryComponent } from './leaf-history.component';
import { StgHistoryComponent } from './components/stg-history/stg-history.component';
import { SupplierHistoryComponent } from './components/supplier-history/supplier-history.component';
import { LeafHistoryRoutingModule } from './leaf-history-routing.module';
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
import { SaleHistoryComponent } from './components/sale-history/sale-history.component';

import { AddStgComponent } from './models/add-stg/add-stg.component';
import { PaymentHistoryComponent } from './components/payment-history/payment-history.component';
import { SeasonAdvanceHistoryComponent } from './components/season-advance-history/season-advance-history.component';
import { StgBillHistoryComponent } from './components/stg-bill-history/stg-bill-history.component';
import { SupplierBillHistoryComponent } from './components/supplier-bill-history/supplier-bill-history.component';
import { SmartHistoryComponent } from './components/smart-history/smart-history.component';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { WalletHistoryComponent } from './components/wallet-history/wallet-history.component';
import { PettyCashbookHistoryComponent } from './components/petty-cashbook-history/petty-cashbook-history.component';

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
    LeafHistoryComponent,
    StgHistoryComponent,
    SupplierHistoryComponent,
    SaleHistoryComponent,
    AddStgComponent,
    PaymentHistoryComponent,
    SeasonAdvanceHistoryComponent,
    StgBillHistoryComponent,
    SupplierBillHistoryComponent,
    SmartHistoryComponent,
    WalletHistoryComponent,
    PettyCashbookHistoryComponent
  ],
  imports: [
    CommonModule,
    LeafHistoryRoutingModule,
    MatSelectModule,
    NgxMatSelectSearchModule,
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
export class LeafHistoryModule { }
