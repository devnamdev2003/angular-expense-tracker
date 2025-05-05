import { Component, AfterViewInit, Input } from '@angular/core';
import { CategoryService, Category } from '../../service/localStorage/category.service';
import { ExpenseService, Expense } from '../../service/localStorage/expense.service';
declare const Chart: any;

import { isPlatformBrowser } from '@angular/common';
import { Inject, PLATFORM_ID } from '@angular/core';

@Component({
  selector: 'app-pie-chart',
  templateUrl: './pie-chart.component.html',
  styleUrls: ['./pie-chart.component.css'],
  standalone: true,
})
export class PieChartComponent implements AfterViewInit {

  categoryMap: any = {};
  categories: Category[] = []
  expenses: Expense[] = [];

  constructor(
    private categoryService: CategoryService,
    private expenseService: ExpenseService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.categories = this.categoryService.getAll();
    this.expenses = this.expenseService.getAll();
  }


  charts: { [key: string]: any } = {};

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.renderCategoryChart();
    }
  }

  renderCategoryChart() {

    this.categories.forEach((cat) => {
      this.categoryMap[cat.category_id] = cat.name;
    });
    const categoryTotals: { [key: string]: number } = {};
    const categoryColors: { [key: string]: string } = {};

    this.categories.forEach(cat => {
      categoryColors[cat.name] = cat.color;
    });


    this.expenses.forEach(expense => {
      const catName = this.categoryMap[expense.category_id] || "Other";
      categoryTotals[catName] = (categoryTotals[catName] || 0) + expense.amount;
    });

    this.renderChart("categoryChart", "doughnut", {
      labels: Object.keys(categoryTotals),
      data: Object.values(categoryTotals),
      label: "Expenses by Category",
      backgroundColors: Object.keys(categoryTotals).map(cat => categoryColors[cat] || "#ccc")
    });
  }

  renderChart(id: string, type: string, { labels, data, label, backgroundColors, borderColor }: any) {
    const ctx = (document.getElementById(id) as HTMLCanvasElement).getContext("2d");
    const isDarkMode = document.documentElement.classList.contains("dark");

    if (this.charts[id]) {
      this.charts[id].destroy();
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
              color: isDarkMode ? "#fff" : "#111"
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
              color: isDarkMode ? "#ddd" : "#111"
            }
          },
          y: {
            beginAtZero: true,
            ticks: {
              color: isDarkMode ? "#ddd" : "#111"
            }
          }
        } : {}
      }
    });
  }
}
