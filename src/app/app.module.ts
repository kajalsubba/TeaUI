import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CoreModule } from './core/core.module';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { ApiService } from './core/services/api.service';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { LoadingInterceptor } from './core/interceptors/loading.interceptor';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    CoreModule,
    ToastrModule.forRoot({
      timeOut: 3000, 
      positionClass: 'toast-top-center',
      preventDuplicates: true,
      closeButton:true,
      progressAnimation:'increasing',    
    }),
  ],
  providers: [ToastrService, ApiService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: LoadingInterceptor,
      multi: true,
    },
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
