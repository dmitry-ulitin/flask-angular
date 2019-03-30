import simplejson as simplejson
import datetime
from marshmallow import fields
from .api import db, ma
import requests
import xml.etree.ElementTree as ET
from decimal import *

class CurrencyRates(db.Model):
    __tablename__ = 'rates'
    date = db.Column(db.Date, primary_key=True)
    currency = db.Column(db.String(5), primary_key=True)
    target = db.Column(db.String(5), primary_key=True)
    nominal = db.Column(db.Integer, nullable=False)
    value = db.Column(db.Numeric(10,4), nullable=False)

 
class CurrencyRateSchema(ma.Schema):
    class Meta:
        json_module = simplejson
        fields = ('date', 'currency','target','nominal','value')

rate_schema = CurrencyRateSchema()

def convert(value, currency, target, date) :
    if currency == target:
        return value
    rate = CurrencyRates.query\
        .filter(CurrencyRates.date==date)\
        .filter(CurrencyRates.currency==currency)\
        .filter(CurrencyRates.target==target)\
        .first()
    if rate :
        return round(Decimal(value) * rate.value / rate.nominal, 2)
    rate = CurrencyRates.query\
        .filter(CurrencyRates.date==date)\
        .filter(CurrencyRates.target==currency)\
        .filter(CurrencyRates.currency==target)\
        .first()
    if rate :
        return round(Decimal(value) * rate.nominal / rate.value, 2)
    if currency == 'RUB' or target == 'RUB':
        code = target if currency == 'RUB' else currency
        response = requests.get(f'http://www.cbr.ru/scripts/XML_daily.asp?date_req={date:%d/%m/%Y}')
        root = ET.fromstring(response.text)
        valute = next((v for v in root.findall('Valute') if v.find('CharCode').text==code), None)
        if valute:
            print(valute)
            nominal = int(valute.find('Nominal').text)
            rate = Decimal(valute.find('Value').text.replace(',', '.'))
            db.session.add(CurrencyRates(date = date, currency = code, target = 'RUB', nominal = nominal, value = rate))
            db.session.commit()
            return round(Decimal(value) * nominal / rate if currency == 'RUB' else Decimal(value) * rate / nominal, 2)
    return value

