import simplejson as simplejson
from marshmallow import fields
from sqlalchemy.event import listens_for

from .api import db, ma

class Category(db.Model):
    __tablename__ = 'categories'
    id = db.Column(db.Integer, primary_key=True)
    parent_id = db.Column(db.Integer, db.ForeignKey('categories.id'), nullable=True)
    parent = db.relationship("Category", foreign_keys=[parent_id])
    name = db.Column(db.String(250), nullable=False)
    bg = db.Column(db.String(16), nullable=True)

    def get_root(self):
        return self.get_root(self.parent) if self.parent else self
    
    def get_level(self):
        return (self.get_level(self.parent) + 1) if self.parent else 0

 
class CategorySchema(ma.Schema):
    class Meta:
        json_module = simplejson
        fields = ('id', 'parent_id', 'parent', 'name', 'bg')
    id = fields.Int(dump_only=True)

category_schema = CategorySchema()

@listens_for(Category.__table__, 'after_create')
def insert_initial_records(*args, **kwargs):
    db.session.add(Category(id=1, name='Expense'))
    db.session.add(Category(id=2, name='Income'))
    db.session.commit()
 