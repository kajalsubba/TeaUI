import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ToastrService } from 'ngx-toastr';
import { Subject, Subscription, takeUntil } from 'rxjs';
import { HelperService } from 'src/app/core/services/helper.service';
import { TenantServiceService } from '../services/tenant-service.service';
import { AddEditTenantComponent } from '../model/add-edit-tenant/add-edit-tenant.component';

@Component({
  selector: 'app-tenant',
  templateUrl: './tenant.component.html',
  styleUrls: ['./tenant.component.scss']
})
export class TenantComponent implements OnInit {
  displayedColumns: string[] = [
    'TenantName',
    'TenantEmail',
    'TenantContactNo',
    'IsActive',
    'actions',
  ];
  dataSource = new MatTableDataSource<any>();
  columns: { columnDef: string; header: string }[] = [
    { columnDef: 'TenantName', header: 'User Name' },
    { columnDef: 'TenantEmail', header: 'Login Name' },
    { columnDef: 'TenantContactNo', header: 'Email' },
    { columnDef: 'IsActive', header: 'Contact No' },
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
    private tenantService: TenantServiceService
  ) {}

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

 async ngOnInit() {
    this.loginDetails = this.helper.getItem('loginDetails');
   
    await this.GetTenant();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sub) => {
      sub.unsubscribe();
    });
  }

 async GetTenant() {
  
      try {

  
        const res: any = await this.tenantService
          .GetTeanat()
          .pipe(takeUntil(this.destroy$))
          .toPromise();
  
        this.dataSource.data = res.TenantDetails;
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

  addTenant() {
    const dialogRef = this.dialog.open(AddEditTenantComponent, {
      width: '60%',
      data: {
        title: 'Add User',
        buttonName: 'Save',
      },
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        this.GetTenant();
      }
    });
  }

  editItem(e: any) {
    const dialogRef = this.dialog.open(AddEditTenantComponent, {
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
        this.GetTenant();
      }
    });
  }

  deleteItem(row: any) {}
}
