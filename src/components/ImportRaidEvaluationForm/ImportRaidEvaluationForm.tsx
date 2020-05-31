import { Button, Form, Input, message } from 'antd';
import { useForm } from 'antd/lib/form/Form';
import { GoogleSpreadsheet, GoogleSpreadsheetCellCollection } from 'google-spreadsheet';
import React, { useCallback, useState } from 'react';
import { DKP_LIST_COLUMNS, PLAYER_CLASSES, RAIDS } from '../../constants';
import { Evaluation, Participant, PlayerClass } from '../../types/addon';
import { getPlayersRows, getRowIndexOfLastPlayerWithClass } from '../../utils/dkpSheet';
import { insertRowAfter } from '../../utils/google-spreadsheets';
import { getDkpWorksheet, getRow } from '../../utils/sheets';


interface Props {
  sheet: GoogleSpreadsheet;
}

function getParticipantItems(evaluation: Evaluation, participant: Participant) {
  return evaluation.loot.filter((lootEntry) => {
    if (! lootEntry.givenTo) {
      return false;
    }

    return lootEntry.givenTo.player === participant.player;
  });
}

export function ImportRaidEvaluationForm(props: Props) {
  const { sheet } = props;
  const dkpSheet = getDkpWorksheet(sheet);
  const [form] = useForm();
  const [isLoading, setIsLoading] = useState(false);
  const handleFinish = useCallback(async (values) => {
    setIsLoading(true);

    let evaluation: Evaluation;

    try {
      evaluation = JSON.parse(values.jsonCode);

      if (!evaluation.raid || !evaluation.participants || !evaluation.loot) {
        setIsLoading(false);
        return message.error(`Ungültiges Format.`);
      }
    }
    catch (error) {
      setIsLoading(false);
      return message.error(`Die Raidauswertung konnte nicht geladen werden.\n${error}`);
    }

    await dkpSheet.loadCells();

    const dkpColumn = DKP_LIST_COLUMNS[RAIDS[evaluation.raid]];
    const playerRows: { [key: string]: GoogleSpreadsheetCellCollection } = getPlayersRows(dkpSheet).reduce((carry, playerRow) => ({
      ...carry,
      [playerRow.cells[DKP_LIST_COLUMNS.PLAYER].value]: playerRow,
    }), {});

    Object.values(playerRows).forEach((playerRow) => {
      // Reset the recent loot field for all players
      playerRow.cells[DKP_LIST_COLUMNS.RECENT_LOOT].value = '';
    });

    for (const participant of evaluation.participants) {
      let row = playerRows[participant.player];

      if (! row) {
        const playerClass = participant.class || (PLAYER_CLASSES.PALADIN as PlayerClass);
        const lastPlayerWithSameClass = getRowIndexOfLastPlayerWithClass(dkpSheet, playerClass);
        const newRowIndex = lastPlayerWithSameClass + 1;

        await insertRowAfter(dkpSheet, newRowIndex);

        // Update player rows
        const newRow = getRow(dkpSheet, newRowIndex);

        newRow.cells[DKP_LIST_COLUMNS.PLAYER].value = participant.player;
        newRow.cells[DKP_LIST_COLUMNS.SPEC].value = '?';
        newRow.cells[DKP_LIST_COLUMNS[RAIDS.MOLTEN_CORE]].value = 10;
        newRow.cells[DKP_LIST_COLUMNS[RAIDS.BLACKWING_LAIR]].value = 10;
        newRow.cells[DKP_LIST_COLUMNS[RAIDS.ZUL_GURUB]].value = 10;

        // Quickly save the changed cell values to properly work with the new cells locally
        await dkpSheet.saveCells([
          newRow.cells[DKP_LIST_COLUMNS.PLAYER],
          newRow.cells[DKP_LIST_COLUMNS.SPEC],
          newRow.cells[DKP_LIST_COLUMNS[RAIDS.MOLTEN_CORE]],
          newRow.cells[DKP_LIST_COLUMNS[RAIDS.BLACKWING_LAIR]],
          newRow.cells[DKP_LIST_COLUMNS[RAIDS.ZUL_GURUB]],
        ]);

        row = newRow;
        playerRows[participant.player] = newRow;
      }

      const items = getParticipantItems(evaluation, participant);
      const currentDkp = row
        ? parseInt(row.cells[dkpColumn].value)
        : 10;
      const dkpPaidForItems = items.reduce((carry, item) => carry + Number(item.givenTo.dkp), 0);
      const dkpAfterRaid = currentDkp - dkpPaidForItems;
      let dkpForNextRaid = dkpPaidForItems === 0
        ? dkpAfterRaid + 1
        : Math.min(dkpAfterRaid, 10);
      let recentLootText = `Vorherige DKP: ${currentDkp}`;

      if (dkpForNextRaid < 10) {
        dkpForNextRaid = Math.min(dkpForNextRaid + 10, 10);
      }

      if (items.length > 0) {
        const playerLootList = items.map(entry => (
          `${entry.itemName} (${entry.givenTo.dkp})`
        )).join(', ');

        recentLootText += `, ${playerLootList}`;
      }

      if (participant.dkp !== currentDkp) {
        // TODO: Warning because dkp stored in addon differs from dkp in spreadsheet
      }

      row.cells[dkpColumn].value = dkpForNextRaid;
      row.cells[DKP_LIST_COLUMNS.RECENT_LOOT].value = recentLootText;
    }

    await dkpSheet.saveUpdatedCells();

    message.success('Der Raid wurde erfolgreich importiert und die DKP-Stände angepasst!');

    form.resetFields();
    setIsLoading(false);
  }, [dkpSheet, form]);

  return (
    <Form
      form={form}
      onFinish={handleFinish}
      layout="vertical"
    >
      <Form.Item
        label="JSON-Code"
        name="jsonCode"
        rules={[
          {
            required: true,
            message: 'Bitte trage den JSON-Code ein.',
          },
        ]}
      >
        <Input.TextArea
          autoSize={{ minRows: 5 }}
          style={{ fontFamily: 'monospace' }}
        />
      </Form.Item>

      <Form.Item style={{ textAlign: 'right' }}>
        <Button type="primary" htmlType="submit" loading={isLoading}>
          Weiter
        </Button>
      </Form.Item>
    </Form>
  );
}
