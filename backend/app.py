from flask import Flask, request, jsonify
from models import *

import os
from dotenv import load_dotenv

load_dotenv()


class Config:
    # SQLALCHEMY_DATABASE_URI = os.getenv("DATABASE_URL")
    SQLALCHEMY_DATABASE_URI = os.getenv("DATABASE_URL_LOCAL")
    SQLALCHEMY_TRACK_MODIFICATIONS = False


app = Flask(__name__)
app.config.from_object(Config)
db.init_app(app)
from flask_migrate import Migrate

migrate = Migrate(app, db)


@app.route("/")
def index():
    return "ExpenseWise API is running!"


# 1. **Restore Data API** - Fetch all data based on email and password
@app.route("/restore-data", methods=["POST"])
def restore_data():
    data = request.get_json()
    email = data.get("email")
    password = data.get("password")

    # Find user based on email
    settings = Settings.query.filter_by(user_email=email).first()

    if settings and check_password(settings.user_password, password):
        # Fetch all user data based on email
        categories = Category.query.all()
        custom_categories = CustomCategory.query.all()
        expenses = Expense.query.filter_by(category_id=Category.category_id).all()
        budgets = Budget.query.all()

        response = {
            "categories": [
                {
                    "category_id": c.category_id,
                    "name": c.name,
                    "icon": c.icon,
                    "color": c.color,
                }
                for c in categories
            ],
            "custom_categories": [
                {
                    "category_id": c.category_id,
                    "name": c.name,
                    "icon": c.icon,
                    "color": c.color,
                }
                for c in custom_categories
            ],
            "expenses": [
                {
                    "expense_id": e.expense_id,
                    "amount": e.amount,
                    "date": e.date,
                    "location": e.location,
                    "note": e.note,
                    "payment_mode": e.payment_mode,
                    "subcategory": e.subcategory,
                    "time": e.time,
                    "category_id": e.category_id,
                }
                for e in expenses
            ],
            "budgets": [
                {
                    "budget_id": b.budget_id,
                    "amount": b.amount,
                    "fromDate": b.fromDate,
                    "toDate": b.toDate,
                }
                for b in budgets
            ],
        }

        return jsonify(response), 200
    else:
        return jsonify({"error": "Invalid credentials"}), 401


# 2. **Set Data API** - Save local storage data to the database
@app.route("/set-data", methods=["POST"])
def set_data():
    data = request.get_json()
    email = data.get("email")
    password = data.get("password")

    # Authenticate user by email and password
    settings = Settings.query.filter_by(user_email=email).first()

    if not settings or not check_password(settings.user_password, password):
        return jsonify({"error": "Invalid credentials"}), 401

    try:
        # Insert/Update categories
        for category in data["categories"]:
            existing_category = Category.query.filter_by(
                category_id=category["category_id"]
            ).first()
            if existing_category:
                existing_category.name = category["name"]
                existing_category.icon = category["icon"]
                existing_category.color = category["color"]
            else:
                new_category = Category(**category)
                db.session.add(new_category)

        # Insert/Update custom categories
        for custom_category in data["custom_categories"]:
            existing_custom_category = CustomCategory.query.filter_by(
                category_id=custom_category["category_id"]
            ).first()
            if existing_custom_category:
                existing_custom_category.name = custom_category["name"]
                existing_custom_category.icon = custom_category["icon"]
                existing_custom_category.color = custom_category["color"]
            else:
                new_custom_category = CustomCategory(**custom_category)
                db.session.add(new_custom_category)

        # Insert/Update expenses
        for expense in data["expenses"]:
            existing_expense = Expense.query.filter_by(
                expense_id=expense["expense_id"]
            ).first()
            if existing_expense:
                existing_expense.amount = expense["amount"]
                existing_expense.date = expense["date"]
                existing_expense.location = expense["location"]
                existing_expense.note = expense["note"]
                existing_expense.payment_mode = expense["payment_mode"]
                existing_expense.subcategory = expense["subcategory"]
                existing_expense.time = expense["time"]
                existing_expense.category_id = expense["category_id"]
            else:
                new_expense = Expense(**expense)
                db.session.add(new_expense)

        # Insert/Update budgets
        for budget in data["budgets"]:
            existing_budget = Budget.query.filter_by(
                budget_id=budget["budget_id"]
            ).first()
            if existing_budget:
                existing_budget.amount = budget["amount"]
                existing_budget.fromDate = budget["fromDate"]
                existing_budget.toDate = budget["toDate"]
            else:
                new_budget = Budget(**budget)
                db.session.add(new_budget)

        db.session.commit()
        return jsonify({"message": "Data successfully saved."}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/register-user", methods=["POST"])
def register_user():
    data = request.get_json()
    settings_id = data.get("settings_id")
    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return jsonify({"error": "Email and password are required."}), 400

    existing_user = Settings.query.filter_by(user_email=email).first()
    if existing_user:
        return jsonify({"error": "User already exists."}), 409

    hashed_password = hash_password(password)
    new_user = Settings(
        settings_id=settings_id, user_email=email, user_password=hashed_password
    )
    db.session.add(new_user)
    db.session.commit()

    return jsonify({"message": "User registered successfully."}), 201


if __name__ == "__main__":
    app.run(debug=True)
