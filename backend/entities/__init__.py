from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

Base = declarative_base()
 
# Create an engine that stores data in the local directory's
# sqlalchemy_example.db file.
engine = create_engine('sqlite:///swarmer.db')
 
# Create all tables in the engine. This is equivalent to "Create Table"
# statements in raw SQL.
from .account import Account
Base.metadata.create_all(engine)
Session = sessionmaker(bind=engine)
