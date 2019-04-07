import * as p from '../types';

import { getStatePollingData, getNationalPollingData, getLastModifiedTime } from '../data-utils/data-store';
import { computePollingAverages, getMostRecentPolls } from '../data-utils/polling-operations';
import { readPollingDataFromCsv } from '../data-utils/csv-processing';
import { convertStatePollingDataToFlatPolls, convertNationalPollingDataToFlatPolls } from '../data-utils/data-shaping';

export const getAveragedPollingData = async (): Promise<p.AveragedPollingData> => {
  const pollingData = await getStatePollingData();
  const averagedPollingData = computePollingAverages(pollingData, 5);
  return averagedPollingData;
};

export const getMostRecentPollData = async (count: number, type: p.PollType): Promise<p.FlatPoll[]> => {
  let polls = [];

  if (type === 'state') {
    const pollingStateData = await getStatePollingData();
    polls = convertStatePollingDataToFlatPolls(pollingStateData);
  } else {
    const pollingNationalData = await getNationalPollingData();
    polls = convertNationalPollingDataToFlatPolls(pollingNationalData);
  }

  const mostRecentPollData = getMostRecentPolls(polls, count);

  return mostRecentPollData;
};

export const getRawPolls = async (type: p.PollType): Promise<p.FlatPoll[]> => {
  if (type === 'state') {
    await getStatePollingData();
  } else {
    await getNationalPollingData();
  }
  return readPollingDataFromCsv(type);
};

export const getLastModified = async (type: p.PollType): Promise<Date> => {
  return getLastModifiedTime(type);
};
