import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-confirm-dialog-remarks',
  templateUrl: './confirm-dialog-remarks.component.html',
  styleUrls: ['./confirm-dialog-remarks.component.scss']
})
export class ConfirmDialogRemarksComponent {

  remarks:any=''

  constructor(
    public dialogRef: MatDialogRef<ConfirmDialogRemarksComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  onNoClick(): void {
    this.dialogRef.close();
  }

  onYesClick(): void {
    this.dialogRef.close(this.remarks);
  }

}
