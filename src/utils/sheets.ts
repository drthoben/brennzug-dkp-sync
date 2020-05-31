import { GoogleSpreadsheet, GoogleSpreadsheetCellCollection, GoogleSpreadsheetWorksheet } from 'google-spreadsheet';


export function getDkpWorksheet(sheet: GoogleSpreadsheet) {
  return sheet.sheetsByIndex.find(current => current.title === 'Punkteübersicht');
}

export function getRow(worksheet: GoogleSpreadsheetWorksheet, rowIndex: number) {
  const row: GoogleSpreadsheetCellCollection = {
    get rowIndex() {
      return this.cells[0].rowIndex;
    },
    cells: [],
  };

  for (let column = 0; column < worksheet.columnCount; column += 1) {
    row.cells[column] = worksheet.getCell(rowIndex, column);
  }

  return row;
}

export function getRows(worksheet: GoogleSpreadsheetWorksheet, offset: number = 0, limit: number = Infinity) {
  const rows: GoogleSpreadsheetCellCollection[] = [];

  for (let i = 0, row = offset; row < worksheet.rowCount && i < limit; i += 1, row += 1) {
    rows[i] = getRow(worksheet, row);
  }

  return rows;
}
