import * as cheerio from 'cheerio';
import axios from 'axios';
import { toNumber, zipObject, startCase } from 'lodash';

import * as p from '../types';

import { STATE_NAMES, CAUCUS, PRIMARY } from '../util/constants';

export const loadWikipediaPollingData = async (): Promise<p.PollingData> => {
  const WIKIPEDIA_POLLING_URL =
    'https://en.wikipedia.org/wiki/Statewide_opinion_polling_for_the_2020_Democratic_Party_presidential_primaries';
  const response = await axios.get(WIKIPEDIA_POLLING_URL);
  const $ = cheerio.load(response.data);

  const statePollingData = STATE_NAMES.map(stateName => getStatePollingData(stateName, $));

  return zipObject(STATE_NAMES, statePollingData);
};

const getStatePollingData = (stateName: string, $: CheerioSelector): p.Poll[] => {
  const stateNameFormatted = stateName.split(' ').join('_');

  const statePrimaryId = `${stateNameFormatted}_${PRIMARY}`;
  const primaryHeaderTextElement = $(`#${statePrimaryId}`)[0];

  const stateCaucusId = `${stateNameFormatted}_${CAUCUS}`;
  const caucusHeaderTextElement = $(`#${stateCaucusId}`)[0];

  if (primaryHeaderTextElement) {
    return getStatePollsFromTable(primaryHeaderTextElement, $);
  } else if (caucusHeaderTextElement) {
    return getStatePollsFromTable(caucusHeaderTextElement, $);
  }

  return [];
};

const getStatePollsFromTable = (headerTextElement: CheerioElement, $: CheerioSelector): p.Poll[] => {
  const tableElement = $(headerTextElement)
    .parent()
    .next()
    .next();
  const tableRows = $(tableElement).find('tr');
  const tableHeaderElement = $(tableRows[0]);

  const tableDefinition = getTableDefinition(tableHeaderElement, $);
  return getStatePolls(tableDefinition, tableRows, $);
};

const getTableDefinition = (tableHeaderElement: Cheerio, $: CheerioSelector): p.TableDefinition => {
  const tableHeaderColumns = tableHeaderElement.find('th');

  const columnNames = tableHeaderColumns
    .map((index, tableHeaderColumn) =>
      $(tableHeaderColumn)
        .text()
        .trim()
    )
    .get();
  const candidates = columnNames
    .slice(columnNames.indexOf('Marginof error') + 1, columnNames.indexOf('Other'))
    .map(startCase);

  return { candidates, columnCount: columnNames.length };
};

const getStatePolls = (tableDefinition: p.TableDefinition, tableDataRows: Cheerio, $: CheerioSelector): p.Poll[] => {
  let polls = [];

  tableDataRows.each((index: number, tableDataRow: CheerioElement) => {
    if (index > 0) {
      // Skip header row
      polls = [...polls, getPollFromTableDataRow(tableDefinition, $(tableDataRow), $)];
    }
  });

  polls = backFillSubPollData(polls);

  return polls;
};

const backFillSubPollData = (polls: p.Poll[]): p.Poll[] => {
  const backFilledPolls = [];

  for (let i = 0; i < polls.length; i++) {
    const currentPoll = polls[i];
    if (currentPoll.date) {
      backFilledPolls.push(currentPoll);
    } else if (i > 0) {
      const previousPoll = polls[i - 1];
      backFilledPolls.push({
        ...currentPoll,
        date: previousPoll.date,
        sampleSize: previousPoll.sampleSize,
        marginOfError: previousPoll.marginOfError
      });
    }
  }

  return backFilledPolls;
};

const getPollFromTableDataRow = (
  tableDefinition: p.TableDefinition,
  tableDataRowElement: Cheerio,
  $: CheerioSelector
): p.Poll => {
  let candidateResults = {};
  let date = undefined;
  let sampleSize = undefined;
  let marginOfError = undefined;

  const isSubPoll = tableDataRowElement.find('td').length !== tableDefinition.columnCount;
  const startCandidateIndex = isSubPoll ? 0 : 4;

  tableDataRowElement.find('td').each((index: number, tableDataCell: CheerioElement) => {
    const cellText = $(tableDataCell).text();

    if (!isSubPoll && index < 4) {
      if (index === 1) {
        date = cleanUpDateValue(cellText);
      } else if (index === 2) {
        sampleSize = cleanUpSampleSizeValue(cellText);
      } else if (index === 3) {
        marginOfError = cleanUpMarginOfErrorValue(cellText);
      }
      return;
    } else if (isSubPoll && index < startCandidateIndex) {
      return;
    }

    if (index - startCandidateIndex < tableDefinition.candidates.length) {
      candidateResults[tableDefinition.candidates[index - startCandidateIndex]] = cleanUpPollDataValue(cellText);
    }
  });

  return { date, sampleSize, marginOfError, candidateResults };
};

const cleanUpDateValue = (dateValue: string): Date => {
  return new Date(dateValue.replace(/(...) ..+–(.*)/i, '$1 $2'));
};

const cleanUpSampleSizeValue = (sampleSizeValue: string): number => {
  return toNumber(sampleSizeValue.trim().replace(/[^0-9]/g, ''));
};

const cleanUpMarginOfErrorValue = (marginOfErrorValue: string): number => {
  if (marginOfErrorValue.includes('±')) {
    return toNumber(marginOfErrorValue.trim().replace(/[^0-9.]/g, ''));
  } else {
    return 0;
  }
};

const cleanUpPollDataValue = (pollDataValueText: string): number => {
  return toNumber(
    pollDataValueText
      .trim()
      .replace(/\[.*\]/gi, '')
      .replace('%', '')
  );
};
