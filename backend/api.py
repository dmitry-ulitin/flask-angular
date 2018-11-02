from flask import Flask, jsonify, request
from flask_sqlalchemy import SQLAlchemy
from flask_marshmallow import Marshmallow

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///swarmer.db'
db = SQLAlchemy(app)
ma = Marshmallow(app)

from .account import Account, account_schema, accounts_schema
#from .category import Category, CategorySchema, category_schema, categories_schema
#from .transaction import Transaction, TransactionSchema, transaction_schema, transactions_schema
db.create_all()

@app.route('/api/accounts')
def get_accounts():
  all_accounts = Account.query.all()
  return accounts_schema.jsonify(all_accounts)

@app.route("/api/accounts/<id>")
def get_account(id):
  account = Account.query.get(id)
  return account_schema.jsonify(account)

@app.route('/api/accounts', methods=['POST'])
def account_add():
  data = account_schema.load(request.json)
  account = Account(**data)
  db.session.add(account)
  db.session.commit()
  return account_schema.jsonify(account), 201

@app.route("/api/accounts", methods=["PUT"])
def account_update():
  account = session.query(Account).get(request.json['id'])
  account.name = request.json['name']
  account.currency = request.json['currency']
  account.start_balance = request.json['start_balance']
  db.session.commit()
  return account_schema.jsonify(account)

@app.route("/api/accounts/<id>", methods=["DELETE"])
def account_delete(id):
  account = session.query(Account).get(id)
  db.session.delete(account)
  db.session.commit()
  return account_schema.jsonify(account)
'''

@app.route('/api/categories')
def get_categories():
  all_categories = session.query(Category).all()
  if len(all_categories) == 0:
    session.add(Category(id=1, name='Expense'))
    session.add(Category(id=2, name='Income'))
    session.commit()
    all_categories = session.query(Category).all()
  result = categories_schema.dump(all_categories)
  return jsonify(result)

@app.route('/api/categories/expenses')
def get_expenses():
  category = session.query(Category).get(1)
  result = category_schema.dump(category)
  return jsonify(result)

@app.route('/api/categories/income')
def get_income():
  category = session.query(Category).get(2)
  result = category_schema.dump(category)
  return jsonify(result)

@app.route('/api/categories', methods=['POST'])
def category_add():
  json = request.json
  data = CategorySchema(only=('name', 'parent_id', 'bg')).load(json)
  category = Category(**data)
  session.add(category)
  session.commit()
  return category_schema.jsonify(category), 201

@app.route('/api/transactions')
def get_transactions():
  all_transactions = session.query(Transaction).all()
  result = transactions_schema.dump(all_transactions)
  return jsonify(result)

'''