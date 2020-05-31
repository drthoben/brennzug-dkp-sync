import { ExclamationCircleOutlined } from '@ant-design/icons/lib';
import { Alert, Button, Tabs, Form, Modal, Card } from 'antd';
import { GoogleSpreadsheet } from 'google-spreadsheet';
import React, { useCallback } from 'react';
import { Block } from '../components/Block';
import { ExportJsonCodeContainer } from '../components/ExportJsonCodeContainer';
import { ImportRaidEvaluationForm } from '../components/ImportRaidEvaluationForm';
import { STORAGE_KEYS } from '../constants';
import { getDkpWorksheet } from '../utils/sheets';


type Props = {
  sheet: GoogleSpreadsheet;
}

const TABS = {
  EXPORT_DKP: 'EXPORT_DKP',
  IMPORT_RAID: 'IMPORT_RAID',
  SETTINGS: 'SETTINGS',
};

export function Sheet(props: Props) {
  const { sheet } = props;
  const dkpSheet = getDkpWorksheet(sheet);
  const handleReset = useCallback(() => {
    Modal.confirm({
      title: 'Willst du lokal gespeicherte Daten zurücksetzen?',
      icon: <ExclamationCircleOutlined/>,
      content: 'Wenn du OK klickst, wird die Seite neugeladen.',
      onOk() {
        window.localStorage.removeItem(STORAGE_KEYS.SHEET_URL);
        window.localStorage.removeItem(STORAGE_KEYS.CREDENTIALS);
        window.location.reload();
      },
      onCancel() {
      },
    });
  }, []);

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

        <Tabs.TabPane
          key={TABS.SETTINGS}
          tab="Einstellungen"
        >
          <Card>
            <Block>
              <p>Gespeicherte App-Daten zurücksetzen.</p>

              <Form.Item style={{ textAlign: 'right' }}>
                <Button type="primary" onClick={handleReset} danger>
                  Daten zurücksetzen
                </Button>
              </Form.Item>
            </Block>
          </Card>
        </Tabs.TabPane>
      </Tabs>
    </>
  );
}
