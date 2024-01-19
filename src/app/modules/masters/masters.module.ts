import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MastersComponent } from './masters.component';
import { MastersRoutingModule } from './masters-routing.module';
import { CategoryComponent } from './components/category/category.component';
import { ClientComponent } from './components/client/client.component';
import { GradeComponent } from './components/grade/grade.component';
import { FactoryComponent } from './components/factory/factory.component';
import { FactoryAccountComponent } from './components/factory-account/factory-account.component';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { ApiService } from 'src/app/core/services/api.service';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { AddEditCategoryComponent } from './models/add-edit-category/add-edit-category.component';
import { AddEditClientComponent } from './models/add-edit-client/add-edit-client.component';
import { AddEditFactoryComponent } from './models/add-edit-factory/add-edit-factory.component';
import { AddEditFactoryAccountComponent } from './models/add-edit-factory-account/add-edit-factory-account.component';
import { AddEditGradeComponent } from './models/add-edit-grade/add-edit-grade.component';
import {MatTooltipModule} from '@angular/material/tooltip';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {MatInputModule} from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';

@NgModule({
  declarations: [
    MastersComponent,
    CategoryComponent,
    ClientComponent,
    GradeComponent,
    FactoryComponent,
    FactoryAccountComponent,
    AddEditCategoryComponent,
    AddEditClientComponent,
    AddEditFactoryComponent,
    AddEditFactoryAccountComponent,
    AddEditGradeComponent
  ],
  imports: [
    CommonModule,
    MatSelectModule,
    MastersRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    MatTableModule, 
    MatPaginatorModule,
    MatSortModule,
    MatButtonModule,
    MatDialogModule,
    MatTooltipModule,
    MatSelectModule,
    MatInputModule,
    MatFormFieldModule,
    MatSlideToggleModule
  ],
  providers:[ApiService]
})
export class MastersModule { }
