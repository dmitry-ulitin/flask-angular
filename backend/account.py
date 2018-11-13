import simplejson as simplejson
from marshmallow import fields
from .api import db, ma

class Account(db.Model):
    __tablename__ = 'accounts'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(250), nullable=False)
    currency = db.Column(db.String(250), nullable=False)
    start_balance = db.Column(db.Numeric(10,2), nullable=False)
    def __repr__(self):
        return '<Account %r>' % self.name
 
class AccountSchema(ma.Schema):
    class Meta:
        json_module = simplejson
        fields = ('id', 'name','currency','start_balance')
    id = fields.Int(dump_only=True)

account_schema = AccountSchema()
