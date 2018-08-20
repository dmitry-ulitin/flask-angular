from sqlalchemy import Column, ForeignKey, Integer, String, Numeric
from sqlalchemy.orm import relationship
from marshmallow import fields
import simplejson as simplejson
from .api import Base, ma

class Transaction(Base):
    __tablename__ = 'transactions'
    id = Column(Integer, primary_key=True)
    category_id = Column(Integer, ForeignKey('categories.id'))
    currency = Column(String(250), nullable=False)
    amount = Column(Numeric(10,2), nullable=False)
    detales = Column(String(250), nullable=False)
 
class TransactionSchema(ma.Schema):
    class Meta:
        json_module = simplejson
        fields = ('id', 'currency','amount','detales')

transaction_schema = TransactionSchema()
transactions_schema = TransactionSchema(many=True)