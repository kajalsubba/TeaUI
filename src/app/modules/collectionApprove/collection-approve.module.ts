import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';

import { CollectionApproveRoutingModule } from './collection-approve-routing.module';



import { CollectionApproveComponent } from "./collection-approve.component";
import { StgapproveComponent } from "./components/stgapprove/stgapprove.component";

import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE, MatNativeDateModule } from "@angular/material/core";
import { MAT_MOMENT_DATE_ADAPTER_OPTIONS, MomentDateAdapter } from "@angular/material-moment-adapter";
import { MatAutocompleteModule } from "@angular/material/autocomplete";
import { MatSlideToggleModule } from "@angular/material/slide-toggle";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatTooltipModule } from "@angular/material/tooltip";
import { MatDialogModule } from "@angular/material/dialog";
import { MatButtonModule } from "@angular/material/button";
import { MatSortModule } from "@angular/material/sort";
import { MatPaginatorModule } from "@angular/material/paginator";
import { MatTableModule } from "@angular/material/table";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { MatSelectModule } from "@angular/material/select";

export const MY_FORMATS = {
    parse: {
      dateInput: 'DD-MMM-YYYY',
    },
    display: {
      dateInput: 'DD-MMM-YYYY',
      monthYearLabel: 'MMM YYYY',
      dateA11yLabel: 'LL',
      monthYearA11yLabel: 'MMMM YYYY',
    },
  };
  
  
  @NgModule({
    declarations: [
    CollectionApproveComponent,
      StgapproveComponent
   //   SupplierComponent,
     // AddEditStgComponent
    ],
    imports: [
      CommonModule,
      CollectionApproveRoutingModule,
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
export class CollectionApproveModule { }
