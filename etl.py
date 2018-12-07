from sqlalchemy import Column, ForeignKey, Integer, String
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy import or_

from backend.api import db
from backend.user import User
from backend.account import Account
from backend.category import Category

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
    Created = Column(String(30))
    Modified = Column(String(30))
    Options = Column(Integer)
    AccountId = Column(Integer)
    RecipientId = Column(Integer)
    CategoryId = Column(Integer)
    Paid = Column(String(30))
    Value = db.Column(db.Numeric(10,2), nullable=False)
    Currency = Column(String(7))
    Details = Column(String(1000))
    Payee = Column(String(1000))
    Metadata = Column(String(1000))

engine = create_engine('mssql+pymssql://SA:Wowdaemon123@srv7-dieuron/DB_48667_swarmer')
Base.metadata.bind = engine
DBSession = sessionmaker(bind=engine)
session = DBSession()

User.query.delete()
users = session.query(SUserProfiles)\
    .filter(or_(SUserProfiles.UserId==1,SUserProfiles.UserId==2))\
    .all()
for u in users:
    print(u.UserId, u.UserName.lower(), u.FirstName)
    db.session.add(User(id=u.UserId, email = u.UserName.lower(), name = u.FirstName))


Account.query.delete()
accounts = session.query(SAccounts.AccountId, SAccounts.Name, SAccounts.Currency, SAccounts.UserId)\
    .outerjoin(SAccountUsers, SAccounts.AccountId==SAccountUsers.AccountId)\
    .filter(SAccounts.UserId==1)\
    .filter(SAccounts.Options==0)\
    .filter(or_(SAccountUsers.UserId==None, SAccountUsers.Options==0, SAccountUsers.Options==1))\
    .order_by(SAccounts.AccountId).all()
for a in accounts:
    print(a.AccountId, a.Name, a.UserId)
    db.session.add(Account(id=a.AccountId, name=a.Name, currency=a.Currency, start_balance=0, user_id=a.UserId))

db.session.commit()
