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
    db.session.add(Category(id=3, parent_id=1, name='Car'))
    db.session.add(Category(id=4, parent_id=1, name='Food'))
    db.session.add(Category(id=5, parent_id=1, name='Household'))
    db.session.add(Category(id=6, parent_id=1, name='Healthcare'))
    db.session.add(Category(id=7, parent_id=1, name='Entertainment'))
    db.session.add(Category(id=8, parent_id=1, name='Invoces'))
    db.session.add(Category(id=9, parent_id=1, name='Presents'))
    db.session.commit()
 