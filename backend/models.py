from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash

db = SQLAlchemy()

class Category(db.Model):
    category_id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    icon = db.Column(db.String(10))  # For emoji icons
    color = db.Column(db.String(10))

class Expense(db.Model):
    expense_id = db.Column(db.String, primary_key=True)
    amount = db.Column(db.Float)
    date = db.Column(db.String(50))
    location = db.Column(db.String(100))
    note = db.Column(db.String(255))
    payment_mode = db.Column(db.String(50))
    subcategory = db.Column(db.String(100))
    time = db.Column(db.String(50))
    category_id = db.Column(db.Integer, db.ForeignKey('category.category_id'), nullable=False)
    settings_id = db.Column(db.String(50))
    
class Settings(db.Model):
    settings_id = db.Column(db.String, primary_key=True)
    themeMode = db.Column(db.String(20))
    notifications = db.Column(db.Boolean, default=True)
    backupFrequency = db.Column(db.String(20))
    isBackup = db.Column(db.Boolean, default=False)
    user_email = db.Column(db.String(100), nullable=False)
    user_password = db.Column(db.String(200), nullable=False) 
    lastBackup = db.Column(db.DateTime)

class Budget(db.Model):
    budget_id = db.Column(db.String, primary_key=True)
    amount = db.Column(db.Float)
    fromDate = db.Column(db.DateTime)
    toDate = db.Column(db.DateTime)
    settings_id = db.Column(db.String(50))

class CustomCategory(db.Model):
    category_id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100))
    icon = db.Column(db.String(10))  # For emoji icons
    color = db.Column(db.String(10))
    settings_id = db.Column(db.String(50))

# Hash password when setting it
def hash_password(password):
    return generate_password_hash(password)

# Check password validity
def check_password(stored_hash, password):
    return check_password_hash(stored_hash, password)
