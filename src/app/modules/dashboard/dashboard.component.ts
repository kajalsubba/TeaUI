import { Component, OnInit } from '@angular/core';
import * as Highcharts from 'highcharts';
import HC_exporting from 'highcharts/modules/exporting';

// Initiate the module
HC_exporting(Highcharts);

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

  Highcharts: typeof Highcharts = Highcharts;
  stgAndSale: Highcharts.Options = {
    title: {
      text: 'STG and SALE Comparision'
    },
    subtitle: {
      text: ''
    },
    xAxis: {
      categories: ['01-04-2024', '02-04-2024', '03-04-2024', '04-04-2024', '05-04-2024', '06-04-2024'],
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
        color:'#6fc276',
        type: 'column', // Set the type property to 'column' for column chart
        data: [406292, 260000, 107000, 68300, 27500, 14500]
      },
      {
        name: 'SALE',
        color:'#018353',
        type: 'column', // Set the type property to 'column' for column chart
        data: [51086, 136000, 5500, 141000, 107180, 77000]
      }
    ]
  };
  supplierWiseSaleDetails: Highcharts.Options = {
    title: {
      text: 'Supplier Wise Sale Details'
    },
    subtitle: {
      text: ''
    },
    xAxis: {
      categories: ['01-04-2024', '02-04-2024', '03-04-2024', '04-04-2024', '05-04-2024', '06-04-2024'],
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
        color:'#018353',
        type: 'column', // Set the type property to 'column' for column chart
        data: [406292, 260000, 107000, 68300, 27500, 14500]
      },
    ]
  };
  companyWiseSaleDetails: Highcharts.Options = {
    title: {
      text: 'Company Wise Sale Details'
    },
    subtitle: {
      text: ''
    },
    xAxis: {
      categories: ['Pawai', 'Tata', 'Jorhat TEA', 'Siva Tea', 'Tinsukia TEA', 'Mag TEA'],
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
        color:'#018353',
        type: 'column', // Set the type property to 'column' for column chart
        data: [406292, 260000, 107000, 768300, 627500, 514500]
      },
    ]
  };

  ngOnInit(): void {
      
  }

}
