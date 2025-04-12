import { addFormReset, loadCategory } from './addSection.js';
import { loadDashboardData } from './homeSection.js';
import { renderCalendar } from './calenderSection.js';
import { listSection } from './listSection.js';
import { syncExpensesWithSchema, syncSettingsWithSchema, syncBudgetWithSchema, syncCustomCategoriesWithSchema } from './localStorage/storage.js';

document.addEventListener("DOMContentLoaded", () => {
  loadDashboardData();
  syncExpensesWithSchema();
  syncSettingsWithSchema();
  syncCustomCategoriesWithSchema();
  syncBudgetWithSchema();
});

window.showSection = (id) => {
  // Hide all sections
  document.querySelectorAll(".section").forEach((section) => {
    section.classList.add("hidden");
  });

  // Show selected section
  document.getElementById(id).classList.remove("hidden");
  if (id === "list") {
    listSection();
  }
  else if (id === "home") {
    loadDashboardData();
  }
  else if (id === "add") {
    addFormReset();
    loadCategory();
  }
  else if (id === "calendar") {
    let currentMonth = new Date().getMonth();
    let currentYear = new Date().getFullYear();
    renderCalendar(currentYear, currentMonth);
  }
  // On mobile, close the sidebar after selection
  const sidebar = document.getElementById("sidebar");
  const menuToggle = document.getElementById("menuToggle");

  if (window.innerWidth < 768) {
    sidebar.classList.add("hidden");
    menuToggle.classList.remove("hidden");
  }
};

window.showToast = (message, type = 'success') => {
  const toastContainer = document.getElementById('toast-container');

  // Remove any existing toasts immediately
  toastContainer.innerHTML = '';

  const typeClasses = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    info: 'bg-blue-500',
    warning: 'bg-yellow-500 text-black',
  };

  const toast = document.createElement('div');
  toast.className = `
    flex items-center justify-between max-w-xs w-full p-4 rounded shadow-lg
    text-white dark:text-white
    ${typeClasses[type] || typeClasses.success}
    animate-fade-in
  `;

  toast.innerHTML = `
    <span>${message}</span>
    <button class="ml-4 font-bold focus:outline-none" onclick="this.parentElement.remove()">&times;</button>
  `;

  toastContainer.appendChild(toast);

  // Auto-remove after 5 seconds
  setTimeout(() => {
    toast.remove();
  }, 5000);
};

window.toggleSidebar = () => {
  const sidebar = document.getElementById("sidebar");
  const isHidden = sidebar.classList.contains("hidden");

  if (isHidden) {
    sidebar.classList.remove("hidden");
    document.body.dataset.sidebarOpen = "true";

    // Allow time for sidebar to fully open before listening for outside clicks
    setTimeout(() => {
      document.addEventListener("click", handleOutsideClick);
    }, 10);
  } else {
    sidebar.classList.add("hidden");
    document.body.dataset.sidebarOpen = "false";
    document.removeEventListener("click", handleOutsideClick);
  }
};

function handleOutsideClick(event) {
  const sidebar = document.getElementById("sidebar");
  const menuToggle = document.getElementById("menuToggle");

  // Only apply on mobile
  if (window.innerWidth >= 768) return;

  if (!sidebar.contains(event.target) && !menuToggle.contains(event.target)) {
    closeSidebar();
  }

}

function closeSidebar() {
  const sidebar = document.getElementById("sidebar");
  sidebar.classList.add("hidden");
  document.body.dataset.sidebarOpen = "false";
  document.removeEventListener("click", handleOutsideClick);
}
