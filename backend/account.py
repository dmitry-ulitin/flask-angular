import simplejson as simplejson
import datetime
from marshmallow import fields
from sqlalchemy.event import listens_for
from .api import db, ma

class Account(db.Model):
    __tablename__ = 'accounts'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    user = db.relationship("User", foreign_keys=[user_id])
    created = db.Column(db.DateTime, nullable = False, default=datetime.datetime.now)
    updated = db.Column(db.DateTime, nullable = False, default=datetime.datetime.now, onupdate=datetime.datetime.now)
    name = db.Column(db.String(250), nullable=False)
    currency = db.Column(db.String(250), nullable=False)
    start_balance = db.Column(db.Numeric(10,2), nullable=False)
    visible = db.Column(db.Boolean, nullable=False, default = True)
    inbalance = db.Column(db.Boolean, nullable=False, default = True)
    deleted = db.Column(db.Boolean, nullable=False, default = False)
    order = db.Column(db.Integer, nullable=False, default = 0)
    permissions = db.relationship("AccountUser")
    def __repr__(self):
        return '<Account %r>' % self.name
 
class AccountSchema(ma.Schema):
    class Meta:
        json_module = simplejson
    id = fields.Int(dump_only=True)
    name = fields.Str()
    currency = fields.Str()
    start_balance = fields.Decimal()
    visible = fields.Boolean()
    inbalance = fields.Boolean()
    user_id = fields.Int(dump_only=True)
    permissions =  ma.Nested('AccountUserSchema', dump_only=True, many = True)

account_schema = AccountSchema()

# for test purposes
@listens_for(Account.__table__, 'after_create')
def insert_initial_records(*args, **kwargs):
    db.session.add(Account(id=1, name='cash', currency='RUB', start_balance=5450, user_id=1))
    db.session.add(Account(id=2, name='visa ...1234', currency='RUB', start_balance=56432.28, user_id=1))
    db.session.commit()

class AccountUser(db.Model):
    __tablename__ = 'account_users'
    account_id = db.Column(db.Integer, db.ForeignKey('accounts.id'), primary_key=True)
    account = db.relationship("Account", foreign_keys=[account_id])
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), primary_key=True)
    user = db.relationship("User", foreign_keys=[user_id])
    created = db.Column(db.DateTime, nullable = False, default=datetime.datetime.now)
    updated = db.Column(db.DateTime, nullable = False, default=datetime.datetime.now, onupdate=datetime.datetime.now)
    name = db.Column(db.String(250), nullable=True)
    write = db.Column(db.Boolean, nullable=False, default = False)
    admin = db.Column(db.Boolean, nullable=False, default = False)
    visible = db.Column(db.Boolean, nullable=False, default = True)
    inbalance = db.Column(db.Boolean, nullable=False, default = True)
    deleted = db.Column(db.Boolean, nullable=False, default = False)
    order = db.Column(db.Integer, nullable=False, default = 0)
    def __repr__(self):
        return '<AccountUser %r-%r, write: %s>' % (self.account.name, self.user.name, self.write)

# for test purposes
@listens_for(AccountUser.__table__, 'after_create')
def insert_initial_records(*args, **kwargs):
    db.session.add(AccountUser(account_id=1, user_id=2))
    db.session.commit()

 
class AccountUserSchema(ma.Schema):
    class Meta:
        json_module = simplejson
        fields = ('account_id', 'user_id', 'name', 'write', 'admin', 'visible', 'inbalance', 'deleted')
    id = fields.Int(dump_only=True)

account_user_schema = AccountUserSchema()
