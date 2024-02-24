import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { HelperService } from 'src/app/core/services/helper.service';
import { AddEditUserComponent } from '../../models/add-edit-user/add-edit-user.component';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.scss'],
})
export class UserComponent implements OnInit {
  displayedColumns: string[] = [
    'UserFirstName',
    'UserMiddleName',
    'UserLastName',
    'UserEmail',
    'ContactNo',
    'LoginUserName',
    'UserRole',
    'status',
    'actions',
  ];
  dataSource = new MatTableDataSource<any>();
  columns: { columnDef: string; header: string }[] = [
    { columnDef: 'UserFirstName', header: 'User First Name' },
    { columnDef: 'UserMiddleName', header: 'User Middle Name' },
    { columnDef: 'UserLastName', header: 'User Last Name' },
    { columnDef: 'UserEmail', header: 'User Email' },
    { columnDef: 'ContactNo', header: 'Contact No' },
    { columnDef: 'LoginUserName', header: 'Login User Name' },
    { columnDef: 'UserRole', header: 'User Role' },
    { columnDef: 'status', header: 'Status' },
  ];

  dummyData: any[] = [
    {
      UserFirstName: 'Dummy UserFirstName',
      UserMiddleName: 'Dummy UserMiddleName',
      UserLastName: 'Dummy UserLastName',
      UserEmail: 'Dummy UserEmail',
      ContactNo: 'Dummy ContactNo',
      LoginUserName: 'Dummy LoginUserName',
      UserRole: 'Dummy Role Name', // Fallback to "Dummy Role Name" from the columns array
      status: 'Dummy status',
      actions: 'Dummy actions',
    },
  ];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  private subscriptions: Subscription[] = [];
  loginDetails: any;

  constructor(
    private dialog: MatDialog,
    private toastr: ToastrService,
    private helper: HelperService
  ) {}

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  ngOnInit(): void {
    this.loginDetails = this.helper.getItem('loginDetails');
    this.GetUserList();
    this.dataSource.data = this.dummyData;
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sub) => {
      sub.unsubscribe();
    });
  }

  GetUserList() {}

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  addUser() {
    const dialogRef = this.dialog.open(AddEditUserComponent, {
      width: '60%',
      data: {
        title: 'Add User',
        buttonName: 'Save',
      },
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        this.GetUserList();
      }
    });
  }

  editItem(e: any) {
    const dialogRef = this.dialog.open(AddEditUserComponent, {
      width: '60%',
      data: {
        title: 'Edit User',
        buttonName: 'Update',
        value: e,
      },
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        this.GetUserList();
      }
    });
  }

  deleteItem(row: any) {}
}
