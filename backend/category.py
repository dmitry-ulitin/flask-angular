import simplejson as simplejson
from marshmallow import fields
from sqlalchemy.event import listens_for

from .api import db, ma

class Category(db.Model):
    __tablename__ = 'categories'
    id = db.Column(db.Integer, primary_key=True)
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

category_schema = CategorySchema()

@listens_for(Category.__table__, 'after_create')
def insert_initial_records(*args, **kwargs):
    db.session.add(Category(id=1, name='Expense'))
    db.session.add(Category(id=2, name='Income'))
    # for test purposes
    db.session.add(Category(id=11, parent_id=1, name='Car'))
    db.session.add(Category(id=12, parent_id=1, name='Food'))
    db.session.add(Category(id=13, parent_id=1, name='Household'))
    db.session.add(Category(id=14, parent_id=1, name='Healthcare'))
    db.session.add(Category(id=17, parent_id=1, name='Entertainment'))
    db.session.add(Category(id=18, parent_id=1, name='Invoces'))
    db.session.add(Category(id=19, parent_id=1, name='Presents'))
    db.session.add(Category(id=51, parent_id=2, name='Wages'))
    db.session.add(Category(id=52, parent_id=2, name='Awards'))
    db.session.add(Category(id=53, parent_id=3, name='Cashback'))
    db.session.commit()
 