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
from .account import AccountGroup, group_schema, Account, account_schema, AccountUser, account_user_schema
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

def get_balances(ai, tid = None, opdate = None):
    query = db.session.query(Transaction.account_id, Transaction.recipient_id, \
            label('debit', func.sum(Transaction.debit)), label('credit', func.sum(Transaction.credit))) \
            .filter(or_(Transaction.account_id.in_(ai), Transaction.recipient_id.in_(ai)))
    if tid and opdate:
        query = query.filter(or_(Transaction.opdate < opdate, and_(Transaction.opdate == opdate, Transaction.id < tid)))
    return query.group_by(Transaction.account_id, Transaction.recipient_id).all()

def get_user_categories(user_id):
    a_au = [au.group.user_id for au in AccountUser.query.filter(AccountUser.user_id == user_id).all()]
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

def get_group_json(group, balances, user_id):
    json = group_schema.dump(group)
    json['belong'] = group.belong(user_id)
    json['full_name'] = group.full_name(user_id)
    balances = {}
    acconts = []
    for account in group.acconts:
        ajson = get_account_json(account, balances, user_id)
        acconts.append(ajson)
        balances[account.currency] = balances.get(account.currency, 0) + ajson['balance']
    json['accounts'] = acconts
    json['balances'] = [{'currency':currency, 'balance': balance} for currency,balance in balances.items()]
    return json

def get_account_json(account, balances, user_id):
    json = account_schema.dump(account)
    json['belong'] = account.group.belong(user_id)
    json['full_name'] = account.full_name(user_id)
    json['name'] = account.name if len(account.group.accounts)>1 else account.group.name
    json['balance'] = account.start_balance
    if balances:
        json['balance'] -= sum(list(map(lambda b: b.credit, list(filter(lambda b: b.account_id == account.id, balances)))))
        json['balance'] += sum(list(map(lambda b: b.debit, list(filter(lambda b: b.recipient_id == account.id, balances)))))
    return json


@app.route('/api/groups')
@jwt_required
def get_groups():
    user_id = get_jwt_identity()['id']
    u_groups = AccountGroup.query.filter(AccountGroup.user_id == user_id).filter(AccountGroup.deleted.is_(False)).order_by(AccountGroup.id).all()
    s_groups = AccountUser.query.filter(AccountUser.user_id == user_id).select(AccountUser.group).order_by(AccountUser.group_id).all()
    all_groups = [g for g in u_groups if g.belong(user_id) == AccountGroup.OWNER]
    all_groups = [g for g in u_groups if g.belong(user_id) == AccountGroup.COOWNER]
    all_groups = [g for g in s_groups if g.belong(user_id) == AccountGroup.COOWNER]
    all_groups = [g for g in s_groups if g.belong(user_id) == AccountGroup.SHARED]
    all_accounts = [g for g in all_groups for a in g.accounts]
    balances = get_balances([a.id for a in all_accounts])
    jsons = [get_group_json(group,balances,user_id) for group in all_groups]
    return jsonify(jsons)

@app.route('/api/accounts')
@jwt_required
def get_accounts():
    user_id = get_jwt_identity()['id']
    u_accounts = Account.query.filter(AccountGroup.user_id == user_id).filter(AccountGroup.deleted.is_(False)).order_by(AccountGroup.id).all()
    s_groups = AccountUser.query.filter(AccountUser.user_id == user_id).order_by(AccountUser.group_id).all()
    s_accounts = [a for g in s_groups for a in g.group.accounts]
    balances = get_balances([a.id for a in (u_accounts + s_accounts)])
    jsons = [get_account_json(a, balances, user_id) for a in u_accounts if a.group.belong(user_id) == AccountGroup.OWNER]
    jsons += [get_account_json(a, balances, user_id) for a in u_accounts if a.group.belong(user_id) == AccountGroup.COOWNER]
    jsons += [get_account_json(a, balances, user_id) for a in s_accounts if a.group.belong(user_id) == AccountGroup.COOWNER]
    jsons += [get_account_json(a, balances, user_id) for a in s_accounts if a.group.belong(user_id) == AccountGroup.SHARED]
    return jsonify(jsons)

@app.route("/api/accounts/<id>")
@jwt_required
def get_account(id):
    user_id = get_jwt_identity()['id']
    account = Account.query.get(id)
    balances = get_balances([account.id])
    json = get_account_json(account, balances, user_id)
    return jsonify(json)

@app.route('/api/accounts', methods=['POST'])
@jwt_required
def account_add():
    user_id = get_jwt_identity()['id']
    data = account_schema.load(request.json, partial=True)
    account = Account(**data)
    if 'group' in request.json:
        account.group =  AccountGroup.query.get(request.json['group']['id'])
    else:
        account.group = AccountGroup(name =  account.name, user_id = user_id)
        account.name = None
    db.session.add(account)
    db.session.commit()
    json = get_account_json(account, None, user_id)
    return jsonify(json), 201


@app.route("/api/accounts", methods=["PUT"])
@jwt_required
def account_update():
    user_id = get_jwt_identity()['id']
    account = Account.query.get(request.json['id'])
    if account.group.user_id != user_id:
        return jsonify({"msg": "Can't update this account"}), 401
    if len(account.group.accounts)>1:
        account.name = request.json['name']
    else:
        account.group.name = request.json['name']
    account.currency = request.json.get('currency', 'RUB')
    account.start_balance = request.json.get('start_balance', 0)
    db.session.commit()
    balances = get_balances([account.id])
    json = get_account_json(account, balances, user_id)
    return jsonify(json)


@app.route("/api/accounts/<id>", methods=["DELETE"])
@jwt_required
def account_delete(id):
    user_id = get_jwt_identity()['id']
    account = Account.query.get(id)
    if account.group.user_id != user_id:
        return jsonify({"msg": "Can't delete this account"}), 401
    account.deleted = True
#    if len([a for a in account.group.accounts if not a.deleted])<1:
    account.group.deleted = True
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
        user_accounts = Account.query.filter(AccountGroup.user_id == user_id).all()
        user_permissions = AccountUser.query.filter(AccountUser.user_id == user_id).all()
        accounts = user_accounts +  [a for g in user_permissions for a in g.group.accounts]
    account_ids = [a.id for a in accounts]
    account_balances = dict((a.id,a.start_balance) for a in accounts)
    account_jsons = dict((a.id,get_account_json(a, None, user_id)) for a in accounts)
    # get transactions
    transactions = Transaction.query.filter(or_(Transaction.account_id.in_(account_ids), Transaction.recipient_id.in_(account_ids))) \
        .order_by(Transaction.opdate.desc(), Transaction.id.desc()) \
        .limit(limit).offset(offset).all()
    # get balances for all previous transactions
    balances = get_balances(account_ids, transactions[-1].id, transactions[-1].opdate) if len(transactions) else []
    for id in account_balances:
        account_balances[id] -= sum(list(map(lambda b: b.credit, list(filter(lambda b: b.account_id == id, balances)))))
        account_balances[id] += sum(list(map(lambda b: b.debit, list(filter(lambda b: b.recipient_id == id, balances)))))
    # set balances to transactions
    tr = transaction_schema.dump(transactions, many = True)    
    for t in tr[::-1]:
        if t['account']:
            id = t['account']['id']
            if id in account_jsons:
                t['account']['full_name'] = account_jsons[id]['full_name']
            if id in account_balances:
                account_balances[id] -= t['credit']
                t['account']['balance'] = account_balances[id]
        if t['recipient']:
            id = t['recipient']['id']
            if id in account_jsons:
                t['recipient']['full_name'] = account_jsons[id]['full_name']
            if id in account_balances:
                account_balances[id] += t['debit']
                t['recipient']['balance'] = account_balances[id]
    return jsonify(tr)


@app.route('/api/transactions/<id>')
@jwt_required
def get_transaction(id):
    user_id = get_jwt_identity()['id']
    transaction = Transaction.query.get(id)
    balances = get_balances([a.id for a in [transaction.account,transaction.recipient] if a], transaction.id, transaction.opdate)
    tr = transaction_schema.dump(transaction)
    if tr['account']:
        tr['account'] = get_account_json(transaction.account, balances, user_id)
        tr['account']['balance'] -= transaction.credit
    elif tr['recipient']:
        tr['recipient'] = get_account_json(transaction.recipient, balances, user_id)
        tr['account']['balance'] += transaction.debit
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
