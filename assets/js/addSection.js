import { ExpenseService } from './localStorage/expenseLocal.js';
import { CategoryService } from './localStorage/categoryLocal.js';

window.addExpenseForm = () => {
    const form = document.getElementById('expenseForm');
    // Clear previous errors
    document.querySelectorAll('.error-message').forEach(el => el.textContent = '');

    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    // Required fields
    const requiredFields = ['amount', 'category_id', 'date', 'time', 'payment_mode'];
    let isValid = true;

    requiredFields.forEach(field => {
        const value = data[field];
        if (!value || value.trim() === '') {
            isValid = false;
            // const input = form.querySelector(`[name="${field}"]`);
            const errorDiv = document.getElementById(`${field}-error`);

            // if (input) input.classList.add('input-error');
            if (errorDiv) {
                errorDiv.textContent = `This field is required.`;
                // Remove error after 3 seconds
                setTimeout(() => {
                    errorDiv.textContent = '';
                    // if (input) input.classList.remove('input-error');
                }, 3000);
            }
        }
    });


    if (!isValid) return;
    try {
        const newExpense = ExpenseService.add({
            amount: data.amount,
            category_id: data.category_id,
            subcategory: data.subcategory,
            date: data.date,
            time: data.time,
            note: data.note,
            payment_mode: data.payment_mode,
            location: data.location,
        });
        if (!newExpense) {
            showToast(result.error || 'Failed to add expense', 'error');
            return;
        }
        showToast('Expense added successfully!', 'success');
        form.reset();
        addFormReset();
        loadCategory();
    } catch (err) {
        console.error('Submit failed:', err);
        showToast(result.error || 'Failed to add expense', 'error');
    }
}

function loadCategory() {
    const dropdownBtn = document.getElementById("custom-category");
    const dropdownList = document.getElementById("category-list");
    const selectedSpan = document.getElementById("selected-category");

    // Clear previous list items to prevent duplicates
    dropdownList.innerHTML = '';
    // api use
    try {
        const categories = CategoryService.getAll();

        categories.forEach(cat => {
            const li = document.createElement("li");
            li.textContent = cat.name + " " + cat.icon;
            li.className = "p-2 cursor-pointer category-list-item";
            li.dataset.value = cat.category_id;

            li.addEventListener("click", () => {
                selectedSpan.textContent = cat.name;
                dropdownList.classList.add("hidden");

                // Set hidden input for form submission
                let hiddenInput = document.querySelector('input[name="category_id"]');
                if (!hiddenInput) {
                    hiddenInput = document.createElement("input");
                    hiddenInput.type = "hidden";
                    hiddenInput.name = "category_id";
                    dropdownBtn.parentElement.appendChild(hiddenInput);
                }
                hiddenInput.value = cat.category_id;
            });

            dropdownList.appendChild(li);
        });

    } catch (error) {
        console.error("Failed to load categories", error);
        document.getElementById('category_id-error').textContent = 'Failed to load categories.';
    }

    // Attach dropdown toggle only once
    if (!dropdownBtn.hasAttribute('data-listener-attached')) {
        dropdownBtn.addEventListener("click", () => {
            dropdownList.classList.toggle("hidden");
        });

        document.addEventListener("click", (e) => {
            if (!dropdownBtn.contains(e.target) && !dropdownList.contains(e.target)) {
                dropdownList.classList.add("hidden");
            }
        });

        dropdownBtn.setAttribute('data-listener-attached', 'true');
    }
}

function addFormReset() {
    const timeInput = document.getElementById("expenseTime");
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const seconds = String(now.getSeconds()).padStart(2, "0");
    timeInput.value = `${hours}:${minutes}:${seconds}`;

    const dateInput = document.getElementById("expenseDate");
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    dateInput.value = `${year}-${month}-${day}`;


    const selectedSpan = document.getElementById("selected-category");
    selectedSpan.textContent = "Select Category";
    let hiddenInput = document.querySelector('input[name="category_id"]');
    if (hiddenInput) {
        hiddenInput.value = "";
    }
}

export { addFormReset, loadCategory };