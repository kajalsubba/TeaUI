import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-image-viewer',
  templateUrl: './image-viewer.component.html',
  styleUrls: ['./image-viewer.component.scss']
})
export class ImageViewerComponent implements OnInit {

  rotateDegrees = 'rotate(0deg)'; 
  constructor(
    public dialogRef: MatDialogRef<ImageViewerComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ){}

  ngOnInit(): void {
      
  }
  rotateImage() {
    // Update the rotation angle
    this.rotateDegrees = `rotate(${(parseInt(this.rotateDegrees.substring(7)) + 90) % 360}deg)`;
  }
  downloadImage() {
   // window.open(this.data.imageUrl, '_blank');

    const link = document.createElement('a');
    link.href = this.data.imageUrl; // Use the image URL
    link.target = '_blank'; // Open in a new tab
    link.download = 'image.jpg'; // Set the file name for download
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
