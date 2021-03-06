import simplejson as simplejson
import datetime
from marshmallow import fields
from sqlalchemy.ext.hybrid import hybrid_property
from sqlalchemy.event import listens_for

from .api import db, ma

class Category(db.Model):
    __tablename__ = 'categories'
    TRANSFER = 0
    EXPENSE = 1
    INCOME = 2
    EXPENSE_BG = '#ffe2dc'
    INCOME_BG = '#ddffd7'
    TRANSFER_BG = '#f9fbbe'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    created = db.Column(db.DateTime, nullable = False, default=datetime.datetime.now)
    updated = db.Column(db.DateTime, nullable = False, default=datetime.datetime.now, onupdate=datetime.datetime.now)
    parent_id = db.Column(db.Integer, db.ForeignKey('categories.id'), nullable=True)
    parent = db.relationship("Category", remote_side=[id])
#    children = db.relationship("Category", lazy="joined", join_depth=5)
    name = db.Column(db.String(250), nullable=False)
    bg = db.Column(db.String(16), nullable=True)
    def __repr__(self):
        return '<Category %r>' % self.name
    @hybrid_property
    def root(self):
        return self.parent.root if self.parent_id else self
    @hybrid_property
    def level(self):
        return self.parent.level + 1 if self.parent_id else 0
    @hybrid_property
    def full_name(self):
        return self.parent.full_name + self.name if self.parent_id else self.name
    @hybrid_property
    def bgc(self):
        return self.bg if self.bg else self.parent.bgc if self.parent else None

 
class CategorySchema(ma.Schema):
    class Meta:
        json_module = simplejson
        fields = ('id', 'user_id', 'parent_id', 'name', 'level')
    id = fields.Int(dump_only=True)
    parent = ma.Nested('CategorySchema', dump_only=True)
    level = fields.Int(dump_only=True)
#    children = ma.Nested('CategorySchema', many = True)

category_schema = CategorySchema()

@listens_for(Category.__table__, 'after_create')
def insert_initial_records(*args, **kwargs):
    db.session.add(Category(id=Category.EXPENSE, name='Expense', bg=Category.EXPENSE_BG))
    db.session.add(Category(id=Category.INCOME, name='Income', bg=Category.INCOME_BG))
    # for test purposes
    db.session.add(Category(id=101, parent_id=Category.EXPENSE, name='Car', user_id=1))
    db.session.add(Category(id=1011, parent_id=101, name='Fuel', user_id=1))
    db.session.add(Category(id=1012, parent_id=101, name='Repair', user_id=1))
    db.session.add(Category(id=102, parent_id=Category.EXPENSE, name='Food', user_id=1))
    db.session.add(Category(id=1021, parent_id=102, name='Food supplies', user_id=1))
    db.session.add(Category(id=1022, parent_id=102, name='Restorants', user_id=1))
    db.session.add(Category(id=103, parent_id=Category.EXPENSE, name='Household', user_id=1))
    db.session.add(Category(id=104, parent_id=Category.EXPENSE, name='Healthcare', user_id=1))
    db.session.add(Category(id=1041, parent_id=104, name='Medicine', user_id=1))
    db.session.add(Category(id=1042, parent_id=104, name='Doctors', user_id=1))
    db.session.add(Category(id=105, parent_id=Category.EXPENSE, name='Transport', user_id=1))
    db.session.add(Category(id=106, parent_id=Category.EXPENSE, name='Clothes', user_id=1))
    db.session.add(Category(id=107, parent_id=Category.EXPENSE, name='Entertainment', user_id=1))
    db.session.add(Category(id=108, parent_id=Category.EXPENSE, name='Bills', user_id=1))
    db.session.add(Category(id=1081, parent_id=108, name='Rent', user_id=1))
    db.session.add(Category(id=1082, parent_id=108, name='Electricity', user_id=1))
    db.session.add(Category(id=1083, parent_id=108, name='Internet', user_id=1))
    db.session.add(Category(id=109, parent_id=Category.EXPENSE, name='Presents', user_id=1))
    db.session.add(Category(id=110, parent_id=Category.EXPENSE, name='Traveling', user_id=1))
    db.session.add(Category(id=111, parent_id=Category.EXPENSE, name='Clothes', user_id=1))
    db.session.add(Category(id=112, parent_id=Category.EXPENSE, name='Education', user_id=1))
    db.session.add(Category(id=113, parent_id=Category.EXPENSE, name='Gifts', user_id=1))
    db.session.add(Category(id=114, parent_id=Category.EXPENSE, name='Interests and hobbies', user_id=1))
    
    db.session.add(Category(id=201, parent_id=Category.INCOME, name='Salary', user_id=1))
    db.session.add(Category(id=202, parent_id=Category.INCOME, name='Bonuses', user_id=1))
    db.session.add(Category(id=203, parent_id=Category.INCOME, name='Cashback', user_id=1))
    db.session.add(Category(id=204, parent_id=Category.INCOME, name='Interest', user_id=1))
    db.session.commit()
 