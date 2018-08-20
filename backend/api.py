from flask import Flask, jsonify, request
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from flask_marshmallow import Marshmallow

app = Flask(__name__)
ma = Marshmallow(app)

Base = declarative_base()
engine = create_engine('sqlite:///swarmer.db')
from .account import Account, AccountSchema, account_schema, accounts_schema
from .category import Category, CategorySchema, category_schema, categories_schema
Base.metadata.create_all(engine)
Session = sessionmaker(bind=engine)

@app.route('/api/accounts')
def get_accounts():
  session = Session()
  all_accounts = session.query(Account).all()
  result = accounts_schema.dump(all_accounts)
  return jsonify(result)

@app.route("/api/accounts/<id>")
def get_account(id):
  session = Session()
  account = session.query(Account).get(id)
  return account_schema.jsonify(account)

@app.route('/api/accounts', methods=['POST'])
def account_add():
  json = request.json
  data = AccountSchema(only=('name', 'currency', 'start_balance')).load(json)
  account = Account(**data)
  session = Session()
  session.add(account)
  session.commit()
  return account_schema.jsonify(account), 201

@app.route("/api/accounts", methods=["PUT"])
def account_update():
  session = Session()
  account = session.query(Account).get(request.json['id'])
  account.name = request.json['name']
  account.currency = request.json['currency']
  account.start_balance = request.json['start_balance']
  session.commit()
  return account_schema.jsonify(account)

@app.route("/api/accounts/<id>", methods=["DELETE"])
def account_delete(id):
  session = Session()
  account = session.query(Account).get(id)
  session.delete(account)
  session.commit()
  return account_schema.jsonify(account)

@app.route('/api/categories')
def get_categories():
  session = Session()
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
  session = Session()
  category = session.query(Category).get(1)
  result = category_schema.dump(category)
  return jsonify(result)

@app.route('/api/categories/income')
def get_income():
  session = Session()
  category = session.query(Category).get(2)
  result = category_schema.dump(category)
  return jsonify(result)
