import * as fs from 'fs';
import * as util from 'util';
import * as path from 'path';

import * as p from '../types';

import { loadWikipediaStatePollingData, loadWikipediaNationalPollingData } from './wikipedia-parser';
import { CSV_PATH, readPollingDataFromCsv, writePollingDataToCsv } from './csv-processing';
import { convertFlatPollsToPolls } from './data-shaping';
import { applyPollFilter } from './poll-filtering';

export const getPolls = async (pollFilter: p.PollFilter, forceRefresh?: boolean): Promise<p.Poll[]> => {
  let flatPolls = [];

  if (isCachedDataValid() && !forceRefresh) {
    flatPolls = readPollingDataFromCsv();
  } else {
    const statePolls = await loadWikipediaStatePollingData();
    const nationalPolls = await loadWikipediaNationalPollingData();
    writePollingDataToCsv([...statePolls, ...nationalPolls]);
    flatPolls = readPollingDataFromCsv();
  }

  const filteredFlatPolls = applyPollFilter(flatPolls, pollFilter);
  return convertFlatPollsToPolls(filteredFlatPolls);
};

export const getLastModifiedTime = (): Date => {
  const fileStats = fs.statSync(CSV_PATH());
  return new Date(util.inspect(fileStats.mtime));
};

export const getPledgedDelegateJson = (): Record<string, number> => {
  const pledgedDelegateJsonPath = path.resolve(__dirname, `../../static/delegates.json`);
  const pledgedDelegateData = JSON.parse(fs.readFileSync(pledgedDelegateJsonPath, 'utf8'));
  return pledgedDelegateData;
};

const isCachedDataValid = (): boolean => {
  const TEN_MIN_IN_MS = 1000 * 60 * 10;

  if (fs.existsSync(CSV_PATH())) {
    const lastModifiedTime = getLastModifiedTime();
    const timeDifferenceMs = Date.now() - lastModifiedTime.getTime();

    if (timeDifferenceMs < TEN_MIN_IN_MS) {
      return true;
    }
  }

  return false;
};
