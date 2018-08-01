from flask import jsonify, request
from backend import app
from .entities import Session
from .entities.account import Account

@app.route('/api/accounts')
def get_accounts():
  session = Session()
  all = session.query(Account).all()
  return jsonify(all)

@app.route('/api/accounts', methods=['POST'])
def add_exam():
    json = request.json
    account = Account(**json)
    session = Session()
    session.add(account)
    session.commit()
    return jsonify(json), 201
