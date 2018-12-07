import simplejson as simplejson
from marshmallow import fields
from sqlalchemy.event import listens_for

from .api import db, ma

class Category(db.Model):
    __tablename__ = 'categories'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    parent_id = db.Column(db.Integer, db.ForeignKey('categories.id'), nullable=True)
    children = db.relationship("Category", lazy="joined", join_depth=5)
    name = db.Column(db.String(250), nullable=False)
    bg = db.Column(db.String(16), nullable=True)
 
class CategorySchema(ma.Schema):
    class Meta:
        json_module = simplejson
        fields = ('id', 'parent_id', 'children', 'name', 'bg')
    id = fields.Int(dump_only=True)
    children = ma.Nested('CategorySchema', many = True)
    bg = fields.Str(allow_none=True)

category_schema = CategorySchema()

@listens_for(Category.__table__, 'after_create')
def insert_initial_records(*args, **kwargs):
    db.session.add(Category(id=1, name='Expense'))
    db.session.add(Category(id=2, name='Income'))
    # for test purposes
    db.session.add(Category(id=101, parent_id=1, name='Car', user_id=1))
    db.session.add(Category(id=1011, parent_id=101, name='Fuel', user_id=1))
    db.session.add(Category(id=1012, parent_id=101, name='Repair', user_id=1))
    db.session.add(Category(id=102, parent_id=1, name='Food', user_id=1))
    db.session.add(Category(id=1021, parent_id=102, name='Food supplies', user_id=1))
    db.session.add(Category(id=1022, parent_id=102, name='Restorants', user_id=1))
    db.session.add(Category(id=103, parent_id=1, name='Household', user_id=1))
    db.session.add(Category(id=104, parent_id=1, name='Healthcare', user_id=1))
    db.session.add(Category(id=1041, parent_id=104, name='Medicine', user_id=1))
    db.session.add(Category(id=1042, parent_id=104, name='Doctors', user_id=1))
    db.session.add(Category(id=107, parent_id=1, name='Entertainment', user_id=1))
    db.session.add(Category(id=108, parent_id=1, name='Bills', user_id=1))
    db.session.add(Category(id=1081, parent_id=108, name='Rent', user_id=1))
    db.session.add(Category(id=1082, parent_id=108, name='Electricity', user_id=1))
    db.session.add(Category(id=1083, parent_id=108, name='Internet', user_id=1))
    db.session.add(Category(id=109, parent_id=1, name='Presents', user_id=1))
    db.session.add(Category(id=110, parent_id=1, name='Traveling', user_id=1))
    db.session.add(Category(id=111, parent_id=1, name='Clothes', user_id=1))
    db.session.add(Category(id=112, parent_id=1, name='Education', user_id=1))
    db.session.add(Category(id=201, parent_id=2, name='Wages', user_id=1))
    db.session.add(Category(id=202, parent_id=2, name='Bonuses', user_id=1))
    db.session.add(Category(id=203, parent_id=2, name='Cashback', user_id=1))
    db.session.commit()
 