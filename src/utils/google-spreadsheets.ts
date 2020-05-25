import { GoogleSpreadsheetWorksheet } from 'google-spreadsheet';


export async function insertRowAfter(worksheet: GoogleSpreadsheetWorksheet, rowIndex: number) {
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

  const response = await worksheet._spreadsheet.axios.request({
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
              endIndex: rowIndex + 1,
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

  // const response = await worksheet._spreadsheet.axios.request({
  //   method: 'post',
  //   url: `/values/${worksheet.encodedA1SheetName}:append`,
  //   params: {
  //     valueInputOption: 'USER_ENTERED',
  //     insertDataOption: 'OVERWRITE',
  //     includeValuesInResponse: true,
  //   },
  //   data: {
  //     values: [
  //       'Thoben',
  //       'MEGAKILL',
  //     ],
  //   },
  // });

  // // extract the new row number from the A1-notation data range in the response
  // // ex: in "'Sheet8!A2:C2" -- we want the `2`
  // const { updatedRange } = response.data.updates;
  // let rowNumber = updatedRange.match(/![A-Z]+([0-9]+):?/)[1];
  // rowNumber = parseInt(rowNumber);
  //
  // // if new rows were added, we need update sheet.rowRount
  // if (options.insert) {
  //   this._rawProperties.gridProperties.rowCount += rows.length;
  // }
  // else if (rowNumber + rows.length > this.rowCount) {
  //   // have to subtract 1 since one row was inserted at rowNumber
  //   this._rawProperties.gridProperties.rowCount = rowNumber + rows.length - 1;
  // }
  //
  // return _.map(response.data.updates.updatedData.values, (rowValues) => {
  //   const row = new GoogleSpreadsheetRow(this, rowNumber++, rowValues);
  //   return row;
  // });
}
