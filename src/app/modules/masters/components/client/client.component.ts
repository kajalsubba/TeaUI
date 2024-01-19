import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { AddEditClientComponent } from '../../models/add-edit-client/add-edit-client.component';
import { MatDialog } from '@angular/material/dialog';
import { HelperService } from 'src/app/core/services/helper.service';
import { IgetClient } from '../../interfaces/iget-client';
import { ClientService } from '../../services/client.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-client',
  templateUrl: './client.component.html',
  styleUrls: ['./client.component.scss']
})
export class ClientComponent implements OnInit, AfterViewInit {
  private subscriptions: Subscription[] = [];

  displayedColumns: string[] = ['ClientId', 'ClientFirstName', 'ClientLastName','ContactNo','EmailId','CategoryName','actions'];
  dataSource = new MatTableDataSource<any>();
  columns: { columnDef: string, header: string }[] = [
    { columnDef: 'ClientId', header: 'Client ID' },
    { columnDef: 'ClientFirstName', header: 'First Name' },
    { columnDef: 'ClientLastName', header: 'Last Name' },
    { columnDef: 'ContactNo', header: 'Contact No' },
    { columnDef: 'EmailId', header: 'Email' },
    { columnDef: 'CategoryName', header: 'Category' },
  ];


  loginDetails: any;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  constructor(
    private dialog:MatDialog,
    private helper:HelperService,
    private clientService:ClientService
  ){}

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  ngOnInit(): void {
    this.loginDetails = this.helper.getItem('loginDetails');
    this.GetClientList();
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
        this.GetClientList();
      }
    })
  }


  GetClientList(){
    let bodyData:IgetClient = {
      TenantId:this.loginDetails.TenantId
    }
    const categoryListService = this.clientService.GetClientList(bodyData).subscribe((res:any)=>{
      console.log(res);
      this.dataSource.data = res.ClientDetails;
    });
    this.subscriptions.push(categoryListService);
  }

  editItem(e:any)
  {

  }
  ngOnDestroy(): void {
    this.subscriptions.forEach((sub)=>{
      sub.unsubscribe();
    })
}

}



