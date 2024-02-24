import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserManagementComponent } from './user-management.component';
import { UserComponent } from './components/user/user.component';
import { RoleComponent } from './components/role/role.component';
import { UserManagementRoutingModule } from './user-management-routing.module';
import { ApiService } from 'src/app/core/services/api.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { AddEditRoleComponent } from './models/add-edit-role/add-edit-role.component';
import { RolePermissionComponent } from './components/role-permission/role-permission.component';
import { AddEditUserComponent } from './models/add-edit-user/add-edit-user.component';



@NgModule({
  declarations: [
    UserManagementComponent,
    UserComponent,
    RoleComponent,
    AddEditRoleComponent,
    RolePermissionComponent,
    AddEditUserComponent
  ],
  imports: [
    CommonModule,
    UserManagementRoutingModule,
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
export class UserManagementModule { }
