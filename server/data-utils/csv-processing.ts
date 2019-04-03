import * as path from 'path';
import { DataFrame } from 'dataframe-js';

import * as p from '../types';

import { expandPollingData, flattenPollingData } from './polling-operations';

const CSV_PATH = path.resolve(__dirname, '../data/polls.csv');

export const writePollingDataToCSV = (pollingData: p.PollingData): void => {
  const df = getDataFrameFromPollingData(pollingData);
  df.toCSV(CSV_PATH);
};

export const readDateFrameFromCSV = async (): Promise<any> => {
  console.log(CSV_PATH);
  const df = await DataFrame.fromCSV(CSV_PATH);
  return df.toJSON();
};

const getDataFrameFromPollingData = (pollingData: p.PollingData): any => {
  const expandedPollingData = expandPollingData(pollingData);
  const flattenedPollingData = flattenPollingData(expandedPollingData);
  const pollingDataColumnNames = Object.keys(flattenedPollingData[0]);

  return new DataFrame(flattenedPollingData, pollingDataColumnNames);
};
