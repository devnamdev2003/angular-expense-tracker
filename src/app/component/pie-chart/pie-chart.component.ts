import { Component, Input, OnInit, OnChanges, SimpleChanges, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CategoryService, Category } from '../../service/localStorage/category.service';
import { ExpenseService, Expense } from '../../service/localStorage/expense.service';
declare const Chart: any;
import { UserService } from '../../service/localStorage/user.service';

@Component({
  selector: 'app-pie-chart',
  templateUrl: './pie-chart.component.html',
  styleUrls: ['./pie-chart.component.css'],
  standalone: true,
})
export class PieChartComponent implements OnInit, OnChanges, AfterViewInit {
  isDarkMode: boolean = false;
  categoryMap: any = {};
  categories: Category[] = []
  expenses: Expense[] = [];
  charts: { [key: string]: any } = {};
  categoryColors: { [key: string]: string } = {};


  @ViewChild('categoryCanvas', { static: false }) canvasRef!: ElementRef<HTMLCanvasElement>;
  @Input() viewType: 'month' | 'day' = 'month';
  @Input() currentDate!: Date;

  constructor(
    private categoryService: CategoryService,
    private expenseService: ExpenseService,
    private userService: UserService,
  ) { }

  ngOnInit(): void {
    const userTheme = this.userService.getValue<string>('theme_mode');
    this.isDarkMode = userTheme === 'dark';
    this.categories = this.categoryService.getAll();
    this.expenses = this.expenseService.getAll();
    this.categories.forEach((cat) => {
      this.categoryMap[cat.category_id] = cat.name;
    });
    this.categories.forEach(cat => {
      this.categoryColors[cat.name] = cat.color;
    });
  }

  ngAfterViewInit(): void {
    this.loadData();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['viewType'] || changes['currentDate']) {
      this.loadData();
    }
  }

  loadData(): void {
    if (this.viewType === 'month') {
      this.loadMonthData();
    } else {
      this.loadDayData();
    }
  }

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
      label: "Expenses by Category",
      backgroundColors: Object.keys(categoryTotals).map(cat => this.categoryColors[cat] || "#ccc")
    });
  }

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
      label: "Expenses by Category",
      backgroundColors: Object.keys(categoryTotals).map(cat => this.categoryColors[cat] || "#ccc")
    });
  }

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
      this.charts[id] = new Chart(ctx, {
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
                  return `${context.dataset.label}: ₹${value.toLocaleString("en-IN", {
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