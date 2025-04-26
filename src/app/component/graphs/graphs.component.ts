import { Component, OnInit } from '@angular/core';
import { NgApexchartsModule } from 'ng-apexcharts';
import { ApexAxisChartSeries, ApexChart, ApexXAxis, ApexDataLabels, ApexStroke, ApexTitleSubtitle, ApexTheme } from 'ng-apexcharts';
import { UserService } from '../../localStorage/user.service';
import { ExpenseService } from '../../localStorage/expense.service'; // Import ExpenseService
import { Expense } from '../../localStorage/expense.service';
import { Input, OnChanges, SimpleChanges } from '@angular/core';

@Component({
  standalone: true,
  selector: 'app-graphs',
  templateUrl: './graphs.component.html',
  styleUrls: ['./graphs.component.css'],
  imports: [NgApexchartsModule]
})
export class GraphsComponent implements OnInit {


  @Input() viewType: 'month' | 'day' = 'month';

  constructor(
    public userService: UserService,
    private expenseService: ExpenseService
  ) { }

  ngOnInit(): void {
    const userTheme = this.userService.getValue<string>('theme_mode');
    this.theme.mode = userTheme === 'dark' ? 'dark' : 'light';
    this.loadData();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['viewType']) {
      this.loadData();
    }
  }

  chartSeries: ApexAxisChartSeries = [
    {
      name: "Expenses",
      data: []
    }
  ];

  chartYAxis = {
    show: true
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
    type: 'category',
    categories: []
  };


  dataLabels: ApexDataLabels = {
    enabled: false
  };

  stroke: ApexStroke = {
    curve: "smooth"
  };

  title: ApexTitleSubtitle = {
    text: "Expenses Trend",
    align: "left",
    style: {
      color: '#ccc'
    }
  };

  theme: ApexTheme = {
    mode: 'light' // default, will override in ngOnInit
  };

  // Switch between month and day view
  switchView(viewType: 'month' | 'day'): void {
    this.viewType = viewType;
    this.loadData();
  }

  // Load data based on the selected view (month or day)


  loadData(): void {
    const expenses: Expense[] = this.expenseService.getAll();

    if (this.viewType === 'month') {
      this.loadMonthData(expenses);
    } else {
      this.loadDayData(expenses);
    }
  }


  // Load month data (Expenses per day for the selected month)
  loadMonthData(expenses: Expense[]): void {
    const dayAmountMap = new Map<number, number>();
    dayAmountMap.set(1, 0);

    expenses.forEach(item => {
      const day = parseInt(item.date.split('-')[2]);
      const amount = item.amount;

      if (dayAmountMap.has(day)) {
        dayAmountMap.set(day, dayAmountMap.get(day)! + amount);
      } else {
        dayAmountMap.set(day, amount);
      }
    });

    const days: number[] = Array.from(dayAmountMap.keys()).sort((a, b) => a - b);
    const amounts: number[] = days.map(day => dayAmountMap.get(day)!);

    this.chartXAxis = {
      type: 'category',
      categories: days
    };

    this.chartSeries = [{
      name: "Expenses",
      data: amounts
    }];
  }

  // Load day data (Expenses per hour for today)
  loadDayData(expenses: Expense[]): void {
    const timeAmountMap = new Map<string, number>();

    // ✅ First, sort the expenses based on time (hours and minutes)
    expenses.sort((a, b) => {
      const [aHours, aMinutes] = a.time.split(":").map(Number);
      const [bHours, bMinutes] = b.time.split(":").map(Number);
      return aHours !== bHours ? aHours - bHours : aMinutes - bMinutes;
    });

    let sum = 0;

    // ✅ Always start from 00:00 with 0
    timeAmountMap.set("00:00", 0);

    expenses.forEach(item => {
      const [hour, minute] = item.time.split(":");
      const time = `${hour}:${minute}`; // Take only HH:MM

      sum += item.amount; // Cumulative sum
      timeAmountMap.set(time, sum);
    });

    // ✅ Now times will be naturally ordered because we sorted before
    const times: string[] = Array.from(timeAmountMap.keys());
    const amounts: number[] = times.map(time => timeAmountMap.get(time)!);

    this.chartXAxis = {
      type: 'category',
      categories: times
    };

    this.chartSeries = [{
      name: "Expenses",
      data: amounts
    }];
  }
}
