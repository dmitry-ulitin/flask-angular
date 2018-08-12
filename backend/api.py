from flask import Flask, jsonify, request
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from flask_marshmallow import Marshmallow

app = Flask(__name__)
ma = Marshmallow(app)

Base = declarative_base()
engine = create_engine('sqlite:///swarmer.db')
from .account import Account, account_schema, accounts_schema
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
  data = account_schema.load(json)
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
