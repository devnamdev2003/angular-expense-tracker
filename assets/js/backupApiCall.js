import { APIURL } from "./global.js";

async function syncAllDataToServer() {
    try {
        const settings = JSON.parse(localStorage.getItem("settings")) || {};

        if (!settings.settings_id || !settings.user_email || !settings.user_password) {
            showToast("Incomplete account settings. Please set up your account first.", "error");
            return;
        }

        // Load all local data
        const categories = JSON.parse(localStorage.getItem("categories")) || [];
        const custom_categories = JSON.parse(localStorage.getItem("custom_categories")) || [];
        const expenses = JSON.parse(localStorage.getItem("expenses")) || [];
        const budgets = JSON.parse(localStorage.getItem("budget")) || [];

        // Add settings_id to each item
        const addSettingsId = (arr) =>
            arr.map(item => ({ ...item, settings_id: settings.settings_id }));

        // Prepare payload with settings as an object
        const payload = {
            settings: settings, // contains settings_id, user_email, user_password, etc.
            categories: categories,
            custom_categories: addSettingsId(custom_categories),
            expenses: addSettingsId(expenses),
            budgets: addSettingsId(budgets),
        };

        showGloabalLoader(); // Optional: show loader

        const response = await fetch(APIURL + "/set-data", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });

        const data = await response.json();

        hideGloabalLoader(); // hide loader when done

        if (data.status === "success") {
            showToast(data.message, "success");
        } else {
            showToast(data.message || "Data sync failed.", "error");
        }

    } catch (err) {
        hideGloabalLoader();
        console.error("Sync error:", err);
        showToast("Server error while syncing data.", "error");
    }
};


function handleRestoreData(email, password) {
    fetch(APIURL + "/restore-data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
    })
        .then(res => res.json())
        .then(data => {
            hideRestoreLoader();

            if (data.status === "success") {
                const restored = data.data;

                localStorage.clear();
                localStorage.setItem("settings", JSON.stringify(restored.settings));
                localStorage.setItem("categories", JSON.stringify(restored.categories));
                localStorage.setItem("custom_categories", JSON.stringify(restored.custom_categories));
                localStorage.setItem("expenses", JSON.stringify(restored.expenses));
                localStorage.setItem("budget", JSON.stringify(restored.budgets));

                closeRestoreModal();
                hideRestoreLoader();
                showToast(data.message, "success");
                location.reload();
            } else {
                hideRestoreLoader();
                const el = document.getElementById("restorePasswordError");
                el.textContent = data.message || "Failed to restore data.";
                el.classList.remove('hidden');
                setTimeout(() => el.classList.add('hidden'), 3000);
            }
        })
        .catch(err => {
            hideRestoreLoader();
            console.error("Restore failed:", err);
            showToast("Something went wrong. Please try again.", "error");
        });
}


export { syncAllDataToServer, handleRestoreData };