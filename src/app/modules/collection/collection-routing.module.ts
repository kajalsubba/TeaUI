import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CollectionComponent } from './collection.component';
import { StgComponent } from './components/stg/stg.component';
import { SupplierComponent } from './components/supplier/supplier.component';

const routes: Routes = [
  { path: '', redirectTo: '', pathMatch: 'full' },
  {path:'', component: CollectionComponent, children:[
    {path:'', redirectTo: 'stg', pathMatch: 'full'},
    {path:'stg', component: StgComponent},
    {path:'supplier', component: SupplierComponent},
  ]}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CollectionRoutingModule { }
