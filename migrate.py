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


class OAccountGroup(Base):
    __tablename__ = 'account_groups'
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    created = Column(DateTime, nullable = False)
    updated = Column(DateTime, nullable = False)
    name = Column(String(250), nullable=False)
    visible = Column(Boolean, nullable=False, default = True)
    inbalance = Column(Boolean, nullable=False, default = True)
    deleted = Column(Boolean, nullable=False, default = False)
    order = Column(Integer, nullable=False, default = 0)


class OAccount(Base):
    __tablename__ = 'accounts'
    id = Column(Integer, primary_key=True)
    group_id = Column(Integer, ForeignKey('account_groups.id'), nullable=False)
    created = Column(DateTime, nullable = False)
    updated = Column(DateTime, nullable = False)
    name = Column(String(250), nullable=True)
    currency = Column(String(250), nullable=False)
    start_balance = Column(Numeric(10,2), nullable=False)
    deleted = Column(Boolean, nullable=False, default = False)
    order = Column(Integer, nullable=False, default = 0)

class OAccountUser(Base):
    __tablename__ = 'account_users'
    group_id = Column(Integer, ForeignKey('account_groups.id'), primary_key=True)
    user_id = Column(Integer, ForeignKey('users.id'), primary_key=True)
    created = Column(DateTime, nullable = False)
    updated = Column(DateTime, nullable = False)
    write = Column(Boolean, nullable=False, default = False)
    admin = Column(Boolean, nullable=False, default = False)
    name = Column(String(250), nullable=True)
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


AccountGroup.query.delete()
print('\nAccount Groups')
groups = session.query(OAccountGroup).all()
for g in groups:
    print(g.name)
    db.session.add(AccountGroup(id = g.id, user_id = g.user_id, created = g.created, updated = g.updated, name = g.name, visible = g.visible, inbalance = g.inbalance, deleted = g.deleted, order = g.order))


Account.query.delete()
print('\nAccounts')
accounts = session.query(OAccount).all()
for a in accounts:
    print(a.name)
    db.session.add(Account(id = a.id, group_id = a.group_id, created = a.created, updated = a.updated, name = a.name, currency = a.currency, start_balance = a.start_balance, deleted = a.deleted, order = a.order))

AccountUser.query.delete()
print('\nAccount Users')
account_users = session.query(OAccountUser).all()
for au in account_users:
    print(au.group_id, au.user_id)
    db.session.add(AccountUser(group_id = au.group_id, user_id = au.user_id, created = au.created, updated = au.updated, write = au.write, admin = au.admin, name = au.name, visible = au.visible, inbalance = au.inbalance, deleted = au.deleted, order = au.order))

Transaction.query.delete()
print('\nTransactions')
transactions = session.query(OTransaction).all()
for t in transactions:
    print(t.credit)
    db.session.add(Transaction(id = t.id, user_id = t.user_id, created = t.created, updated = t.updated, opdate = t.opdate, account_id = t.account_id, credit = t.credit, recipient_id = t.recipient_id, debit = t.debit, category_id = t.category_id, currency = t.currency, details = t.details, mcc=t.mcc))

db.session.commit()