import { NgModule } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { SeasonAdvanceComponent } from './components/season-advance/season-advance.component';
import { PaymentsComponent } from './components/payments/payments.component';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE, MatNativeDateModule } from '@angular/material/core';
import { MAT_MOMENT_DATE_ADAPTER_OPTIONS, MomentDateAdapter } from '@angular/material-moment-adapter';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatSortModule } from '@angular/material/sort';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatSelectModule } from '@angular/material/select';
import { AccountsRoutingModule } from './accounts-routing.module';
import { EditAddSeasonAdvanceComponent } from './models/edit-add-season-advance/edit-add-season-advance.component';
import { AccountsComponent } from './accounts.component';
import { AddEditPaymentComponent } from './models/add-edit-payment/add-edit-payment.component';
import { CharacterRestrictionDirective } from 'src/app/shared/character-restriction.directive';
import { AutocompleteLibModule } from 'angular-ng-autocomplete';
import { WalletCreationComponent } from './components/wallet-creation/wallet-creation.component';
import { AddEditWalletComponent } from './models/add-edit-wallet/add-edit-wallet.component';
import { WalletPaymentbyuserComponent } from './components/wallet-paymentbyuser/wallet-paymentbyuser.component';
import { PettyCashbookComponent } from './components/petty-cashbook/petty-cashbook.component';

export const MY_FORMATS = {
  parse: {
    dateInput: 'DD/MM/YYYY',
  },
  display: {
    dateInput: 'DD/MM/YYYY',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};

@NgModule({
  declarations: [
    SeasonAdvanceComponent,
    PaymentsComponent,
    EditAddSeasonAdvanceComponent,
    AccountsComponent,
    AddEditPaymentComponent,
    CharacterRestrictionDirective,
    WalletCreationComponent,
    AddEditWalletComponent,
    WalletPaymentbyuserComponent,
    PettyCashbookComponent
  ],
  imports: [
    CommonModule,
    AccountsRoutingModule,
    MatSelectModule,
    AutocompleteLibModule,
    MatNativeDateModule,
    MatDatepickerModule,
    ReactiveFormsModule,
    FormsModule,
    MatTableModule, 
    MatPaginatorModule,
    MatSortModule,
    MatButtonModule,
    MatDialogModule,
    MatTooltipModule,
    MatInputModule,
    MatFormFieldModule,
    MatSlideToggleModule,
    MatAutocompleteModule

  ],
  providers : [
    CurrencyPipe,
    DatePipe,
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS],
    },
    {provide: MAT_DATE_FORMATS, useValue: MY_FORMATS},
  ],
})
export class AccountsModule { }
