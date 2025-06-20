import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConfirmDialogComponent } from './components/confirm-dialog/confirm-dialog.component';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ColumnTotalPipe } from './pipes/column-total.pipe';
import { SaleEntryComponent } from './components/sale-entry/sale-entry.component';
import { MatSelectModule } from '@angular/material/select';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { ImageViewerComponent } from './components/image-viewer/image-viewer.component';
import { EditSaleEntryComponent } from './components/edit-sale-entry/edit-sale-entry.component';
import { ConfirmDialogRemarksComponent } from './components/confirm-dialog-remarks/confirm-dialog-remarks.component';
import { CurrencyDirective } from './currency.directive';
import { ViewCollectionBagComponent } from './components/view-collection-bag/view-collection-bag.component';
import { QRViewerComponent } from './components/qr-viewer/qr-viewer.component';
import { QRCodeModule } from 'angularx-qrcode';
//import { CharacterRestrictionDirective } from './character-restriction.directive';

@NgModule({
  declarations: [ConfirmDialogComponent, ColumnTotalPipe, SaleEntryComponent, ImageViewerComponent, EditSaleEntryComponent, ConfirmDialogRemarksComponent, CurrencyDirective, ViewCollectionBagComponent, QRViewerComponent],
  exports: [ConfirmDialogComponent],
  imports: [
    CommonModule,
    MatButtonModule,
    MatDialogModule,
    MatTooltipModule,
    MatSelectModule,
    MatNativeDateModule,
    MatDatepickerModule,
    ReactiveFormsModule,
    FormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatInputModule,
    MatFormFieldModule,
    MatSlideToggleModule,
    MatAutocompleteModule,
    MatCheckboxModule,
    QRCodeModule
  ],
})
export class SharedModule {}
