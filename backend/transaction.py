import simplejson as simplejson
from marshmallow import fields
from .api import db, ma

class Transaction(db.Model):
    __tablename__ = 'transactions'
    id = db.Column(db.Integer, primary_key=True)
    category_id = db.Column(db.Integer, db.ForeignKey('categories.id'), nullable=True)
    category = db.relationship("Category")
    account_id = db.Column(db.Integer, db.ForeignKey('accounts.id'), nullable=True)
    account = db.relationship("Account", foreign_keys=[account_id])
    recipient_id = db.Column(db.Integer, db.ForeignKey('accounts.id'), nullable=True)
    recipient = db.relationship("Account", foreign_keys=[recipient_id])
    currency = db.Column(db.String(250), nullable=False)
    amount = db.Column(db.Numeric(10,2), nullable=False)
    details = db.Column(db.String(1024), nullable=True)
 
class TransactionSchema(ma.Schema):
    class Meta:
        json_module = simplejson
        fields = ('id', 'category', 'account', 'recipient', 'currency', 'amount', 'details')
    id = fields.Int(dump_only=True)

transaction_schema = TransactionSchema()
