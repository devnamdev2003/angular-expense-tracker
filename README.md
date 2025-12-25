# [📘 Expense Tracker](https://exwise.vercel.app/)

> ### Expense Wisely – Where Your Money Stops Playing Hide and Seek!

## 📌 Overview

**Expense Tracker** is a mobile-first financial management application designed to help users easily track their daily and monthly expenses. The application emphasizes a user-friendly UI/UX tailored specifically for smartphones, allowing seamless personal finance management on the go.

This application leverages **Angular** as the frontend framework and **Tailwind CSS** for responsive and modern UI styling. All user data is stored in **LocalStorage**, making the app lightweight and independent of backend dependencies.

---

<a href="https://github.com/devnamdev2003/angular-expense-tracker/raw/refs/heads/main/exwise.apk">⬇️ Download APK</a> | <a href="https://exwise.vercel.app/">🌐 Live Demo</a> | <a href="https://github.com/devnamdev2003/angular-expense-tracker">🔗 GitHub</a> | <a href="https://exwisedoc.vercel.app/">📄 Code Documentation</a>

---

## 🧰 Tech Stack

| Technology           | Purpose                         |
| -------------------- | ------------------------------- |
| Angular              | Frontend application logic      |
| Tailwind CSS         | Styling and responsive UI       |
| LocalStorage         | Persistent data storage         |
| Django               | Backend api logic               |

---

## 📱 Features & Functionality

### 1. **Dashboard View**

* Upon launch, users are greeted with two interactive graphs:
  * **Expense Graph**:
    - Displays a line graph representing user expenses over time.
    - Supports multiple **time-based views**:
      - **Daily** – View expenses for individual days.
      - **Monthly** – View month-wise expense distribution.
      - **Yearly** – View yearly expense trends.
    - Includes a **graph representation toggle**:
      - **Discrete (discrete values)** – Shows period-wise expense values.
      - **Cumulative** – Shows a running total of expenses over time, useful for understanding overall spending growth.
    - Graph updates dynamically based on the selected time range and graph mode.
  * **Category-wise Pie Chart**: Visualizes how the expenses are distributed across different categories (e.g., Food, Travel, Shopping).

---

### 2. **Add Expense View**

Allows users to add new expense entries through a form. Input fields include:

* 💰 **Amount**
* 📅 **Date & Time**
* 🏷️ **Category** (chosen from a dropdown list)
* 💳 **Payment Mode**
* 📍 **Location** (chosen from a dropdown list or manually typed)
* 📝 **Note** (chosen from a dropdown list or manually typed)
* 💡 **Extra Spending**

All expenses are stored in the device's **LocalStorage** and reflected immediately in graphs and listings.

---

### 3. **Calendar View**

* Users can view a **monthly calendar** to explore expenses on specific dates.
* Tap any date to open a **popup modal** displaying all expenses for that day.
* Navigate across **months and years** to view past or future expenses.
* Toggle the Show HeatMap switch to highlight each day based on spending intensity.
  * Days are color-coded based on spending thresholds (e.g. No expense, < threshold, between thresholds, > threshold) for quick insights.
  * Users can now **customize the threshold amounts** for each heatmap color:
    * **Red (Rose)** – default  > ₹1000
    * **Yellow (Amber)** – default ₹500 - 1000
    * **Green (Emerald)** – default < ₹500
  * A **summary table** displays each color, the number of days, the total expense, and an **Edit button** for updating the thresholds.
    * Editing allows users to set a new amount for the corresponding color, immediately updating the heatmap visualization.
  * Additionally, users can enable a radio option to automatically set threshold values based on their budget, where
    * Rose represents the average spent per day amount.
    * Emerald represents the suggested spending per day amount.

---

### 4. **List View**

* Displays all user expenses in a scrollable, and sortable list.
* Users can:

  * 🔍 **Search** expenses quickly by typing keywords (category, note, or payment mode).
  * 🧾 **Sort** expenses by date, amount, or category.
  * 🎯 **Filter** by category, date, extra spending, and payment mode.
  * 🖱️ Tap any entry to open a **modal** with complete details and options to **edit** or **delete** the expense.

---

### 5. **Budget View**

* Users can define a **budget range** by selecting a **start** and **end date**.
* Once a budget is set:

  * A **progress bar** visually represents how much of the budget has been spent.
  * Informative summary boxes display:

    * **Avg Allowed/Day**
    * **Spent/Day**
    * **Suggested/Day** (based on remaining budget and days)
  * Users have the ability to **edit** or **delete** the budget for better flexibility and control.

---

### 6. **Settings View**

Provides customization and utility options for better personalization:

* 🎨 **Theme Mode Toggle**  — Dark / Light
* ⬇️ **Download Data**  —  Export your expenses in **PDF**, **JSON**, or **Excel** formats between the selected date range. Users can also choose **All Data** to export all expense records.
* 📤 **Import Data** — Upload expense data.
* 🔄 **Update App** — Update the application to the latest release.
* ➕ **Add Category** — Create custom categories for better organization.
* ✏️ **Edit Category** — Modify existing categories.
* ❌ **Delete Category** — Remove unused or incorrect categories.

---

## 📱 Mobile-First Design

* The application is specifically designed for **mobile devices**.
* Features responsive components, intuitive touch controls, and visually appealing UI optimized for small screens.
* Not intended for laptop or desktop usage (though it works as PWA).

---

## 🗃️ Data Storage

All user data is stored using the **browser’s LocalStorage API**, ensuring:

* ✅ No need for a backend or server
* ⚡ Fast read/write operations
* 🔒 Data stays on the user's device for privacy and control

---

## 📈 User Flow Summary

1. **Launch App** → View Expense Graphs (Toggle between Month/Day).
2. **Add Expenses** via the ➕ tab.
3. Navigate to:

   * **Calendar** to view per-date expenses.
   * **List** for detailed log with **search, filter, and sort** options.
   * **Budget** to monitor spending.
   * **Settings** for customization.

---

## 📄 Code Documentation

For developers and contributors, detailed code-level documentation is available here:
👉 [Documentation](https://devnamdev2003.github.io/angular-expense-tracker/documentation/)

---

## 🖼️ Screenshots

<div style="
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 16px;
    justify-items: center;
    padding: 16px;
">
    <img src="https://exwise.vercel.app/assets/appScreenshot/home.jpg" alt="home" style="width: 200px; border-radius: 8px;">
    <img src="https://exwise.vercel.app/assets/appScreenshot/add.jpg" alt="add" style="width: 200px; border-radius: 8px;">
    <img src="https://exwise.vercel.app/assets/appScreenshot/calendar.jpg" alt="calendar" style="width: 200px; border-radius: 8px;">
    <img src="https://exwise.vercel.app/assets/appScreenshot/settings.jpg" alt="settings" style="width: 200px; border-radius: 8px;">
    <img src="https://exwise.vercel.app/assets/appScreenshot/budget.jpg" alt="budget" style="width: 200px; border-radius: 8px;">
    <img src="https://exwise.vercel.app/assets/appScreenshot/list.jpg" alt="list" style="width: 200px; border-radius: 8px;">
</div>
