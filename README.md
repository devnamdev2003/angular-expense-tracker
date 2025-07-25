# [📘 Expense Tracker](https://exwise.vercel.app/)

>### Expense Wisely – Where Your Money Stops Playing Hide and Seek!

## 📌 Overview

**Expense Tracker** is a mobile-first financial management application designed to help users easily track their daily and monthly expenses. The application emphasizes a user-friendly UI/UX tailored specifically for smartphones, allowing seamless personal finance management on the go.

This application leverages **Angular** as the frontend framework and **Tailwind CSS** for responsive and modern UI styling. All user data is stored in **LocalStorage**, making the app lightweight and independent of backend dependencies.

---

## 🧰 Tech Stack

| Technology   | Purpose                    |
| ------------ | -------------------------- |
| Angular      | Frontend application logic |
| Tailwind CSS | Styling and responsive UI  |
| LocalStorage | Persistent data storage    |

---

## 📱 Features & Functionality

### 1. **Dashboard View**

* Upon launch, users are greeted with two interactive graphs:

  * **Expense Graph (Toggle: Monthly / Daily)**: Displays a line graph representing user expenses over time. Users can switch between **Monthly** and **Daily** views.
  * **Category-wise Pie Chart**: Visualizes how the expenses are distributed across different categories (e.g., Food, Travel, Shopping).

---

### 2. **Add Expense View**

Allows users to add new expense entries through a form. Input fields include:

* 💰 **Amount**
* 📅 **Date & Time**
* 🏷️ **Category** (chosen from a dropdown list)
* 💳 **Payment Mode**
* 📍 **Location**
* 📝 **Note**

All expenses are stored in the device's **LocalStorage** and reflected immediately in graphs and listings.

---

### 3. **Calendar View**

* Users can view a **monthly calendar** to explore expenses on specific dates.
* Tap any date to open a **popup modal** displaying all expenses for that day.
* Navigate across **months and years** to view past or future expenses.

---

### 4. **List View**

* Displays all user expenses in a scrollable, and sortable list.
* Users can:

  * 🧾 **Sort** expenses by date, amount, or category.
  * 🔍 **Filter** by category, date, and payment mode.
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

* 🎨 **Theme Mode Toggle** (Dark / Light)
* ⬇️ **Download Data** (export expenses data)
* 📤 **Import Data** (upload expense data)
* ➕ **Add Category** (custom categories for better organization)
* ❌ **Delete Category** (remove unused or incorrect categories)

---

## 📱 Mobile-First Design

* The application is specifically designed for **mobile devices**.
* Features responsive components, intuitive touch controls, and visually appealing UI optimized for small screens.
* Not intended for laptop or desktop usage.

---

## 🗃️ Data Storage

All user data is stored using the **browser’s LocalStorage API**, ensuring:

* ✅ No need for a backend or server
* ⚡ Fast read/write operations
* 🔒 Data stays on the user's device for privacy and control

---

## 📈 User Flow Summary

1. **Launch App** → View Expense Graphs (Toggle between Month/Day).
2. **Add Expenses** via the **+** tab.
3. Navigate to:

   * **Calendar** to view per-date expenses.
   * **List** for detailed log and search/filter options.
   * **Budget** to monitor spending.
   * **Settings** for customization.

## 📄 Code Documentation

For developers and contributors, detailed code-level documentation is available here:  
👉 [Documentation](https://devnamdev2003.github.io/ExpenseWise/documentation/)
