/** Predefined categories for the application */
export const HelpData = [
    { id: 101, category: "Getting Started", question: "What is Expense Wise?", answer: "Expense Wise is a mobile-first financial management app designed to help you track daily and monthly expenses. It uses Angular and Tailwind CSS for a fast, responsive experience." },
    { id: 102, category: "Getting Started", question: "Is my data private?", answer: "Yes. All data is stored in your device's <strong>LocalStorage</strong> by default. This means we don't see your financial data unless you explicitly enable cloud backup." },
    { id: 103, category: "Getting Started", question: "Can I use it on Desktop?", answer: "The app is designed 'Mobile-First' for optimal use on smartphones. However, it works on laptops as a Progressive Web App (PWA), though the layout remains narrow." },
    { id: 104, category: "Getting Started", question: "How do I install the app?", answer: "You can <a href='https://github.com/devnamdev2003/angular-expense-tracker/raw/refs/heads/main/exwise.apk' class='text-indigo-600 hover:underline'>download the APK</a> from our website or use the 'Add to Home Screen' feature in your browser to install it as a PWA." },
    { id: 105, category: "Getting Started", question: "Do I need to sign up before using the app?", answer: "No sign-up is required for basic usage. You can start adding expenses immediately with local storage. Optional cloud features may require internet access." },
    { id: 106, category: "Getting Started", question: "How do I quickly find help topics?", answer: "Use the search box at the top of this page. You can type words like <strong>budget</strong>, <strong>calendar</strong>, or <strong>export</strong> to instantly filter questions across all categories." },
    { id: 201, category: "Features", question: "Discrete vs. Cumulative Graphs", answer: "<strong>Discrete</strong> shows spending for individual periods (e.g., just Monday's cost). <strong>Cumulative</strong> adds them up over time (e.g., Monday + Tuesday), showing your total spending trend." },
    { id: 202, category: "Features", question: "What does the Pie Chart show?", answer: "The Pie Chart visualizes your expenses split by Category (e.g., Food, Travel). It helps you identify where most of your money goes." },
    { id: 301, category: "Features", question: "How do I add an expense?", answer: "Tap the <strong>+ (Plus)</strong> button. Enter Amount, Date, Category, and Payment Mode. You can also add a location or mark it as 'Extra Spending' to separate it from regular bills." },
    { id: 302, category: "Features", question: "What is 'Extra Spending'?", answer: "This is a checkbox to mark non-essential or one-time large expenses. You can later filter these out in the List View to see your core living costs." },
    { id: 303, category: "Features", question: "Can I edit or delete an existing expense?", answer: "Yes. Open the <strong>List View</strong>, select the entry you want to change, then use edit or delete actions. Changes are saved instantly and reflected in charts, stats, and calendar views." },
    { id: 304, category: "Features", question: "How do filters in List View work?", answer: "You can filter by date range, category, payment mode, and extra-spending flag. Combine filters to audit specific periods, such as 'weekend food expenses' or 'UPI payments this month'." },
    { id: 401, category: "Features", question: "How does the Calendar Heatmap work?", answer: "The heatmap colors days based on spending: <br>• <span class='text-emerald-600 font-bold'>Green</span>: Low spending<br>• <span class='text-amber-600 font-bold'>Yellow</span>: Moderate<br>• <span class='text-rose-600 font-bold'>Red</span>: High spending." },
    { id: 402, category: "Features", question: "Can I change Heatmap thresholds?", answer: "Yes. In Calendar view, click the summary table's <strong>Edit</strong> button. You can manually set the rupee limits for Red/Yellow/Green or use 'Auto' to base it on your daily budget." },
    { id: 403, category: "Features", question: "What is Salary / Income tracking used for?", answer: "Salary tracking lets you record your monthly income and compare it against spending. This powers savings insights, budget planning, and better month-end financial review." },
    { id: 501, category: "Budgeting", question: "How is 'Suggested/Day' calculated?", answer: "This is a smart metric. It takes your remaining budget and divides it by the days left in the month. If you overspend today, your suggested daily amount for tomorrow drops." },
    { id: 502, category: "Budgeting", question: "What do the progress bar colors mean?", answer: "• <strong>Green/Indigo:</strong> You have spent less than 50% of your budget.<br>• <strong>Orange:</strong> You are between 50% and 90%.<br>• <strong>Red:</strong> You have exceeded 90% or the total limit." },
    { id: 503, category: "Budgeting", question: "Income Tracking vs Budget Tracking", answer: "<strong>Income Tracking</strong> focuses on total earnings and savings rate. <strong>Budget Tracking</strong> is stricter, focusing on limiting expenses within a set monthly cap." },
    { id: 504, category: "Budgeting", question: "What happens if I cross my monthly budget?", answer: "When spending exceeds your target, the UI moves into warning state (red indicators), and suggested/day becomes stricter. This helps you slow down spend in the remaining days." },
    { id: 505, category: "Budgeting", question: "Can I change my budget in the middle of the month?", answer: "Yes. Update your budget in the budget/settings controls anytime. All dashboards recalculate instantly using the new limit and your current month spending." },
    { id: 601, category: "Data & Settings", question: "How do I backup my data?", answer: "Go to Settings > Data Backup. You can enable automatic cloud sync or manually trigger a backup to our secure database." },
    { id: 602, category: "Data & Settings", question: "Can I export my expenses?", answer: "Yes! In Settings, click <strong>Download Data</strong>. You can export as PDF, Excel (XLSX), or JSON. You can filter the export by date range." },
    { id: 603, category: "Data & Settings", question: "How do I create a custom category?", answer: "Go to Settings > Add Category. Enter the name (e.g., 'Gym', 'Pet') and save. It will immediately appear in your dropdowns." },
    { id: 604, category: "Data & Settings", question: "I deleted the app. Is my data gone?", answer: "If you did not enable Cloud Backup or Export your data, it is likely lost because LocalStorage is cleared when the app is uninstalled." },
    // { id: 605, category: "Data & Settings", question: "How can I reset all app data?", answer: "In Settings, use the reset/clear data option carefully. This removes local expenses, custom categories, and budget values. Export a backup first if you may need recovery." },
    { id: 606, category: "Data & Settings", question: "Why are my changes not visible across devices?", answer: "LocalStorage data stays on one device/browser profile. To sync between devices, enable cloud backup and restore the same account data on the second device." },
    { id: 607, category: "Data & Settings", question: "How do I contact support from inside the app?", answer: "Open this Help page and scroll to the contact form. Submit your name, email, and issue details. Our team uses that message to help you troubleshoot quickly." },
  { 
  id: 608, 
  category: "Data & Settings", 
  question: "What is Cloud Backup?", 
  answer: "Cloud Backup allows you to securely store your expense data online. This protects your data if you change devices, reinstall the app, or accidentally clear local storage." 
},
{ 
  id: 609, 
  category: "Data & Settings", 
  question: "How do I enable Auto Backup?", 
  answer: "Go to <strong>Settings → Cloud Backup</strong> and enable the <strong>Auto Backup</strong> toggle. Once enabled, your data will automatically sync to the cloud periodically." 
},
{ 
  id: 610, 
  category: "Data & Settings", 
  question: "What does Cloud Synchronization do?", 
  answer: "Cloud Synchronization manually uploads your current local data to the cloud instantly. Use it when you want an immediate backup before switching devices or reinstalling the app." 
},
{ 
  id: 611, 
  category: "Data & Settings", 
  question: "What is a Backup Key?", 
  answer: "The Backup Key is a secure unique key linked to your cloud data. You must keep it safe because it is required to restore your data later." 
},
{ 
  id: 612, 
  category: "Data & Settings", 
  question: "How do I restore my data from the cloud?", 
  answer: "Go to <strong>Settings → Cloud Backup → Restore from Backup Key</strong>, paste your backup key, and confirm. Your current local data will be replaced with the backed-up cloud data." 
},
{ 
  id: 613, 
  category: "Data & Settings", 
  question: "Will restoring data delete my current data?", 
  answer: "Yes. Restoring replaces your current local data with cloud backup data. The app performs validation and keeps a temporary rollback copy for safety in case restoration fails." 
},
{ 
  id: 614, 
  category: "Data & Settings", 
  question: "Is Cloud Backup secure?", 
  answer: "Yes. Your data is linked with a secure backup key. Only someone with this key can restore the data, so keep it private and safe." 
}
];
