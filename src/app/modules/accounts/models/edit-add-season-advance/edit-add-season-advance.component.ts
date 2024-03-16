import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { Subject, Subscription, takeUntil } from 'rxjs';
import { HelperService } from 'src/app/core/services/helper.service';
import { IGetTeaClient } from 'src/app/modules/collection/interfaces/istg';
import { AutoCompleteService } from 'src/app/modules/collection/services/auto-complete.service';
import { StgApproveService } from 'src/app/modules/collectionApprove/services/stg-approve.service';

@Component({
  selector: 'app-edit-add-season-advance',
  templateUrl: './edit-add-season-advance.component.html',
  styleUrls: ['./edit-add-season-advance.component.scss']
})
export class EditAddSeasonAdvanceComponent implements OnInit {

  addEditSeasonAdvance!:FormGroup;
  minToDate!: Date | null;
  private subscriptions: Subscription[] = [];
  private destroy$ = new Subject<void>();
  clientCategoryList: any;
  loginDetails: any;
  ClientNames: any[]=[];

  constructor(
    @Inject(MAT_DIALOG_DATA) public dialogData: any,
    public dialogRef: MatDialogRef<EditAddSeasonAdvanceComponent>,
    private fb:FormBuilder,
    private saleService: StgApproveService,
    private helper: HelperService,
    private toastr: ToastrService,
    private autocompleteService: AutoCompleteService,
  ){}

  async ngOnInit() {
    this.loginDetails = this.helper.getItem('loginDetails');
    this.addEditSeasonAdvance = this.fb.group({
      AdvancedDate: [new Date(), Validators.required],
      ClientCategory: [''],
      ClientId: [''],
      Amount: [''],
    });
    await this.loadClientNames()
    this.GetClientCategory()
  }

  displayWithFn(value: string): string {
    return value || '';
  }

  async loadClientNames() {
    try {
      const bodyData: IGetTeaClient = {
        TenantId: this.loginDetails.TenantId,
        Category: ''

      };

      const res: any = await this.autocompleteService.GetClientNames(bodyData)
        .pipe(takeUntil(this.destroy$))
        .toPromise();

      this.ClientNames = res.ClientDetails;


    } catch (error) {
      console.error('Error:', error);
      this.toastr.error('Something went wrong.', 'ERROR');
    }
  }

  filterClientNames(value: string): any[] {

    const filterValue = value.toLowerCase();
    return this.ClientNames.filter((x: any) => x?.ClientName?.toLowerCase()?.includes(filterValue));
  }

  selectClient(client: any) {
    if (client == '') {
      this.addEditSeasonAdvance.controls['ClientId'].reset();
    }
    console.log(client.ClientId, 'Client');

    this.addEditSeasonAdvance.controls['ClientId'].setValue(client?.ClientId);
  }

  GetClientCategory() {

    const services = this.saleService.GetSaleType().subscribe((res: any) => {
      this.clientCategoryList = res.SaleTypes;
    });
    this.subscriptions.push(services);
  }
   onSubmit(){

   }

}
