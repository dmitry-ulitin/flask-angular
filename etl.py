from sqlalchemy import Column, ForeignKey, Integer, String
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

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
    AccountId = Column(Integer)
    UserId = Column(Integer)
    Options = Column(Integer)


engine = create_engine('mssql+pymssql://SA:Wowdaemon123@srv7-dieuron/DB_48667_swarmer')
Base.metadata.bind = engine
DBSession = sessionmaker(bind=engine)
session = DBSession()
accounts = session.query(Account).all()
for a in accounts:
    print(a.Name)
