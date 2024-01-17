import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { CategoryService } from '../../services/category.service';
import { IGetCategory } from '../../interfaces/iget-category';
import { MatDialog } from '@angular/material/dialog';
import { AddEditCategoryComponent } from '../../models/add-edit-category/add-edit-category.component';
import { Subscription } from 'rxjs';
import { HelperService } from 'src/app/core/services/helper.service';

@Component({
  selector: 'app-category',
  templateUrl: './category.component.html',
  styleUrls: ['./category.component.scss']
})
export class CategoryComponent implements OnInit, AfterViewInit, OnDestroy {
  displayedColumns: string[] = ['CategoryId', 'CategoryName', 'actions'];
  dataSource = new MatTableDataSource<any>();
  columns: { columnDef: string, header: string }[] = [
    { columnDef: 'CategoryId', header: 'Category ID' },
    { columnDef: 'CategoryName', header: 'Category Name' },
  ];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  private subscriptions: Subscription[] = [];
  loginDetails: any;

  constructor(
    private categoryService:CategoryService,
    private dialog:MatDialog,
    private helper:HelperService
  ){}

  ngAfterViewInit() {
    console.log(this.loginDetails);
    
    
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }
  
  ngOnInit(): void {
      this.loginDetails = this.helper.getItem('loginDetails');
      this.getCategoryList();
  }

  ngOnDestroy(): void {
      this.subscriptions.forEach((sub)=>{
        sub.unsubscribe();
      })
  }

  getCategoryList(){
    let bodyData:IGetCategory = {
      TenantId:this.loginDetails.TenantId
    }
    const categoryListService = this.categoryService.getCategory(bodyData).subscribe((res:any)=>{
      console.log(res);
      this.dataSource.data = res.CategoryDetails;
    });
    this.subscriptions.push(categoryListService);
  }

  addCategory(){
    const dialogRef = this.dialog.open(AddEditCategoryComponent, {
      width: "30%",
      data:{
        title:"Add Category",
        buttonName:"Save"
      },
      disableClose:true
    });

    dialogRef.afterClosed().subscribe((result:any)=>{
      if(result){
        this.getCategoryList();
      }
    })
  }

  editItem(element: any): void {
    const dialogRef = this.dialog.open(AddEditCategoryComponent, {
      width: "30%",
      data:{
        title:"Update Category",
        buttonName:"Update",
        value:element
      },
      disableClose:true
    });

    dialogRef.afterClosed().subscribe((result:any)=>{
      if(result){
        this.getCategoryList();
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
