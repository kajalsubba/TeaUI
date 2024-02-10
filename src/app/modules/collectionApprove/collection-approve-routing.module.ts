import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CollectionApproveComponent } from './collection-approve.component';
import { StgapproveComponent } from './components/stgapprove/stgapprove.component';
import { SupplierapproveComponent } from './components/supplierapprove/supplierapprove.component';


const routes: Routes = [
  { path: '', redirectTo: '', pathMatch: 'full' },
  {path:'', component: CollectionApproveComponent, children:[
    {path:'', redirectTo: 'stgapprove', pathMatch: 'full'},
    {path:'stgapprove', component: StgapproveComponent},
   {path:'supplierapprove', component: SupplierapproveComponent},
  ]}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CollectionApproveRoutingModule { }
