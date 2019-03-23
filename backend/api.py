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
    accounts = []
    for account in group.accounts:
        ajson = get_account_json(account, balances, user_id)
        ajson.pop('group', None)
        ajson['group_id'] = group.id
        accounts.append(ajson)
    json['accounts'] = accounts
    return json

def get_account_json(account, balances, user_id):
    json = account_schema.dump(account)
    json['belong'] = account.group.belong(user_id)
    json['full_name'] = account.full_name(user_id)
    json['name'] = account.name # if len(account.group.accounts)>1 else account.group.name
    json['balance'] = account.start_balance
    if balances:
        json['balance'] -= sum(list(map(lambda b: b.credit, list(filter(lambda b: b.account_id == account.id, balances)))))
        json['balance'] += sum(list(map(lambda b: b.debit, list(filter(lambda b: b.recipient_id == account.id, balances)))))
    return json

@app.route('/api/users')
@jwt_required
def get_users():
    limit = request.args.get('limit', 5)
    name = request.args.get('name', '')
    user_id = get_jwt_identity()['id']
    users = User.query.filter(User.id != user_id).filter(func.lower(User.name).like('%' + name.lower() + '%')).limit(limit).all()
    return user_schema.jsonify(users, many=True)

@app.route('/api/groups')
@jwt_required
def get_groups():
    user_id = get_jwt_identity()['id']
    u_groups = AccountGroup.query.filter(AccountGroup.user_id == user_id).order_by(AccountGroup.id).all()
    s_groups = [au.group for au in AccountUser.query.filter(AccountUser.user_id == user_id).order_by(AccountUser.group_id).all()]
    all_groups = [g for g in u_groups if g.belong(user_id) == AccountGroup.OWNER]
    all_groups += [g for g in u_groups if g.belong(user_id) == AccountGroup.COOWNER]
    all_groups += [g for g in s_groups if g.belong(user_id) == AccountGroup.COOWNER]
    all_groups += [g for g in s_groups if g.belong(user_id) == AccountGroup.SHARED]
    all_accounts = [g for g in all_groups for a in g.accounts]
    balances = get_balances([a.id for a in all_accounts])
    jsons = [get_group_json(group,balances,user_id) for group in all_groups]
    return jsonify(jsons)

@app.route("/api/groups/<id>")
@jwt_required
def get_group(id):
    user_id = get_jwt_identity()['id']
    group = AccountGroup.query.get(id)
    balances = get_balances([a.id for a in group.accounts])
    json = get_group_json(group, balances, user_id)
    return jsonify(json)

@app.route('/api/groups', methods=['POST'])
@jwt_required
def group_add():
    user_id = get_jwt_identity()['id']
    data = group_schema.load(request.json, partial=True)
    group = AccountGroup(**data)
    group.user_id = user_id
    for acc in request.json['accounts']:
        name = acc['name'] if acc['name'] else None
        start_balance = acc['start_balance'] if acc['start_balance'] else 0
        currency = acc['currency'] if acc['currency'] else 'RUB'
        if not acc['deleted']:
            group.accounts.append(Account(start_balance =start_balance, currency = currency, name = name))
    for p in request.json['permissions']:
        group.permissions.append(AccountUser(user_id=p['id'], admin=p['admin'], write=p.get('write', p['admin'])))
    db.session.add(group)
    db.session.commit()
    json = get_group_json(group, None, user_id)
    return jsonify(json), 201

@app.route("/api/groups", methods=["PUT"])
@jwt_required
def group_update():
    user_id = get_jwt_identity()['id']
    group = AccountGroup.query.get(request.json['id'])
    if group.user_id != group.user_id and user_id not in [p.user_id for p in group.permissions if p.write]:
        return jsonify({"msg": "Can't update this group"}), 403
    group.name = request.json['name']
    for acc in request.json['accounts']:
        name = acc['name'] if acc['name'] else None
        start_balance = acc['start_balance'] if acc['start_balance'] else 0
        currency = acc.get('currency', None)
        if acc['id']:
            account = next(account for account in group.accounts if account.id==acc['id'])
            account.start_balance = start_balance
            account.currency = currency if currency else account.currency
            account.deleted = acc.get('deleted', False)
            account.name = name
        elif not acc['deleted']:
            group.accounts.append(Account(start_balance = start_balance, currency = currency if currency else 'RUB', name = name))
    for p in request.json['permissions']:
        permission = next((permission for permission in group.permissions if permission.user_id==p['id']), None)
        if permission:
            permission.admin = p['admin']
            permission.write = p.get('write', permission.admin)
        else:
            group.permissions.append(AccountUser(group_id = group.id, user_id = p['id'], admin = p['admin'], write = p.get('write', p['admin'])))
    for p in [permission for permission in group.permissions if not next((p for p in request.json['permissions'] if permission.user_id==p['id']), None)]:
        db.session.delete(p)
    db.session.commit()
    balances = get_balances([a.id for a in group.accounts])
    json = get_group_json(group, balances, user_id)
    return jsonify(json)

@app.route("/api/groups/<id>", methods=["DELETE"])
@jwt_required
def group_delete(id):
    user_id = get_jwt_identity()['id']
    group = AccountGroup.query.get(id)
    if group.user_id != user_id:
        return jsonify({"msg": "Can't delete this group"}), 403
    group.deleted = True
    for account in group.accounts:
        account.delete = True
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
        return jsonify({"msg": "Can't update this category"}), 403        
    category.name = request.json['name']
    category.bg = request.json['bgc']
    db.session.commit()
    return category_schema.jsonify(category)

@app.route('/api/transactions')
@jwt_required
def get_transactions():
    limit = request.args.get('limit', 30)
    offset = request.args.get('offset', 0)
    user_id = get_jwt_identity()['id']
    # select accounts
    user_accounts = Account.query.join(Account.group).filter(AccountGroup.user_id == user_id).all()
    print(user_accounts)
    user_permissions = AccountUser.query.filter(AccountUser.user_id == user_id).all()
    print(user_permissions)
    accounts = user_accounts +  [a for p in user_permissions for a in p.group.accounts]
    account_jsons = dict((a.id,get_account_json(a, None, user_id)) for a in accounts)
    account_ids = [int(a) for a in request.args.get('accounts','').split(',') if a]
    if not any(account_ids):
        account_ids = [a.id for a in accounts]
    account_balances = dict((a.id,a.start_balance) for a in accounts if a.id in account_ids)
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
        tr['recipient']['balance'] += transaction.debit
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
    if request.json['cname']:
        parent_id = transaction.category_id if transaction.category_id else Category.EXPENSE if transaction.account_id else Category.INCOME
        transaction.category_id = None
        transaction.category = Category(parent_id=parent_id, name=request.json['cname'], user_id=transaction.user_id)
        db.session.add(transaction.category)
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
    if request.json['cname']:
        parent_id = transaction.category_id if transaction.category_id else Category.EXPENSE if transaction.account_id else Category.INCOME
        transaction.category_id = None
        transaction.category = Category(parent_id=parent_id, name=request.json['cname'], user_id=transaction.user_id)
        db.session.add(transaction.category)
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
