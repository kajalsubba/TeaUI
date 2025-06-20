import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ToastrService } from 'ngx-toastr';
import { Subject, Subscription, takeUntil } from 'rxjs';
import { HelperService } from 'src/app/core/services/helper.service';
import { AddEditUserComponent } from '../../models/add-edit-user/add-edit-user.component';
import { UserService } from '../../services/user.service';
import { IGetUser } from '../../interfaces/iuser';
import { UserPasswordChangeComponent } from '../../models/user-password-change/user-password-change.component';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.scss'],
})
export class UserComponent implements OnInit {
  displayedColumns: string[] = [
    'FullName',
    'LoginUserName',
    'UserEmail',
    'ContactNo',
    'RoleName',
    'status',
    'actions',
  ];
  dataSource = new MatTableDataSource<any>();
  columns: { columnDef: string; header: string }[] = [
    { columnDef: 'FullName', header: 'User Name' },
    { columnDef: 'LoginUserName', header: 'Login Name' },
    { columnDef: 'UserEmail', header: 'Email' },
    { columnDef: 'ContactNo', header: 'Contact No' },
     { columnDef: 'RoleName', header: 'User Role' },
    { columnDef: 'status', header: 'Status' },
  ];


  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  private subscriptions: Subscription[] = [];
  loginDetails: any;
  private destroy$ = new Subject<void>();

  constructor(
    private dialog: MatDialog,
    private toastr: ToastrService,
    private helper: HelperService,
    private userService: UserService
  ) {}

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

 async ngOnInit() {
    this.loginDetails = this.helper.getItem('loginDetails');
   
    await this.GetUserList();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sub) => {
      sub.unsubscribe();
    });
  }

 async GetUserList() {
  
      try {
        const categoryBody: IGetUser = {
          TenantId: this.loginDetails.TenantId,
        };
  
        const res: any = await this.userService
          .GetUser(categoryBody)
          .pipe(takeUntil(this.destroy$))
          .toPromise();
  
        this.dataSource.data = res.UserDetails;
      } catch (error) {
        console.error('Error:', error);
        this.toastr.error('Something went wrong.', 'ERROR');
      }
    

  }

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

  updatePassword(element:any):void
  {
    const dialogRef = this.dialog.open(UserPasswordChangeComponent, {
      width: '40%',
      data: {
        title: 'Change Password',
        buttonName: 'Change',
        value: element,
      },
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
      //  this.getClientList();
      }
    });
  }
}
