import * as path from 'path';
import * as fs from 'fs';
import { zipObject } from 'lodash';

import * as p from '../types';

import { convertStatePollingDataToFlatPolls, convertNationalPollingDataToFlatPolls } from './data-shaping';

export const CSV_PATH = (type: p.PollType): string => path.resolve(__dirname, `../../polls-${type}.csv`);

export const writeStatePollingDataToCsv = (pollingData: p.StatePollingData): void => {
  const csvData = buildCsvDataFromStatePollingData(pollingData);
  fs.writeFileSync(CSV_PATH('state'), csvData, 'utf8');
};

export const writeNationalPollingDataToCsv = (polls: p.Poll[]): void => {
  const csvData = buildCsvDataFromNationalPollingData(polls);
  fs.writeFileSync(CSV_PATH('national'), csvData, 'utf8');
};

export const readPollingDataFromCsv = (type: p.PollType): p.FlatPoll[] => {
  const csvData = fs.readFileSync(CSV_PATH(type), 'utf8');
  return buildPollsListFromCsvData(csvData);
};

const buildCsvDataFromStatePollingData = (pollingData: p.StatePollingData): string => {
  const flattenedPollingData = convertStatePollingDataToFlatPolls(pollingData);
  return buildCsvDataFromPollsList(flattenedPollingData);
};

const buildCsvDataFromNationalPollingData = (pollingData: p.Poll[]): string => {
  const flattenedPollingData = convertNationalPollingDataToFlatPolls(pollingData);
  return buildCsvDataFromPollsList(flattenedPollingData);
};

const buildCsvDataFromPollsList = (pollsList: p.FlatPoll[]): string => {
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
