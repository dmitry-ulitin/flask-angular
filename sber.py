from backend.api import db
from backend.user import User
from backend.transaction import Transaction

import re
from datetime import datetime, date, time

months = {'ЯНВ':1, 'ДЕК':12}

with open('39825_Jan19.txt') as f:
    lines = f.readlines()

part = 0
transactions = []
for line in lines:
    if re.match('^(-+\+){6}-+$', line):
        part = (part + 1)%3
        parts = list(map(lambda g: len(g.strip('+')), re.findall('(-+\+?)', line)))
        print(parts)
#        continue
    if part == 2:
        print(line.strip('\n'))
        d1 = parts[0]
        d2 = d1 + 1 + parts[1] + 1 + parts[2] + 1 + parts[3]        
        d3 = d2 + 1 + parts[4]
        d4 = d3 + 1 + parts[5]

        dates = line[d1:d2].strip()
        if re.match('^\d{2}\w{3}\s+\d{2}\w{3}\d{2}\s+\d+$', dates):
            opdate = datetime.combine(date(2000 + int(dates[11:13]), months[dates[2:5]], int(dates[0:2])), datetime.now().time())
            details = line[d2:d3].strip()
            currency = details[-3:]
            details = details[:-3].strip()
            cr = line.strip(' \n')[-2:] == 'CR'
            credit = line[d3:d4].strip()
            debit = line[d4:].strip(' CR\n')
            transactions.append(Transaction(opdate=opdate, currency= currency, details=details, debit = credit if cr else debit, credit = debit if cr else credit ))
        elif len(transactions) and not line[d3:].strip() :
            transactions[len(transactions) - 1].details += line[d2:d3].strip()

for t in transactions:
    print(t.opdate, t.currency, t.credit, t.debit, t.details)
