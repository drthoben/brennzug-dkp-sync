import { Button, Form, Input, message } from 'antd';
import { useForm } from 'antd/lib/form/Form';
import { GoogleSpreadsheet, GoogleSpreadsheetCellCollection, GoogleSpreadsheetWorksheet } from 'google-spreadsheet';
import React, { useCallback, useState } from 'react';
import { DKP_LIST_COLUMNS, PLAYER_CLASSES, RAID_NAMES, RAIDS } from '../../constants';
import { Evaluation, LootEntry, Participant, PlayerClass } from '../../types/addon';
import { getPlayersRows, getRowIndexOfLastPlayerWithClass } from '../../utils/dkpSheet';
import { insertRowAfter } from '../../utils/google-spreadsheets';
import { getDkpWorksheet, getLootLogWorksheet, getRow, getRows } from '../../utils/sheets';


interface Props {
  sheet: GoogleSpreadsheet;
}

interface PlayerLoot {
  player: string,
  items: Required<LootEntry>[],
}

function getParticipantItems(evaluation: Evaluation, participant: Participant) {
  return evaluation.loot.filter((lootEntry) => {
    if (! lootEntry.givenTo) {
      return false;
    }

    return lootEntry.givenTo.player === participant.player;
  });
}

async function updateDKPSheet(dkpSheet: GoogleSpreadsheetWorksheet, evaluation: Evaluation) {
  await dkpSheet.loadCells();

  const dkpColumn = DKP_LIST_COLUMNS[RAIDS[evaluation.raid]];
  const playerRows: { [key: string]: GoogleSpreadsheetCellCollection } = getPlayersRows(dkpSheet)
    .reduce((carry, playerRow) => ({
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
}

async function updateLootLog(lootLogSheet: GoogleSpreadsheetWorksheet, evaluation: Evaluation) {
  await lootLogSheet.loadCells();

  const lootLogRows = getRows(lootLogSheet);
  let lastRowIndex = null;

  for (let i = 0; i < lootLogRows.length - 5 && lastRowIndex === null; i += 1) {
    let fiveInARow = true;

    for (let j = 0; j < 5 && fiveInARow; j += 1) {
      const currentRow = lootLogRows[i + j];

      for (let k = 0; k < 2 && fiveInARow; k += 1) {
        const relevantCell = currentRow.cells[k];

        if (relevantCell.value !== null && relevantCell.value !== '') {
          fiveInARow = false;
        }
      }
    }

    if (fiveInARow) {
      lastRowIndex = i;
    }
  }

  if (lastRowIndex === null) {
    throw new Error('Keine freie Stelle im Logbuch gefunden');
  }

  const playerLootMap: PlayerLoot[] = evaluation.loot.reduce((carry: any, entry) => {
    if (! entry.givenTo) {
      return carry;
    }

    const { player } = entry.givenTo;

    if (! carry[player]) {
      carry[player] = {
        player,
        items: [],
      };
    }

    carry[player].items.push(entry);

    return carry;
  }, {});
  const groupedLoot = Object.values(playerLootMap).sort((a, b) => (
  	String.prototype.localeCompare.call(a.player, b.player)
  ));
  // 2 empty rows, 1 caption row, 1 empty row, n rows for n players who won items
  const rowsToInsert = 2 + 1 + 1 + groupedLoot.length;

  // Insert a couple of rows
  await insertRowAfter(lootLogSheet, lastRowIndex, rowsToInsert);

  const newRows = getRows(lootLogSheet, lastRowIndex + 2, rowsToInsert - 2);
  const raidName = RAID_NAMES[evaluation.raid];
  const captionCell = newRows[0].cells[0];

  captionCell.value = `${raidName} ${evaluation.date}`;
  captionCell.textFormat = {
    fontSize: 18,
    bold: true,
  };

  for (let i = 0, row = 2; i < groupedLoot.length; i += 1, row += 1) {
    newRows[row].cells[1].value = groupedLoot[i].player;
    newRows[row].cells[2].value = groupedLoot[i].items.map((lootEntry) => (
      `${lootEntry.itemName} (${lootEntry.givenTo.dkp})`
    )).join(', ');
  }

  await lootLogSheet.saveUpdatedCells();
}

export function ImportRaidEvaluationForm(props: Props) {
  const { sheet } = props;
  const dkpSheet = getDkpWorksheet(sheet);
  const lootLogSheet = getLootLogWorksheet(sheet);
  const [form] = useForm();
  const [isLoading, setIsLoading] = useState(false);
  const handleFinish = useCallback(async (values) => {
    setIsLoading(true);

    const messageKey = `Message-${Math.random().toString().substr(2)}`;
    let evaluation: Evaluation;

    try {
      evaluation = JSON.parse(values.jsonCode);

      if (! evaluation.raid || ! evaluation.participants || ! evaluation.loot) {
        setIsLoading(false);
        return message.error(`Ungültiges Format.`);
      }
    }
    catch (error) {
      setIsLoading(false);
      return message.error(`Die Raidauswertung konnte nicht geladen werden.\n${error}`);
    }

    try {
      message.loading({
        key: messageKey,
        content: 'Aktualisiere die Punkteübersicht...',
        duration: 0,
      });

      await updateDKPSheet(dkpSheet, evaluation);

      message.loading({
        key: messageKey,
        content: 'Aktualisiere Logbuch...',
        duration: 0,
      });

      await updateLootLog(lootLogSheet, evaluation);

      message.success({
        key: messageKey,
        content: 'Der Raid wurde erfolgreich importiert!',
      });
    }
    catch (error) {
      message.error({
        key: messageKey,
        content: error.toString(),
      });
    }

    form.resetFields();
    setIsLoading(false);
  }, [dkpSheet, lootLogSheet, form]);

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
