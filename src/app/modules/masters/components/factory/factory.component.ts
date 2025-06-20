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
import { HelperService } from 'src/app/core/services/helper.service';
import { FactoryService } from '../../services/factory.service';
import { Subscription } from 'rxjs';
import { IGetFactory } from '../../interfaces/IFactory';
import { AddEditFactoryComponent } from '../../models/add-edit-factory/add-edit-factory.component';

@Component({
  selector: 'app-factory',
  templateUrl: './factory.component.html',
  styleUrls: ['./factory.component.scss'],
})
export class FactoryComponent implements OnInit, AfterViewInit {
  displayedColumns: string[] = [
    'FactoryId',
    'FactoryName',
    'FactoryAddress',
    'ContactNo',
    'EmailId',
    'ClientView',
    'actions',
  ];
  dataSource = new MatTableDataSource<any>();
  columns: { columnDef: string; header: string }[] = [
    { columnDef: 'FactoryId', header: 'FactoryId' },
    { columnDef: 'FactoryName', header: 'Factory Name' },
    { columnDef: 'FactoryAddress', header: 'Address' },
    { columnDef: 'ContactNo', header: 'Contact No' },
    { columnDef: 'EmailId', header: 'Email' },
    { columnDef: 'ClientView', header: 'Client View' },
  ];

  loginDetails: any;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  private subscriptions: Subscription[] = [];
  selectedRowIndex: number = -1;
  /**
   *
   */
  constructor(
    private factoryService: FactoryService,
    private dialog: MatDialog,
    private helper: HelperService
  ) {}

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  ngOnInit(): void {
    this.loginDetails = this.helper.getItem('loginDetails');
    this.GetFactoryList();
  }
  GetFactoryList() {
    let bodyData: IGetFactory = {
      TenantId: this.loginDetails.TenantId,
      IsClientView: false,
    };
    const GetService = this.factoryService
      .GetFactory(bodyData)
      .subscribe((res: any) => {
     
        this.dataSource.data = res.FactoryDetails;
      });
    this.subscriptions.push(GetService);
  }
  editItem(element: any) {
    const dialogRef = this.dialog.open(AddEditFactoryComponent, {
      width: '30%',
      data: {
        title: 'Update Factory',
        buttonName: 'Update',
        value: element,
      },
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        this.GetFactoryList();
      }
    });
  }
  addFactory() {
    const dialogRef = this.dialog.open(AddEditFactoryComponent, {
      width: '30%',
      data: {
        title: 'Add Factory',
        buttonName: 'Save',
      },
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        this.GetFactoryList();
      }
    });
  }
  ngOnDestroy(): void {
    this.subscriptions.forEach((sub) => {
      sub.unsubscribe();
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
