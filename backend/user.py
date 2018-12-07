import simplejson as simplejson
from marshmallow import fields
from sqlalchemy.event import listens_for
from .api import db, ma

class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(250), nullable=False)
    name = db.Column(db.String(250), nullable=False)
    def __repr__(self):
        return '<User %r>' % self.name
 
class UserSchema(ma.Schema):
    class Meta:
        json_module = simplejson
        fields = ('id', 'email','name')
    id = fields.Int(dump_only=True)

user_schema = UserSchema()

# for test purposes
@listens_for(User.__table__, 'after_create')
def insert_initial_records(*args, **kwargs):
    db.session.add(User(id=1, email='test@gmail.com', name='Test'))
    db.session.commit()
