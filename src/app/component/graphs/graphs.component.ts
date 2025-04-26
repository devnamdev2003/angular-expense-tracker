import { Component, OnInit } from '@angular/core';
import { NgApexchartsModule } from 'ng-apexcharts';
import { ApexAxisChartSeries, ApexChart, ApexXAxis, ApexDataLabels, ApexStroke, ApexTitleSubtitle, ApexTheme } from 'ng-apexcharts';
import { UserService } from '../../localStorage/user.service';

@Component({
  standalone: true,
  selector: 'app-graphs',
  templateUrl: './graphs.component.html',
  styleUrls: ['./graphs.component.css'],
  imports: [NgApexchartsModule]
})
export class GraphsComponent implements OnInit {

  constructor(
    public userService: UserService,
  ) { }

  chartSeries: ApexAxisChartSeries = [
    {
      name: "Sales",
      data: [31, 40, 28, 51, 42, 109, 100]
    }
  ];

  chartYAxis = {
    show: false
  };

  grid = {
    show: false
  };

  chartDetails: ApexChart = {
    type: "area",
    height: 350,
    toolbar: {
      show: false
    },
    zoom: {
      enabled: false
    },
    foreColor: '#ccc',
    background: 'transparent'
  };

  chartXAxis: ApexXAxis = {
    categories: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"]
  };

  dataLabels: ApexDataLabels = {
    enabled: false
  };

  stroke: ApexStroke = {
    curve: "smooth"
  };

  title: ApexTitleSubtitle = {
    text: "Sales Trend",
    align: "left",
    style: {
      color: '#ccc'
    }
  };

  theme: ApexTheme = {
    mode: 'light' // default, will override in ngOnInit
  };

  ngOnInit(): void {
    const userTheme = this.userService.getValue<string>('theme_mode');
    this.theme.mode = userTheme === 'dark' ? 'dark' : 'light';
  }
}
