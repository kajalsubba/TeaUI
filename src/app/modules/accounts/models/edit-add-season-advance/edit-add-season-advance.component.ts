import { Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { Subject, Subscription, catchError, takeUntil } from 'rxjs';
import { HelperService } from 'src/app/core/services/helper.service';
import { IGetTeaClient } from 'src/app/modules/collection/interfaces/istg';
import { AutoCompleteService } from 'src/app/modules/collection/services/auto-complete.service';
import { StgApproveService } from 'src/app/modules/collectionApprove/services/stg-approve.service';
import { IGetCategory } from 'src/app/modules/masters/interfaces/ICategory';
import { CategoryService } from 'src/app/modules/masters/services/category.service';
import { ISaveSeasonAdvance } from '../../interfaces/iseason-advance';
import { formatDate } from '@angular/common';
import { SeasonAdvanceService } from '../../services/season-advance.service';
import { MatOptionSelectionChange } from '@angular/material/core';

@Component({
  selector: 'app-edit-add-season-advance',
  templateUrl: './edit-add-season-advance.component.html',
  styleUrls: ['./edit-add-season-advance.component.scss']
})
export class EditAddSeasonAdvanceComponent implements OnInit {
  isSubmitting = false;
  addEditSeasonAdvance!: FormGroup;
  minToDate!: Date | null;
  @ViewChild('AdvancedDate') AdvancedDateInput!: ElementRef;
  private subscriptions: Subscription[] = [];
  private destroy$ = new Subject<void>();
  clientList: any;
  loginDetails: any;
  ClientNames: any[] = [];
  categoryList: any[] = [];
  constructor(
    @Inject(MAT_DIALOG_DATA) public dialogData: any,
    public dialogRef: MatDialogRef<EditAddSeasonAdvanceComponent>,
    private fb: FormBuilder,
    private categoryService: CategoryService,
    private helper: HelperService,
    private toastr: ToastrService,
    private autocompleteService: AutoCompleteService,
    private advaceService: SeasonAdvanceService
  ) { }

  async ngOnInit() {
    this.loginDetails = this.helper.getItem('loginDetails');
    this.addEditSeasonAdvance = this.fb.group({
      AdvancedDate: [new Date(), Validators.required],
      CategoryId: ['', Validators.required],
      CategoryName: [''],
      ClientName: ['', Validators.required],
      ClientId: [0],
      Amount: ['', Validators.required],
    });
    await this.loadClientNames()
    await this.getCategoryList()
  }

  displayWithFn(value: string): string {
    return value || '';
  }

  async loadClientNames() {
    try {
      const bodyData: IGetTeaClient = {
        TenantId: this.loginDetails.TenantId,
        //  Category: this.addEditSeasonAdvance.value.CategoryName
        Category: ''
      };

      const res: any = await this.autocompleteService.GetClientNames(bodyData)
        .pipe(takeUntil(this.destroy$))
        .toPromise();

      this.clientList = res.ClientDetails;


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
    console.log(client, 'client?.ClientId');

    this.addEditSeasonAdvance.controls['ClientId'].setValue(client?.ClientId);
  }


  async selectCategory(event: MatOptionSelectionChange, category: any) {
    if (event.source.selected) {
      this.addEditSeasonAdvance.controls['CategoryName'].setValue(category.CategoryName);
      var dataList = this.clientList.filter((x: any) => x.CategoryName.toLowerCase() == this.addEditSeasonAdvance.value.CategoryName.toLowerCase() || x.CategoryName.toLowerCase() == 'Both'.toLowerCase())
      this.ClientNames = dataList;
      console.log(dataList, 'this.clientList');

      // await this.loadClientNames();
    }

  }
  async getCategoryList() {
    try {
      const categoryBody: IGetCategory = {
        TenantId: this.loginDetails.TenantId
      };

      const res: any = await this.categoryService.getCategory(categoryBody)
        .pipe(takeUntil(this.destroy$))
        .toPromise();

      this.categoryList = res.CategoryDetails.filter((x: any) => x.CategoryName != 'Both');


    } catch (error) {
      console.error('Error:', error);
      this.toastr.error('Something went wrong.', 'ERROR');
    }
  }
  onSubmit() {
    if (this.addEditSeasonAdvance.invalid || this.addEditSeasonAdvance.value.ClientId == 0) {
      this.addEditSeasonAdvance.markAllAsTouched();
      return;
    }
    // if(this.dialogData.buttonName == "Save"){
    let data: ISaveSeasonAdvance = {
      SeasonAdvanceId: this.dialogData?.value?.SeasonAdvanceId ? this.dialogData?.value?.SeasonAdvanceId : 0,
      AdvancedDate: formatDate(this.addEditSeasonAdvance.value.AdvancedDate, 'yyyy-MM-dd', 'en-US'),
      ClientCategory: this.addEditSeasonAdvance.value.CategoryName,
      ClientId: this.addEditSeasonAdvance.value.ClientId,
      Amount: this.addEditSeasonAdvance.value.Amount,
      TenantId: this.loginDetails.TenantId,
      CreatedBy: this.loginDetails.UserId

    }
    this.isSubmitting = true;
       this.SaveData(data);
  }

  SaveData(clientBody: ISaveSeasonAdvance) {
    this.advaceService.SaveSeasonAdvance(clientBody)
      .pipe(
        takeUntil(this.destroy$),
        catchError(error => {
          console.error('Error:', error);
          this.isSubmitting = false;
          this.toastr.error('An error occurred', 'ERROR');
          throw error;
        })
      )
      .subscribe((res: any) => {
        //console.log(res);
        if (res.Id == 0) {
          this.toastr.warning(res.Message, 'Warning');
        }
        else {
          this.toastr.success(res.Message, 'SUCCESS');
        }
        if (this.dialogData.buttonName == "Update") {
          this.dialogRef.close(true);
        }

        this.CleanFormControl();
        this.AdvancedDateInput.nativeElement.focus();

        this.isSubmitting = false;
      });
  }

  CleanFormControl() {

    this.addEditSeasonAdvance.controls['ClientName'].reset()
    this.addEditSeasonAdvance.controls['ClientId'].reset()
  //  this.addEditSeasonAdvance.controls['CategoryId'].reset()
    this.addEditSeasonAdvance.controls['Amount'].reset()

  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sub) => {
      sub.unsubscribe();
    })
    this.dialogRef.close(true);
  }
}
