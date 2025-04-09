import { CategoryService } from "./localStorage/categoryLocal.js";
import { BudgetService } from "./localStorage/budgetLocal.js";


const toggle = document.getElementById("modeToggle");

// Load theme from localStorage
const savedSettings = JSON.parse(localStorage.getItem("settings")) || {};
const savedTheme = savedSettings.themeMode || "light";

// Apply the saved theme
if (savedTheme === "dark") {
    document.documentElement.classList.add("dark");
    toggle.checked = true;
} else {
    document.documentElement.classList.remove("dark");
    toggle.checked = false;
}

// Theme toggle event
toggle.addEventListener("change", () => {
    const isDark = toggle.checked;
    document.documentElement.classList.toggle("dark", isDark);

    // Update localStorage
    const currentSettings = JSON.parse(localStorage.getItem("settings")) || {};
    currentSettings.themeMode = isDark ? "dark" : "light";
    localStorage.setItem("settings", JSON.stringify(currentSettings));
});


// Add Category Model
function showCategoryFormError(id, message) {
    const el = document.getElementById(id);
    el.textContent = message;
    el.classList.remove('hidden');
    setTimeout(() => el.classList.add('hidden'), 3000);
}

function clearFormAndErrors() {
    document.getElementById('catName').value = '';
    document.getElementById('catIcon').value = '';
    document.getElementById('catColor').value = '#000000';

    ['nameError', 'iconError', 'colorError'].forEach(id => {
        const el = document.getElementById(id);
        el.textContent = '';
        el.classList.add('hidden');
    });
}

window.closeCategoryModal = () => {
    document.getElementById('categoryModal').close();
    clearFormAndErrors();
}

window.addCategory = () => {
    const name = document.getElementById('catName').value.trim();
    const icon = document.getElementById('catIcon').value.trim();
    const color = document.getElementById('catColor').value;

    const categories = CategoryService.getAll();

    const nameExists = categories.some(c => c.name.toLowerCase() === name.toLowerCase());
    const iconExists = categories.some(c => c.icon === icon);
    const colorExists = categories.some(c => c.color.toLowerCase() === color.toLowerCase());

    let hasError = false;

    if (nameExists) {
        showCategoryFormError('nameError', 'This category name already exists.');
        hasError = true;
    }

    if (iconExists) {
        showCategoryFormError('iconError', 'This icon is already used.');
        hasError = true;
    }

    if (colorExists) {
        showCategoryFormError('colorError', 'This color is already used.');
        hasError = true;
    }

    if (hasError) return;

    const newCategory = {
        name,
        icon,
        color
    };

    CategoryService.add(newCategory);
    closeCategoryModal();
    showToast('Category added successfully!', 'success');
}

// Delete Category Modal 
window.closeDeleteCategoryModal = () => {
    document.getElementById('deleteCategoryModal').close();
    document.getElementById('deleteCatName').value = '';
    document.getElementById('deleteError').textContent = '';
    document.getElementById('deleteError').classList.add('hidden');
}

function showDeleteError(message) {
    const errorEl = document.getElementById('deleteError');
    errorEl.textContent = message;
    errorEl.classList.remove('hidden');
    setTimeout(() => errorEl.classList.add('hidden'), 3000);
}

window.deleteCategory = () => {
    const nameToDelete = document.getElementById('deleteCatName').value.trim().toLowerCase();
    const categories = CategoryService.getAll();
    if (nameToDelete === "") {
        showDeleteError('Please enter a category name.');
        document.getElementById('deleteCatName').value = "";
        return;
    }

    const category = categories.find(c => c.name.toLowerCase() === nameToDelete);

    if (!category) {
        showDeleteError('Category not found.');
        document.getElementById('deleteCatName').value = "";
        return;
    }

    if (category.expense_count > 0) {
        showDeleteError('Deletion blocked: category tied to existing expenses.');
        document.getElementById('deleteCatName').value = "";
        return;
    }

    const idAsNumber = parseInt(category.category_id);
    if (!isNaN(idAsNumber) && idAsNumber <= CategoryService.getDefault().length) {
        showDeleteError('Cannot delete default category.');
        document.getElementById('deleteCatName').value = "";
        return;
    }

    // Proceed with deletion
    const deleted = CategoryService.remove(category.category_id);
    if (deleted) {
        document.getElementById('deleteCatName').value = "";
        closeDeleteCategoryModal();
        showToast('Category deleted successfully!', 'success');
    } else {
        showDeleteError('Deletion failed.');
        document.getElementById('deleteCatName').value = "";
    }
}

// Add Budget Model
function showBudgetFormError(id, message) {
    const el = document.getElementById(id);
    el.textContent = message;
    el.classList.remove('hidden');
    setTimeout(() => el.classList.add('hidden'), 3000);
}

function clearBudgetFormAndErrors() {
    document.getElementById('budgetFrom').value = '';
    document.getElementById('budgetTo').value = '';
    document.getElementById('budgetAmount').value = '';

    ['fromDateError', 'toDateError', 'amountError'].forEach(id => {
        const el = document.getElementById(id);
        el.textContent = '';
        el.classList.add('hidden');
    });
}

function isOverlapping(from1, to1, from2, to2) {
    const start1 = new Date(from1);
    const end1 = new Date(to1);
    const start2 = new Date(from2);
    const end2 = new Date(to2);

    return start1 <= end2 && start2 <= end1;
}

window.showBudgetModal = () => {
    const allBudgets = BudgetService.getAll();

    if (allBudgets.length > 0) {
        const latest = allBudgets[allBudgets.length - 1];
        document.getElementById('budgetFrom').value = latest.fromDate;
        document.getElementById('budgetTo').value = latest.toDate;
        document.getElementById('budgetAmount').value = latest.amount;
        document.getElementById('budgetModalSubmitButton').innerText = "Update";
    } else {
        document.getElementById('budgetFrom').value = '';
        document.getElementById('budgetTo').value = '';
        document.getElementById('budgetAmount').value = '';
        document.getElementById('budgetModalSubmitButton').innerText = "Save";

    }

    document.getElementById('budgetModal').showModal();
};

window.closeBudgetModal = () => {
    document.getElementById('budgetModal').close();
    clearBudgetFormAndErrors();
}

window.saveBudget = () => {
    const fromDate = document.getElementById('budgetFrom').value;
    const toDate = document.getElementById('budgetTo').value;
    const amount = document.getElementById('budgetAmount').value;
    const allBudgets = BudgetService.getAll();
    let hasError = false;
    // Basic validations
    if (!fromDate) {
        showBudgetFormError('fromDateError', 'Please select start date.');
        hasError = true;
    }

    if (!toDate) {
        showBudgetFormError('toDateError', 'Please select end date.');
        hasError = true;
    }

    if (!amount || parseFloat(amount) <= 0) {
        showBudgetFormError('amountError', 'Amount must be greater than 0.');
        hasError = true;
    }

    if (hasError) return;

    // Advanced check: fromDate must be before toDate
    if (new Date(fromDate) > new Date(toDate)) {
        showBudgetFormError('toDateError', 'End date must be after start date.');
        return;
    }

    if (allBudgets.length > 0) {
        const latest = allBudgets[allBudgets.length - 1];
        BudgetService.update(latest.id, { amount: parseFloat(amount), fromDate, toDate });
        closeBudgetModal();
        showToast('Budget updated successfully!', 'success');

    } else {
        const overlapping = allBudgets.some(budget =>
            isOverlapping(fromDate, toDate, budget.fromDate, budget.toDate)
        );

        if (overlapping) {
            showBudgetFormError('amountError', 'A budget already exists in this date range!');
            return;
        }

        // All good → Save
        BudgetService.add({ amount: parseFloat(amount), fromDate, toDate });
        closeBudgetModal();
        showToast('Budget added successfully!', 'success');
    }
}


