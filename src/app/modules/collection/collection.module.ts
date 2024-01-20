import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CollectionComponent } from './collection.component';
import { StgComponent } from './components/stg/stg.component';
import { SupplierComponent } from './components/supplier/supplier.component';
import { CollectionRoutingModule } from './collection-routing.module';



@NgModule({
  declarations: [
    CollectionComponent,
    StgComponent,
    SupplierComponent
  ],
  imports: [
    CommonModule,
    CollectionRoutingModule
  ]
})
export class CollectionModule { }
