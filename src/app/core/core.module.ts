import { NgModule } from '@angular/core';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { ApiService } from './services/api.service';
import { ConfigService } from './services/config.service';
import { ErrorInterceptor } from './interceptors/error.interceptor';
import { LoaderComponent } from './components/loader/loader.component';
import { CommonModule } from '@angular/common';

@NgModule({
  imports: [HttpClientModule, CommonModule],
  providers: [
    ApiService,
    ConfigService,
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
  ],
  declarations: [
    LoaderComponent
  ],
  exports:[LoaderComponent]
})
export class CoreModule {}
