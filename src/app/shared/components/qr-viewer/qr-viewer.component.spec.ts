import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QRViewerComponent } from './qr-viewer.component';

describe('QRViewerComponent', () => {
  let component: QRViewerComponent;
  let fixture: ComponentFixture<QRViewerComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [QRViewerComponent]
    });
    fixture = TestBed.createComponent(QRViewerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
