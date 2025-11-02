import { AfterViewInit, Component, HostListener, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ToastrService } from 'ngx-toastr';
import { Subject, Subscription, takeUntil } from 'rxjs';
import { HelperService } from 'src/app/core/services/helper.service';
import { IGetCategory } from '../../interfaces/ICategory';
import { CategoryService } from '../../services/category.service';
import { AddEditFinancialYearComponent } from '../../models/add-edit-financial-year/add-edit-financial-year.component';

@Component({
  selector: 'app-financial-year',
  templateUrl: './financial-year.component.html',
  styleUrls: ['./financial-year.component.scss']
})
export class FinancialYearComponent implements OnInit, AfterViewInit, OnDestroy {
  displayedColumns: string[] = ['FinancialYear', 'YearStatus'];
  dataSource = new MatTableDataSource<any>();
  columns: { columnDef: string; header: string }[] = [
    { columnDef: 'FinancialYear', header: 'Financial Year' },
    { columnDef: 'YearStatus', header: 'Status' },
  ];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  financialyearList: any = [];

  private destroy$ = new Subject<void>(); loginDetails: any;
  selectedRowIndex: number = -1;

  constructor(
    private categoryService: CategoryService,
    private dialog: MatDialog,
    private toastr: ToastrService,
    private helper: HelperService
  ) { }

  ngAfterViewInit() {
    console.log(this.loginDetails);

    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  async ngOnInit() {
    this.loginDetails = this.helper.getItem('loginDetails');
    await this.getFinancialYear();
  }

  ngOnDestroy(): void {

  }

  async getFinancialYear() {
    try {
      const categoryBody: IGetCategory = {
        TenantId: this.loginDetails.TenantId
      };

      const res: any = await this.categoryService.getFinancialYear(categoryBody)
        .pipe(takeUntil(this.destroy$))
        .toPromise()
      this.dataSource = res.FinancialYear;


    } catch (error) {
      console.error('Error:', error);
      this.toastr.error('Something went wrong.', 'ERROR');
    }
  }
  addFinancialYear() {
      const dialogRef = this.dialog.open(AddEditFinancialYearComponent, {
        width: '30%',
        data: {
          title: 'Add Financial Year',
          buttonName: 'Save',
        },
        disableClose: true,
      });

      dialogRef.afterClosed().subscribe((result: any) => {
        if (result) {
          this.getFinancialYear();
        }
      });
  }

  // editItem(element: any): void {
  //   const dialogRef = this.dialog.open(AddEditCategoryComponent, {
  //     width: '30%',
  //     data: {
  //       title: 'Update Category',
  //       buttonName: 'Update',
  //       value: element,
  //     },
  //     disableClose: true,
  //   });

  //   dialogRef.afterClosed().subscribe((result: any) => {
  //     if (result) {
  //       this.getCategoryList();
  //     }
  //   });
  // }

  // deleteItem(element: any): void {
  //   const dialogRef = this.dialog.open(ConfirmDialogComponent, {
  //     width: '30%',
  //     data: {
  //       title: 'Confirmation',
  //       message: 'Are you sure you want to delete this record?',
  //     },
  //   });

  //   dialogRef.afterClosed().subscribe((result) => {
  //     if (result) {
  //       let bodyData: IDeleteCategory = {
  //         CategoryId: element.CategoryId,
  //       };
  //       const categoryListService = this.categoryService
  //         .deleteCategory(bodyData)
  //         .subscribe((res: any) => {
  //           this.toastr.success(res.Message, 'SUCCESS');
  //           this.getCategoryList();
  //         });
  //       this.subscriptions.push(categoryListService);
  //     }
  //   });
  // }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  selectRow(row: any, index: number) {
    this.selectedRowIndex = index; // Set the selected row index
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
