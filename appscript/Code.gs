function doGet() {
  return HtmlService.createHtmlOutput(JSON.stringify(getMenuData()))
    .setMimeType(HtmlService.MimeType.JSON);
}

function getMenuData() {
  const sheet = SpreadsheetApp.openById('YOUR_SPREADSHEET_ID');
  const dataSheet = sheet.getSheets()[0];
  const rows = dataSheet.getDataRange().getValues();

  const headers = rows[0];
  const items = rows.slice(1)
    .filter((row) => row.some((cell) => cell !== ''))
    .map((row) => {
      const obj = {};
      headers.forEach((header, index) => {
        obj[header] = row[index];
      });
      return obj;
    });

  return {
    hero: {
      title: 'Crafted for every craving',
      description: 'Discover our signature beverages, comfort plates, and sweet endings.'
    },
    categories: [...new Set(items.map((item) => item.Category).filter(Boolean))],
    items
  };
}
