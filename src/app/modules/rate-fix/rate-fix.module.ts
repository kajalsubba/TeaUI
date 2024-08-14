import { NgModule } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { RateFixRoutingModule } from './rate-fix-routing.module';
import { RateFixComponent } from './rate-fix.component';
import { StgRateFixComponent } from './components/stg-rate-fix/stg-rate-fix.component';
import { SupplierRateFixComponent } from './components/supplier-rate-fix/supplier-rate-fix.component';
import { SaleRateFixComponent } from './components/sale-rate-fix/sale-rate-fix.component';
import { ApiService } from 'src/app/core/services/api.service';
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
import { EditRateComponent } from './models/edit-rate/edit-rate.component';
import { EditSaleRateComponent } from './models/edit-sale-rate/edit-sale-rate.component';
import { EditSupplierRateComponent } from './models/edit-supplier-rate/edit-supplier-rate.component';

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
    RateFixComponent,
    StgRateFixComponent,
    SupplierRateFixComponent,
    SaleRateFixComponent,
    EditRateComponent,
    EditSaleRateComponent,
    EditSupplierRateComponent
  ],
  imports: [
    CommonModule,
    RateFixRoutingModule,
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
  providers:[
    ApiService,
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
export class RateFixModule { }
