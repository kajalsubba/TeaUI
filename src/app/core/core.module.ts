import { NgModule } from '@angular/core';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { ApiService } from './services/api.service';
import { ConfigService } from './services/config.service';
import { ErrorInterceptor } from './interceptors/error.interceptor';

@NgModule({
  imports: [HttpClientModule],
  providers: [
    ApiService,
    ConfigService,
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
  ],
})
export class CoreModule {}
