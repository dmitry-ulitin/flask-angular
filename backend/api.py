from flask import jsonify
from backend import app

@app.route('/api/accounts')
def get_accounts():
  return jsonify([{'id': 1, 'name': 'cash' , 'currency': 'RUB', 'balance': 0}, {'id': 2, 'name': 'visa' , 'currency': 'RUB', 'balance': 0}])
