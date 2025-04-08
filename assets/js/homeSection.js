import { ExpenseService } from './localStorage/expenseLocal.js';
import { CategoryService } from './localStorage/categoryLocal.js';

let charts = {};

function loadDashboardData() {
    try {
        const expenses = ExpenseService.getAll();
        const categories = CategoryService.getAll();
        console.log(expenses, categories);
        const categoryMap = {};
        categories.forEach((cat) => {
            categoryMap[cat.category_id] = cat.name;
        });

        // Daily Expenses - Today Only
        const today = new Date();
        const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

        const todayTotals = {};

        expenses.forEach(exp => {
            const expDate = new Date(exp.date);
            const expKey = `${expDate.getFullYear()}-${String(expDate.getMonth() + 1).padStart(2, '0')}-${String(expDate.getDate()).padStart(2, '0')}`;

            if (expKey === todayKey) {
                const formattedTime = exp.time ? `${exp.time.split(":")[0]}:${exp.time.split(":")[1]}:${exp.time.split(":")[2]}` : "Unknown";
                todayTotals[formattedTime] = (todayTotals[formattedTime] || 0) + parseFloat(exp.amount);
            }
        });

        renderChart("dailyChart", "bar", {
            labels: Object.keys(todayTotals),
            data: Object.values(todayTotals),
            label: "Today's Spending",
            borderColor: "#3498db",
            backgroundColors: ["#3498db"]
        });
        // Last 7 Days Spending
        const last7DaysTotals = {};

        // Generate last 7 dates in reverse (oldest to newest)
        for (let i = 6; i >= 0; i--) {
            const d = new Date(today);
            d.setDate(today.getDate() - i);
            const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
            last7DaysTotals[key] = 0;
        }

        expenses.forEach(exp => {
            const date = new Date(exp.date);
            const formattedDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
            if (formattedDate in last7DaysTotals) {
                last7DaysTotals[formattedDate] += parseFloat(exp.amount);
            }
        });

        renderChart("last7DaysChart", "bar", {
            labels: Object.keys(last7DaysTotals),
            data: Object.values(last7DaysTotals),
            label: "Last 7 Days Spending",
            borderColor: "#8e44ad",
            backgroundColors: "#8e44ad"
        });

        //  Category-wise Totals
        const categoryTotals = {};
        const categoryColors = {};
        categories.forEach(cat => {
            categoryColors[cat.name] = cat.color;
        });

        expenses.forEach((expense) => {
            const catName = categoryMap[expense.category_id] || "Other";
            categoryTotals[catName] = (categoryTotals[catName] || 0) + parseFloat(expense.amount);
        });

        renderChart("categoryChart", "doughnut", {
            labels: Object.keys(categoryTotals),
            data: Object.values(categoryTotals),
            label: "Expenses by Category",
            backgroundColors: Object.keys(categoryTotals).map(cat => categoryColors[cat] || "#ccc")
        });



        // Monthly Spending - Last 12 Months
        const monthlyTotals = {};

        // Aggregate totals by YYYY-MM
        expenses.forEach(exp => {
            const date = new Date(exp.date);
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
            monthlyTotals[monthKey] = (monthlyTotals[monthKey] || 0) + parseFloat(exp.amount);
        });

        // Sort the keys (months) chronologically
        const sortedMonths = Object.keys(monthlyTotals).sort((a, b) => new Date(a) - new Date(b));

        // Take only the last 12 months
        const last12Months = sortedMonths.slice(-12);

        // Extract data for those months
        const last12Data = last12Months.map(month => monthlyTotals[month]);

        renderChart("monthlyChart", "bar", {
            labels: last12Months,
            data: last12Data,
            label: "Monthly Spending (Last 12 Months)",
            backgroundColors: "#1abc9c"
        });




    } catch (error) {
        console.error("Failed to load dashboard:", error);
    }
}

function renderChart(id, type, { labels, data, label, backgroundColors, borderColor }) {
    const ctx = document.getElementById(id).getContext("2d");

    // Detect dark mode
    const isDarkMode = document.documentElement.classList.contains("dark");

    // Destroy previous chart instance if exists
    if (charts[id]) {
        charts[id].destroy();
    }

    const datasetConfig = {
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

    charts[id] = new Chart(ctx, {
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
                        label: function (context) {
                            let label = context.dataset.label || "";
                            let value = context.parsed.y !== undefined ? context.parsed.y : context.parsed;

                            return `${label}: ₹${value.toLocaleString("en-IN", {
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

export { loadDashboardData };