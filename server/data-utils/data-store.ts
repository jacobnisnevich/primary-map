import * as fs from 'fs';
import * as util from 'util';

import * as p from '../types';

import { loadWikipediaStatePollingData, loadWikipediaNationalPollingData } from './wikipedia-parser';
import {
  CSV_PATH,
  readPollingDataFromCsv,
  writeStatePollingDataToCsv,
  writeNationalPollingDataToCsv
} from './csv-processing';
import { convertFlatPollsToStatePollingData, convertFlatPollsToNationalPollingData } from './data-shaping';

export const getStatePollingData = async (): Promise<p.StatePollingData> => {
  const type = 'state';

  if (isCachedDataValid(type)) {
    const flatPollingData = readPollingDataFromCsv(type);
    return convertFlatPollsToStatePollingData(flatPollingData);
  } else {
    const pollingData = await loadWikipediaStatePollingData();
    writeStatePollingDataToCsv(pollingData);
    return convertFlatPollsToStatePollingData(readPollingDataFromCsv(type));
  }
};

export const getNationalPollingData = async (): Promise<p.Poll[]> => {
  const type = 'national';

  if (isCachedDataValid(type)) {
    return convertFlatPollsToNationalPollingData(readPollingDataFromCsv(type));
  } else {
    const pollingData = await loadWikipediaNationalPollingData();
    writeNationalPollingDataToCsv(pollingData);
    return convertFlatPollsToNationalPollingData(readPollingDataFromCsv(type));
  }
};

export const getLastModifiedTime = (type: p.PollType): Date => {
  const fileStats = fs.statSync(CSV_PATH(type));
  return new Date(util.inspect(fileStats.mtime));
};

const isCachedDataValid = (type: p.PollType): boolean => {
  const TEN_MIN_IN_MS = 1000 * 60 * 10;

  if (fs.existsSync(CSV_PATH(type))) {
    const lastModifiedTime = getLastModifiedTime(type);
    const timeDifferenceMs = Date.now() - lastModifiedTime.getTime();

    if (timeDifferenceMs < TEN_MIN_IN_MS) {
      return true;
    }
  }

  return false;
};
