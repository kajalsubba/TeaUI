import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-image-viewer',
  templateUrl: './image-viewer.component.html',
  styleUrls: ['./image-viewer.component.scss']
})
export class ImageViewerComponent implements OnInit {

  rotateDegrees: number = 0; 
  zoomLevel: number = 1;
  transformStyle: string = '';

  constructor(
    public dialogRef: MatDialogRef<ImageViewerComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ){}

  ngOnInit(): void {
    this.updateTransformStyle();
  }

  rotateImage() {
    this.rotateDegrees = (this.rotateDegrees + 90) % 360;
    this.updateTransformStyle();
  }

  downloadImage() {
    
    const link = document.createElement('a');
    link.href = this.data.rowData.imageUrl;
    link.target = '_blank';
    link.download = 'image.jpg';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  zoomIn() {
    this.zoomLevel += 0.1;
    this.updateTransformStyle();
  }

  zoomOut() {
    if (this.zoomLevel > 0.1) {
      this.zoomLevel -= 0.1;
      this.updateTransformStyle();
    }
  }

  updateTransformStyle() {
    this.transformStyle = `scale(${this.zoomLevel}) rotate(${this.rotateDegrees}deg)`;
  }
}
