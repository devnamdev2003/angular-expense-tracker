import { APIURL } from "./global.js";

async function syncAllDataToServer() {
    try {
        const settings = JSON.parse(localStorage.getItem('settings')) || {};

        if (!settings.settings_id || !settings.user_email || !settings.user_password) {
            showToast("Incomplete account settings. Please set up your account first.", "error");
            return;
        }

        // Load all local data
        const categories = JSON.parse(localStorage.getItem('categories')) || [];
        const custom_categories = JSON.parse(localStorage.getItem('custom_categories')) || [];
        const expenses = JSON.parse(localStorage.getItem('expenses')) || [];
        const budgets = JSON.parse(localStorage.getItem('budget')) || [];

        // Add settings_id to each item in these arrays
        const addSettingsId = (arr) =>
            arr.map(item => ({ ...item, settings_id: settings.settings_id }));

        const payload = {
            settings_id: settings.settings_id,
            email: settings.user_email,
            password: settings.user_password,
            categories: categories,
            custom_categories: addSettingsId(custom_categories),
            expenses: addSettingsId(expenses),
            budgets: addSettingsId(budgets)
        };

        // Optional: show loader
        showGloabalLoader();

        const response = await fetch(APIURL + "/set-data", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        hideGloabalLoader(); // hide loader when done

        if (data.status === "success") {
            showToast("All data synced successfully!", "success");
        } else {
            showToast(data.message || "Data sync failed.", "error");
        }

    } catch (err) {
        hideGloabalLoader();
        console.error("Sync error:", err);
        showToast("Server error while syncing data.", "error");
    }
};


export { syncAllDataToServer };