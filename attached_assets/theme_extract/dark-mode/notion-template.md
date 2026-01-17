# Notion Dashboard Template — Dark Neon KSA Vision

## Header (paste as top blocks)
🟢 Riyadh Control Hub  
Vision 2030 Infrastructure • Online  

⚡ Efficiency: 99.8%  
🛡️ System Health: 100%  

---

## Databases
### 1) KPIs (Database)
Properties:
- Metric (Title)
- Value (Number)
- Status (Select: Good, Warning, Critical, Info)
- Trend (Select: Up, Down, Flat)
- Owner (Person)
- Updated (Date)

Views:
- Cards (Compact) — sort Updated desc
- Table — group by Status

### 2) Live Projects (Database)
Properties:
- Project (Title)
- Region (Select)
- Status (Select)
- Last Update (Date)
- Link (URL)

Views:
- List — sort Last Update desc
- Board — group by Status

### 3) Incidents / Security (Database)
Properties:
- Incident (Title)
- Severity (Select: Low, Medium, High, Critical)
- Domain (Select: Security, Availability, Data, Compliance)
- Status (Select: Open, Investigating, Mitigated, Closed)
- Evidence (Files & media)
- Timestamp (Date)

Views:
- Board — group by Status
- Table — filter Severity = High/Critical

## Color Rules
- Good / Success = Green
- Warning = Yellow
- Critical / Error = Red
- Security / Info = Blue

## Layout Trick
Use Callouts as section headers:
- 🟢 KPIs
- ⚡ Performance
- 🛡️ Security
