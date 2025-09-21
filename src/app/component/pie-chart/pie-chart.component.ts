import { Component, Input, OnInit, OnChanges, SimpleChanges, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CategoryService, Category } from '../../service/localStorage/category.service';
import { ExpenseService, Expense } from '../../service/localStorage/expense.service';
import { UserService } from '../../service/localStorage/user.service';

/** Chart.js instance */
declare const Chart: any;

/**
 * Component to render a pie/doughnut chart of expenses by category.
 * Supports monthly, daily, and yearly views.
 */
@Component({
  selector: 'app-pie-chart',
  templateUrl: './pie-chart.component.html',
  styleUrls: ['./pie-chart.component.css'],
  standalone: true,
})
export class PieChartComponent implements OnInit, OnChanges, AfterViewInit {

  /** Dark mode flag from user settings */
  isDarkMode: boolean = false;

  /** Map of category_id to category name */
  categoryMap: any = {};

  /** List of all categories */
  categories: Category[] = [];

  /** List of all expenses */
  expenses: Expense[] = [];

  /** Chart instances keyed by chart ID */
  charts: { [key: string]: any } = {};

  /** Map of category name to its color */
  categoryColors: { [key: string]: string } = {};

  /** User-selected currency */
  currency: string | null;

  /** Reference to the canvas element for Chart.js */
  @ViewChild('categoryCanvas', { static: false }) canvasRef!: ElementRef<HTMLCanvasElement>;

  /** View type: 'month' | 'day' | 'year' */
  @Input() viewType: 'month' | 'day' | 'year' = 'month';

  /** Current date to filter expenses */
  @Input() currentDate!: Date;

  /**
   * Constructor to inject required services.
   * @param categoryService Service to get category data
   * @param expenseService Service to get expense data
   * @param userService Service to get user preferences
   */
  constructor(
    private categoryService: CategoryService,
    private expenseService: ExpenseService,
    private userService: UserService,
  ) {
    this.currency = this.userService.getValue<string>('currency');
  }

  /**
   * Lifecycle hook runs on component init.
   * Initializes theme, categories, expenses, and category mapping.
   */
  ngOnInit(): void {
    const userTheme = this.userService.getValue<string>('theme_mode');
    this.isDarkMode = userTheme === 'dark';
    this.categories = this.categoryService.getAll();
    this.expenses = this.expenseService.getAll();

    this.categories.forEach((cat) => {
      this.categoryMap[cat.category_id] = cat.name;
      this.categoryColors[cat.name] = cat.color;
    });
  }

  /**
   * Lifecycle hook after view initialization.
   * Loads chart data after canvas element is available.
   */
  ngAfterViewInit(): void {
    this.loadData();
  }

  /**
   * Lifecycle hook for input changes.
   * Reloads chart if viewType or currentDate changes.
   * @param changes Object containing changed inputs
   */
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['viewType'] || changes['currentDate']) {
      this.loadData();
    }
  }

  /** Loads chart data based on the selected view type */
  loadData(): void {
    if (typeof window !== 'undefined' && (window as any).Chart) {
      if (this.viewType === 'month') {
        this.loadMonthData();
      } else if (this.viewType === 'year') {
        this.loadYearData();
      } else if (this.viewType === 'day') {
        this.loadDayData();
      }
    } else {
      console.error("Chart.js is not loaded properly.");
    }
  }

  /** Aggregates and renders monthly expense data */
  loadMonthData(): void {
    const categoryTotals: { [key: string]: number } = {};
    const currentYear = this.currentDate.getFullYear();
    const currentMonth = this.currentDate.getMonth() + 1;

    const currentMonthExpenses = this.expenses.filter(item => {
      const [year, month] = item.date.split('-').map(Number);
      return year === currentYear && month === currentMonth;
    });

    currentMonthExpenses.forEach(item => {
      const catName = this.categoryMap[item.category_id] || "Other";
      categoryTotals[catName] = (categoryTotals[catName] || 0) + item.amount;
    });

    this.renderChart("categoryChart", "doughnut", {
      labels: Object.keys(categoryTotals),
      data: Object.values(categoryTotals),
      label: "Amount: " + this.currency,
      backgroundColors: Object.keys(categoryTotals).map(cat => this.categoryColors[cat] || "#ccc")
    });
  }

  /** Aggregates and renders daily expense data */
  loadDayData(): void {
    const categoryTotals: { [key: string]: number } = {};
    const todayStr = `${this.currentDate.getFullYear()}-${(this.currentDate.getMonth() + 1).toString().padStart(2, '0')}-${this.currentDate.getDate().toString().padStart(2, '0')}`;

    const todaysExpenses = this.expenses.filter(exp => exp.date === todayStr);

    todaysExpenses.forEach(item => {
      const catName = this.categoryMap[item.category_id] || "Other";
      categoryTotals[catName] = (categoryTotals[catName] || 0) + item.amount;
    });

    this.renderChart("categoryChart", "doughnut", {
      labels: Object.keys(categoryTotals),
      data: Object.values(categoryTotals),
      label: "Amount: " + this.currency,
      backgroundColors: Object.keys(categoryTotals).map(cat => this.categoryColors[cat] || "#ccc")
    });
  }

  /** Aggregates and renders yearly expense data */
  loadYearData(): void {
    const categoryTotals: { [key: string]: number } = {};
    const currentYear = this.currentDate.getFullYear();

    const currentYearExpenses = this.expenses.filter(item => {
      const [year] = item.date.split('-').map(Number);
      return year === currentYear;
    });

    currentYearExpenses.forEach(item => {
      const catName = this.categoryMap[item.category_id] || "Other";
      categoryTotals[catName] = (categoryTotals[catName] || 0) + item.amount;
    });

    this.renderChart("categoryChart", "doughnut", {
      labels: Object.keys(categoryTotals),
      data: Object.values(categoryTotals),
      label: "Amount: " + this.currency,
      backgroundColors: Object.keys(categoryTotals).map(cat => this.categoryColors[cat] || "#ccc")
    });
  }

  /**
   * Renders a Chart.js chart
   * @param id Chart ID
   * @param type Chart type ('doughnut', 'line', 'bar', etc.)
   * @param config Chart configuration containing labels, data, colors, etc.
   */
  renderChart(id: string, type: string, { labels, data, label, backgroundColors, borderColor }: any) {
    const ctx = this.canvasRef?.nativeElement.getContext('2d');
    if (!ctx) return;

    if (this.charts[id]) {
      this.charts[id].destroy();
      delete this.charts[id];
    }

    const datasetConfig: any = {
      label: label,
      data: data,
      backgroundColor: backgroundColors,
      borderColor: borderColor || backgroundColors,
      borderWidth: 1
    };

    if (type === "line") {
      datasetConfig.fill = false;
      datasetConfig.tension = 0.3;
    }

    try {
      (window as any).Chart = (window as any).Chart || Chart;
      this.charts[id] = new (window as any).Chart(ctx, {
        type: type,
        data: {
          labels: labels,
          datasets: [datasetConfig]
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              position: type === "bar" || type === "line" ? "top" : "bottom",
              labels: {
                color: this.isDarkMode ? "#fff" : "#111"
              }
            },
            title: {
              display: false
            },
            tooltip: {
              callbacks: {
                label: function (context: any) {
                  let value = context.parsed.y !== undefined ? context.parsed.y : context.parsed;
                  return `${context.dataset.label}${value.toLocaleString("en-IN", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  })}`;
                }
              }
            }
          },
          scales: type === "bar" || type === "line" ? {
            x: {
              ticks: {
                color: this.isDarkMode ? "#ddd" : "#111"
              }
            },
            y: {
              beginAtZero: true,
              ticks: {
                color: this.isDarkMode ? "#ddd" : "#111"
              }
            }
          } : {}
        }
      });
    } catch (error) {
      console.error("Error rendering chart:", error);
    }
  }
}
