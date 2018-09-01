from sqlalchemy import Column, ForeignKey, Integer, String, Numeric
from sqlalchemy.orm import relationship
from marshmallow import fields
import simplejson as simplejson
from .api import Base, ma

class Transaction(Base):
    __tablename__ = 'transactions'
    id = Column(Integer, primary_key=True)
    category_id = Column(Integer, ForeignKey('categories.id'), nullable=True)
    category = relationship("Category")
    account_id = Column(Integer, ForeignKey('accounts.id'), nullable=True)
    account = relationship("Account", foreign_keys=[account_id])
    recipient_id = Column(Integer, ForeignKey('accounts.id'), nullable=True)
    recipient = relationship("Account", foreign_keys=[recipient_id])
    currency = Column(String(250), nullable=False)
    amount = Column(Numeric(10,2), nullable=False)
    details = Column(String(1024), nullable=True)
 
class TransactionSchema(ma.Schema):
    class Meta:
        json_module = simplejson
        fields = ('id', 'category', 'account', 'recipient', 'currency', 'amount', 'details')

transaction_schema = TransactionSchema()
transactions_schema = TransactionSchema(many=True)