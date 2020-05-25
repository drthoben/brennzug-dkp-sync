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

export function getRows(worksheet: GoogleSpreadsheetWorksheet) {
  const rows: GoogleSpreadsheetCellCollection[] = [];

  for (let row = 0; row < worksheet.rowCount; row += 1) {
    rows[row] = getRow(worksheet, row);
  }

  return rows;
}
