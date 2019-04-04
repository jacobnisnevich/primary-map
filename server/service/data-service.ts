import * as p from '../types';

import { getStatePollingData } from '../data-utils/data-store';
import { computePollingAverages, getMostRecentPolls } from '../data-utils/polling-operations';
import { readPollingDataFromCSV } from '../data-utils/csv-processing';

export const getAveragedPollingData = async (): Promise<p.AveragedPollingData> => {
  const pollingData = await getStatePollingData();
  const averagedPollingData = computePollingAverages(pollingData, 5);
  return averagedPollingData;
};

export const getMostRecentPollData = async (count: number): Promise<p.FlatPoll[]> => {
  const pollingData = await getStatePollingData();
  const mostRecentPollData = getMostRecentPolls(pollingData, count);
  return mostRecentPollData;
};

export const getRawPolls = async (): Promise<p.FlatPoll[]> => {
  await getStatePollingData();
  return readPollingDataFromCSV();
};
