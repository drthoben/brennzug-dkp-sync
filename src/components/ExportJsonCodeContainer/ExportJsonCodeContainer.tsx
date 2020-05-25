import { LoadingOutlined } from '@ant-design/icons';
import { Empty, Input } from 'antd';
import { GoogleSpreadsheetWorksheet } from 'google-spreadsheet';
import React, { useState } from 'react';
import { DKP_LIST_COLUMNS, RAIDS } from '../../constants';
import { useAsyncEffect } from '../../hooks/useAsyncEffect';
import { getPlayersRows } from '../../utils/dkpSheet';


interface Props {
  dkpSheet: GoogleSpreadsheetWorksheet;
}

export function ExportJsonCodeContainer(props: Props) {
  const { dkpSheet } = props;
  const [jsonCode, setJsonCode] = useState(null);

  useAsyncEffect(async () => {
    const playerDkp = [];

    await dkpSheet.loadCells();

    for (const playerRow of getPlayersRows(dkpSheet)) {
      const playerCell = playerRow.cells[DKP_LIST_COLUMNS.PLAYER];
      const player = playerCell.value;

      if (! player) {
        continue;
      }

      const { fontSize, bold } = playerCell.effectiveFormat.textFormat;

      if (fontSize === 10 && ! bold) {
        playerDkp.push({
          player,
          dkp: {
            [RAIDS.MOLTEN_CORE]: playerRow.cells[DKP_LIST_COLUMNS.MOLTEN_CORE].value,
            [RAIDS.BLACKWING_LAIR]: playerRow.cells[DKP_LIST_COLUMNS.BLACKWING_LAIR].value,
            [RAIDS.ZUL_GURUB]: playerRow.cells[DKP_LIST_COLUMNS.ZUL_GURUB].value,
          },
        });
      }
    }

    setJsonCode(JSON.stringify({
      brennzug: playerDkp,
    }));
  }, [dkpSheet]);

  if (! jsonCode) {
    return (
      <Empty
        description="Lade Daten..."
        image={(
          <LoadingOutlined style={{ fontSize: '5rem' }}/>
        )}
      />
    );
  }

  return (
    <Input.TextArea
      value={jsonCode}
      autoSize={{ minRows: 5 }}
      onClick={event => (event.target as HTMLInputElement).select()}
      style={{ fontFamily: 'monospace' }}
      readOnly
    />
  );
}
