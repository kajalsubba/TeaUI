import {
  AfterViewInit,
  Component,
  HostListener,
  OnInit,
  ViewChild,
} from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { AddEditGradeComponent } from '../../models/add-edit-grade/add-edit-grade.component';
import { MatDialog } from '@angular/material/dialog';
import { HelperService } from 'src/app/core/services/helper.service';
import { IDeleteGrade, IGetGrade } from '../../interfaces/IGrade';
import { GradeService } from '../../services/grade.service';
import { Subscription } from 'rxjs';

import { ConfirmDialogComponent } from 'src/app/shared/components/confirm-dialog/confirm-dialog.component';
import { ToastrService } from 'ngx-toastr';
@Component({
  selector: 'app-grade',
  templateUrl: './grade.component.html',
  styleUrls: ['./grade.component.scss'],
})
export class GradeComponent implements OnInit, AfterViewInit {
  displayedColumns: string[] = ['GradeId', 'GradeName', 'actions'];
  dataSource = new MatTableDataSource<any>();
  columns: { columnDef: string; header: string }[] = [
    { columnDef: 'GradeId', header: 'GradeId ' },
    { columnDef: 'GradeName', header: 'Grade Name' },
  ];
  loginDetails: any;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  selectedRowIndex: number = -1;
  private subscriptions: Subscription[] = [];
  /**
   *
   */
  constructor(
    private dialog: MatDialog,
    private helper: HelperService,
    private gradeService: GradeService,
    private toastr: ToastrService
  ) {}

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  ngOnInit(): void {
    this.loginDetails = this.helper.getItem('loginDetails');
    this.GetGradeList();
  }

  GetGradeList() {
    let bodyData: IGetGrade = {
      TenantId: this.loginDetails.TenantId,
    };
    const gradeListService = this.gradeService
      .GetGrade(bodyData)
      .subscribe((res: any) => {
        console.log(res);
        this.dataSource.data = res.GradeDetails;
      });
    this.subscriptions.push(gradeListService);
  }

  addGrade() {
    const dialogRef = this.dialog.open(AddEditGradeComponent, {
      width: '30%',
      data: {
        title: 'Add Grade',
        buttonName: 'Save',
      },
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        this.GetGradeList();
      }
    });
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sub) => {
      sub.unsubscribe();
    });
  }

  editItem(element: any) {
    const dialogRef = this.dialog.open(AddEditGradeComponent, {
      width: '30%',
      data: {
        title: 'Update Grade',
        buttonName: 'Update',
        value: element,
      },
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        this.GetGradeList();
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
        let bodyData: IDeleteGrade = {
          GradeId: element.GradeId,
        };
        const categoryListService = this.gradeService
          .DeleteGrade(bodyData)
          .subscribe((res: any) => {
            this.toastr.success(res.Message, 'SUCCESS');
            this.GetGradeList();
          });
        this.subscriptions.push(categoryListService);
      }
    });
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
