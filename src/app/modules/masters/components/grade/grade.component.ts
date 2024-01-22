import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { AddEditGradeComponent } from '../../models/add-edit-grade/add-edit-grade.component';
import { MatDialog } from '@angular/material/dialog';
import { HelperService } from 'src/app/core/services/helper.service';
import { IGetGrade } from '../../interfaces/IGrade';
import { GradeService } from '../../services/grade.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-grade',
  templateUrl: './grade.component.html',
  styleUrls: ['./grade.component.scss']
})
export class GradeComponent implements OnInit, AfterViewInit {

  displayedColumns: string[] = ['GradeId', 'GradeName', 'actions'];
  dataSource = new MatTableDataSource<any>();
  columns: { columnDef: string, header: string }[] = [
    { columnDef: 'GradeId', header: 'GradeId ' },
    { columnDef: 'GradeName', header: 'Grade Name' },
  ];
  loginDetails:any;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  private subscriptions: Subscription[] = [];
/**
 *
 */
constructor(
  private dialog:MatDialog,
  private helper:HelperService,
  private gradeService:GradeService
  ) {

  
}

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  ngOnInit(): void {
    this.loginDetails = this.helper.getItem('loginDetails');
    this.GetGradeList();
  }

  GetGradeList(){
    let bodyData:IGetGrade = {
      TenantId:this.loginDetails.TenantId
    }
    const gradeListService = this.gradeService.GetGrade(bodyData).subscribe((res:any)=>{
      console.log(res);
      this.dataSource.data = res.GradeDetails;
    });
    this.subscriptions.push(gradeListService);
  }

  addGrade(){
    const dialogRef = this.dialog.open(AddEditGradeComponent, {
      width: "30%",
      data:{
        title:"Add Category",
        buttonName:"Save"
      },
      disableClose:true
    });

    dialogRef.afterClosed().subscribe((result:any)=>{
      if(result){
        this.GetGradeList();
      }
    })
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sub)=>{
      sub.unsubscribe();
    })
}

editItem(e:any)
{

}
}


