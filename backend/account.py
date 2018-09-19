from sqlalchemy import Column, ForeignKey, Integer, String, Numeric
from sqlalchemy.orm import relationship
from marshmallow import fields
import simplejson as simplejson
from .api import Base, ma

class Account(Base):
    __tablename__ = 'accounts'
    id = Column(Integer, primary_key=True)
    name = Column(String(250), nullable=False)
    currency = Column(String(250), nullable=False)
    start_balance = Column(Numeric(10,2), nullable=False)
 
class AccountSchema(ma.Schema):
    class Meta:
        json_module = simplejson
        fields = ('id', 'name','currency','start_balance')

account_schema = AccountSchema()
accounts_schema = AccountSchema(many=True)