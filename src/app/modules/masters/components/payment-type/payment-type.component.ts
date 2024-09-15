import { AfterViewInit, Component, HostListener, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Subscription } from 'rxjs';
import { PaymenttypeService } from '../../services/paymenttype.service';
import { MatDialog } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { HelperService } from 'src/app/core/services/helper.service';
import { IGetPaymentType } from '../../interfaces/ipayment-type';
import { AddEditPaymentTypeComponent } from '../../models/add-edit-payment-type/add-edit-payment-type.component';

@Component({
  selector: 'app-payment-type',
  templateUrl: './payment-type.component.html',
  styleUrls: ['./payment-type.component.scss']
})
export class PaymentTypeComponent  implements OnInit, AfterViewInit, OnDestroy {

  displayedColumns: string[] = ['PaymentTypeId', 'PaymentType', 'actions'];
  dataSource = new MatTableDataSource<any>();
  columns: { columnDef: string; header: string }[] = [
    { columnDef: 'PaymentTypeId', header: ' ID' },
    { columnDef: 'PaymentType', header: 'Payment Type' },
  ];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  private subscriptions: Subscription[] = [];
  loginDetails: any;
  selectedRowIndex: number = -1;

  constructor(
    private paymentTypeService: PaymenttypeService,
    private dialog: MatDialog,
    private toastr: ToastrService,
    private helper: HelperService
  ) {}


  ngAfterViewInit() {
    console.log(this.loginDetails);

    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  ngOnInit(): void {
    this.loginDetails = this.helper.getItem('loginDetails');
    this.GetPaymentType();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sub) => {
      sub.unsubscribe();
    });
  }

  GetPaymentType() {
    let bodyData: IGetPaymentType = {
      TenantId: this.loginDetails.TenantId,
    };
    const categoryListService = this.paymentTypeService
      .GetPaymentType(bodyData)
      .subscribe((res: any) => {
    
        this.dataSource.data = res.PaymentTypeDetails;
      });
    this.subscriptions.push(categoryListService);
  }

  editItem(element:any)
  {
    const dialogRef = this.dialog.open(AddEditPaymentTypeComponent, {
      width: '30%',
      data: {
        title: 'Update Payment Type',
        buttonName: 'Update',
        value: element,
      },
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        this.GetPaymentType();
      }
    });
  }

  selectRow(row: any, index: number) {
    this.selectedRowIndex = index; // Set the selected row index
  }
  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  addPaymentType()
  {
    const dialogRef = this.dialog.open(AddEditPaymentTypeComponent, {
      width: '30%',
      data: {
        title: 'Add Payment Type',
        buttonName: 'Save',
      },
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        this.GetPaymentType();
      }
    });
  }

  @HostListener('document:keydown', ['$event'])
  handleKeyboardNavigation(event: KeyboardEvent) {
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
