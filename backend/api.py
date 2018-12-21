from flask import Flask, jsonify, request
from flask_sqlalchemy import SQLAlchemy
from flask_marshmallow import Marshmallow
from sqlalchemy import func
from sqlalchemy.sql import label, expression
from flask_jwt_extended import JWTManager, jwt_required, create_access_token, get_jwt_identity


app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///swarmer.db'
db = SQLAlchemy(app)
ma = Marshmallow(app)

from .user import User, user_schema
from .account import Account, account_schema, AccountUser, account_user_schema
from .category import Category, category_schema
from .transaction import Transaction, transaction_schema
db.create_all()

app.config['JWT_SECRET_KEY'] = 'swarmer'
jwt = JWTManager(app)


@app.route('/api/login', methods=['POST'])
def login():
    if not request.is_json:
        return jsonify({"msg": "Missing JSON in request"}), 400
    username = request.json.get('username', None)
    password = request.json.get('password', None)
    if not username:
        return jsonify({"msg": "Missing username parameter"}), 400
    if not password:
        return jsonify({"msg": "Missing password parameter"}), 400
    if username != 'test' or password != 'test':
        return jsonify({"msg": "Bad username or password"}), 401
    # Identity can be any data that is json serializable
    access_token = create_access_token(identity=username)
    return jsonify(access_token=access_token), 200

def get_ua_account(au) :
    a = au.account
    a.name = au.name if au.name else a.name + ' (' + a.user.name + ')'
    a.visible = au.visible
    a.inbalance = au.inbalance
    return a

@app.route('/api/accounts')
#@jwt_required
def get_accounts():
    u_accounts = Account.query.filter(Account.user_id == 1).order_by(Account.id).all()
    a_au = AccountUser.query.filter(AccountUser.account_id.in_(map(lambda a: a.id, u_accounts))).filter(AccountUser.coowner.is_(True)).all()
    co_a = list(map(lambda a: a.account_id, a_au))
    all_accounts = list(map(lambda a: dict({'belong':'owner'},**a), account_schema.dump(filter(lambda a: a.id not in co_a, u_accounts), many=True)))
    all_accounts += list(map(lambda a: dict({'belong':'coowner'},**a), account_schema.dump(filter(lambda a: a.id in co_a, u_accounts), many=True)))

    u_au = AccountUser.query.filter(AccountUser.user_id == 1)\
        .order_by(AccountUser.account_id).all()

    all_accounts += list(map(lambda a: dict({'belong':'coowner'},**a), account_schema.dump(map(lambda au: get_ua_account(au), filter(lambda au: au.coowner, u_au)), many=True)))
    all_accounts += list(map(lambda a: dict({'belong':'shared'},**a), account_schema.dump(map(lambda au: get_ua_account(au), filter(lambda au: not au.coowner, u_au)), many=True)))

    balances = db.session.query(Transaction.account_id, Transaction.recipient_id, label('debit', func.sum(Transaction.debit)), label(
        'credit', func.sum(Transaction.credit))).group_by(Transaction.account_id, Transaction.recipient_id).all()
    for account in all_accounts:
        account['balance'] = account['start_balance']
        account['balance'] -= sum(list(map(lambda b: b.credit, list(
            filter(lambda b: b.account_id == account['id'], balances)))))
        account['balance'] += sum(list(map(lambda b: b.debit, list(
            filter(lambda b: b.recipient_id == account['id'], balances)))))
    return jsonify(all_accounts)


@app.route("/api/accounts/<id>")
#@jwt_required
def get_account(id):
    account = Account.query.get(id)
    return account_schema.jsonify(account)


@app.route('/api/accounts', methods=['POST'])
#@jwt_required
def account_add():
    data = account_schema.load(request.json, partial=True)
    account = Account(**data)
    account.user_id=1
    db.session.add(account)
    db.session.commit()
    return account_schema.jsonify(account), 201


@app.route("/api/accounts", methods=["PUT"])
#@jwt_required
def account_update():
    account = Account.query.get(request.json['id'])
    account.name = request.json['name']
    account.currency = request.json['currency']
    account.start_balance = request.json['start_balance']
    db.session.commit()
    return account_schema.jsonify(account)


@app.route("/api/accounts/<id>", methods=["DELETE"])
#@jwt_required
def account_delete(id):
    account = Account.query.get(id)
    db.session.delete(account)
    db.session.commit()
    return account_schema.jsonify(account)


@app.route('/api/categories')
#@jwt_required
def get_categories():
    all_categories = Category.query.all()
    return category_schema.jsonify(all_categories, many=True)


@app.route('/api/categories/expenses')
#@jwt_required
def get_expenses():
#    expenses = Category.query.get(1)
    expenses = Category.query.filter(Category.parent_id==1).filter(Category.user_id==1).order_by(Category.name).all()
    return category_schema.jsonify(Category(id=1, name='Expense', children=expenses))


@app.route('/api/categories/income')
#@jwt_required
def get_income():
#    income = Category.query.get(2)
    income = Category.query.filter(Category.parent_id==2).filter(Category.user_id==1).order_by(Category.name).all()
    return category_schema.jsonify(Category(id=2, name='Income', children=income))


@app.route("/api/categories/<id>")
#@jwt_required
def get_category(id):
    category = Category.query.get(id)
    return category_schema.jsonify(category)


@app.route('/api/categories', methods=['POST'])
#@jwt_required
def category_add():
    data = category_schema.load(request.json)
    category = Category(**data)
    category.user_id=1
    db.session.add(category)
    db.session.commit()
    return category_schema.jsonify(category), 201


@app.route('/api/transactions')
#@jwt_required
def get_transactions():
    limit = request.args.get('limit', 40)
    offset = request.args.get('offset', 0)
    all_transactions = Transaction.query.order_by(
        Transaction.opdate.desc()).limit(limit).offset(offset).all()
    return transaction_schema.jsonify(all_transactions, many=True)


@app.route('/api/transactions/<id>')
#@jwt_required
def get_transaction(id):
    transaction = Transaction.query.get(id)
    return transaction_schema.jsonify(transaction)


@app.route('/api/transactions', methods=['POST'])
#@jwt_required
def transaction_add():
    #  print(request.json)
    data = transaction_schema.load(request.json)
    if request.json['account']:
        data['account_id'] = request.json['account']['id']
    if request.json['recipient']:
        data['recipient_id'] = request.json['recipient']['id']
    if request.json['category']:
        data['category_id'] = request.json['category']['id']
#  print(data)
    transaction = Transaction(**data)
    db.session.add(transaction)
    db.session.commit()
    return transaction_schema.jsonify(transaction), 201
