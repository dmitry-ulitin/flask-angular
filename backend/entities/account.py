from sqlalchemy import Column, ForeignKey, Integer, String, Numeric
from sqlalchemy.orm import relationship
from . import Base

class Account(Base):
    __tablename__ = 'accounts'
    id = Column(Integer, primary_key=True)
    name = Column(String(250), nullable=False)
    currency = Column(String(250), nullable=False)
    balance = Column(Numeric(10,2), nullable=False)
 