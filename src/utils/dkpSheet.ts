import { GoogleSpreadsheetCell, GoogleSpreadsheetWorksheet } from 'google-spreadsheet';
import { DKP_LIST_COLUMNS, PLAYER_CLASS_NAMES } from '../constants';
import { PlayerClass } from '../types/addon';
import { getRows } from './sheets';


function isPlayerCell(cell: GoogleSpreadsheetCell) {
  if (! cell.value) {
    return false;
  }

  const { fontSize, bold } = cell.effectiveFormat.textFormat;

  // Assume that player cells are those with a font size of 10 and non-bold content
  return fontSize === 10 && ! bold;
}

function isClassCell(cell: GoogleSpreadsheetCell) {
  if (! cell.value) {
    return false;
  }

  const { fontSize, bold } = cell.effectiveFormat.textFormat;

  // Assume that class cells are those with a font size of 14 and bold content
  return fontSize === 14 && bold;
}

export function getPlayersRows(dkpSheet: GoogleSpreadsheetWorksheet) {
  return getRows(dkpSheet).filter(row => isPlayerCell(row.cells[DKP_LIST_COLUMNS.PLAYER]));
}

export function getRowIndexOfLastPlayerWithClass(dkpSheet: GoogleSpreadsheetWorksheet, playerClass: PlayerClass) {
  const playerClassName = PLAYER_CLASS_NAMES[playerClass];
  const rows = getRows(dkpSheet);
  let didFindClass = false;
  let lastIndex = -1;

  for (let i = 0; i < rows.length; i += 1) {
    const row = rows[i];
    if (didFindClass) {
      const playerCell = row.cells[DKP_LIST_COLUMNS.PLAYER];

      if (isPlayerCell(playerCell)) {
        lastIndex = i;
      }
      else {
        break;
      }
    }
    else {
      const classCell = row.cells[DKP_LIST_COLUMNS.CLASS];

      if (isClassCell(classCell) && classCell.value === playerClassName) {
        didFindClass = true;
      }
    }
  }

  return lastIndex;
}
