import { addFormReset, loadCategory } from './addSection.js';
import { loadDashboardData } from './homeSection.js';
import { renderCalendar } from './calenderSection.js';
import { listSection } from './listSection.js';
import { syncExpensesWithSchema, syncSettingsWithSchema, syncBudgetWithSchema } from './localStorage/storage.js';

document.addEventListener("DOMContentLoaded", () => {
  loadDashboardData();
  syncExpensesWithSchema();
  syncSettingsWithSchema();
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

window.toggleSidebar = () => {
  const sidebar = document.getElementById("sidebar");
  const isHidden = sidebar.classList.contains("hidden");

  if (isHidden) {
    sidebar.classList.remove("hidden");
  } else {
    sidebar.classList.add("hidden");
  }
};

window.showToast = (message, type = 'success') => {
  const toastContainer = document.getElementById('toast-container');

  const toast = document.createElement('div');
  toast.className = `
      flex items-center justify-between max-w-xs w-full p-4 rounded shadow-lg text-white
      ${type === 'success' ? 'bg-green-500' : 'bg-red-500'}
      animate-fade-in
  `;

  toast.innerHTML = `
      <span>${message}</span>
      <button class="ml-4 text-white focus:outline-none" onclick="this.parentElement.remove()">&times;</button>
  `;

  toastContainer.appendChild(toast);

  // Auto-remove after 3 seconds
  setTimeout(() => {
    toast.remove();
  }, 5000);
}
