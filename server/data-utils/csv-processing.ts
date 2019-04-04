import * as path from 'path';
import * as fs from 'fs';
import { zipObject } from 'lodash';

import * as p from '../types';

import { convertStatePollingDataToFlatPolls } from './data-shaping';

export const CSV_PATH = path.resolve(__dirname, '../../polls.csv');

export const writePollingDataToCSV = (pollingData: p.StatePollingData): void => {
  const csvData = buildCsvDataFromStatePollingData(pollingData);
  fs.writeFileSync(CSV_PATH, csvData, 'utf8');
};

export const readPollingDataFromCSV = (): p.FlatPoll[] => {
  const csvData = fs.readFileSync(CSV_PATH, 'utf8');
  return buildPollsListFromCsvData(csvData);
};

const buildCsvDataFromStatePollingData = (pollingData: p.StatePollingData): string => {
  const flattenedPollingData = convertStatePollingDataToFlatPolls(pollingData);
  const columnHeaders = Object.keys(flattenedPollingData[0]);

  const headerString = `${columnHeaders.join()}\n`;
  const dataString = flattenedPollingData
    .map((flattenedPoll: p.FlatPoll): string => `${Object.values(flattenedPoll).join()}`)
    .join(`\n`);

  return headerString + dataString;
};

const buildPollsListFromCsvData = (csvData: string): p.FlatPoll[] => {
  const csvDataRows = csvData.split('\n');
  const csvDataHeaders = csvDataRows[0].split(',');
  return csvDataRows.slice(1).map((csvDataRow: string) => zipObject(csvDataHeaders, csvDataRow.split(',')));
};
