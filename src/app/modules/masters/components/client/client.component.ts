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
import { Subject, Subscription, takeUntil } from 'rxjs';
import { ClientService } from '../../services/client.service';
import { MatDialog } from '@angular/material/dialog';
import { HelperService } from 'src/app/core/services/helper.service';
import { IGetClient } from '../../interfaces/IClient';
import { AddEditClientComponent } from '../../models/add-edit-client/add-edit-client.component';
import { CategoryService } from '../../services/category.service';
import { IGetCategory } from '../../interfaces/ICategory';
import { ToastrService } from 'ngx-toastr';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ClientPasswordChangeComponent } from '../../models/client-password-change/client-password-change.component';

@Component({
  selector: 'app-client',
  templateUrl: './client.component.html',
  styleUrls: ['./client.component.scss'],
})
export class ClientComponent implements OnInit, AfterViewInit {
  private subscriptions: Subscription[] = [];
  categoryList: any;
  private destroy$ = new Subject<void>();
  displayedColumns: string[] = [
    'ClientId',
    'ClientFirstName',
    'ClientLastName',
    'ClientAddress',
    'CategoryName',
    'ContactNo',
    'WhatsAppNo',
    'BioMatrixNo',
    'EmailId',
    'LoginStatus',
    'actions',
  ];
  dataSource = new MatTableDataSource<any>();
  columns: { columnDef: string; header: string }[] = [
    { columnDef: 'ClientId', header: 'Client ID' },
    { columnDef: 'ClientFirstName', header: 'First Name' },
    // { columnDef: 'ClientMiddleName', header: 'Middle Name' },
    { columnDef: 'ClientLastName', header: 'Last Name' },
    { columnDef: 'ClientAddress', header: 'Client Address' },
    { columnDef: 'CategoryName', header: 'Category' },
    { columnDef: 'ContactNo', header: 'Contact No.' },
    { columnDef: 'WhatsAppNo', header: 'WhatsApp No' },
    { columnDef: 'BioMatrixNo', header: 'Bio-Matric No' },
    { columnDef: 'EmailId', header: 'Email ID' },
    { columnDef: 'LoginStatus', header: 'Client Login' },
  ];

  ClientForm!: FormGroup;
  loginDetails: any;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  selectedRowIndex: number = -1;

  constructor(
    private clientService: ClientService,
    private dialog: MatDialog,
    private helper: HelperService,
    private categoryService: CategoryService,
    private toastr: ToastrService,
    private fb: FormBuilder,

  ) { }

  ngAfterViewInit() {
    //    console.log(this.loginDetails);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  async ngOnInit() {
    this.loginDetails = this.helper.getItem('loginDetails');
    this.ClientForm = this.fb.group({
      CategoryId: [''],
    })
    this.getClientList('');
    await this.getCategoryList();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sub) => {
      sub.unsubscribe();
    });
  }

  getClientList(category?: any) {
    let bodyData: IGetClient = {
      TenantId: this.loginDetails.TenantId,
      Category: category
    };
    const clientListService = this.clientService
      .getClient(bodyData)
      .subscribe((res: any) => {
        // console.log(res);
        this.dataSource.data = res.ClientDetails;
      });
    this.subscriptions.push(clientListService);
  }
  ClientSearch() {
    this.getClientList(this.ClientForm.value.CategoryId);
  }
  addClient() {
    const dialogRef = this.dialog.open(AddEditClientComponent, {
      width: '70%',
      data: {
        title: 'Add Client',
        buttonName: 'Save',
      },
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        this.getClientList();
      }
    });
  }
  async getCategoryList() {
    try {
      const categoryBody: IGetCategory = {
        TenantId: this.loginDetails.TenantId,
      };

      const res: any = await this.categoryService
        .getCategory(categoryBody)
        .pipe(takeUntil(this.destroy$))
        .toPromise();

      this.categoryList = res.CategoryDetails;
    } catch (error) {
      console.error('Error:', error);
      this.toastr.error('Something went wrong.', 'ERROR');
    }
  }
  updatePassword(element:any):void
  {
    const dialogRef = this.dialog.open(ClientPasswordChangeComponent, {
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
        this.getClientList();
      }
    });
  }
  editItem(element: any): void {
    const dialogRef = this.dialog.open(AddEditClientComponent, {
      width: '70%',
      data: {
        title: 'Update Client',
        buttonName: 'Update',
        value: element,
      },
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        this.getClientList();
      }
    });
  }

  deleteItem(element: any): void {
    // Implement the logic to handle delete action
    console.log('Delete clicked for:', element);
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
