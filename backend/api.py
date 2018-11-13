from flask import Flask, jsonify, request
from flask_sqlalchemy import SQLAlchemy
from flask_marshmallow import Marshmallow

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///swarmer.db'
db = SQLAlchemy(app)
ma = Marshmallow(app)

from .account import Account, account_schema
from .category import Category, category_schema
from .transaction import Transaction, transaction_schema
db.create_all()

@app.route('/api/accounts')
def get_accounts():
  all_accounts = Account.query.all()
  return account_schema.jsonify(all_accounts, many = True)

@app.route("/api/accounts/<id>")
def get_account(id):
  account = Account.query.get(id)
  return account_schema.jsonify(account)

@app.route('/api/accounts', methods=['POST'])
def account_add():
  data = account_schema.load(request.json, partial=True)
  account = Account(**data)
  db.session.add(account)
  db.session.commit()
  return account_schema.jsonify(account), 201

@app.route("/api/accounts", methods=["PUT"])
def account_update():
  account = db.session.query(Account).get(request.json['id'])
  account.name = request.json['name']
  account.currency = request.json['currency']
  account.start_balance = request.json['start_balance']
  db.session.commit()
  return account_schema.jsonify(account)

@app.route("/api/accounts/<id>", methods=["DELETE"])
def account_delete(id):
  account = db.session.query(Account).get(id)
  db.session.delete(account)
  db.session.commit()
  return account_schema.jsonify(account)

@app.route('/api/categories')
def get_categories():
  all_categories = db.session.query(Category).all()
  return category_schema.jsonify(all_categories, many = True)

@app.route('/api/categories/expenses')
def get_expenses():
  all_categories = db.session.query(Category).all()
  expenses = filter(lambda x: x.get_root().id == 1, all_categories)
  return category_schema.jsonify(expenses, many = True)

@app.route('/api/categories/income')
def get_income():
  all_categories = db.session.query(Category).all()
  income = filter(lambda x: x.get_root().id == 2, all_categories)
  return category_schema.jsonify(income, many = True)

@app.route('/api/categories', methods=['POST'])
def category_add():
  data = category_schema.load(request.json)
  category = Category(**data)
  db.session.add(category)
  db.session.commit()
  return category_schema.jsonify(category), 201

@app.route('/api/transactions')
def get_transactions():
  all_transactions = db.session.query(Transaction).all()
  return transaction_schema.jsonify(all_transactions, many = True)
