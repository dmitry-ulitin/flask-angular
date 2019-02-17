from flask import Flask, jsonify, request
from flask_sqlalchemy import SQLAlchemy
from flask_marshmallow import Marshmallow
from sqlalchemy import func, or_, and_
from sqlalchemy.sql import label, expression
from flask_jwt_extended import JWTManager, jwt_required, create_access_token, get_jwt_identity
import dateutil.parser
import datetime

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
    all_categories = Category.query.filter(Category.user_id==1).order_by(Category.name).all()
    return category_schema.jsonify(all_categories, many=True)

@app.route('/api/categories/expenses')
#@jwt_required
def get_expenses():
    all_categories = Category.query.filter(Category.user_id==1).all()
    expenses = sorted(filter(lambda e: e.root.id == Category.EXPENSE, all_categories), key = lambda c: c.full_name)
    return category_schema.jsonify(expenses, many=True)


@app.route('/api/categories/income')
#@jwt_required
def get_income():
    all_categories = Category.query.filter(Category.user_id==1).all()
    income = sorted(filter(lambda e: e.root.id == Category.INCOME, all_categories), key = lambda c: c.full_name)
    return category_schema.jsonify(income, many=True)


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

@app.route("/api/categories", methods=["PUT"])
#@jwt_required
def category_update():
    category = Category.query.get(request.json['id'])
    category.name = request.json['name']
    category.bg = request.json['bgc']
    db.session.commit()
    return category_schema.jsonify(category)

def get_balances(ai, tid, opdate):
    return db.session.query(Transaction.account_id, Transaction.recipient_id, \
            label('debit', func.sum(Transaction.debit)), label('credit', func.sum(Transaction.credit))) \
            .filter(or_(Transaction.account_id.in_(ai), Transaction.recipient_id.in_(ai))) \
            .filter(or_(Transaction.opdate < opdate, and_(Transaction.opdate == opdate, Transaction.id < tid))) \
            .group_by(Transaction.account_id, Transaction.recipient_id).all()

@app.route('/api/transactions')
#@jwt_required
def get_transactions():
    limit = request.args.get('limit', 40)
    offset = request.args.get('offset', 0)
    # select accounts
    u_a = Account.query.filter(Account.user_id == 1).all()
    a_u = AccountUser.query.filter(AccountUser.user_id == 1).all()
    accounts = u_a + list(map(lambda a: a.account, a_u))
    ai = list(map(lambda a: a.id, accounts))
    ab = dict((a.id,a.start_balance) for a in accounts)
    # get transactions
    transactions = Transaction.query.filter(or_(Transaction.account_id.in_(ai), Transaction.recipient_id.in_(ai))) \
        .order_by(Transaction.opdate.desc(), Transaction.id.desc()) \
        .limit(limit).offset(offset).all()
    # get balances for all previous transactions
    balances = get_balances(ai, transactions[-1].id, transactions[-1].opdate) if len(transactions) else []
    for id in ab:
        ab[id] -= sum(list(map(lambda b: b.credit, list(filter(lambda b: b.account_id == id, balances)))))
        ab[id] += sum(list(map(lambda b: b.debit, list(filter(lambda b: b.recipient_id == id, balances)))))
    # set balances to transactions
    tr = transaction_schema.dump(transactions, many = True)
    for t in tr[::-1]:
        if t['account']:
            id = t['account']['id']
            ab[id] -= t['credit']
            t['account']['balance'] = ab[id]
        if t['recipient']:
            id = t['recipient']['id']
            ab[id] += t['debit']
            t['recipient']['balance'] = ab[id]

    return jsonify(tr)


@app.route('/api/transactions/<id>')
#@jwt_required
def get_transaction(id):
    transaction = Transaction.query.get(id)
    acc = transaction.account if transaction.account else transaction.recipient
    balances = get_balances([acc.id], transaction.id, transaction.opdate)
    balance = acc.start_balance \
        - sum(list(map(lambda b: b.credit, list(filter(lambda b: b.account_id == acc.id, balances))))) \
        + sum(list(map(lambda b: b.debit, list(filter(lambda b: b.recipient_id == acc.id, balances)))))
    tr = transaction_schema.dump(transaction)
    if tr['account']:
        tr['account']['balance'] = balance - tr['credit']
    elif tr['recipient']:
        tr['recipient']['balance'] = balance + tr['debit']
    return jsonify(tr)


@app.route('/api/transactions', methods=['POST'])
#@jwt_required
def transaction_add():
#    request.json['opdate'] = datetime.datetime.combine(dateutil.parser.parse(request.json['opdate']).date(), datetime.datetime.now().time()).strftime("%Y-%m-%d %H:%M:%S.%f")
    data = transaction_schema.load(request.json)
    if request.json['account']:
        data['account_id'] = request.json['account']['id']
    if request.json['recipient']:
        data['recipient_id'] = request.json['recipient']['id']
    if request.json['category']:
        data['category_id'] = request.json['category']['id']
    transaction = Transaction(**data)
    transaction.user_id=1
    db.session.add(transaction)
    db.session.commit()
    return transaction_schema.jsonify(transaction), 201


@app.route("/api/transactions", methods=["PUT"])
#@jwt_required
def transaction_update():
    transaction = Transaction.query.get(request.json['id'])
    transaction.user_id=1
    transaction.opdate = datetime.datetime.combine(dateutil.parser.parse(request.json['opdate']).date(), transaction.opdate.time())
    transaction.account_id = request.json['account']['id'] if request.json['account'] else None
    transaction.recipient_id = request.json['recipient']['id'] if request.json['recipient'] else None
    transaction.category_id = request.json['category']['id'] if request.json['category'] else None
    transaction.credit = request.json['credit']
    transaction.debit = request.json['debit']
    transaction.currency = request.json['currency']
    transaction.details = request.json['details']
    db.session.commit()
    return transaction_schema.jsonify(transaction)

@app.route("/api/transactions/<id>", methods=["DELETE"])
#@jwt_required
def transaction_delete(id):
    transaction = Transaction.query.get(id)
    if transaction:
        db.session.delete(transaction)
        db.session.commit()
    return ('', 204)
