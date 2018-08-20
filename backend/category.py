from sqlalchemy import Column, ForeignKey, Integer, String
from sqlalchemy.orm import relationship, backref
from marshmallow import fields
import simplejson as simplejson
from .api import Base, ma

class Category(Base):
    __tablename__ = 'categories'
    id = Column(Integer, primary_key=True)
    parent_id = Column(Integer, ForeignKey('categories.id'), nullable=True)
    parent = relationship("Category", uselist=False)
    subcategories = relationship("Category", uselist=True)
    name = Column(String(250), nullable=False)
 
class CategorySchema(ma.Schema):
    class Meta:
        json_module = simplejson
        fields = ('id', 'parent_id', 'parent', 'name', 'subcategories')

category_schema = CategorySchema()
categories_schema = CategorySchema(many=True)