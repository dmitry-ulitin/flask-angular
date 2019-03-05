from flask import Flask, jsonify, request
from flask_sqlalchemy import SQLAlchemy
from flask_marshmallow import Marshmallow
from sqlalchemy import func, or_, and_
from sqlalchemy.sql import label, expression
from flask_jwt_extended import JWTManager, jwt_required, create_access_token, get_jwt_identity
import dateutil.parser
import datetime
import hashlib
import os

db_path = os.path.join(os.path.dirname(__file__), 'swarmer.db')
db_uri = 'sqlite:///{}'.format(db_path)
app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = db_uri
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
    users = User.query.filter(func.lower(User.email) == username.lower().strip()).all()
    if len(users) != 1 or users[0].password != hashlib.md5((password + "swarmer").encode('utf-8')).hexdigest():
        return jsonify({"msg": "Bad username or password"}), 401
    # Identity can be any data that is json serializable
    access_token = create_access_token(identity=user_schema.dump(users[0]), expires_delta=False)
    return jsonify(access_token=access_token), 200

def get_ua_account(au):
    a = au.account
    a.name = au.name if au.name else a.name + ' (' + a.user.name + ')'
    a.visible = au.visible
    a.inbalance = au.inbalance
    return a

def get_balances(ai, tid = None, opdate = None):
    query = db.session.query(Transaction.account_id, Transaction.recipient_id, \
            label('debit', func.sum(Transaction.debit)), label('credit', func.sum(Transaction.credit))) \
            .filter(or_(Transaction.account_id.in_(ai), Transaction.recipient_id.in_(ai)))
    if tid and opdate:
        query = query.filter(or_(Transaction.opdate < opdate, and_(Transaction.opdate == opdate, Transaction.id < tid)))
    return query.group_by(Transaction.account_id, Transaction.recipient_id).all()

def get_user_categories(user_id):
    a_au = [au.account.user_id for au in AccountUser.query.filter(AccountUser.user_id == user_id).all()]
    a_au.append(user_id)
    all_categories = Category.query.filter(Category.user_id.in_(a_au)).all()
    all_categories = sorted(all_categories, key = lambda c: c.full_name)
    categories = []
    p = None
    for c in all_categories:
        if p and p.full_name == c.full_name:
            if c.user_id == user_id:
                categories[len(categories) - 1] = c
            continue
        categories.append(c)
        p = c
    return categories

def get_account_json(account, user_id):
    json = account_schema.dump(account)
    balances = get_balances([account.id])
    json['balance'] = account.start_balance
    json['balance'] -= sum(list(map(lambda b: b.credit, list(filter(lambda b: b.account_id == account.id, balances)))))
    json['balance'] += sum(list(map(lambda b: b.debit, list(filter(lambda b: b.recipient_id == account.id, balances)))))
    json['belong'] = 'owner' if account.user_id == user_id else 'shared'
    if any([p.write for p in account.permissions]):
        json['belong'] = 'coowner'
    return json


@app.route('/api/accounts')
@jwt_required
def get_accounts():
    user_id = get_jwt_identity()['id']
    u_accounts = Account.query.filter(Account.user_id == user_id).filter(Account.deleted.is_(False)).order_by(Account.id).all()
    a_au = AccountUser.query.filter(AccountUser.account_id.in_(map(lambda a: a.id, u_accounts))).filter(AccountUser.write.is_(True)).all()
    co_a = list(map(lambda a: a.account_id, a_au))
    all_accounts = list(map(lambda a: dict({'belong':'owner'},**a), account_schema.dump(filter(lambda a: a.id not in co_a, u_accounts), many=True)))
    all_accounts += list(map(lambda a: dict({'belong':'coowner'},**a), account_schema.dump(filter(lambda a: a.id in co_a, u_accounts), many=True)))

    u_au = AccountUser.query.filter(AccountUser.user_id == user_id) \
        .order_by(AccountUser.account_id).all()
    all_accounts += [dict({'belong':'coowner'},**a) for a in account_schema.dump([get_ua_account(au) for au in u_au if not au.account.deleted and au.write], many=True)]
    all_accounts += [dict({'belong':'shared'},**a) for a in account_schema.dump([get_ua_account(au) for au in u_au if not au.account.deleted and not au.write], many=True)]
    balances = get_balances(list(map(lambda a: a['id'], all_accounts)))
    for account in all_accounts:
        account['balance'] = account['start_balance']
        account['balance'] -= sum(list(map(lambda b: b.credit, list(filter(lambda b: b.account_id == account['id'], balances)))))
        account['balance'] += sum(list(map(lambda b: b.debit, list(filter(lambda b: b.recipient_id == account['id'], balances)))))
    return jsonify(all_accounts)

@app.route("/api/accounts/<id>")
@jwt_required
def get_account(id):
    user_id = get_jwt_identity()['id']
    account = Account.query.get(id)
    json = get_account_json(account, user_id)
    return jsonify(json)

@app.route('/api/accounts', methods=['POST'])
@jwt_required
def account_add():
    data = account_schema.load(request.json, partial=True)
    account = Account(**data)
    account.user_id = get_jwt_identity()['id']
    db.session.add(account)
    db.session.commit()
    json = account_schema.dump(account)
    json['balance'] = account.start_balance
    json['belong'] = 'owner'
    if any([p.write for p in account.permissions]):
        json['belong'] = 'coowner'
    return jsonify(json), 201


@app.route("/api/accounts", methods=["PUT"])
@jwt_required
def account_update():
    user_id = get_jwt_identity()['id']
    account = Account.query.get(request.json['id'])
    if account.user_id != user_id:
        return jsonify({"msg": "Can't update this account"}), 401
    account.name = request.json['name']
    account.currency = request.json.get('currency', 'RUB')
    account.start_balance = request.json.get('start_balance', 0)
    account.visible = request.json.get('visible', False)
    account.inbalance = request.json.get('inbalance', False)
    db.session.commit()
    json = get_account_json(account, user_id)
    return jsonify(json)


@app.route("/api/accounts/<id>", methods=["DELETE"])
@jwt_required
def account_delete(id):
    user_id = get_jwt_identity()['id']
    account = Account.query.get(id)
    if account.user_id != user_id:
        return jsonify({"msg": "Can't delete this account"}), 401
    account.deleted = True
    db.session.commit()
    return account_schema.jsonify(account)

@app.route('/api/categories')
@jwt_required
def get_categories():
    user_id = get_jwt_identity()['id']
    all_categories = get_user_categories(user_id)
    return category_schema.jsonify(all_categories, many=True)

@app.route('/api/categories/expenses')
@jwt_required
def get_expenses():
    user_id = get_jwt_identity()['id']
    all_categories = get_user_categories(user_id)
    expenses = sorted(filter(lambda e: e.root.id == Category.EXPENSE, all_categories), key = lambda c: c.full_name)
    return category_schema.jsonify(expenses, many=True)


@app.route('/api/categories/income')
@jwt_required
def get_income():
    user_id = get_jwt_identity()['id']
    all_categories = get_user_categories(user_id)
    income = sorted(filter(lambda e: e.root.id == Category.INCOME, all_categories), key = lambda c: c.full_name)
    return category_schema.jsonify(income, many=True)


@app.route("/api/categories/<id>")
@jwt_required
def get_category(id):
    category = Category.query.get(id)
    return category_schema.jsonify(category)


@app.route('/api/categories', methods=['POST'])
@jwt_required
def category_add():
    data = category_schema.load(request.json)
    category = Category(**data)
    category.user_id=get_jwt_identity()['id']
    db.session.add(category)
    db.session.commit()
    return category_schema.jsonify(category), 201

@app.route("/api/categories", methods=["PUT"])
@jwt_required
def category_update():
    category = Category.query.get(request.json['id'])
    user_id = get_jwt_identity()['id']
    if category.user_id != user_id:
        return jsonify({"msg": "Can't update this category"}), 401        
    category.name = request.json['name']
    category.bg = request.json['bgc']
    db.session.commit()
    return category_schema.jsonify(category)

@app.route('/api/transactions')
@jwt_required
def get_transactions():
    limit = request.args.get('limit', 40)
    offset = request.args.get('offset', 0)
    user_id = get_jwt_identity()['id']
    # select accounts
    accounts = request.args.get('accounts')
    if (accounts):
        accounts = Account.query.filter(Account.id.in_(accounts.split(','))).all()
    else:
        u_a = Account.query.filter(Account.user_id == user_id).all()
        a_u = AccountUser.query.filter(AccountUser.user_id == user_id).all()
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
            if id in ab:
                ab[id] -= t['credit']
                t['account']['balance'] = ab[id]
        if t['recipient']:
            id = t['recipient']['id']
            if id in ab:
                ab[id] += t['debit']
                t['recipient']['balance'] = ab[id]
    return jsonify(tr)


@app.route('/api/transactions/<id>')
@jwt_required
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
@jwt_required
def transaction_add():
    data = transaction_schema.load(request.json)
    if request.json['account']:
        data['account_id'] = request.json['account']['id']
    if request.json['recipient']:
        data['recipient_id'] = request.json['recipient']['id']
    if request.json['category']:
        data['category_id'] = request.json['category']['id']
    transaction = Transaction(**data)
    transaction.user_id=get_jwt_identity()['id']
    db.session.add(transaction)
    db.session.commit()
    return transaction_schema.jsonify(transaction), 201


@app.route("/api/transactions", methods=["PUT"])
@jwt_required
def transaction_update():
    transaction = Transaction.query.get(request.json['id'])
    transaction.user_id=get_jwt_identity()['id']
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
@jwt_required
def transaction_delete(id):
    transaction = Transaction.query.get(id)
    if transaction:
        db.session.delete(transaction)
        db.session.commit()
    return ('', 204)
