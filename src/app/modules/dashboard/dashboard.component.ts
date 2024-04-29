import { Component, OnInit } from '@angular/core';
import * as Highcharts from 'highcharts';
import HC_exporting from 'highcharts/modules/exporting';
import { DashboardServiceService } from './dashboard-service.service';
import { Idashboard } from './idashboard';
import { HelperService } from 'src/app/core/services/helper.service';
import { Subject, Subscription } from 'rxjs';

// Initiate the module
HC_exporting(Highcharts);

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

  Highcharts: typeof Highcharts = Highcharts;
  companyWiseSaleDetails!: Highcharts.Options;
  stgAndSale!: Highcharts.Options;
  supplierWiseSaleDetails!: Highcharts.Options;
  loginDetails: any;
  companyWiseData: any;
  private destroy$ = new Subject<void>();



  private subscriptions: Subscription[] = [];

  constructor(private dashBoardService: DashboardServiceService,
    private helper: HelperService,

  ) { }

  ngOnInit(): void {
    this.loginDetails = this.helper.getItem('loginDetails');
    this.GetCompanyWiseData();
    this.GetSupplierWiseData();
    this.GetSTGWiseData();

  }

  GetCompanyWiseData() {

    let bodyData: Idashboard = {

      TenantId: this.loginDetails.TenantId,
      CreatedBy: this.loginDetails.LoginType == 'Client' || this.loginDetails.RoleName != 'Admin' ? this.loginDetails.UserId : 0,

    };
    const categoryListService = this.dashBoardService
      .GetCompanyWiseChart(bodyData)
      .subscribe((res: any) => {
        //  this.companyWiseData= res.CompanyWiseChart;
        const categoriesData: string[] = res.CompanyWiseChart.map((item: any) => item.FactoryName);
        const salesData: number[] = res.CompanyWiseChart.map((item: any) => item.ChallanWeight);

        this.GetCompanyWiseSaleChart(categoriesData, salesData);
      });
    this.subscriptions.push(categoryListService);
  }
  GetSTGWiseData() {

    let bodyData: Idashboard = {

      TenantId: this.loginDetails.TenantId,
      CreatedBy: this.loginDetails.LoginType == 'Client' || this.loginDetails.RoleName != 'Admin' ? this.loginDetails.UserId : 0,

    };
    const categoryListService = this.dashBoardService
      .GetSTGWiseChart(bodyData)
      .subscribe((res: any) => {

        const categoriesData: string[] = res.StgWiseChart.map((item: any) => item.CollectionDate);
        const stgData: number[] = res.StgWiseChart.map((item: any) => item.finalweight);
        const salesData: number[] = res.StgWiseChart.map((item: any) => item.ChallanWeight);

        this.GetStgWiseChart(categoriesData, stgData, salesData);
      });
    this.subscriptions.push(categoryListService);
  }
  GetSupplierWiseData() {

    let bodyData: Idashboard = {

      TenantId: this.loginDetails.TenantId,
      CreatedBy: this.loginDetails.LoginType == 'Client' || this.loginDetails.RoleName != 'Admin' ? this.loginDetails.UserId : 0,

    };
    const categoryListService = this.dashBoardService
      .GetSupplierWiseChart(bodyData)
      .subscribe((res: any) => {
        //  this.companyWiseData= res.CompanyWiseChart;
        const categoriesData: string[] = res.SupplierWiseChart.map((item: any) => item.CollectionDate);
        const supplierData: number[] = res.SupplierWiseChart.map((item: any) => item.ChallanWeight);

        this.GetSupplierWiseChart(categoriesData, supplierData);
      });
    this.subscriptions.push(categoryListService);
  }

  GetCompanyWiseSaleChart(categories: any = [], datas: any = []) {
    const currentDate = new Date();
    const currentMonthName = currentDate.toLocaleString('default', { month: 'long' });
    
    this.companyWiseSaleDetails = {
      title: {
        text: 'Company Wise Sale for the month - '+currentMonthName
      },
      subtitle: {
        text: ''
      },
      xAxis: {
        categories: categories,
        crosshair: true,
        accessibility: {
          description: 'sale'
        }
      },
      yAxis: {
        title: {
          text: 'KG'
        }
      },
      tooltip: {
        valueSuffix: ''
      },
      series: [
        {
          name: 'SALE',
          color: '#018353',
          type: 'column', // Set the type property to 'column' for column chart
          data: datas
        },
      ]
    };
  }
  GetStgWiseChart(categories: any = [], stgData: any = [], supplierData: any = []) {
    this.stgAndSale = {
      title: {
        text: 'STG and SALE Comparision'
      },
      subtitle: {
        text: ''
      },
      xAxis: {
        categories: categories,
        crosshair: true,
        accessibility: {
          description: 'Sale'
        }
      },
      yAxis: {
        title: {
          text: 'KG'
        }
      },
      tooltip: {
        valueSuffix: ''
      },
      series: [
        {
          name: 'STG',
          color: '#6fc276',
          type: 'column', // Set the type property to 'column' for column chart
          data: stgData
        },
        {
          name: 'SALE',
          color: '#018353',
          type: 'column', // Set the type property to 'column' for column chart
          data: supplierData
        }
      ]
    };
  }

  GetSupplierWiseChart(categories: any = [], supplierData: any = []) {
    this.supplierWiseSaleDetails = {
      title: {
        text: 'Supplier Wise Sale Details'
      },
      subtitle: {
        text: ''
      },
      xAxis: {
        categories: categories,
        crosshair: true,
        accessibility: {
          description: 'Sale'
        }
      },
      yAxis: {
        title: {
          text: 'KG'
        }
      },
      tooltip: {
        valueSuffix: ''
      },
      series: [
        {
          name: 'SALE',
          color: '#018353',
          type: 'column', // Set the type property to 'column' for column chart
          data: supplierData
        },
      ]
    };
  }
  ngOnDestroy(): void {
    this.subscriptions.forEach((sub) => {
      sub.unsubscribe();
    })

  }
}
