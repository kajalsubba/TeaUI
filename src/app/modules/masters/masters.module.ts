import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MastersComponent } from './masters.component';
import { MastersRoutingModule } from './masters-routing.module';
import { CategoryComponent } from './components/category/category.component';
import { ClientComponent } from './components/client/client.component';
import { GradeComponent } from './components/grade/grade.component';
import { FactoryComponent } from './components/factory/factory.component';
import { FactoryAccountComponent } from './components/factory-account/factory-account.component';
import { ApiService } from 'src/app/core/services/api.service';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { AddEditCategoryComponent } from './models/add-edit-category/add-edit-category.component';
import { AddEditClientComponent } from './models/add-edit-client/add-edit-client.component';
import { AddEditFactoryComponent } from './models/add-edit-factory/add-edit-factory.component';
import { AddEditFactoryAccountComponent } from './models/add-edit-factory-account/add-edit-factory-account.component';
import { AddEditGradeComponent } from './models/add-edit-grade/add-edit-grade.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { CompanyComponent } from './components/company/company.component';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatSelectModule } from '@angular/material/select';
import { PaymentTypeComponent } from './components/payment-type/payment-type.component';
import { AddEditPaymentTypeComponent } from './models/add-edit-payment-type/add-edit-payment-type.component';
import { ClientPasswordChangeComponent } from './models/client-password-change/client-password-change.component';

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
    AddEditGradeComponent,
    CompanyComponent,
    PaymentTypeComponent,
    AddEditPaymentTypeComponent,
    ClientPasswordChangeComponent
  ],
  imports: [
    CommonModule,
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
  providers: [ApiService]
})
export class MastersModule { }
