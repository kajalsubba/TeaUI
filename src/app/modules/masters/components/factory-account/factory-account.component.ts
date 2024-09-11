import {
  AfterViewInit,
  Component,
  HostListener,
  OnInit,
  ViewChild,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Subscription } from 'rxjs';
import { HelperService } from 'src/app/core/services/helper.service';
import { IGetFactoryAccount } from '../../interfaces/IFactoryAccount';
import { FactoryAccountService } from '../../services/factory-account.service';
import { AddEditFactoryAccountComponent } from '../../models/add-edit-factory-account/add-edit-factory-account.component';

@Component({
  selector: 'app-factory-account',
  templateUrl: './factory-account.component.html',
  styleUrls: ['./factory-account.component.scss'],
})
export class FactoryAccountComponent implements OnInit, AfterViewInit {
  displayedColumns: string[] = [
    'AccountId',
    'AccountName',
    'FactoryName',
    'BioMatrixNo',
    'actions',
  ];
  dataSource = new MatTableDataSource<any>();
  columns: { columnDef: string; header: string }[] = [
    { columnDef: 'AccountId', header: 'Account Id' },
    { columnDef: 'AccountName', header: 'Account Name' },
    { columnDef: 'BioMatrixNo', header: 'Bio Matric No' },
    { columnDef: 'FactoryName', header: 'Factory Name' },
  ];

  private subscriptions: Subscription[] = [];
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  loginDetails: any;
  selectedRowIndex: number = -1;

  constructor(
    private accountService: FactoryAccountService,
    private dialog: MatDialog,
    private helper: HelperService
  ) {}
  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  ngOnInit(): void {
    this.loginDetails = this.helper.getItem('loginDetails');
    this.GetFactoryAccountList();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sub) => {
      sub.unsubscribe();
    });
  }

  GetFactoryAccountList() {
    let bodyData: IGetFactoryAccount = {
      TenantId: this.loginDetails.TenantId,
    };
    const dataService = this.accountService
      .GetFactoryAccount(bodyData)
      .subscribe((res: any) => {
        console.log(res);
        this.dataSource.data = res.AccountDetails;
      });
    this.subscriptions.push(dataService);
  }
  addAccount() {
    const dialogRef = this.dialog.open(AddEditFactoryAccountComponent, {
      width: '60%',
      data: {
        title: 'Add Factory Account',
        buttonName: 'Save',
      },
      disableClose: true,
    });
    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        this.GetFactoryAccountList();
      }
    });
  }

  editItem(element: any) {
    const dialogRef = this.dialog.open(AddEditFactoryAccountComponent, {
      width: '60%',
      data: {
        title: 'Update Factory Account',
        buttonName: 'Update',
        value: element,
      },
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        this.GetFactoryAccountList();
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

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

}
