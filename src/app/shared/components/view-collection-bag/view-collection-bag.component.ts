import { Component, HostListener, Inject, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Subscription } from 'rxjs';
import { HelperService } from 'src/app/core/services/helper.service';
import { IStgBag } from '../../interfaces/istg-bag';
import { StgBagService } from '../../services/stg-bag.service';

@Component({
  selector: 'app-view-collection-bag',
  templateUrl: './view-collection-bag.component.html',
  styleUrls: ['./view-collection-bag.component.scss']
})
export class ViewCollectionBagComponent {
  displayedColumns: string[] = [
    'RowNum',
    'FirstWeight'

  ];
  selectedRowIndex: number = -1;
  dataSource = new MatTableDataSource<any>();
  filteredData: any[] = [];
  columns: { columnDef: string; header: string }[] = [
    //{ columnDef: 'VehicleNo', header: 'Vehicle NO.' },
    { columnDef: 'RowNum', header: 'Srl No' },
    { columnDef: 'FirstWeight', header: 'Weight' }

  ];

  // @ViewChild(MatPaginator) paginator!: MatPaginator;
  // @ViewChild(MatSort) sort!: MatSort;
  private subscriptions: Subscription[] = [];
  loginDetails: any;
  constructor(
    public dialogRef: MatDialogRef<ViewCollectionBagComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private helper: HelperService,
    private stgBagService: StgBagService
  ) { }

  async ngOnInit() {
    this.loginDetails = this.helper.getItem('loginDetails');
    this.GetStgBagList();
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
  GetStgBagList() {


    const bodyData: IStgBag = {

      TenantId: this.loginDetails.TenantId,
      CollectionId: this.data.value.CollectionId,
      CreatedBy: this.loginDetails.UserId,
    }
    const categoryListService = this.stgBagService.GetStgBagData(bodyData).subscribe((res: any) => {
      // console.log(res);
      this.dataSource.data = res.BagDetails;


    });
    this.subscriptions.push(categoryListService);
  }

}
