import { DatePipe, formatDate } from '@angular/common';
import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { HelperService } from 'src/app/core/services/helper.service';
import { IStgSelect } from 'src/app/modules/collection/interfaces/istg';
import { StgService } from 'src/app/modules/collection/services/stg.service';

@Component({
  selector: 'app-stgapprove',
  templateUrl: './stgapprove.component.html',
  styleUrls: ['./stgapprove.component.scss']
})
export class StgapproveComponent implements OnInit,  AfterViewInit {

  displayedColumns: string[] = [
    'CollectionDate',
    'VehicleNo',
    'ClientName',
    'FirstWeight',
    'WetLeaf',
    'LongLeaf',
    'Deduction',
    'FinalWeight',
    'Grade',
    'Rate',
    'Remarks',
    'Status',
    'actions'
  ];
 
  dataSource = new MatTableDataSource<any>();
  filteredData: any[] = [];
  columns: { columnDef: string; header: string }[] = [
    { columnDef: 'CollectionDate', header: 'Collection Date' },
    { columnDef: 'VehicleNo', header: 'Vehicle NO.' },
    { columnDef: 'ClientName', header: 'Client Name' },
    { columnDef: 'FirstWeight', header: 'First Weight(Kg)' },
    { columnDef: 'WetLeaf', header: 'Wet Leaf' },
    { columnDef: 'LongLeaf', header: 'Long Leaf' },
    { columnDef: 'Deduction', header: 'Deduction' },
    { columnDef: 'FinalWeight', header: 'Final Weight' },
    { columnDef: 'Grade', header: 'Grade' },
    { columnDef: 'Rate', header: 'Rate' },
    { columnDef: 'Status', header: 'Status' },
    { columnDef: 'Remarks', header: 'Remarks' },
  ];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  private subscriptions: Subscription[] = [];
  loginDetails: any;
  dateRangeForm!: FormGroup;
  minToDate!: any;

  constructor(
    private dialog: MatDialog,
    private toastr: ToastrService,
    private helper: HelperService,
    private datePipe: DatePipe,
    private fb:FormBuilder,
    private stgService:StgService,
  ) {}

  ngOnInit(): void {
    this.loginDetails = this.helper.getItem('loginDetails');
    this.dateRangeForm = this.fb.group({
      fromDate: [null, Validators.required]
     
    });

  
    this.GetStgList(null,null);
 
  }
  GetStgList(FromDate:any,ToDate:any){
    const currentDate = new Date();
    let bodyData:IStgSelect = {
      FromDate:FromDate==null?formatDate(currentDate, 'yyyy-MM-dd', 'en-US'): FromDate,
      ToDate:ToDate==null?formatDate(currentDate, 'yyyy-MM-dd', 'en-US'): FromDate,
      TenantId:this.loginDetails.TenantId
    }
    const categoryListService = this.stgService.GetStg(bodyData).subscribe((res:any)=>{
     // console.log(res);
      this.dataSource.data = res.STGDetails;
    });
    this.subscriptions.push(categoryListService);
  }

  
  ngAfterViewInit() {
    console.log(this.loginDetails);
    
    
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  search()
  {

  }

  clearFilter()
  {

  }

  fromDateChange(e:any)
  {

  }

  editItem(e:any)
  {

  }

  deleteItem(e:any)
  {

  }

  setStatus(e:any)
  {

  }

}
