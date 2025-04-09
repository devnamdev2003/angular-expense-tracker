import { CategoryService } from "./localStorage/categoryLocal.js";


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



function showError(id, message) {
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
        showError('nameError', 'This category name already exists.');
        hasError = true;
    }

    if (iconExists) {
        showError('iconError', 'This icon is already used.');
        hasError = true;
    }

    if (colorExists) {
        showError('colorError', 'This color is already used.');
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

    // Check if it's a default category (id between 1–15)
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
