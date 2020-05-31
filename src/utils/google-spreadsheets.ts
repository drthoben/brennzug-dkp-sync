import { GoogleSpreadsheetWorksheet } from 'google-spreadsheet';


export async function insertRowAfter(worksheet: GoogleSpreadsheetWorksheet, rowIndex: number, amount: number = 1) {
  // adds multiple rows in one API interaction using the append endpoint

  // each row can be an array or object
  // an array is just cells
  // ex: ['column 1', 'column 2', 'column 3']
  // an object must use the header row values as keys
  // ex: { col1: 'column 1', col2: 'column 2', col3: 'column 3' }

  // google bug that does not handle colons in names
  // see https://issuetracker.google.com/issues/150373119
  if (worksheet.title.includes(':')) {
    throw new Error(
      'Please remove the ":" from your sheet title. There is a bug with the google API which breaks appending rows if any colons are in the sheet title.',
    );
  }

  await worksheet._spreadsheet.axios.request({
    method: 'post',
    url: `https://sheets.googleapis.com/v4/spreadsheets/${worksheet._spreadsheet.spreadsheetId}:batchUpdate`,
    data: {
      requests: [
        {
          insertDimension: {
            range: {
              sheetId: worksheet.sheetId,
              dimension: 'ROWS',
              startIndex: rowIndex,
              endIndex: rowIndex + amount,
            },
            inheritFromBefore: rowIndex > 0,
          },
        },
      ],
    },
  });

  // Append row count by one
  worksheet._rawProperties.gridProperties.rowCount += 1;

  const sourceRowIndex = rowIndex === 0 ? rowIndex : rowIndex - 1;
  const cellsToClone = worksheet._cells[sourceRowIndex];

  worksheet._cells.splice(rowIndex, 0, cellsToClone.map((cell, columnIndex) => (
    new (cell as any).constructor(worksheet, rowIndex, columnIndex, {
      effectiveFormat: cell._rawData.effectiveFormat,
      userEnteredFormat: cell._rawData.userEnteredFormat,
    })
  )));

  for (let row = rowIndex + 1; row < worksheet.rowCount - 1; row += 1) {
    for (let column = 0; column < worksheet.columnCount; column += 1) {
      worksheet._cells[row][column]._row += 1;
    }
  }
}
