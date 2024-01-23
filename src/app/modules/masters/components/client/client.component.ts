import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Subscription } from 'rxjs';
import { ClientService } from '../../services/client.service';
import { MatDialog } from '@angular/material/dialog';
import { HelperService } from 'src/app/core/services/helper.service';
import { IGetClient } from '../../interfaces/IClient';
import { AddEditClientComponent } from '../../models/add-edit-client/add-edit-client.component';

@Component({
  selector: 'app-client',
  templateUrl: './client.component.html',
  styleUrls: ['./client.component.scss']
})
export class ClientComponent implements OnInit, AfterViewInit {
  private subscriptions: Subscription[] = [];

  displayedColumns: string[] = ['ClientId', 'ClientFirstName', 'ClientLastName', 'ClientAddress','CategoryName', 'ContactNo','EmailId','actions'];
  dataSource = new MatTableDataSource<any>();
  columns: { columnDef: string, header: string }[] = [
    { columnDef: 'ClientId', header: 'Client ID' },
    { columnDef: 'ClientFirstName', header: 'First Name' },
   // { columnDef: 'ClientMiddleName', header: 'Middle Name' },
    { columnDef: 'ClientLastName', header: 'Last Name' },
    { columnDef: 'ClientAddress', header: 'Client Address' },
   // { columnDef: 'CategoryID', header: 'CategoryID' },
    { columnDef: 'CategoryName', header: 'Category' },
    { columnDef: 'ContactNo', header: 'Contact No.' },
    { columnDef: 'EmailId', header: 'Email ID' }
  ];


  loginDetails: any;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private clientService:ClientService,
    private dialog:MatDialog,
    private helper:HelperService
  ){}

  ngAfterViewInit() {
//    console.log(this.loginDetails);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }
  
  ngOnInit(): void {
      this.loginDetails = this.helper.getItem('loginDetails');
      this.getClientList();
  }

  ngOnDestroy(): void {
      this.subscriptions.forEach((sub)=>{
        sub.unsubscribe();
      })
  }

  getClientList(){
    let bodyData:IGetClient = {
      TenantId:this.loginDetails.TenantId
    }
    const clientListService = this.clientService.getClient(bodyData).subscribe((res:any)=>{
     // console.log(res);
      this.dataSource.data = res.ClientDetails;
    });
    this.subscriptions.push(clientListService);
  }

  addClient(){
    const dialogRef = this.dialog.open(AddEditClientComponent, {
      width: "70%",
      data:{
        title:"Add Client",
        buttonName:"Save"
      },
      disableClose:true
    });

    dialogRef.afterClosed().subscribe((result:any)=>{
      if(result){
        this.getClientList();
      }
    })
  }

  editItem(element: any): void {
    const dialogRef = this.dialog.open(AddEditClientComponent, {
      width: "70%",
      data:{
        title:"Update Client",
        buttonName:"Update",
        value:element
      },
      disableClose:true
    });

    dialogRef.afterClosed().subscribe((result:any)=>{
      if(result){
        this.getClientList();
      }
    })
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

}
