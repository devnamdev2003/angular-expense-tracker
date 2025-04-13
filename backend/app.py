from flask import Flask, request, jsonify
from models import *
import re
import os
from dotenv import load_dotenv
from flask_cors import CORS
import traceback

load_dotenv()


class Config:
    # SQLALCHEMY_DATABASE_URI = os.getenv("DATABASE_URL")
    SQLALCHEMY_DATABASE_URI = os.getenv("DATABASE_URL_LOCAL")
    SQLALCHEMY_TRACK_MODIFICATIONS = False


app = Flask(__name__)
CORS(app)
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

    if settings and settings.user_password == password:
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
    try:
        # Parse and validate JSON payload
        try:
            data = request.get_json(force=True)
        except Exception:
            return (
                jsonify(
                    {
                        "status": "fail",
                        "message": "Malformed JSON. Please check request format.",
                    }
                ),
                400,
            )

        email = str(data.get("email", "")).strip().lower()
        password = str(data.get("password", "")).strip()
        settings_id = str(data.get("settings_id", "")).strip()

        if not email or not password or not settings_id:
            return (
                jsonify(
                    {
                        "status": "fail",
                        "message": "Email, password, and settings_id are required.",
                    }
                ),
                400,
            )

        # Authenticate user using settings_id + email + password
        settings = Settings.query.filter_by(
            settings_id=settings_id, user_email=email
        ).first()

        if not settings or not settings.user_password == password:
            return (
                jsonify(
                    {
                        "status": "fail",
                        "message": "Invalid credentials or user not found.",
                    }
                ),
                401,
            )

        # Validate presence of all required data keys
        expected_keys = ["categories", "custom_categories", "expenses", "budgets"]
        missing_keys = [key for key in expected_keys if key not in data]
        if missing_keys:
            return (
                jsonify(
                    {
                        "status": "fail",
                        "message": f"Missing required keys: {', '.join(missing_keys)}",
                    }
                ),
                400,
            )

        inserted = {
            "categories": 0,
            "custom_categories": 0,
            "expenses": 0,
            "budgets_updated": 0,
            "custom_categories_deleted": 0,
        }

        # Categories: Insert new only
        for cat in data["categories"]:
            if not Category.query.filter_by(category_id=cat["category_id"]).first():
                db.session.add(Category(**cat))
                inserted["categories"] += 1

        # Custom Categories: Insert new + delete missing
        incoming_custom_ids = set()
        for cat in data["custom_categories"]:
            incoming_custom_ids.add(cat["category_id"])
            if not CustomCategory.query.filter_by(
                category_id=cat["category_id"]
            ).first():
                db.session.add(CustomCategory(**cat))
                inserted["custom_categories"] += 1

        # Delete CustomCategories not in localStorage
        existing_custom = CustomCategory.query.all()
        for db_cat in existing_custom:
            if db_cat.category_id not in incoming_custom_ids:
                db.session.delete(db_cat)
                inserted["custom_categories_deleted"] += 1

        # Expenses: Insert new only
        for exp in data["expenses"]:
            if not Expense.query.filter_by(expense_id=exp["expense_id"]).first():
                db.session.add(Expense(**exp))
                inserted["expenses"] += 1

        # Budgets: Update if exists, else insert new
        for bud in data["budgets"]:
            existing_budget = Budget.query.filter_by(budget_id=bud["budget_id"]).first()
            if existing_budget:
                existing_budget.amount = bud["amount"]
                existing_budget.fromDate = bud["fromDate"]
                existing_budget.toDate = bud["toDate"]
                existing_budget.settings_id = settings_id
            else:
                new_budget = Budget(
                    budget_id=bud["budget_id"],
                    amount=bud["amount"],
                    fromDate=bud["fromDate"],
                    toDate=bud["toDate"],
                    settings_id=settings_id,
                )
                db.session.add(new_budget)
            inserted["budgets_updated"] += 1

        db.session.commit()

        return (
            jsonify(
                {
                    "status": "success",
                    "message": "Data synced successfully.",
                    "data": inserted,
                }
            ),
            200,
        )

    except Exception as e:
        print("Error in /set-data:\n", traceback.format_exc())
        return (
            jsonify(
                {
                    "status": "error",
                    "message": "An unexpected error occurred while saving data.",
                    "details": str(e),
                }
            ),
            500,
        )


@app.route("/register-user", methods=["POST"])
def register_user():
    try:
        # Try to parse JSON safely
        try:
            data = request.get_json(force=True)
        except Exception:
            return (
                jsonify(
                    {
                        "status": "fail",
                        "message": "Malformed JSON. Please check your request body format.",
                    }
                ),
                400,
            )

        # Required fields
        required_fields = ["settings_id", "email", "password"]
        missing_fields = [
            field
            for field in required_fields
            if field not in data or not str(data[field]).strip()
        ]

        if missing_fields:
            return (
                jsonify(
                    {
                        "status": "fail",
                        "message": f"Missing or empty required fields: {', '.join(missing_fields)}",
                    }
                ),
                400,
            )

        # Extract & normalize fields
        settings_id = str(data["settings_id"]).strip()
        email = str(data["email"]).strip().lower()
        password = str(data["password"]).strip()

        # Validate email format
        email_regex = r"^[^@\s]+@[^@\s]+\.[^@\s]+$"
        if not re.match(email_regex, email):
            return jsonify({"status": "fail", "message": "Invalid email format."}), 400

        # Validate password strength
        if len(password) < 8:
            return (
                jsonify(
                    {
                        "status": "fail",
                        "message": "Password must be at least 8 characters long.",
                    }
                ),
                400,
            )

        # Check duplicate email
        if Settings.query.filter_by(user_email=email).first():
            return (
                jsonify({"status": "fail", "message": "Email is already registered."}),
                409,
            )

        # Check duplicate settings_id
        if Settings.query.filter_by(settings_id=settings_id).first():
            return (
                jsonify(
                    {
                        "status": "fail",
                        "message": "settings_id already in use. Please use a different one.",
                    }
                ),
                409,
            )

        # All validations passed
        hashed_password = password
        new_user = Settings(
            settings_id=settings_id, user_email=email, user_password=hashed_password
        )
        db.session.add(new_user)
        db.session.commit()

        return (
            jsonify(
                {
                    "status": "success",
                    "message": "User registered successfully.",
                    "data": {"settings_id": settings_id, "email": email},
                }
            ),
            201,
        )

    except Exception as e:
        # Optional: log the error for debug purposes
        print(f"[ERROR] /register-user -> {e}")
        return (
            jsonify(
                {
                    "status": "error",
                    "message": "Something went wrong on the server. Please try again later.",
                }
            ),
            500,
        )


@app.route("/update-user", methods=["PUT"])
def update_user():
    try:
        # Parse and validate JSON
        try:
            data = request.get_json(force=True)
        except Exception:
            return (
                jsonify(
                    {
                        "status": "fail",
                        "message": "Malformed JSON. Please check your request body.",
                    }
                ),
                400,
            )

        # Required: settings_id to identify user
        settings_id = str(data.get("settings_id", "")).strip()
        if not settings_id:
            return (
                jsonify(
                    {
                        "status": "fail",
                        "message": "settings_id is required to update the user.",
                    }
                ),
                400,
            )

        # Fetch user
        user = Settings.query.filter_by(settings_id=settings_id).first()
        if not user:
            return (
                jsonify(
                    {
                        "status": "fail",
                        "message": "User not found with the provided settings_id.",
                    }
                ),
                404,
            )

        # Optional updates
        email = data.get("email")
        password = data.get("password")

        # Update email if provided
        if email:
            email = email.strip().lower()
            email_regex = r"^[^@\s]+@[^@\s]+\.[^@\s]+$"
            if not re.match(email_regex, email):
                return (
                    jsonify({"status": "fail", "message": "Invalid email format."}),
                    400,
                )

            # Check for email conflict
            existing_user = Settings.query.filter_by(user_email=email).first()
            if existing_user and existing_user.settings_id != settings_id:
                return (
                    jsonify(
                        {
                            "status": "fail",
                            "message": "This email is already in use by another account.",
                        }
                    ),
                    409,
                )

            user.user_email = email

        # Update password if provided
        if password:
            password = password.strip()
            if len(password) < 8:
                return (
                    jsonify(
                        {
                            "status": "fail",
                            "message": "Password must be at least 8 characters long.",
                        }
                    ),
                    400,
                )

            user.user_password = password

        # If nothing to update
        if not email and not password:
            return (
                jsonify({"status": "fail", "message": "No fields provided to update."}),
                400,
            )

        # Commit the changes
        db.session.commit()

        return (
            jsonify(
                {
                    "status": "success",
                    "message": "User updated successfully.",
                    "data": {"settings_id": settings_id, "email": user.user_email},
                }
            ),
            200,
        )

    except Exception as e:
        print(f"[ERROR] /update-user -> {e}")
        return (
            jsonify(
                {
                    "status": "error",
                    "message": "An internal server error occurred. Please try again later.",
                }
            ),
            500,
        )


if __name__ == "__main__":
    app.run(debug=True)
