import * as cheerio from 'cheerio';
import axios from 'axios';
import { toNumber, zipObject, startCase } from 'lodash';

import * as p from '../types';

import {
  STATE_NAMES,
  CAUCUS,
  PRIMARY,
  WIKIPEDIA_BASE_URL,
  STATE_POLLING_ROUTE,
  NATIONAL_POLLING_ROUTE
} from '../util/constants';

export const loadWikipediaStatePollingData = async (): Promise<p.StatePollingData> => {
  const WIKIPEDIA_POLLING_URL = `${WIKIPEDIA_BASE_URL}${STATE_POLLING_ROUTE}`;
  const response = await axios.get(WIKIPEDIA_POLLING_URL);
  const $ = cheerio.load(response.data);

  const statePollingData = STATE_NAMES.map(stateName => getStatePollingData(stateName, $));

  return zipObject(STATE_NAMES, statePollingData);
};

export const loadWikipediaNationalPollingData = async (): Promise<p.Poll[]> => {
  const WIKIPEDIA_POLLING_URL = `${WIKIPEDIA_BASE_URL}${NATIONAL_POLLING_ROUTE}`;
  const response = await axios.get(WIKIPEDIA_POLLING_URL);
  const $ = cheerio.load(response.data);

  const nationalPolls = getNationalPollingData($);

  return nationalPolls;
};

const getNationalPollingData = ($: CheerioSelector): p.Poll[] => {
  const tableElements = $('.wikitable th:contains("Poll source")').closest('.wikitable');
  let polls = [];

  tableElements.each(
    (index: number, tableElement: CheerioElement): void => {
      polls = [...polls, ...parseNationalPollingTable(tableElement, $)];
    }
  );

  return polls;
};

const parseNationalPollingTable = (tableElement: CheerioElement, $: CheerioSelector): p.Poll[] => {
  const tableRows = $(tableElement).find('tr');
  const tableHeaderElement = $(tableRows[0]);

  const tableDefinition = getTableDefinition(tableHeaderElement, $);
  const year = $(tableElement)
    .prev()
    .text()
    .replace(/[^0-9]/g, '');

  return getPolls(tableDefinition, tableRows, $, year);
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
    .nextAll('.wikitable')[0];
  const tableRows = $(tableElement).find('tr');
  const tableHeaderElement = $(tableRows[0]);

  const tableDefinition = getTableDefinition(tableHeaderElement, $);
  return getPolls(tableDefinition, tableRows, $);
};

const getTableDefinition = (tableHeaderElement: Cheerio, $: CheerioSelector): p.TableDefinition => {
  const tableHeaderColumns = tableHeaderElement.find('th');

  const columnNames = tableHeaderColumns
    .map(
      (index: number, tableHeaderColumn: CheerioElement): string =>
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

const getPolls = (
  tableDefinition: p.TableDefinition,
  tableDataRows: Cheerio,
  $: CheerioSelector,
  year?: string
): p.Poll[] => {
  let polls = [];

  tableDataRows.slice(1).each((index: number, tableDataRow: CheerioElement) => {
    if (!tableDataRow.attribs['style']) {
      polls = [...polls, getPollFromTableDataRow(tableDefinition, $(tableDataRow), $, year)];
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
      const previousValidPoll = getClosestValidPoll(polls, i);
      backFilledPolls.push({
        ...currentPoll,
        date: previousValidPoll.date,
        sampleSize: previousValidPoll.sampleSize,
        marginOfError: previousValidPoll.marginOfError
      });
    }
  }

  return backFilledPolls;
};

const getClosestValidPoll = (polls: p.Poll[], i: number): p.Poll => {
  while (!polls[i].date) {
    i--;
  }
  return polls[i];
};

const getPollFromTableDataRow = (
  tableDefinition: p.TableDefinition,
  tableDataRowElement: Cheerio,
  $: CheerioSelector,
  year?: string
): p.Poll => {
  let candidateResults = {};
  let date = undefined;
  let sampleSize = undefined;
  let marginOfError = undefined;

  const rowColumnCountDifference = tableDefinition.columnCount - tableDataRowElement.find('td').length;
  const isSubPoll = rowColumnCountDifference !== 0;
  const startCandidateIndex = isSubPoll ? 4 - rowColumnCountDifference : 4;

  tableDataRowElement.find('td').each((index: number, tableDataCell: CheerioElement) => {
    const cellText = $(tableDataCell).text();

    if (!isSubPoll && index < 4) {
      if (index === 1) {
        date = cleanUpDateValue(cellText, year);
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

const cleanUpDateValue = (dateValue: string, year?: string): Date => {
  const dateString = year ? `${dateValue} ${year}` : dateValue;
  const numberOfMonths = dateString.replace(/[^a-zA-Z]/g, '').length / 3;

  if (/[a-zA-Z]{3} [0-9]{4}/.test(dateValue)) {
    return new Date(dateValue);
  }

  if (numberOfMonths === 1) {
    return new Date(dateString.replace(/(...) .+–(.*)/i, '$1 $2'));
  } else if (numberOfMonths === 2) {
    return new Date(dateString.replace(/(.*) – (.*)/i, '$2'));
  } else {
    return new Date();
  }
};

const cleanUpSampleSizeValue = (sampleSizeValue: string): number => {
  if (sampleSizeValue.trim() !== '–') {
    return toNumber(sampleSizeValue.trim().replace(/[^0-9]/g, ''));
  } else {
    return null;
  }
};

const cleanUpMarginOfErrorValue = (marginOfErrorValue: string): number => {
  if (marginOfErrorValue.includes('±')) {
    return toNumber(marginOfErrorValue.trim().replace(/[^0-9.]/g, ''));
  } else {
    return null;
  }
};

const cleanUpPollDataValue = (pollDataValueText: string): number => {
  if (pollDataValueText.trim() !== '–') {
    return toNumber(pollDataValueText.trim().replace(/[^0-9]/g, ''));
  } else {
    return null;
  }
};
