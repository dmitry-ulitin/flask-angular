import simplejson as simplejson
import datetime
from marshmallow import fields
from sqlalchemy.event import listens_for
from sqlalchemy.ext.hybrid import hybrid_property
from .api import db, ma
from .category import Category

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
    @hybrid_property
    def ttype(self):
        return Category.TRANSFER if self.account_id and self.recipient_id else Category.EXPENSE if self.account_id else Category.INCOME
    @hybrid_property
    def bg(self):
        return Category.TRANSFER_BG if self.ttype == 0 else self.category.bgc if self.category else Category.EXPENSE_BG if self.ttype == Category.EXPENSE else Category.INCOME_BG


 
class TransactionSchema(ma.Schema):
    class Meta:
        json_module = simplejson
    id = fields.Int(dump_only=True)
    opdate = fields.Date()
    account = ma.Nested('AccountSchema', dump_only=True)
    credit = fields.Decimal()
    recipient = ma.Nested('AccountSchema', dump_only=True)
    debit = fields.Decimal()
    category = ma.Nested('CategorySchema', dump_only=True)
    currency = fields.Str()
    details = fields.Str(allow_none=True)
    ttype = fields.Int(dump_only=True)
    bg = fields.Str(dump_only=True)

transaction_schema = TransactionSchema()

# for test purposes
@listens_for(Transaction.__table__, 'after_create')
def insert_initial_records(*args, **kwargs):
    db.session.add(Transaction(id=1, opdate=datetime.datetime.utcnow(), account_id=2, credit=260, debit=260, category_id=1022, currency='RUB', details='dinner'))
    db.session.commit()

