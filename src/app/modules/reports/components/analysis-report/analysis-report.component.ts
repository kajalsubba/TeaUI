import { Component, HostListener, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ToastrService } from 'ngx-toastr';
import { Subject, Subscription, takeUntil } from 'rxjs';
import { HelperService } from 'src/app/core/services/helper.service';
import { ExcelExportService } from 'src/app/shared/services/excel-export.service';
import { ReportsServiceService } from '../../services/reports-service.service';
import { IAnalysisReport, IMonthWiseCollection } from '../../interfaces/ireports';
import { CategoryService } from 'src/app/modules/masters/services/category.service';
import { IGetCategory } from 'src/app/modules/masters/interfaces/ICategory';

@Component({
  selector: 'app-analysis-report',
  templateUrl: './analysis-report.component.html',
  styleUrls: ['./analysis-report.component.scss']
})
export class AnalysisReportComponent {
  displayedColumns: string[] = [
    'ClientName',
    'VehicleCount',
    'CollectionDays',
    'ChallanWeight',
    'TargetWeight',
    'TargetAchievementPercent',
    'RegularityScore',
    'FinalScore',
    'PerformanceStatus'

  ];

  dataSource = new MatTableDataSource<any>();
  filteredData: any[] = [];
  columns: { columnDef: string; header: string }[] = [

    { columnDef: 'ClientName', header: 'Client Name' },
    { columnDef: 'VehicleCount', header: 'Vehicle Count' },
    { columnDef: 'CollectionDays', header: 'Collection Days' },
    { columnDef: 'ChallanWeight', header: 'Challan Weight' },
    { columnDef: 'TargetWeight', header: 'Target Weight' },
    { columnDef: 'TargetAchievementPercent', header: 'Target Achievement (%)' },
    { columnDef: 'RegularityScore', header: 'Regularity Score' },
    { columnDef: 'FinalScore', header: 'Final Score' },
    { columnDef: 'PerformanceStatus', header: 'Performance Status' }

  ];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  private subscriptions: Subscription[] = [];
  loginDetails: any;
  AnalysisForm!: FormGroup;
  ClientNames: any[] = [];
  minToDate!: any;
  vehicleNumbers: any[] = [];
  financialyearList: any = [];
  selectedRowIndex: number = -1;
  AverageRate: number = 0;
  TotalVehicleCount: number = 0;
  CategotyList: string[] = [ 'Supplier']
  private destroy$ = new Subject<void>();
  constructor(
    private helper: HelperService,
    private toastr: ToastrService,
    private fb: FormBuilder,
    private excelService: ExcelExportService,
    private reportService: ReportsServiceService,
    private categoryService: CategoryService

  ) { }

  async ngOnInit() {
    this.loginDetails = this.helper.getItem('loginDetails');
    this.AnalysisForm = this.fb.group({
      FinancialYearId: ['', Validators.required],
      Category: ['', Validators.required],

    });

    await this.getFinancialYear();
  }


  async getFinancialYear() {
    try {
      const categoryBody: IGetCategory = {
        TenantId: this.loginDetails.TenantId
      };

      const res: any = await this.categoryService.getFinancialYear(categoryBody)
        .pipe(takeUntil(this.destroy$))
        .toPromise();
      this.financialyearList = res.FinancialYear;


    } catch (error) {
      console.error('Error:', error);
      this.toastr.error('Something went wrong.', 'ERROR');
    }
  }
  ngAfterViewInit() {


    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  deleteItem(element: any) { }



  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }



  search() {
    if (this.AnalysisForm.invalid) {
      this.AnalysisForm.markAllAsTouched();
      return;
    }

    this.GetAnalysisData();

  }


  filterClientNames(value: string): any[] {

    const filterValue = value.toLowerCase();
    return this.ClientNames.filter((x: any) => x?.ClientName?.toLowerCase()?.includes(filterValue));
  }

  GetAnalysisData() {


    const bodyData: IAnalysisReport = {
      TenantId: this.loginDetails.TenantId,
      FinancialYearId: this.AnalysisForm.value.FinancialYearId

    }
    const categoryListService = this.reportService.GetAnalysisReport(bodyData).subscribe((res: any) => {

      this.dataSource.data = res.AnalysisReport;


    });
    this.subscriptions.push(categoryListService);
  }


  handleChange(event: any): void {
    // Your code to handle the change event
    if (event.target.checked) {
      // Checkbox is checked, do something
      console.log('Checkbox is checked');
    } else {
      // Checkbox is unchecked, do something else
      console.log('Checkbox is unchecked');
    }
  }

  getTotal(columnName: string): number {
    return this.dataSource.filteredData.filter((x: any) => x.Status != 'Rejected').reduce((acc, curr) => acc + curr[columnName], 0);

  }


  // Autocomplete function


  displayWithFn(value: string): string {
    return value || '';
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

  exportToExcel() {
    if (this.dataSource.data.length > 0) {
      // Get the table element
      const table = document.getElementById('material-table');

      if (table instanceof HTMLTableElement) { // Check if table is a HTMLTableElement
        // Remove unwanted columns
        const columnsToRemove = ['Id', 'Actions', 'Created By']; // Specify columns to remove
        columnsToRemove.forEach(col => {
          const columnIndex = Array.from(table.rows[0].cells).findIndex(cell => cell.textContent && cell.textContent.trim() === col);
          if (columnIndex !== -1) {
            Array.from(table.rows).forEach(row => {
              if (row.cells[columnIndex]) {
                row.deleteCell(columnIndex);
              }
            });
          }
        });

        this.excelService.exportToExcel('material-table', 'STG History');
      } else {
        console.error("Table element not found or not an HTML table.");
      }
    } else {
      this.toastr.warning("NO DATA TO EXPORT", "WARNING");
    }
  }

}

