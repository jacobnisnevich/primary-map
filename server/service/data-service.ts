import { zipObject } from 'lodash';

import * as p from '../types';

import { getStatePollingData, getNationalPollingData, getLastModifiedTime } from '../data-utils/data-store';
import {
  computePollingAverages,
  getMostRecentPolls,
  getPledgedDelegateTotalsForCandidates,
  getNationalPollingAveragesForDays
} from '../data-utils/polling-operations';
import { readPollingDataFromCsv } from '../data-utils/csv-processing';
import { convertStatePollingDataToFlatPolls, convertNationalPollingDataToFlatPolls } from '../data-utils/data-shaping';

export const getAveragedPollingData = async (): Promise<p.AveragedPollingData> => {
  const pollingData = await getStatePollingData(false);
  const averagedPollingData = computePollingAverages(pollingData, 5);
  return averagedPollingData;
};

export const getWeightedDelegateTotals = (averagedPollingData: p.AveragedPollingData): p.CandidateResults => {
  return getPledgedDelegateTotalsForCandidates(averagedPollingData);
};

export const getMostRecentPollData = async (count: number, type: p.PollType): Promise<p.FlatPoll[]> => {
  let polls = [];

  if (type === 'state') {
    const statePollingData = await getStatePollingData(false);
    polls = convertStatePollingDataToFlatPolls(statePollingData);
  } else {
    const nationalPollingData = await getNationalPollingData(false);
    polls = convertNationalPollingDataToFlatPolls(nationalPollingData);
  }

  const mostRecentPollData = getMostRecentPolls(polls, count);

  return mostRecentPollData;
};

export const getRawPolls = async (type: p.PollType, forceRefresh: boolean): Promise<p.FlatPoll[]> => {
  if (type === 'state') {
    await getStatePollingData(forceRefresh);
  } else {
    await getNationalPollingData(forceRefresh);
  }
  return readPollingDataFromCsv(type);
};

export const getLastModified = (type: p.PollType): Date => {
  return getLastModifiedTime(type);
};

export const getNationalPollingTrendData = async (): Promise<p.TrendData> => {
  const nationalPollingData = await getNationalPollingData(false);
  return getNationalPollingAveragesForDays(nationalPollingData, 5, 30);
};
