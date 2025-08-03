import { Component, OnInit, Input, SimpleChanges, OnChanges } from '@angular/core';
import { NgApexchartsModule } from 'ng-apexcharts';
import {
  ApexAxisChartSeries, ApexChart, ApexXAxis, ApexDataLabels,
  ApexStroke, ApexTitleSubtitle, ApexTheme, ApexTooltip, ApexGrid, ApexYAxis
} from 'ng-apexcharts';
import { UserService } from '../../service/localStorage/user.service';
import { ExpenseService, Expense } from '../../service/localStorage/expense.service';

/**
 * GraphsComponent displays area charts for expenses based on selected time range (month/day/year).
 */
@Component({
  standalone: true,
  selector: 'app-graphs',
  templateUrl: './graphs.component.html',
  styleUrls: ['./graphs.component.css'],
  imports: [NgApexchartsModule]
})
export class GraphsComponent implements OnInit, OnChanges {

  /**
   * Determines whether to show monthly or daily or yearly view.
   * @type {'month' | 'day' | 'year'}
   */
  @Input() viewType: 'month' | 'day' | 'year' = 'month';

  /**
   * The current selected date used for filtering expense data.
   * @type {Date}
   */
  @Input() currentDate!: Date;

  /**
   * Chart series data used by ApexCharts.
   */
  chartSeries: ApexAxisChartSeries = [
    {
      name: "Expenses",
      data: []
    }
  ];

  /**
   * Y-axis configuration for the chart.
   */
  chartYAxis: ApexYAxis = {
    show: true
  };

  /**
   * Grid styling for the chart.
   */
  grid: ApexGrid = {
    show: false
  };

  /**
   * Main chart configuration such as type, zoom, toolbar.
   */
  chartDetails: ApexChart = {
    type: "area",
    height: 350,
    toolbar: {
      show: false
    },
    zoom: {
      enabled: false
    },
    foreColor: 'var(--color-text)',
    background: 'transparent',
    animations: {
      enabled: true
    }
  };

  /**
   * X-axis configuration including categories and tooltip.
   */
  chartXAxis: ApexXAxis = {
    type: 'category',
    categories: [],
    tooltip: {
      enabled: false
    }
  };

  /**
   * Data label configuration for the chart.
   */
  dataLabels: ApexDataLabels = {
    enabled: false
  };

  /**
   * Stroke configuration for line smoothing.
   */
  stroke: ApexStroke = {
    curve: "smooth"
  };

  /**
   * Title of the chart including total expense.
   */
  title: ApexTitleSubtitle = {};

  /**
   * Theme configuration for light or dark mode.
   */
  theme: ApexTheme = {
    mode: 'light'
  };

  /**
   * Tooltip configuration for the chart.
   */
  tooltip: ApexTooltip = {
    shared: true,
    intersect: false,
    y: {},
    x: {}
  };

  /**
   * Constructs GraphsComponent with injected services.
   * @param userService Service for accessing user settings like theme and currency
   * @param expenseService Service for retrieving stored expenses
   */
  constructor(
    public userService: UserService,
    private expenseService: ExpenseService
  ) { }

  /**
   * Lifecycle hook called after component initialization.
   */
  ngOnInit(): void {
    const userTheme = this.userService.getValue<string>('theme_mode');
    this.theme.mode = userTheme === 'dark' ? 'dark' : 'light';
    this.loadData();
  }

  /**
   * Lifecycle hook called when @Input values change.
   * @param changes Object containing changed input properties
   */
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['viewType'] || changes['currentDate']) {
      this.loadData();
    }
  }

  /**
   * Switches between 'month', 'year' and 'day' view and reloads chart data.
   * @param viewType View type to switch to
   */
  switchView(viewType: 'month' | 'day' | 'year'): void {
    this.viewType = viewType;
    this.loadData();
  }

  /**
   * Loads chart data based on the current view type.
   */
  loadData(): void {
    const expenses: Expense[] = this.expenseService.getAll();
    if (this.viewType === 'month') {
      this.loadMonthData(expenses);
    } else if (this.viewType === 'day') {
      this.loadDayData(expenses);
    }
    else {
      this.loadYearData(expenses);
    }
  }

  /**
   * Loads and processes expense data grouped by day for the current month.
   * @param expenses List of all expenses
   */
  loadMonthData(expenses: Expense[]): void {
    const dayAmountMap = new Map<number, number>();
    const currentYear = this.currentDate.getFullYear();
    const currentMonth = this.currentDate.getMonth() + 1;

    const currentMonthExpenses = expenses.filter(item => {
      const [year, month] = item.date.split('-').map(Number);
      return year === currentYear && month === currentMonth;
    });

    let totalAmount = 0;
    currentMonthExpenses.forEach(item => {
      const day = parseInt(item.date.split('-')[2]);
      const amount = item.amount;
      totalAmount += amount;

      if (dayAmountMap.has(day)) {
        dayAmountMap.set(day, dayAmountMap.get(day)! + amount);
      } else {
        dayAmountMap.set(day, amount);
      }
    });

    const days = Array.from(dayAmountMap.keys()).sort((a, b) => a - b);
    const amounts = days.map(day => dayAmountMap.get(day)!);

    this.tooltip = {
      shared: true,
      intersect: false,
      y: {
        formatter: (value: number) => {
          return `${value} ${this.userService.getValue<string>('currency')}`;
        }
      },
      x: {
        formatter: (value: any) => {
          const day = days[value - 1];
          const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
            "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
          const monthName = monthNames[this.currentDate.getMonth()];
          const year = this.currentDate.getFullYear();
          return `${day} ${monthName} ${year}`;
        }
      }
    };

    this.title = {
      text: "Total: " + totalAmount,
      align: "center",
      style: {
        color: 'var(--color-text)'
      }
    };

    this.chartXAxis = {
      type: 'category',
      categories: days.map(day => day.toString()),
      tooltip: {
        enabled: false
      }
    };

    this.chartSeries = [{
      name: "Expenses",
      data: amounts
    }];
  }

  /**
   * Loads and processes expense data grouped by time for the current day.
   * @param expenses List of all expenses
   */
  loadDayData(expenses: Expense[]): void {
    const timeAmountMap = new Map<string, number>();
    const todayStr = `${this.currentDate.getFullYear()}-${(this.currentDate.getMonth() + 1).toString().padStart(2, '0')}-${this.currentDate.getDate().toString().padStart(2, '0')}`;

    const todaysExpenses = expenses.filter(exp => exp.date === todayStr);

    todaysExpenses.sort((a, b) => {
      const [aHours, aMinutes, aSeconds] = a.time.split(":").map(Number);
      const [bHours, bMinutes, bSeconds] = b.time.split(":").map(Number);

      if (aHours !== bHours) return aHours - bHours;
      if (aMinutes !== bMinutes) return aMinutes - bMinutes;
      return aSeconds - bSeconds;
    });


    // timeAmountMap.set("00:00:00", 0);
    let totalAmount = 0;
    todaysExpenses.forEach(item => {
      const [hour, minute, second] = item.time.split(":");
      const time = `${hour}:${minute}:${second}`;
      totalAmount += item.amount;
      timeAmountMap.set(time, item.amount);
    });

    const times = Array.from(timeAmountMap.keys());
    const amounts = times.map(time => timeAmountMap.get(time)!);

    this.tooltip = {
      shared: true,
      intersect: false,
      y: {
        formatter: (value: number) => {
          return `${value} ${this.userService.getValue<string>('currency')}`;
        }
      },
      x: {
        formatter: (value: any) => {
          const time = times[value - 1];
          return `Time: ${time}`;
        }
      }
    };

    this.title = {
      text: "Total Expenses: " + totalAmount,
      align: "center",
      style: {
        color: 'var(--color-text)'
      }
    };

    this.chartXAxis = {
      type: 'category',
      categories: times,
      tooltip: {
        enabled: false
      }
    };

    this.chartSeries = [{
      name: "Expenses",
      data: amounts
    }];
  }

  /**
   * Loads and processes expense data grouped by month for the current year.
   * @param expenses List of all expenses
   */
  loadYearData(expenses: Expense[]): void {
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const monthAmountMap = new Map<string, number>();
    const currentYear = this.currentDate.getFullYear();

    const currentYearExpenses = expenses.filter(item => {
      const [year] = item.date.split('-').map(Number);
      return year === currentYear;
    });

    let totalAmount = 0;
    currentYearExpenses.forEach(item => {
      const month = parseInt(item.date.split('-')[1]);
      totalAmount += item.amount;
      const monthName = monthNames[month - 1];
      monthAmountMap.set(monthName, (monthAmountMap.get(monthName) || 0) + item.amount);
    });

    const months = Array.from(monthAmountMap.keys()).reverse();
    const amounts = months.map(month => monthAmountMap.get(month)!);

    this.tooltip = {
      shared: true,
      intersect: false,
      y: {
        formatter: (value: number) => `${value} ${this.userService.getValue<string>('currency')}`
      },
      x: {
        formatter: (_value: any) => {
          const fullNames = ["January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"];
          return `Month: ${fullNames[_value - 1]}`;
        }
      }
    };

    this.title = {
      text: "Total: " + totalAmount,
      align: "center",
      style: { color: 'var(--color-text)' }
    };

    this.chartXAxis = {
      type: 'category',
      categories: months,
      tooltip: { enabled: false }
    };

    this.chartSeries = [{
      name: "Expenses",
      data: amounts
    }];
  }
}
