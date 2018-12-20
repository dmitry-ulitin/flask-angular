from sqlalchemy import Column, ForeignKey, Integer, String
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy import or_
import json
from datetime import datetime

from backend.api import db
from backend.user import User
from backend.account import Account, AccountUser
from backend.category import Category
from backend.transaction import Transaction


def convert(value, currency, target, date) :
    rate = session.query(SCurrencyRates)\
        .filter(SCurrencyRates.Date==date)\
        .filter(SCurrencyRates.Currency==currency)\
        .filter(SCurrencyRates.Target==target)\
        .first()
    if rate :
        return value * rate.Value / rate.Nominal
    rate = session.query(SCurrencyRates)\
        .filter(SCurrencyRates.Date==date)\
        .filter(SCurrencyRates.Target==currency)\
        .filter(SCurrencyRates.Currency==target)\
        .first()
    if rate :
        return value * rate.Nominal / rate.Value 
    return value

Base = declarative_base()

class SUserProfiles(Base):
    __tablename__ = 'UserProfiles'
    UserId = Column(Integer, primary_key=True)
    UserName = Column(String(230))
    FirstName = Column(String(130))
    LastName = Column(String(130))

class SAccounts(Base):
    __tablename__ = 'Accounts'
    AccountId = Column(Integer, primary_key=True)
    UserId = Column(Integer)
    Created = Column(String(30))
    Modified = Column(String(30))
    Options = Column(Integer)
    Name = Column(String(250))
    Currency = Column(String(7))

class SAccountUsers(Base):
    __tablename__ = 'AccountUsers'
    AccountId = Column(Integer, primary_key=True)
    UserId = Column(Integer, primary_key=True)
    Options = Column(Integer)
    Name = Column(String(250))

class SCategories(Base):
    __tablename__ = 'Categories'
    CategoryId = Column(Integer, primary_key=True)
    UserId = Column(Integer)
    ParentId = Column(Integer)
    Options = Column(Integer)
    Name = Column(String(250))
    Created = Column(String(30))
    Modified = Column(String(30))

class SCurrencyRates(Base):
    __tablename__ = 'CurrencyRates'
    Date = Column(String(12), primary_key=True)
    Currency = Column(String(7), primary_key=True)
    Target = Column(String(7), primary_key=True)
    Nominal = db.Column(db.Numeric(10,2), nullable=False)
    Value = db.Column(db.Numeric(10,2), nullable=False)

class STransactions(Base):
    __tablename__ = 'Transactions'
    TransactionId = Column(Integer, primary_key=True)
    Created = Column(String(40))
    Modified = Column(String(40))
    Options = Column(Integer)
    AccountId = Column(Integer)
    RecipientId = Column(Integer)
    CategoryId = Column(Integer)
    Paid = Column(String(40))
    Value = db.Column(db.Numeric(10,2), nullable=False)
    Currency = Column(String(7))
    Details = Column(String(1000))
    Payee = Column(String(1000))
    Metadata = Column(String(1000))

engine = create_engine('mssql+pymssql://SA:Wowdaemon123@srv7-aboutae/swarmer')
Base.metadata.bind = engine
DBSession = sessionmaker(bind=engine)
session = DBSession()

User.query.delete()
print('--------users')
users = session.query(SUserProfiles)\
    .filter(or_(SUserProfiles.UserId==1,SUserProfiles.UserId==2))\
    .all()
for u in users:
    print(u.UserId, u.UserName.lower(), u.FirstName)
    db.session.add(User(id=u.UserId, email = u.UserName.lower(), name = u.FirstName))

Account.query.delete()
print('--------accounts')
accounts = session.query(SAccounts)\
    .filter(or_(SAccounts.UserId==1,SAccounts.UserId==2))\
    .order_by(SAccounts.AccountId).all()
for a in accounts:
    print(a.AccountId, a.Name, a.UserId)
    db.session.add(Account(id=a.AccountId, name=a.Name, currency=a.Currency, start_balance=0, user_id=a.UserId,\
        visible=(a.Options & 1)==0, inbalance=(a.Options & 2)==0))

AccountUser.query.delete()
print('--------account users')
account_users = session.query(SAccountUsers)\
    .filter(or_(SAccountUsers.UserId==1,SAccountUsers.UserId==2))\
    .all()
for au in account_users:
    print(au.AccountId, au.UserId, (au.Options & 4)!=0)
    db.session.add(AccountUser(account_id=au.AccountId, user_id=au.UserId, name=au.Name,\
        visible=((au.Options & 1)==0), inbalance=((au.Options & 2)==0), coowner=((au.Options & 4)!=0)))

db.session.commit()

Category.query.delete()
print('--------expenses')
expenses = session.query(SCategories)\
    .filter(SCategories.Options==0)\
    .filter(or_(SCategories.UserId==1,SCategories.UserId==2))\
    .all()
for e in expenses:
    print(e.CategoryId, e.Name)
    db.session.add(Category(id=e.CategoryId + 10, parent_id= e.ParentId + 10 if e.ParentId else 1, name=e.Name, user_id=e.UserId))

print('--------incomes')
incomes = session.query(SCategories)\
    .filter(SCategories.Options==1)\
    .filter(or_(SCategories.UserId==1,SCategories.UserId==2))\
    .all()
for i in incomes:
    print(i.CategoryId, i.Name)
    db.session.add(Category(id=i.CategoryId + 10, parent_id= i.ParentId + 10 if i.ParentId else 2, name=i.Name, user_id=i.UserId))

db.session.commit()

aid = dict(map(lambda a: (a.AccountId,a), accounts))
print('--------balances')
balances = session.query(STransactions)\
    .filter(STransactions.Options==1)\
    .filter(or_(STransactions.AccountId.in_(list(aid.keys())), STransactions.RecipientId.in_(list(aid.keys()))))\
    .all()
for t in balances:
    print(t.TransactionId, t.Value, t.Currency)
    account = Account.query.get(t.AccountId)
    account.start_balance = t.Value
    db.session.commit()

Transaction.query.delete()
print('--------transactions')
transactions = session.query(STransactions)\
    .filter(STransactions.Options==0)\
    .filter(or_(STransactions.AccountId.in_(list(aid.keys())), STransactions.RecipientId.in_(list(aid.keys()))))\
    .all()
for t in transactions:
    print(t.TransactionId, t.Value, t.Currency,t.Paid)
    tt = Transaction(opdate=datetime.strptime(t.Paid[:19],'%Y-%m-%d %H:%M:%S'), category_id=t.CategoryId + 10 if t.CategoryId else None, currency= t.Currency, details=t.Details)
    cValue = t.Value
    cCurrency = t.Currency
    if t.Metadata:
        metadata = json.loads(t.Metadata)
        conversion = metadata['Conversion']
        cCurrency = list(conversion.keys())[0]
        cValue = conversion[cCurrency]

    if t.Value<0:
        tt.account_id = t.AccountId
        tt.recipient_id = t.RecipientId
    else :
        tt.account_id = t.RecipientId
        tt.recipient_id = t.AccountId

    cValue = cValue if cValue>0 else -cValue
    t.Value = t.Value if t.Value>0 else -t.Value
    tt.credit = t.Value
    tt.debit = t.Value

    if tt.account_id and aid[tt.account_id].Currency != t.Currency:
        if aid[tt.account_id].Currency == cCurrency :
            tt.credit = cValue
        else :
            tt.credit = convert(t.Value, t.Currency, aid[tt.account_id].Currency, t.Paid[:10])
    if tt.recipient_id and aid[tt.recipient_id].Currency != t.Currency:
        if aid[tt.recipient_id].Currency == cCurrency :
            tt.debit = cValue
        else :
            tt.debit = convert(t.Value, t.Currency, aid[tt.recipient_id].Currency, t.Paid[:10])
    db.session.add(tt)

db.session.commit()
