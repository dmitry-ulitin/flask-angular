import simplejson as simplejson
import datetime
from marshmallow import fields
from sqlalchemy.event import listens_for
from .api import db, ma

class Transaction(db.Model):
    __tablename__ = 'transactions'
    id = db.Column(db.Integer, primary_key=True)
    opdate = db.Column(db.DateTime, nullable = False)
    account_id = db.Column(db.Integer, db.ForeignKey('accounts.id'), nullable=True)
    account = db.relationship("Account", foreign_keys=[account_id])
    credit = db.Column(db.Numeric(10,2), nullable=False)
    recipient_id = db.Column(db.Integer, db.ForeignKey('accounts.id'), nullable=True)
    recipient = db.relationship("Account", foreign_keys=[recipient_id])
    debit = db.Column(db.Numeric(10,2), nullable=False)
    category_id = db.Column(db.Integer, db.ForeignKey('categories.id'), nullable=True)
    category = db.relationship("Category")
    currency = db.Column(db.String(250), nullable=True)
    details = db.Column(db.String(1024), nullable=True)
 
class TransactionSchema(ma.Schema):
    class Meta:
        json_module = simplejson
        fields = ('id', 'opdate',  'account', 'debit', 'recipient', 'credit', 'category', 'currency', 'details')
    id = fields.Int(dump_only=True)
    account = ma.Nested('AccountSchema')
    recipient = ma.Nested('AccountSchema')
    category = ma.Nested('CategorySchema')


transaction_schema = TransactionSchema()

# for test purposes
@listens_for(Transaction.__table__, 'after_create')
def insert_initial_records(*args, **kwargs):
    db.session.add(Transaction(id=1, opdate=datetime.datetime.utcnow(), account_id=1, credit=260, debit=260, category_id=4, currency='RUB', details='dinner'))
    db.session.commit()

