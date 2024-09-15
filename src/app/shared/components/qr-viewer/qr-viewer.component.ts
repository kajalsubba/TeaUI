import { AfterViewInit, Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import html2canvas from 'html2canvas';
import { HelperService } from 'src/app/core/services/helper.service';

@Component({
  selector: 'app-qr-viewer',
  templateUrl: './qr-viewer.component.html',
  styleUrls: ['./qr-viewer.component.scss']
})
export class QRViewerComponent implements OnInit, AfterViewInit {


  userInput: any;
  @ViewChild('qrCodeCanvas', { static: false }) qrCodeCanvas!: ElementRef;

  widths = [100, 150, 200, 250, 300, 350, 400, 450, 500, 550, 600];
  selectedWidth = this.widths[3];

  fontSizes = [1, 2, 3, 4, 5];
  selectedFontSize = this.fontSizes[0];
  margins = [2, 5, 10, 12, 14, 16, 18, 10];
  selectedMargins = this.margins[0];
  loginDetails: any;
  UserDetails: any;
  constructor(
    public dialogRef: MatDialogRef<QRViewerComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private helper: HelperService,
  ) {

  }

  ngOnInit(): void {
    
   // debugger
    this.loginDetails = this.helper.getItem('loginDetails');
    this.userInput = this.data.value.TenantId + "/" + this.data.value.ClientId+"/"+this.data.value.ClientFirstName+""+this.data.value.ClientLastName;
    this.UserDetails = this.data.value.ClientFirstName + " " + this.data.value.ClientLastName;
  }
  ngAfterViewInit() {
    // The qrCodeCanvas should be available here
    // if (this.qrCodeCanvas) {
    //   console.log('QR Code Canvas:', this.qrCodeCanvas.nativeElement);
    // } else {
    //   console.error('QR Code Canvas is undefined in ngAfterViewInit');
    // }
  }

  downloadQR(qrCodeCanvas: any) {
 //   debugger
    const contents = document.querySelector('.content-container') as HTMLElement;

    if (contents) {
      html2canvas(contents).then(canvas => {
        const link = document.createElement('a');
        link.href = canvas.toDataURL('image/png');
        link.download = this.data.value.ClientFirstName;
        link.click();
      });
    }

    // let parentElement = null

    // parentElement = qrCodeCanvas.qrcElement.nativeElement
    //   .querySelector("canvas")
    //   .toDataURL("image/png")

    // if (parentElement) {
    //   let blobData = this.convertBase64ToBlob(parentElement)
    //   const blob = new Blob([blobData], { type: "image/png" })
    //   const url = window.URL.createObjectURL(blob)
    //   const link = document.createElement("a")
    //   link.href = url
    //   link.download = this.data.value.ClientFirstName;
    //   link.click()
    // }
  }

  private convertBase64ToBlob(Base64Image: string) {
    // split into two parts
    const parts = Base64Image.split(";base64,")
    // hold the content type
    const imageType = parts[0].split(":")[1]
    // decode base64 string
    const decodedData = window.atob(parts[1])
    // create unit8array of size same as row data length
    const uInt8Array = new Uint8Array(decodedData.length)
    // insert all character code into uint8array
    for (let i = 0; i < decodedData.length; ++i) {
      uInt8Array[i] = decodedData.charCodeAt(i)
    }
    // return blob image after conversion
    return new Blob([uInt8Array], { type: imageType })
  }


}
