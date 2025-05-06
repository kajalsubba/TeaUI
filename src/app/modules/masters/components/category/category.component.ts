import {
  AfterViewInit,
  Component,
  HostListener,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { CategoryService } from '../../services/category.service';
import { IDeleteCategory, IGetCategory } from '../../interfaces/ICategory';
import { MatDialog } from '@angular/material/dialog';
import { AddEditCategoryComponent } from '../../models/add-edit-category/add-edit-category.component';
import { Subscription } from 'rxjs';
import { HelperService } from 'src/app/core/services/helper.service';
import { ConfirmDialogComponent } from 'src/app/shared/components/confirm-dialog/confirm-dialog.component';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-category',
  templateUrl: './category.component.html',
  styleUrls: ['./category.component.scss'],
})
export class CategoryComponent implements OnInit, AfterViewInit, OnDestroy {
  displayedColumns: string[] = ['CategoryId', 'CategoryName'];
  dataSource = new MatTableDataSource<any>();
  columns: { columnDef: string; header: string }[] = [
    { columnDef: 'CategoryId', header: 'Category ID' },
    { columnDef: 'CategoryName', header: 'Category Name' },
  ];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  private subscriptions: Subscription[] = [];
  loginDetails: any;
  selectedRowIndex: number = -1;

  constructor(
    private categoryService: CategoryService,
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
    this.getCategoryList();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sub) => {
      sub.unsubscribe();
    });
  }

  getCategoryList() {
    let bodyData: IGetCategory = {
      TenantId: this.loginDetails.TenantId,
    };
    const categoryListService = this.categoryService
      .getCategory(bodyData)
      .subscribe((res: any) => {
 
        this.dataSource.data = res.CategoryDetails;
      });
    this.subscriptions.push(categoryListService);
  }

  addCategory() {
    const dialogRef = this.dialog.open(AddEditCategoryComponent, {
      width: '30%',
      data: {
        title: 'Add Category',
        buttonName: 'Save',
      },
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        this.getCategoryList();
      }
    });
  }

  editItem(element: any): void {
    const dialogRef = this.dialog.open(AddEditCategoryComponent, {
      width: '30%',
      data: {
        title: 'Update Category',
        buttonName: 'Update',
        value: element,
      },
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        this.getCategoryList();
      }
    });
  }

  deleteItem(element: any): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '30%',
      data: {
        title: 'Confirmation',
        message: 'Are you sure you want to delete this record?',
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        let bodyData: IDeleteCategory = {
          CategoryId: element.CategoryId,
        };
        const categoryListService = this.categoryService
          .deleteCategory(bodyData)
          .subscribe((res: any) => {
            this.toastr.success(res.Message, 'SUCCESS');
            this.getCategoryList();
          });
        this.subscriptions.push(categoryListService);
      }
    });
  }

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
