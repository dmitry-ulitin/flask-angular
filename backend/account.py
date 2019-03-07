import simplejson as simplejson
import datetime
from marshmallow import fields
from sqlalchemy.event import listens_for
from sqlalchemy.ext.hybrid import hybrid_property,hybrid_method
from .api import db, ma

class AccountGroup(db.Model):
    __tablename__ = 'account_groups'
    ANOTHER = 0
    OWNER = 1
    COOWNER = 2
    SHARED = 3
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    user = db.relationship("User", foreign_keys=[user_id])
    created = db.Column(db.DateTime, nullable = False, default=datetime.datetime.now)
    updated = db.Column(db.DateTime, nullable = False, default=datetime.datetime.now, onupdate=datetime.datetime.now)
    name = db.Column(db.String(250), nullable=False)
    visible = db.Column(db.Boolean, nullable=False, default = True)
    inbalance = db.Column(db.Boolean, nullable=False, default = True)
    deleted = db.Column(db.Boolean, nullable=False, default = False)
    order = db.Column(db.Integer, nullable=False, default = 0)
    accounts = db.relationship("Account")
    permissions = db.relationship("AccountUser")
    @hybrid_method
    def belong(self, user_id):
        if self.user_id == user_id:
            result = AccountGroup.COOWNER if any([p.write for p in self.permissions]) else AccountGroup.OWNER
        else:
            result = AccountGroup.COOWNER if any([p.write for p in self.permissions if p.user_id == user_id]) \
                else AccountGroup.SHARED if any([p for p in self.permissions if p.user_id == user_id]) \
                else AccountGroup.ANOTHER
        return result
    @hybrid_method
    def full_name(self, user_id):
        return self.name if self.user_id == user_id else self.name + ' (' + self.user.name + ')'
    def __repr__(self):
        return '<AccountGroup %r>' % self.name
 
class AccountGroupSchema(ma.Schema):
    class Meta:
        json_module = simplejson
    id = fields.Int(dump_only=True)
    name = fields.Str()
    visible = fields.Boolean()
    inbalance = fields.Boolean()
    deleted = fields.Boolean()
    user_id = fields.Int(dump_only=True)
    accounts =  ma.Nested('AccountSchema', dump_only=True, many = True, only = ['id', 'name', 'currency', 'start_balance', 'deleted'])
    permissions =  ma.Nested('AccountUserSchema', dump_only=True, many = True)

group_schema = AccountGroupSchema()

# for test purposes
@listens_for(AccountGroup.__table__, 'after_create')
def insert_initial_records(*args, **kwargs):
    db.session.add(AccountGroup(id=1, name='cash', user_id=1))
    db.session.add(AccountGroup(id=2, name='visa ...1234', user_id=1))
    db.session.commit()

class Account(db.Model):
    __tablename__ = 'accounts'
    id = db.Column(db.Integer, primary_key=True)
    group_id = db.Column(db.Integer, db.ForeignKey('account_groups.id'), nullable=False)
    group = db.relationship("AccountGroup", foreign_keys=[group_id])
    created = db.Column(db.DateTime, nullable = False, default=datetime.datetime.now)
    updated = db.Column(db.DateTime, nullable = False, default=datetime.datetime.now, onupdate=datetime.datetime.now)
    name = db.Column(db.String(250), nullable=True)
    currency = db.Column(db.String(250), nullable=False)
    start_balance = db.Column(db.Numeric(10,2), nullable=False)
    deleted = db.Column(db.Boolean, nullable=False, default = False)
    order = db.Column(db.Integer, nullable=False, default = 0)
    @hybrid_method
    def full_name(self, user_id):
        fn = self.group.name
        if self.name:
            fn += ' / ' + self.name
        elif len(self.group.accounts) > 1:
            fn += ' ' + self.currency
        if self.group.user_id != user_id:
            fn += ' (' + self.group.user.name + ')'
        return fn
    def __repr__(self):
        return '<Account %r>' % self.name
 
class AccountSchema(ma.Schema):
    class Meta:
        json_module = simplejson
    id = fields.Int(dump_only=True)
    group = ma.Nested('AccountGroupSchema', dump_only=True, only=["id", "name", "visible", "inbalance", "deleted"])
    name = fields.Str()
    currency = fields.Str()
    start_balance = fields.Decimal()
    deleted = fields.Boolean()

account_schema = AccountSchema()

# for test purposes
@listens_for(Account.__table__, 'after_create')
def insert_initial_records(*args, **kwargs):
    db.session.add(Account(id=1, group_id=1, currency='RUB', start_balance=5450))
    db.session.add(Account(id=2, group_id=2, currency='RUB', start_balance=56432.28))
    db.session.add(Account(id=3, group_id=2, currency='USD', start_balance=456))
    db.session.commit()

class AccountUser(db.Model):
    __tablename__ = 'account_users'
    group_id = db.Column(db.Integer, db.ForeignKey('account_groups.id'), primary_key=True)
    group = db.relationship("AccountGroup", foreign_keys=[group_id])
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), primary_key=True)
    user = db.relationship("User", foreign_keys=[user_id])
    created = db.Column(db.DateTime, nullable = False, default=datetime.datetime.now)
    updated = db.Column(db.DateTime, nullable = False, default=datetime.datetime.now, onupdate=datetime.datetime.now)
    write = db.Column(db.Boolean, nullable=False, default = False)
    admin = db.Column(db.Boolean, nullable=False, default = False)
    name = db.Column(db.String(250), nullable=True)
    visible = db.Column(db.Boolean, nullable=False, default = True)
    inbalance = db.Column(db.Boolean, nullable=False, default = True)
    deleted = db.Column(db.Boolean, nullable=False, default = False)
    order = db.Column(db.Integer, nullable=False, default = 0)
    def __repr__(self):
        return '<AccountUser %r-%r, write: %s>' % (self.group.name, self.user.name, self.write)

# for test purposes
@listens_for(AccountUser.__table__, 'after_create')
def insert_initial_records(*args, **kwargs):
    db.session.add(AccountUser(group_id=1, user_id=2))
    db.session.add(AccountUser(group_id=2, user_id=2))
    db.session.commit()

 
class AccountUserSchema(ma.Schema):
    class Meta:
        json_module = simplejson
        fields = ('group_id', 'user_id', 'write', 'admin', 'name', 'visible', 'inbalance', 'deleted')
    id = fields.Int(dump_only=True)

account_user_schema = AccountUserSchema()
