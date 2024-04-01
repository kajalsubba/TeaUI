import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LayoutComponent } from './layout.component';
import { SideNavComponent } from './components/side-nav/side-nav.component';
import { TopNavComponent } from './components/top-nav/top-nav.component';
import { LayoutRoutingModule } from './layout-routing.module';
import {MatExpansionModule} from '@angular/material/expansion';
import { DashboardModule } from '../dashboard/dashboard.module';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';

@NgModule({
  declarations: [
    LayoutComponent,
    SideNavComponent,
    TopNavComponent
  ],
  imports: [
    CommonModule,
    LayoutRoutingModule,
    MatExpansionModule,
    DashboardModule,
    MatIconModule,
    MatMenuModule
  ]
})
export class LayoutModule { }
