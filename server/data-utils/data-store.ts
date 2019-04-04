import * as fs from 'fs';
import * as util from 'util';

import * as p from '../types';

import { loadWikipediaPollingData } from './wikipedia-parser';
import { CSV_PATH, readPollingDataFromCSV, writePollingDataToCSV } from './csv-processing';
import { convertFlatPollsToStatePollingData } from './data-shaping';

export const getStatePollingData = async (): Promise<p.StatePollingData> => {
  if (isCachedDataValid()) {
    const flatPollingData = readPollingDataFromCSV();
    return convertFlatPollsToStatePollingData(flatPollingData);
  } else {
    const pollingData = await loadWikipediaPollingData();
    writePollingDataToCSV(pollingData);
    return pollingData;
  }
};

export const getLastModifiedTime = (): Date => {
  const fileStats = fs.statSync(CSV_PATH);
  return new Date(util.inspect(fileStats.mtime));
};

const isCachedDataValid = (): boolean => {
  const FIVE_MIN_IN_MS = 1000 * 60 * 5;

  if (fs.existsSync(CSV_PATH)) {
    const lastModifiedTime = getLastModifiedTime();
    const timeDifferenceMs = Date.now() - lastModifiedTime.getTime();

    if (timeDifferenceMs < FIVE_MIN_IN_MS) {
      return true;
    }
  }

  return false;
};
