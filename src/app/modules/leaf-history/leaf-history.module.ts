import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LeafHistoryComponent } from './leaf-history.component';
import { StgHistoryComponent } from './components/stg-history/stg-history.component';
import { SupplierHistoryComponent } from './components/supplier-history/supplier-history.component';
import { LeafHistoryRoutingModule } from './leaf-history-routing.module';
import { MatSelectModule } from '@angular/material/select';
import { MatNativeDateModule } from '@angular/material/core';
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



@NgModule({
  declarations: [
    LeafHistoryComponent,
    StgHistoryComponent,
    SupplierHistoryComponent
  ],
  imports: [
    CommonModule,
    LeafHistoryRoutingModule,
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
  ]
})
export class LeafHistoryModule { }
