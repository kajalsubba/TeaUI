import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConfirmDialogComponent } from './components/confirm-dialog/confirm-dialog.component';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ColumnTotalPipe } from './pipes/column-total.pipe';



@NgModule({
  declarations: [
    ConfirmDialogComponent,
    ColumnTotalPipe
  ],
  exports:[ConfirmDialogComponent],
  imports: [
    CommonModule,
    MatButtonModule,
    MatDialogModule,
    MatTooltipModule
  ]
})
export class SharedModule { }
