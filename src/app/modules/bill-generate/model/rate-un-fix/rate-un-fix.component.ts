import { Component, HostListener, Inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Subject, Subscription } from 'rxjs';
import { HelperService } from 'src/app/core/services/helper.service';

@Component({
  selector: 'app-rate-un-fix',
  templateUrl: './rate-un-fix.component.html',
  styleUrls: ['./rate-un-fix.component.scss']
})
export class RateUnFixComponent implements OnInit {
  RateUnFixBillForm!: FormGroup;
  IsApprove: boolean = false;
  AccountList: any = [];
  FactoryList: any = [];
  AddLateralStgData: any = [];
  filteredFactory: any = [];
  filteredAccounts: any = [];
  vehicleNumbers: any[] = [];
  ClientList: any = [];
  private destroy$ = new Subject<void>();
  loginDetails: any;
  private subscriptions: Subscription[] = [];
  selectedRowIndex: number = -1;
  clientId: any;
  displayedColumns: string[] = [
    'CollectionDate',
    'FactoryName',
    'VehicleNo',
    'FineLeaf',
    'ChallanWeight',
    'Rate',
    'GrossAmount'

  ];

  dataSource = new MatTableDataSource<any>();
  filteredData: any[] = [];
  columns: { columnDef: string; header: string }[] = [

    { columnDef: 'FactoryName', header: 'Factory Name' },
    { columnDef: 'VehicleNo', header: 'Vehicle No ' },

  ];
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    public dialogRef: MatDialogRef<RateUnFixComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder,
    private helper: HelperService,
    private router: Router,

    private dialog: MatDialog
  ) { }

  async ngOnInit() {
    this.loginDetails = this.helper.getItem('loginDetails');

    this.dataSource.data = this.data.unfixData;
    this.RateUnFixBillForm = this.fb.group({

    });
    if (this.data.isEdit) {
      this.clientId = this.data.clientId;

    }
  }

  redirectToRateFixPage(minDate: any, maxDate: any, moduleId: any,displayName:any) {
    if (this.data.Category == 'Supplier') {
      this.router.navigate([`home/rate-fix/supplier-rate-fix`], {
        queryParams: { minDate, maxDate, moduleId ,displayName}
      });

    }

    this.dialogRef.close(true);
  }



  getTotal(columnName: string): number {
    if (!this.dataSource.filteredData || this.dataSource.filteredData.length === 0) {
      return 0;
    }

    const columnValues: number[] = this.dataSource.filteredData
      .map(item => Number(item[columnName]))
      .filter(value => !isNaN(value));

    return columnValues.reduce((acc, curr) => acc + curr, 0);
  }

  selectRow(row: any, index: number) {
    this.selectedRowIndex = index; // Set the selected row index
  }

  @HostListener('document:keydown', ['$event'])
  handleKeyboardNavigation(event: KeyboardEvent) {
    event.stopPropagation();
    if (event.key === 'ArrowDown') {
      if (this.selectedRowIndex < this.dataSource.data.length - 1) {
        this.selectedRowIndex++;
      }
    } else if (event.key === 'ArrowUp') {
      if (this.selectedRowIndex > 0) {
        this.selectedRowIndex--;
      }
    }
  }


}