import { Alert, Tabs } from 'antd';
import { GoogleSpreadsheet } from 'google-spreadsheet';
import React from 'react';
import { ExportJsonCodeContainer } from '../components/ExportJsonCodeContainer';
import { ImportRaidEvaluationForm } from '../components/ImportRaidEvaluationForm';
import { getDkpWorksheet } from '../utils/sheets';


type Props = {
  sheet: GoogleSpreadsheet;
}

const TABS = {
  EXPORT_DKP: 'EXPORT_DKP',
  IMPORT_RAID: 'IMPORT_RAID',
};

export function Sheet(props: Props) {
  const { sheet } = props;
  const dkpSheet = getDkpWorksheet(sheet);

  return (
    <>
      <h1>
        Aktives Spreadsheet:
        {' '}
        <a
          href={`https://docs.google.com/spreadsheets/d/${sheet.spreadsheetId}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          {sheet.title}
        </a>
      </h1>

      <Tabs defaultActiveKey={TABS.EXPORT_DKP} animated={false}>
        <Tabs.TabPane
          key={TABS.EXPORT_DKP}
          tab="DKP-Liste exportieren"
        >
          <Alert
            message="Mit dem folgenden JSON-Code kannst du den aktuellen DKP-Stand im DKBLoot-Addon importieren."
            type="info"
            style={{ marginBottom: '1rem' }}
            showIcon
          />

          <ExportJsonCodeContainer dkpSheet={dkpSheet}/>
        </Tabs.TabPane>

        <Tabs.TabPane
          key={TABS.IMPORT_RAID}
          tab="Raid-Auswertung importieren"
        >
          <Alert
            message="Gib in das folgende Textfeld den JSON-Code aus dem Raidauswertungsfenster ein."
            type="info"
            style={{ marginBottom: '1rem' }}
            showIcon
          />

          <ImportRaidEvaluationForm sheet={sheet}/>
        </Tabs.TabPane>
      </Tabs>
    </>
  );
}
