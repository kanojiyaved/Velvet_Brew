import openpyxl

wb = openpyxl.load_workbook('google-sheet-template/QR Menu.xlsx', data_only=True)
ws = wb['menu_items']
rows = list(ws.iter_rows(values_only=True))
print('rows', len(rows))
for row in rows[:8]:
    print(row)
