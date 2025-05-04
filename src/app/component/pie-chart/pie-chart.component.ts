import { Component, OnInit, Input, ViewChild, SimpleChanges } from "@angular/core";
import { ChartComponent } from "ng-apexcharts";
import { NgApexchartsModule } from "ng-apexcharts";

import { UserService } from "../../service/localStorage/user.service";
import { Expense, ExpenseService } from "../../service/localStorage/expense.service";
import { CategoryService, Category } from "../../service/localStorage/category.service"; // You probably forgot 

import {
  ApexNonAxisChartSeries,
  ApexResponsive,
  ApexChart,
  ApexTheme,
  ApexStroke,
  ApexPlotOptions
} from "ng-apexcharts";

export type ChartOptions = {
  title: ApexTitleSubtitle;
  series: ApexNonAxisChartSeries;
  chart: ApexChart;
  responsive: ApexResponsive[];
  labels: string[];
  theme: ApexTheme;
  colors: string[];
  stroke: ApexStroke;
  plotOptions: ApexPlotOptions;
  legend: ApexLegend;
};

@Component({
  selector: 'app-pie-chart',
  templateUrl: './pie-chart.component.html',
  styleUrls: ['./pie-chart.component.css'],
  standalone: true,
  imports: [NgApexchartsModule]
})
export class PieChartComponent implements OnInit {

  @Input() viewType: 'month' | 'day' = 'month';
  @Input() currentDate!: Date;
  @ViewChild("chart") chart!: ChartComponent;
  public chartOptions!: ChartOptions;

  constructor(
    public userService: UserService,
    private expenseService: ExpenseService,
    private categoryService: CategoryService
  ) { }

  ngOnInit(): void {
    const categories = this.categoryService.getSortedCategoriesByExpenseCount();

    const series: number[] = [];
    const labels: string[] = [];
    const colors: string[] = [];

    categories.forEach((category: any) => {
      if (category.is_active === "true") {
        series.push(Number(category.expense_count));
        labels.push(category.name);
        colors.push(category.color);
      }
    });

    const userTheme = this.userService.getValue<string>('theme_mode');

    this.chartOptions = {
      series,
      labels,
      colors,
      chart: {
        width: 380,
        type: "pie",
        foreColor: 'var(--color-text)',
        background: 'transparent',
        toolbar: {
          show: false
        },
        zoom: {
          enabled: false
        },
        animations: {
          enabled: true
        }
      },
      stroke: {
        show: false
      },
      plotOptions: {
        pie: {
          expandOnClick: false,
          dataLabels: {
            offset: 0
          }
        }
      },
      title: {
        text: "Today Expenses: ",
        align: "center",
        style: {
          color: 'var(--color-text)'
        }
      },
      legend: {
        show: false
      },
      theme: {
        mode: userTheme === 'dark' ? 'dark' : 'light'
      },
      responsive: [
        {
          breakpoint: 480,
          options: {
            chart: {
              width: 200
            }
            // No need for legend here anymore
          }
        }
      ]
    };

  }


  ngOnChanges(changes: SimpleChanges): void {
    if (changes['viewType'] || changes['currentDate']) {
      this.loadData();
    }
  }


  loadData(): void {
    const expenses: Expense[] = this.expenseService.getAll();
    if (this.viewType === 'month') {
      this.loadMonthData(expenses);
    } else {
      this.loadDayData(expenses);
    }
  }
  
  loadDayData(expenses: Expense[]) {
    throw new Error("Method not implemented.");
  }
  loadMonthData(expenses: Expense[]) {
    throw new Error("Method not implemented.");
  }

}
