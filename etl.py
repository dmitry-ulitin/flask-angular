from sqlalchemy import Column, ForeignKey, Integer, String
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy import or_

Base = declarative_base()

class UserProfiles(Base):
    __tablename__ = 'UserProfiles'
    UserId = Column(Integer, primary_key=True)
    UserName = Column(String(230))
    FirstName = Column(String(130))
    LastName = Column(String(130))

class Account(Base):
    __tablename__ = 'Accounts'
    AccountId = Column(Integer, primary_key=True)
    UserId = Column(Integer)
    Created = Column(String(30))
    Modified = Column(String(30))
    Options = Column(Integer)
    Name = Column(String(250))
    Currency = Column(String(7))

class AccountUsers(Base):
    __tablename__ = 'AccountUsers'
    AccountId = Column(Integer, primary_key=True)
    UserId = Column(Integer, primary_key=True)
    Options = Column(Integer)


engine = create_engine('mssql+pymssql://SA:Wowdaemon123@srv7-dieuron/DB_48667_swarmer')
Base.metadata.bind = engine
DBSession = sessionmaker(bind=engine)
session = DBSession()
accounts = session.query(Account.AccountId, Account.Name, AccountUsers.UserId)\
    .outerjoin(AccountUsers, Account.AccountId==AccountUsers.AccountId)\
    .filter(Account.UserId==1)\
    .filter(or_(AccountUsers.UserId==None, AccountUsers.Options==0, AccountUsers.Options==1))\
    .order_by(Account.AccountId).all()
for a in accounts:
    print(a.AccountId, a.Name, a.UserId)
