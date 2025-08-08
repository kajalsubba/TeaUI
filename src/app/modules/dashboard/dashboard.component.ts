import { Component, OnInit } from '@angular/core';
import * as Highcharts from 'highcharts';
import HC_exporting from 'highcharts/modules/exporting';
import { DashboardServiceService } from './dashboard-service.service';
import { Idashboard } from './idashboard';
import { HelperService } from 'src/app/core/services/helper.service';
import { Subject, Subscription } from 'rxjs';
import { ConfigService } from 'src/app/core/services/config.service';
import { environment } from 'src/environments/environment';

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
  totalCompanyWiseSaleDetails!: Highcharts.Options;

  stgAndSale!: Highcharts.Options;
  supplierWiseSaleDetails!: Highcharts.Options;
  stgGapClient!: Highcharts.Options;
  supplierGapClient!: Highcharts.Options;
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
    this.GetGapClientData();
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

        const categoryYear: string[] = res.YearWiseChart.map((item: any) => item.ChallanYear);
        const totalSalesData: number[] = res.YearWiseChart.map((item: any) => item.ChallanWeight);

        const totalSaleDays: number[] = res.YearWiseChart.map((item: any) => item.TotalDays);
        const avgsalePerDay: number[] = res.YearWiseChart.map((item: any) => item.AvgPerDay);

        this.GetCompanyWiseSaleChart(categoriesData, salesData);
        this.GetTotalCompanyWiseSaleChart(categoryYear, totalSalesData, totalSaleDays, avgsalePerDay);
      });
    this.subscriptions.push(categoryListService);
  }

  GetGapClientData() {

    let bodyData: Idashboard = {

      TenantId: this.loginDetails.TenantId,
      CreatedBy: this.loginDetails.LoginType == 'Client' || this.loginDetails.RoleName != 'Admin' ? this.loginDetails.UserId : 0,

    };
    const categoryListService = this.dashBoardService
      .GetGapClientData(bodyData)
      .subscribe((res: any) => {

        if (!environment.production) {

          console.log(res, 'resopsse');
        }

        const categoriesData: string[] = res.STGClient.map((item: any) => item.ClientName);
        const gapData: number[] = res.STGClient.map((item: any) => item.DaysOverdue);
        const gapDate: string[] = res.STGClient.map((item: any) => item.LastCollectionDate);
        const gapContactNo: string[] = res.STGClient.map((item: any) => item.ContactNo);

        const suppliercategoriesData: string[] = res.SupplierClient.map((item: any) => item.ClientName);
        const suppliergapData: number[] = res.SupplierClient.map((item: any) => item.DaysOverdue);
        const suppliergapDate: string[] = res.SupplierClient.map((item: any) => item.LastCollectionDate);
        const suppliergapContactNo: string[] = res.SupplierClient.map((item: any) => item.ContactNo);

        this.GetStgGapChart(categoriesData, gapData, gapDate, gapContactNo);
        this.GetSupplierGapChart(suppliercategoriesData, suppliergapData, suppliergapDate, suppliergapContactNo);
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
      credits: {
        enabled: false
      },
      title: {
        text: 'Factory Wise Sale for the month - ' + currentMonthName
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


  GetTotalCompanyWiseSaleChart(categories: any = [], totalSaledata: any = [], totalSaledays: any = [], avgPerDaySale: any = []) {
    this.totalCompanyWiseSaleDetails = {
      chart: {
        type: 'bar'
      },
      credits: {
        enabled: false
      },
      title: {
        text: 'Sales Data Comparison'
      },
      xAxis: {
        categories: categories,
        crosshair: true
      },
      yAxis: [
        {
          // Primary yAxis for ChallanWeight
          min: 0,
          title: {
            text: 'ChallanWeight'
          },
          opposite: false
        },
        {
          // Secondary yAxis for TotalDays and AvgPerDay
          min: 0,
          title: {
            text: 'TotalDays / AvgPerDay'
          },
          opposite: true
        }
      ],
      tooltip: {
        shared: true
      },
      plotOptions: {
        column: {
          grouping: true,
          shadow: false,
          borderWidth: 0
        }
      },
      series: [
        {
          name: 'TotalDays',
          type: 'column',
          data: totalSaledays,
          color: '#434348',
          yAxis: 1
        },
        {
          name: 'AvgPerDay',
          type: 'column',
          data: avgPerDaySale,
          color: '#90ed7d',
          yAxis: 1
        },
        {
          name: 'ChallanWeight',
          type: 'column',
          data: totalSaledata,
          color: '#018353',
          yAxis: 0
        }
      ]
    };

  }



  GetStgWiseChart(categories: any = [], stgData: any = [], saleData: any = []) {

    // Function to determine color based on condition
    function getSaleColor(stgValue: number, saleValue: number): string {
      return stgValue > saleValue ? '#ff0000' : '#018353'; // Red if saleData > stgData, otherwise original color
    }

    // Process saleData to include color based on condition
    const processedSaleData = saleData.map((saleValue: number, index: number) => ({
      y: saleValue,
      color: getSaleColor(stgData[index], saleValue)
    }));
    this.stgAndSale = {
      credits: {
        enabled: false
      },
      title: {
        text: 'STG and SALE Comapre for last 10 days'
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
          data: processedSaleData
        }
      ]
    };
  }

  GetSupplierWiseChart(categories: any = [], supplierData: any = []) {
    this.supplierWiseSaleDetails = {
      credits: {
        enabled: false
      },
      title: {
        text: 'Supplier Wise sale for last 10 days'
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
  GetStgGapChart(categories: any = [], datas: any = [], lastDate: any = [], contactNo: any = []) {
    this.stgGapClient = {
      credits: {
        enabled: false
      },
      title: {
        text: 'STG Collection Delays Last 10 Days'
      },
      subtitle: {
        text: ''
      },
      xAxis: {
        categories: categories,
        crosshair: true,
        accessibility: {
          description: 'Clients'
        }
      },
      yAxis: {
        title: {
          text: 'Days'
        }
      },
      tooltip: {
        useHTML: true, // Allow HTML formatting in tooltip
        formatter: function () {
          const index = this.point.index;
          const delayDays = this.y;
          const clientName = categories[index];
          const date = lastDate[index] || 'N/A';
          const contact = contactNo[index] || 'N/A';

          return `
          <b>Delay (days):</b> ${delayDays}<br/>
          <b>Last Date:</b> ${date}<br/>
          <b>Contact No:</b> ${contact}
        `;
        }
      },
      series: [
        {
          name: 'Clients',
          color: '#018353',
          type: 'column',
          data: datas
        },
      ]
    };
  }

  GetSupplierGapChart(categories: any = [], datas: any = [], lastDate: any = [], contactNo: any = []) {
    this.supplierGapClient = {
      credits: {
        enabled: false
      },
      title: {
        text: 'Supplier Collection Delays Last 10 Days'
      },
      subtitle: {
        text: ''
      },
      xAxis: {
        categories: categories,
        crosshair: true,
        accessibility: {
          description: 'Clients'
        }
      },
      yAxis: {
        title: {
          text: 'Days'
        }
      },
      tooltip: {
        useHTML: true, // Allow HTML formatting in tooltip
        formatter: function () {
          const index = this.point.index;
          const delayDays = this.y;
          const clientName = categories[index];
          const date = lastDate[index] || 'N/A';
          const contact = contactNo[index] || 'N/A';

          return `
          <b>Delay (days):</b> ${delayDays}<br/>
          <b>Last Date:</b> ${date}<br/>
          <b>Contact No:</b> ${contact}
        `;
        }
      },
      series: [
        {
          name: 'Clients',
          color: '#018353',
          type: 'column',
          data: datas
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
