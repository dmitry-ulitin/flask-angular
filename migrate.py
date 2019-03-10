from sqlalchemy import Column, ForeignKey, Integer, String, DateTime, Numeric, Boolean
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from sqlalchemy import create_engine
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

Base = declarative_base()

class OUser(Base):
    __tablename__ = 'users'
    id = Column(Integer, primary_key=True)
    email = Column(String(250), nullable=False)
    name = Column(String(250), nullable=False)
    password = Column(String(32), nullable=False)
    created = Column(DateTime, nullable = False)
    updated = Column(DateTime, nullable = False)

class OCategory(Base):
    __tablename__ = 'categories'
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=True)
    created = Column(DateTime, nullable = False)
    updated = Column(DateTime, nullable = False)
    parent_id = Column(Integer, ForeignKey('categories.id'), nullable=True)
    name = Column(String(250), nullable=False)
    bg = Column(String(16), nullable=True)


class OAccount(Base):
    __tablename__ = 'accounts'
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    created = Column(DateTime, nullable = False)
    updated = Column(DateTime, nullable = False)
    name = Column(String(250), nullable=False)
    currency = Column(String(250), nullable=False)
    start_balance = Column(Numeric(10,2), nullable=False)
    visible = Column(Boolean, nullable=False, default = True)
    inbalance = Column(Boolean, nullable=False, default = True)
    deleted = Column(Boolean, nullable=False, default = False)
    order = Column(Integer, nullable=False, default = 0)

class OAccountUser(Base):
    __tablename__ = 'account_users'
    account_id = Column(Integer, ForeignKey('accounts.id'), primary_key=True)
    user_id = Column(Integer, ForeignKey('users.id'), primary_key=True)
    created = Column(DateTime, nullable = False)
    updated = Column(DateTime, nullable = False)
    name = Column(String(250), nullable=True)
    write = Column(Boolean, nullable=False, default = False)
    admin = Column(Boolean, nullable=False, default = False)
    visible = Column(Boolean, nullable=False, default = True)
    inbalance = Column(Boolean, nullable=False, default = True)
    deleted = Column(Boolean, nullable=False, default = False)
    order = Column(Integer, nullable=False, default = 0)

class OTransaction(Base):
    __tablename__ = 'transactions'
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    created = Column(DateTime, nullable = False)
    updated = Column(DateTime, nullable = False)
    opdate = Column(DateTime, nullable = False)
    account_id = Column(Integer, ForeignKey('accounts.id'), nullable=True)
    credit = Column(Numeric(10,2), nullable=False)
    recipient_id = Column(Integer, ForeignKey('accounts.id'), nullable=True)
    debit = Column(Numeric(10,2), nullable=False)
    category_id = Column(Integer, ForeignKey('categories.id'), nullable=True)
    currency = Column(String(250), nullable=True)
    details = Column(String(1024), nullable=True)

engine = create_engine('sqlite:///swarmer_old.db')
Base.metadata.bind = engine
DBSession = sessionmaker()
DBSession.bind = engine
session = DBSession()

from backend.api import db
from backend.user import User
from backend.account import AccountGroup, Account, AccountUser
from backend.category import Category
from backend.transaction import Transaction

User.query.delete()
print('Users')
users = session.query(OUser).all()
for u in users:
    print(u.name, u.email)
    db.session.add(User(id = u.id, email = u.email, name = u.name, password = u.password, created = u.created, updated = u.updated))

Category.query.delete()
print('\nCategories')
categories = session.query(OCategory).all()
for c in categories:
    print(c.name)
    db.session.add(Category(id = c.id, user_id=c.user_id, created = c.created, updated = c.updated, parent_id = c.parent_id, name = c.name, bg = c.bg))

db.session.add(Category(id=105, parent_id=Category.EXPENSE, name='Transport', user_id=1))
db.session.add(Category(id=106, parent_id=Category.EXPENSE, name='Clothes', user_id=1))
db.session.add(Category(id=114, parent_id=Category.EXPENSE, name='Interests and hobbies', user_id=1))
db.session.add(Category(id=204, parent_id=Category.INCOME, name='Interest', user_id=1))


AccountGroup.query.delete()
print('\Account Groups')
accounts = session.query(OAccount).all()
for a in accounts:
    print(a.name)
    db.session.add(AccountGroup(id = a.id, user_id = a.user_id, created = a.created, updated = a.updated, name = a.name, visible = a.visible, inbalance = a.inbalance, deleted = a.deleted, order = a.order))

ag = AccountGroup.query.get(3)
ag.name = 'tinkoff ...3272'

Account.query.delete()
print('\nAccounts')
accounts = session.query(OAccount).all()
for a in accounts:
    print(a.name)
    db.session.add(Account(id = a.id, group_id = a.id, created = a.created, updated = a.updated, name = None, currency = a.currency, start_balance = a.start_balance, deleted = a.deleted, order = a.order))

a = Account.query.get(4)
a.group_id = 3
db.session.commit()
db.session.delete(AccountGroup.query.get(4))

AccountUser.query.delete()
print('\nAccount Users')
account_users = session.query(OAccountUser).all()
for au in account_users:
    print(au.account_id, au.user_id)

Transaction.query.delete()
print('\nTransactions')
transactions = session.query(OTransaction).all()
for t in transactions:
    print(t.credit)
    db.session.add(Transaction(id = t.id, user_id = t.user_id, created = t.created, updated = t.updated, opdate = t.opdate, account_id = t.account_id, credit = t.credit, recipient_id = t.recipient_id, debit = t.debit, category_id = t.category_id, currency = t.currency, details = t.details))

db.session.commit()