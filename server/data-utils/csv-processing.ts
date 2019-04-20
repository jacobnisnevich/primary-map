import * as path from 'path';
import * as fs from 'fs';
import { zipObject } from 'lodash';

import * as p from '../types';

import { convertPollsToFlatPolls } from './data-shaping';

export const CSV_PATH = (): string => path.resolve(__dirname, `../../polls.csv`);

export const writePollingDataToCsv = (polls: p.Poll[]): void => {
  const csvData = buildCsvDataFromPolls(polls);
  fs.writeFileSync(CSV_PATH(), csvData, 'utf8');
};

export const readPollingDataFromCsv = (): p.FlatPoll[] => {
  const csvData = fs.readFileSync(CSV_PATH(), 'utf8');
  return buildPollsListFromCsvData(csvData);
};

const buildCsvDataFromPolls = (polls: p.Poll[]): string => {
  const flatPolls = convertPollsToFlatPolls(polls);
  return buildCsvDataFromFlatPolls(flatPolls);
};

const buildCsvDataFromFlatPolls = (pollsList: p.FlatPoll[]): string => {
  const columnHeaders = Object.keys(pollsList[0]);

  const headerString = `${columnHeaders.join()}\n`;
  const dataString = pollsList
    .map((flattenedPoll: p.FlatPoll): string => `${Object.values(flattenedPoll).join()}`)
    .join(`\n`);

  return headerString + dataString;
};

const buildPollsListFromCsvData = (csvData: string): p.FlatPoll[] => {
  const csvDataRows = csvData.split('\n');
  const csvDataHeaders = csvDataRows[0].split(',');
  return csvDataRows.slice(1).map((csvDataRow: string) => zipObject(csvDataHeaders, csvDataRow.split(',')));
};
