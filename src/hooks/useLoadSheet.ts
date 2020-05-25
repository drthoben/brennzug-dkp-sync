import { GoogleSpreadsheet, ServiceAccountCredentials } from 'google-spreadsheet';
import { useCallback } from 'react';
import { SHEET_URL_REGEX } from '../constants';
import { getDkpWorksheet } from '../utils/sheets';


export function useLoadSheet() {
  return useCallback(async (sheetUrl: string, credentials: ServiceAccountCredentials) => {
    const [, sheetId] = sheetUrl.match(SHEET_URL_REGEX);
    const sheet = new GoogleSpreadsheet(sheetId);

    try {
      await sheet.useServiceAccountAuth(credentials);
    }
    catch (error) {
      throw new Error(`Beim Authentifizieren ist ein Fehler aufgetreten.\n${error}`);
    }

    try {
      await sheet.loadInfo();
    }
    catch (error) {
      throw new Error(`Beim Laden des Spreadsheets ist ein Fehler aufgetreten.\n${error}`);
    }

    const dkpSheet = getDkpWorksheet(sheet);

    if (!dkpSheet) {
      throw new Error('Ungültiges Spreadsheet: Bitte stelle sicher, dass die Liste "Punkteübersicht" existiert.');
    }

    return sheet;
  }, []);
}
