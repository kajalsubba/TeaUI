import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { HelperService } from 'src/app/core/services/helper.service';
import { IGetRole } from '../../interfaces/irole';
import { RoleService } from '../../services/role.service';
import { AddEditRoleComponent } from '../../models/add-edit-role/add-edit-role.component';

@Component({
  selector: 'app-role',
  templateUrl: './role.component.html',
  styleUrls: ['./role.component.scss']
})
export class RoleComponent implements OnInit, AfterViewInit, OnDestroy  {
  displayedColumns: string[] = ['RoleName', 'RoleDescription', 'actions'];
  dataSource = new MatTableDataSource<any>();
  columns: { columnDef: string, header: string }[] = [
    { columnDef: 'RoleName', header: 'Role Name' },
    { columnDef: 'RoleDescription', header: 'Description' },
  ];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  private subscriptions: Subscription[] = [];
  loginDetails: any;

  constructor(

   // private categoryService:CategoryService,
   private roleService:RoleService,
    private dialog:MatDialog,
    private toastr:ToastrService,
    private helper:HelperService
  ) {  }

  ngAfterViewInit() {
   
    
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }
  
  ngOnInit(): void {
    this.loginDetails = this.helper.getItem('loginDetails');
    this.GetRoleList();
}

ngOnDestroy(): void {
    this.subscriptions.forEach((sub)=>{
      sub.unsubscribe();
    })
}

GetRoleList(){
  let bodyData:IGetRole = {
    TenantId:this.loginDetails.TenantId
  }
  const categoryListService = this.roleService.GetRole(bodyData).subscribe((res:any)=>{
   // console.log(res);
    this.dataSource.data = res.RoleDetails;
  });
  this.subscriptions.push(categoryListService);
}


applyFilter(event: Event) {
  const filterValue = (event.target as HTMLInputElement).value;
  this.dataSource.filter = filterValue.trim().toLowerCase();

  if (this.dataSource.paginator) {
    this.dataSource.paginator.firstPage();
  }
}

addRole()
{
  const dialogRef = this.dialog.open(AddEditRoleComponent, {
    width: "30%",
    data:{
      title:"Add Role",
      buttonName:"Save"
    },
    disableClose:true
  });

  dialogRef.afterClosed().subscribe((result:any)=>{
    if(result){
      this.GetRoleList();
    }
  })
  
}

editItem(e:any)
{
  const dialogRef = this.dialog.open(AddEditRoleComponent, {
    width: "30%",
    data:{
      title:"Edit Role",
      buttonName:"Update",
      value:e
    },
    disableClose:true
  });

  dialogRef.afterClosed().subscribe((result:any)=>{
    if(result){
      this.GetRoleList();
    }
  })
}
}
