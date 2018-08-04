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
 # return accounts_schema.jsonify(all_accounts)  

@app.route('/api/accounts', methods=['POST'])
def add_exam():
    json = request.json
    data = account_schema.load(json)
    account = Account(**data)
    session = Session()
    session.add(account)
    session.commit()
    return account_schema.jsonify(account), 201
