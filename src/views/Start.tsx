import { InboxOutlined } from '@ant-design/icons';
import { Button, Checkbox, Form, Input, message, Upload } from 'antd';
import { GoogleSpreadsheet } from 'google-spreadsheet';
import React, { useCallback, useState } from 'react';
import { SHEET_URL_REGEX, STORAGE_KEYS } from '../constants';
import { useAsyncEffect } from '../hooks/useAsyncEffect';
import { useLoadSheet } from '../hooks/useLoadSheet';
import { getFileAsFileListFromEvent } from '../utils/antd';
import { readJsonFromFile } from '../utils/file';


type Props = {
  onFinish: (sheet: GoogleSpreadsheet) => void;
}

export function Start(props: Props) {
  const { onFinish } = props;
  const [isLoading, setIsLoading] = useState(false);
  const loadSheet = useLoadSheet();
  const handleFinish = useCallback(async (values) => {
    setIsLoading(true);

    let credentials;

    try {
      credentials = await readJsonFromFile(values.credentialsFile[0]);
    }
    catch (error) {
      setIsLoading(false);
      return message.error(`Deine Zugangsdatendatei konnte nicht gelesen werden.\n${error}`);
    }

    try {
      const sheet = await loadSheet(values.sheetUrl, credentials);

      if (values.persist) {
        window.localStorage.setItem(STORAGE_KEYS.SHEET_URL, values.sheetUrl);
        window.localStorage.setItem(STORAGE_KEYS.CREDENTIALS, JSON.stringify(credentials));
      }

      setIsLoading(false);
      onFinish(sheet);
    }
    catch (error) {
      setIsLoading(false);
      return message.error(error.message);
    }
  }, [loadSheet, onFinish]);

  useAsyncEffect(async () => {
    setIsLoading(true);

    try {
      const sheetUrl = window.localStorage.getItem(STORAGE_KEYS.SHEET_URL);
      const credentials = JSON.parse(window.localStorage.getItem(STORAGE_KEYS.CREDENTIALS));
      const sheet = await loadSheet(sheetUrl, credentials);

      setIsLoading(false);
      onFinish(sheet);
    }
    catch (error) {
      window.localStorage.removeItem(STORAGE_KEYS.SHEET_URL);
      window.localStorage.removeItem(STORAGE_KEYS.CREDENTIALS);
      setIsLoading(false);
    }
  }, [loadSheet, onFinish]);

  return (
    <>
      <h1>DKP-Liste laden</h1>

      <Form
        onFinish={handleFinish}
        layout="vertical"
        initialValues={{
          sheetUrl: window.localStorage.getItem(STORAGE_KEYS.SHEET_URL),
          persist: true,
        }}
      >
        <Form.Item
          label="Spreadsheet-URL"
          name="sheetUrl"
          rules={[
            {
              required: true,
              message: 'Bitte trage die URL zum Google Spreadsheet ein.',
            },
            {
              pattern: SHEET_URL_REGEX,
              message: 'Das scheint keine gültige Spreadheet-URL zu sein.',
            },
          ]}
        >
          <Input disabled={isLoading}/>
        </Form.Item>

        <Form.Item
          label="Service-Account-Zugangsdaten"
          required
        >
          <Form.Item
            name="credentialsFile"
            valuePropName="fileList"
            getValueFromEvent={getFileAsFileListFromEvent}
            rules={[
              {
                required: true,
                message: 'Bitte wähle deine Zugangsdaten aus.',
              },
            ]}
            noStyle
          >
            <Upload.Dragger
              name="credentialsFile"
              beforeUpload={() => false}
              disabled={isLoading}
            >
              <p className="ant-upload-drag-icon">
                <InboxOutlined/>
              </p>
              <p className="ant-upload-text">Klicke hier oder ziehe deine Zugangsdaten Datei hier rein</p>
              <p className="ant-upload-hint">
                Wähle deine <code>Zugangsdaten.json</code>-Datei aus.
              </p>
            </Upload.Dragger>
          </Form.Item>
        </Form.Item>

        <Form.Item style={{ textAlign: 'right' }}>
          <Form.Item
            name="persist"
            valuePropName="checked"
            noStyle
          >
            <Checkbox>Auf diesem Gerät speichern</Checkbox>
          </Form.Item>

          <Button type="primary" htmlType="submit" loading={isLoading}>
            Weiter
          </Button>
        </Form.Item>
      </Form>
    </>
  );
}
